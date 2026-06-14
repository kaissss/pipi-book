import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Coach, Prisma } from '@prisma/client';

@Injectable()
export class CoachRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.CoachCreateInput): Promise<Coach> {
    return this.prisma.coach.create({ data });
  }

  async findById(id: string): Promise<Coach | null> {
    return this.prisma.coach.findUnique({
      where: { id },
      include: { user: true },
    });
  }

  async findByUserId(userId: string): Promise<Coach | null> {
    return this.prisma.coach.findUnique({
      where: { userId },
      include: { user: true },
    });
  }

  async findAll(params: {
    skip?: number;
    take?: number;
    isApproved?: boolean;
  }): Promise<Coach[]> {
    const { skip = 0, take = 20, isApproved } = params;
    return this.prisma.coach.findMany({
      where: { ...(isApproved !== undefined && { isApproved }) },
      skip,
      take,
      include: { user: { select: { displayName: true, avatar: true, email: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async count(isApproved?: boolean): Promise<number> {
    return this.prisma.coach.count({
      where: { ...(isApproved !== undefined && { isApproved }) },
    });
  }

  async update(id: string, data: Prisma.CoachUpdateInput): Promise<Coach> {
    return this.prisma.coach.update({ where: { id }, data });
  }

  async approve(id: string): Promise<Coach> {
    return this.prisma.coach.update({
      where: { id },
      data: { isApproved: true },
    });
  }

  async delete(id: string): Promise<Coach> {
    return this.prisma.coach.delete({ where: { id } });
  }
}
