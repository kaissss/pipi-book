import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  BookingStatus,
  CoachStatus,
  PaymentStatus,
  Prisma,
  Role,
  UserStatus,
} from '@prisma/client';
import { CoachService } from '../coach/coach.service';
import { BookingService } from '../booking/booking.service';

// Flat platform stats shape consumed by the admin dashboard.
export interface PlatformStats {
  totalUsers: number;
  totalCoaches: number;
  totalBookings: number;
  totalRevenue: number;
  pendingCoachApprovals: number;
  bookingsThisMonth: number;
  revenueThisMonth: number;
  activeUsers: number;
}

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly coachService: CoachService,
    private readonly bookingService: BookingService,
  ) {}

  async getDashboardStats(): Promise<PlatformStats> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      totalUsers,
      activeUsers,
      approvedCoaches,
      pendingCoaches,
      totalBookings,
      bookingsThisMonth,
      totalRevenue,
      revenueThisMonth,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { status: UserStatus.ACTIVE } }),
      this.prisma.coach.count({ where: { status: CoachStatus.APPROVED } }),
      this.prisma.coach.count({ where: { status: CoachStatus.PENDING } }),
      this.prisma.booking.count(),
      this.prisma.booking.count({ where: { createdAt: { gte: startOfMonth } } }),
      this.prisma.payment.aggregate({
        where: { paymentStatus: PaymentStatus.PAID },
        _sum: { amount: true },
      }),
      this.prisma.payment.aggregate({
        where: { paymentStatus: PaymentStatus.PAID, createdAt: { gte: startOfMonth } },
        _sum: { amount: true },
      }),
    ]);

    return {
      totalUsers,
      activeUsers,
      totalCoaches: approvedCoaches,
      pendingCoachApprovals: pendingCoaches,
      totalBookings,
      bookingsThisMonth,
      totalRevenue: Number(totalRevenue._sum.amount) || 0,
      revenueThisMonth: Number(revenueThisMonth._sum.amount) || 0,
    };
  }

  async listUsers(params: {
    search?: string;
    role?: string;
    page?: number;
    limit?: number;
  }) {
    const { search, role, page = 1, limit = 20 } = params;
    const where: Prisma.UserWhereInput = {
      ...(role && { role: role as Role }),
      ...(search && {
        OR: [
          { displayName: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      data: users.map(mapUser),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async suspendUser(userId: string) {
    return this.setUserStatus(userId, UserStatus.SUSPENDED);
  }

  async activateUser(userId: string) {
    return this.setUserStatus(userId, UserStatus.ACTIVE);
  }

  private async setUserStatus(userId: string, status: UserStatus) {
    const existing = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!existing) {
      throw new NotFoundException(`User ${userId} not found`);
    }
    const user = await this.prisma.user.update({ where: { id: userId }, data: { status } });
    this.logger.warn({ message: 'User status changed by admin', userId, status });
    return mapUser(user);
  }

  // Coach lifecycle and recent bookings reuse the feature services so the
  // response shapes stay identical to the public endpoints.
  listCoaches(status: CoachStatus | undefined, page: number, limit: number) {
    return this.coachService.listCoaches(status, page, limit);
  }

  approveCoach(coachId: string) {
    return this.coachService.approveCoach(coachId);
  }

  rejectCoach(coachId: string, reason?: string) {
    return this.coachService.rejectCoach(coachId, reason);
  }

  suspendCoach(coachId: string) {
    return this.coachService.suspendCoach(coachId);
  }

  getRecentBookings(limit: number) {
    return this.bookingService.getRecentBookings(limit);
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
