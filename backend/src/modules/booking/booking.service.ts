import {
  Injectable,
  Logger,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { BookingRepository } from './booking.repository';
import { AvailabilityRepository } from '../availability/availability.repository';
import { BookingRedisLockService } from './booking.redis-lock.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { BookingResponseDto } from './dto/booking-response.dto';
import {
  BookingSlotUnavailableException,
  BookingSlotLockedException,
  BookingNotFoundException,
  BookingAlreadyCancelledException,
  BookingUnauthorizedException,
} from '../../common/exceptions/booking.exceptions';
import { SlotStatus, BookingStatus } from '@prisma/client';

@Injectable()
export class BookingService {
  private readonly logger = new Logger(BookingService.name);

  constructor(
    private readonly bookingRepository: BookingRepository,
    private readonly availabilityRepository: AvailabilityRepository,
    private readonly redisLock: BookingRedisLockService,
    private readonly prisma: PrismaService,
  ) {}

  async createBooking(
    memberId: string,
    dto: CreateBookingDto,
  ): Promise<BookingResponseDto> {
    const slot = await this.availabilityRepository.findById(dto.slotId);
    if (!slot) {
      throw new BookingSlotUnavailableException(dto.slotId);
    }

    if (slot.status === SlotStatus.BOOKED) {
      throw new BookingSlotUnavailableException(dto.slotId);
    }

    if (slot.status === SlotStatus.LOCKED) {
      const owner = await this.redisLock.getLockOwner(dto.slotId);
      if (owner !== memberId) {
        throw new BookingSlotLockedException(dto.slotId);
      }
    }

    if (slot.coachId !== dto.coachId) {
      throw new ForbiddenException('Slot does not belong to the specified coach');
    }

    // Acquire Redis lock (5-min TTL)
    const lockAcquired = await this.redisLock.acquireLock(dto.slotId, memberId);
    if (!lockAcquired) {
      throw new BookingSlotLockedException(dto.slotId);
    }

    try {
      // Transactional: update slot to LOCKED in DB + create booking
      const booking = await this.prisma.$transaction(async (tx) => {
        const currentSlot = await tx.availableSlot.findUnique({
          where: { id: dto.slotId },
        });

        if (!currentSlot || currentSlot.status !== SlotStatus.OPEN) {
          throw new BookingSlotUnavailableException(dto.slotId);
        }

        const lockedUntil = new Date(Date.now() + 5 * 60 * 1000);
        await tx.availableSlot.update({
          where: { id: dto.slotId },
          data: { status: SlotStatus.LOCKED, lockedUntil },
        });

        return tx.booking.create({
          data: {
            member: { connect: { id: memberId } },
            coach: { connect: { id: dto.coachId } },
            service: { connect: { id: dto.serviceId } },
            slot: { connect: { id: dto.slotId } },
            bookingStatus: BookingStatus.PENDING,
          },
          include: {
            service: { select: { title: true, duration: true, price: true } },
            slot: { select: { date: true, startTime: true, endTime: true } },
            coach: { select: { nickname: true, userId: true } },
          },
        });
      });

      this.logger.log({
        message: 'Booking created',
        bookingId: booking.id,
        memberId,
        coachId: dto.coachId,
        slotId: dto.slotId,
      });

      return this.toResponseDto(booking);
    } catch (error) {
      // Release Redis lock on failure
      await this.redisLock.releaseLock(dto.slotId, memberId);
      throw error;
    }
  }

  async confirmBooking(bookingId: string): Promise<BookingResponseDto> {
    const booking = await this.bookingRepository.findById(bookingId);
    if (!booking) {
      throw new BookingNotFoundException(bookingId);
    }

    if (booking.bookingStatus === BookingStatus.CANCELLED) {
      throw new BookingAlreadyCancelledException();
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.booking.update({
        where: { id: bookingId },
        data: { bookingStatus: BookingStatus.CONFIRMED },
      });
      await tx.availableSlot.update({
        where: { id: booking.slotId },
        data: { status: SlotStatus.BOOKED, lockedUntil: null },
      });
    });

    // Release the Redis lock since slot is now permanently booked
    await this.redisLock.forceRelease(booking.slotId);

    this.logger.log({ message: 'Booking confirmed', bookingId });

    const updated = await this.bookingRepository.findById(bookingId);
    return this.toResponseDto(updated);
  }

  async cancelBooking(
    userId: string,
    bookingId: string,
    role: string,
  ): Promise<BookingResponseDto> {
    const booking = await this.bookingRepository.findById(bookingId);
    if (!booking) {
      throw new BookingNotFoundException(bookingId);
    }

    if (booking.bookingStatus === BookingStatus.CANCELLED) {
      throw new BookingAlreadyCancelledException();
    }

    const isOwner = booking.memberId === userId;
    const isAdmin = role === 'ADMIN';
    const isCoach = booking.coach?.userId === userId;

    if (!isOwner && !isAdmin && !isCoach) {
      throw new BookingUnauthorizedException();
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.booking.update({
        where: { id: bookingId },
        data: { bookingStatus: BookingStatus.CANCELLED },
      });
      await tx.availableSlot.update({
        where: { id: booking.slotId },
        data: { status: SlotStatus.OPEN, lockedUntil: null },
      });
    });

    await this.redisLock.forceRelease(booking.slotId);

    this.logger.log({ message: 'Booking cancelled', bookingId, cancelledBy: userId });

    const updated = await this.bookingRepository.findById(bookingId);
    return this.toResponseDto(updated);
  }

  async getBooking(
    userId: string,
    bookingId: string,
    role: string,
  ): Promise<BookingResponseDto> {
    const booking = await this.bookingRepository.findById(bookingId);
    if (!booking) {
      throw new BookingNotFoundException(bookingId);
    }

    const isOwner = booking.memberId === userId;
    const isAdmin = role === 'ADMIN';
    const isCoach = booking.coach?.userId === userId;

    if (!isOwner && !isAdmin && !isCoach) {
      throw new BookingUnauthorizedException();
    }

    return this.toResponseDto(booking);
  }

  async getMyBookings(
    memberId: string,
    status?: BookingStatus,
    page = 1,
    limit = 10,
  ): Promise<{ data: BookingResponseDto[]; total: number; page: number; limit: number; totalPages: number }> {
    const { data, total } = await this.bookingRepository.findByMemberId(memberId, status, page, limit);
    return {
      data: data.map(this.toResponseDto),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getPiPiBookings(
    coachId: string,
    status?: BookingStatus,
    page = 1,
    limit = 10,
  ): Promise<{ data: BookingResponseDto[]; total: number; page: number; limit: number; totalPages: number }> {
    const { data, total } = await this.bookingRepository.findByCoachId(coachId, status, page, limit);
    return {
      data: data.map(this.toResponseDto),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  private toResponseDto(booking: any): BookingResponseDto {
    return {
      id: booking.id,
      memberId: booking.memberId,
      coachId: booking.coachId,
      serviceId: booking.serviceId,
      slotId: booking.slotId,
      bookingStatus: booking.bookingStatus,
      createdAt: booking.createdAt,
      service: booking.service
        ? {
            title: booking.service.title,
            duration: booking.service.duration,
            price: Number(booking.service.price),
          }
        : undefined,
      slot: booking.slot
        ? {
            date: booking.slot.date instanceof Date
              ? booking.slot.date.toISOString().split('T')[0]
              : booking.slot.date,
            startTime: booking.slot.startTime instanceof Date
              ? `${booking.slot.startTime.getHours().toString().padStart(2, '0')}:${booking.slot.startTime.getMinutes().toString().padStart(2, '0')}`
              : booking.slot.startTime,
            endTime: booking.slot.endTime instanceof Date
              ? `${booking.slot.endTime.getHours().toString().padStart(2, '0')}:${booking.slot.endTime.getMinutes().toString().padStart(2, '0')}`
              : booking.slot.endTime,
          }
        : undefined,
      coach: booking.coach
        ? { nickname: booking.coach.nickname, userId: booking.coach.userId }
        : undefined,
    };
  }
}
