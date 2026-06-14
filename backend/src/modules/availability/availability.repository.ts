import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AvailableSlot, SlotStatus, Prisma } from '@prisma/client';

@Injectable()
export class AvailabilityRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.AvailableSlotCreateInput): Promise<AvailableSlot> {
    return this.prisma.availableSlot.create({ data });
  }

  async createMany(
    data: Prisma.AvailableSlotCreateManyInput[],
  ): Promise<{ count: number }> {
    return this.prisma.availableSlot.createMany({ data, skipDuplicates: true });
  }

  async findById(id: string): Promise<AvailableSlot | null> {
    return this.prisma.availableSlot.findUnique({ where: { id } });
  }

  async findByCoachAndDate(
    coachId: string,
    date: string,
  ): Promise<AvailableSlot[]> {
    const dateObj = new Date(date);
    return this.prisma.availableSlot.findMany({
      where: {
        coachId,
        date: dateObj,
      },
      orderBy: { startTime: 'asc' },
    });
  }

  async findOpenSlotsByCoach(
    coachId: string,
    fromDate?: string,
  ): Promise<AvailableSlot[]> {
    const now = new Date();
    return this.prisma.availableSlot.findMany({
      where: {
        coachId,
        status: SlotStatus.OPEN,
        date: { gte: fromDate ? new Date(fromDate) : now },
      },
      orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
    });
  }

  async updateStatus(
    id: string,
    status: SlotStatus,
    lockedUntil?: Date,
  ): Promise<AvailableSlot> {
    return this.prisma.availableSlot.update({
      where: { id },
      data: {
        status,
        lockedUntil: lockedUntil ?? null,
      },
    });
  }

  async releaseExpiredLocks(): Promise<number> {
    const result = await this.prisma.availableSlot.updateMany({
      where: {
        status: SlotStatus.LOCKED,
        lockedUntil: { lt: new Date() },
      },
      data: { status: SlotStatus.OPEN, lockedUntil: null },
    });
    return result.count;
  }

  async delete(id: string): Promise<AvailableSlot> {
    return this.prisma.availableSlot.delete({ where: { id } });
  }
}
