import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Service, Prisma } from '@prisma/client';

@Injectable()
export class ServiceRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.ServiceCreateInput): Promise<Service> {
    return this.prisma.service.create({ data });
  }

  async findById(id: string): Promise<Service | null> {
    return this.prisma.service.findUnique({ where: { id } });
  }

  async findByCoachId(coachId: string, activeOnly: boolean = false): Promise<Service[]> {
    return this.prisma.service.findMany({
      where: {
        coachId,
        ...(activeOnly && { isActive: true }),
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async update(id: string, data: Prisma.ServiceUpdateInput): Promise<Service> {
    return this.prisma.service.update({ where: { id }, data });
  }

  async delete(id: string): Promise<Service> {
    return this.prisma.service.delete({ where: { id } });
  }

  async softDelete(id: string): Promise<Service> {
    return this.prisma.service.update({
      where: { id },
      data: { isActive: false },
    });
  }
}
