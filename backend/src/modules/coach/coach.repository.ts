import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Coach, CoachStatus, Prisma } from '@prisma/client';

// Coach profiles are always returned with their owning user and services so the
// response can be mapped to the full client-facing shape in one query.
const coachWithRelations = Prisma.validator<Prisma.CoachDefaultArgs>()({
  include: { user: true, services: true },
});

type CoachWithRelations = Prisma.CoachGetPayload<typeof coachWithRelations>;

@Injectable()
export class CoachRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create a coach profile AND promote the owning user to the COACH role in a
   * single transaction. Becoming a coach is one atomic action: a half-applied
   * state (profile exists but the user is still a STUDENT, or vice versa) would
   * lock the user out of the coach portal with no way to retry.
   */
  async createWithRolePromotion(
    userId: string,
    data: Prisma.CoachCreateInput,
  ): Promise<CoachWithRelations> {
    const [coach] = await this.prisma.$transaction([
      this.prisma.coach.create({ data, ...coachWithRelations }),
      this.prisma.user.update({
        where: { id: userId },
        data: { role: 'COACH' },
      }),
    ]);
    return coach as CoachWithRelations;
  }

  async findById(id: string): Promise<CoachWithRelations | null> {
    return this.prisma.coach.findUnique({ where: { id }, ...coachWithRelations });
  }

  async findByUserId(userId: string): Promise<CoachWithRelations | null> {
    return this.prisma.coach.findUnique({ where: { userId }, ...coachWithRelations });
  }

  async findAll(params: {
    skip?: number;
    take?: number;
    status?: CoachStatus;
  }): Promise<CoachWithRelations[]> {
    const { skip = 0, take = 20, status } = params;
    return this.prisma.coach.findMany({
      where: { ...(status && { status }) },
      skip,
      take,
      ...coachWithRelations,
      orderBy: { createdAt: 'desc' },
    });
  }

  async count(status?: CoachStatus): Promise<number> {
    return this.prisma.coach.count({ where: { ...(status && { status }) } });
  }

  async update(id: string, data: Prisma.CoachUpdateInput): Promise<CoachWithRelations> {
    return this.prisma.coach.update({ where: { id }, data, ...coachWithRelations });
  }

  async updateStatus(id: string, status: CoachStatus): Promise<CoachWithRelations> {
    return this.prisma.coach.update({ where: { id }, data: { status }, ...coachWithRelations });
  }

  async delete(id: string): Promise<Coach> {
    return this.prisma.coach.delete({ where: { id } });
  }
}
