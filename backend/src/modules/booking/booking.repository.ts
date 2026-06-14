import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Booking, BookingStatus, Prisma } from '@prisma/client';

const bookingWithRelations = Prisma.validator<Prisma.BookingDefaultArgs>()({
  include: {
    service: { select: { title: true, duration: true, price: true } },
    slot: { select: { date: true, startTime: true, endTime: true } },
    coach: { select: { nickname: true, userId: true } },
  },
});

type BookingWithRelations = Prisma.BookingGetPayload<typeof bookingWithRelations>;

@Injectable()
export class BookingRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    data: Prisma.BookingCreateInput,
  ): Promise<BookingWithRelations> {
    return this.prisma.booking.create({
      data,
      ...bookingWithRelations,
    });
  }

  async findById(id: string): Promise<BookingWithRelations | null> {
    return this.prisma.booking.findUnique({
      where: { id },
      ...bookingWithRelations,
    });
  }

  async findByMemberId(
    memberId: string,
    status?: BookingStatus,
  ): Promise<BookingWithRelations[]> {
    return this.prisma.booking.findMany({
      where: {
        memberId,
        ...(status && { bookingStatus: status }),
      },
      ...bookingWithRelations,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByCoachId(
    coachId: string,
    status?: BookingStatus,
  ): Promise<BookingWithRelations[]> {
    return this.prisma.booking.findMany({
      where: {
        coachId,
        ...(status && { bookingStatus: status }),
      },
      ...bookingWithRelations,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findBySlotId(slotId: string): Promise<Booking | null> {
    return this.prisma.booking.findUnique({ where: { slotId } });
  }

  async updateStatus(id: string, status: BookingStatus): Promise<Booking> {
    return this.prisma.booking.update({
      where: { id },
      data: { bookingStatus: status },
    });
  }

  async countByStatus(status?: BookingStatus): Promise<number> {
    return this.prisma.booking.count({
      where: status ? { bookingStatus: status } : {},
    });
  }

  async countRecentBookings(fromDate: Date): Promise<number> {
    return this.prisma.booking.count({
      where: { createdAt: { gte: fromDate } },
    });
  }
}
