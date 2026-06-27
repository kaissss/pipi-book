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

  /**
   * Slots for a coach within an optional [from, to) datetime window. When
   * `openOnly` is set, restricts to OPEN slots from now onward (booking view);
   * otherwise returns every slot (coach's own schedule view).
   */
  async findByCoach(params: {
    coachId: string;
    from?: Date;
    to?: Date;
    openOnly?: boolean;
  }): Promise<AvailableSlot[]> {
    const { coachId, from, to, openOnly } = params;
    return this.prisma.availableSlot.findMany({
      where: {
        coachId,
        ...(openOnly && { status: SlotStatus.OPEN }),
        ...((from || to) && {
          startTime: {
            ...(from && { gte: from }),
            ...(to && { lt: to }),
          },
        }),
      },
      orderBy: { startTime: 'asc' },
    });
  }

  async updateStatus(
    id: string,
    status: SlotStatus,
    lockedUntil?: Date,
  ): Promise<AvailableSlot> {
    return this.prisma.availableSlot.update({
      where: { id },
      data: { status, lockedUntil: lockedUntil ?? null },
    });
  }

  async releaseExpiredLocks(): Promise<number> {
    const result = await this.prisma.availableSlot.updateMany({
      where: { status: SlotStatus.LOCKED, lockedUntil: { lt: new Date() } },
      data: { status: SlotStatus.OPEN, lockedUntil: null },
    });
    return result.count;
  }

  async delete(id: string): Promise<AvailableSlot> {
    return this.prisma.availableSlot.delete({ where: { id } });
  }
}
