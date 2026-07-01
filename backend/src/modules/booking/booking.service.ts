import {
  Injectable,
  Logger,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { BookingRepository } from './booking.repository';
import { AvailabilityRepository } from '../availability/availability.repository';
import { CoachRepository } from '../coach/coach.repository';
import { BookingRedisLockService } from './booking.redis-lock.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { BookingResponseDto } from './dto/booking-response.dto';
import { mapService } from '../coach/coach.service';
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
    private readonly coachRepository: CoachRepository,
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
            notes: dto.notes,
          },
          include: {
            member: true,
            service: true,
            slot: true,
            coach: { include: { user: true, services: true } },
            payment: true,
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

  async getCoachBookings(
    userId: string,
    status?: BookingStatus,
    page = 1,
    limit = 10,
  ): Promise<{ data: BookingResponseDto[]; total: number; page: number; limit: number; totalPages: number }> {
    // Bookings reference the Coach record id, not the user id — resolve the
    // caller's coach profile first, then query bookings by that coachId.
    const coach = await this.coachRepository.findByUserId(userId);
    if (!coach) {
      return { data: [], total: 0, page, limit, totalPages: 0 };
    }

    const { data, total } = await this.bookingRepository.findByCoachId(coach.id, status, page, limit);
    return {
      data: data.map(this.toResponseDto),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getRecentBookings(limit = 10): Promise<BookingResponseDto[]> {
    const bookings = await this.bookingRepository.findRecent(limit);
    return bookings.map((booking) => this.toResponseDto(booking));
  }

  async completeBooking(bookingId: string): Promise<BookingResponseDto> {
    const booking = await this.bookingRepository.findById(bookingId);
    if (!booking) {
      throw new BookingNotFoundException(bookingId);
    }
    await this.bookingRepository.updateStatus(bookingId, BookingStatus.COMPLETED);
    this.logger.log({ message: 'Booking completed', bookingId });
    const updated = await this.bookingRepository.findById(bookingId);
    return this.toResponseDto(updated);
  }

  async addMeetingUrl(
    bookingId: string,
    meetingUrl: string,
  ): Promise<BookingResponseDto> {
    const booking = await this.bookingRepository.findById(bookingId);
    if (!booking) {
      throw new BookingNotFoundException(bookingId);
    }
    const updated = await this.bookingRepository.update(bookingId, { meetingUrl });
    this.logger.log({ message: 'Booking meeting URL set', bookingId });
    return this.toResponseDto(updated);
  }

  private toResponseDto(booking: any): BookingResponseDto {
    return {
      id: booking.id,
      studentId: booking.memberId,
      coachId: booking.coachId,
      serviceId: booking.serviceId,
      slotId: booking.slotId,
      status: booking.bookingStatus,
      notes: booking.notes ?? undefined,
      meetingUrl: booking.meetingUrl ?? undefined,
      createdAt: booking.createdAt,
      updatedAt: booking.updatedAt,
      student: booking.member ? mapUser(booking.member) : undefined,
      coach: booking.coach
        ? {
            id: booking.coach.id,
            userId: booking.coach.userId,
            bio: booking.coach.bio,
            specialties: booking.coach.specialties,
            experience: booking.coach.experience,
            rating: 0,
            reviewCount: 0,
            status: booking.coach.status,
            timezone: booking.coach.timezone,
            location: booking.coach.location ?? undefined,
            languages: booking.coach.languages,
            certifications: booking.coach.certifications,
            coverImageUrl: booking.coach.coverImageUrl ?? undefined,
            services: (booking.coach.services ?? []).map(mapService),
            createdAt: booking.coach.createdAt,
            updatedAt: booking.coach.updatedAt,
            user: booking.coach.user ? mapUser(booking.coach.user) : undefined,
          }
        : undefined,
      service: booking.service ? mapService(booking.service) : undefined,
      slot: booking.slot ? mapSlot(booking.slot) : undefined,
      payment: booking.payment ? mapPayment(booking.payment) : undefined,
    };
  }
}

function mapUser(user: any) {
  return {
    id: user.id,
    lineUserId: user.lineUserId ?? '',
    displayName: user.displayName ?? '',
    avatar: user.avatar ?? undefined,
    email: user.email ?? undefined,
    phone: user.phone ?? undefined,
    role: user.role,
    status: user.status,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

const SLOT_STATUS_MAP: Record<string, string> = {
  OPEN: 'AVAILABLE',
  LOCKED: 'BLOCKED',
  BOOKED: 'BOOKED',
};

function mapSlot(slot: any) {
  return {
    id: slot.id,
    coachId: slot.coachId,
    startTime: slot.startTime.toISOString(),
    endTime: slot.endTime.toISOString(),
    status: SLOT_STATUS_MAP[slot.status] ?? slot.status,
  };
}

function mapPayment(payment: any) {
  return {
    id: payment.id,
    bookingId: payment.bookingId,
    amount: Number(payment.amount),
    currency: 'TWD',
    method: payment.paymentMethod,
    status: payment.paymentStatus,
    ecpayTradeNo: payment.ecpayTradeNo ?? undefined,
    createdAt: payment.createdAt,
    updatedAt: payment.updatedAt,
  };
}
