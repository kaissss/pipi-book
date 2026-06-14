import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { BookingStatus, PaymentStatus, UserStatus } from '@prisma/client';

export interface DashboardStats {
  users: {
    total: number;
    active: number;
    coaches: number;
    students: number;
  };
  coaches: {
    total: number;
    approved: number;
    pending: number;
  };
  bookings: {
    total: number;
    pending: number;
    confirmed: number;
    cancelled: number;
    thisMonth: number;
  };
  payments: {
    total: number;
    successful: number;
    failed: number;
    pending: number;
    totalRevenue: number;
    monthlyRevenue: number;
  };
  recentActivity: {
    newUsersThisWeek: number;
    newBookingsThisWeek: number;
  };
}

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getDashboardStats(): Promise<DashboardStats> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const [
      totalUsers,
      activeUsers,
      coachUsers,
      studentUsers,
      totalCoaches,
      approvedCoaches,
      totalBookings,
      pendingBookings,
      confirmedBookings,
      cancelledBookings,
      monthlyBookings,
      totalPayments,
      successfulPayments,
      failedPayments,
      pendingPayments,
      newUsersThisWeek,
      newBookingsThisWeek,
      totalRevenue,
      monthlyRevenue,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { status: UserStatus.ACTIVE } }),
      this.prisma.user.count({ where: { role: 'COACH' } }),
      this.prisma.user.count({ where: { role: 'STUDENT' } }),
      this.prisma.coach.count(),
      this.prisma.coach.count({ where: { isApproved: true } }),
      this.prisma.booking.count(),
      this.prisma.booking.count({ where: { bookingStatus: BookingStatus.PENDING } }),
      this.prisma.booking.count({ where: { bookingStatus: BookingStatus.CONFIRMED } }),
      this.prisma.booking.count({ where: { bookingStatus: BookingStatus.CANCELLED } }),
      this.prisma.booking.count({ where: { createdAt: { gte: startOfMonth } } }),
      this.prisma.payment.count(),
      this.prisma.payment.count({ where: { paymentStatus: PaymentStatus.SUCCESS } }),
      this.prisma.payment.count({ where: { paymentStatus: PaymentStatus.FAILED } }),
      this.prisma.payment.count({ where: { paymentStatus: PaymentStatus.PENDING } }),
      this.prisma.user.count({ where: { createdAt: { gte: startOfWeek } } }),
      this.prisma.booking.count({ where: { createdAt: { gte: startOfWeek } } }),
      this.prisma.payment.aggregate({
        where: { paymentStatus: PaymentStatus.SUCCESS },
        _sum: { amount: true },
      }),
      this.prisma.payment.aggregate({
        where: {
          paymentStatus: PaymentStatus.SUCCESS,
          createdAt: { gte: startOfMonth },
        },
        _sum: { amount: true },
      }),
    ]);

    this.logger.log({ message: 'Dashboard stats fetched' });

    return {
      users: {
        total: totalUsers,
        active: activeUsers,
        coaches: coachUsers,
        students: studentUsers,
      },
      coaches: {
        total: totalCoaches,
        approved: approvedCoaches,
        pending: totalCoaches - approvedCoaches,
      },
      bookings: {
        total: totalBookings,
        pending: pendingBookings,
        confirmed: confirmedBookings,
        cancelled: cancelledBookings,
        thisMonth: monthlyBookings,
      },
      payments: {
        total: totalPayments,
        successful: successfulPayments,
        failed: failedPayments,
        pending: pendingPayments,
        totalRevenue: Number(totalRevenue._sum.amount) || 0,
        monthlyRevenue: Number(monthlyRevenue._sum.amount) || 0,
      },
      recentActivity: {
        newUsersThisWeek,
        newBookingsThisWeek,
      },
    };
  }

  async getPendingCoaches() {
    return this.prisma.coach.findMany({
      where: { isApproved: false },
      include: {
        user: {
          select: { id: true, displayName: true, email: true, avatar: true, createdAt: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async listAllUsers(page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;
    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        skip,
        take: limit,
        select: {
          id: true,
          displayName: true,
          email: true,
          role: true,
          status: true,
          createdAt: true,
          lineUserId: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count(),
    ]);

    return { data: users, total, page, limit };
  }

  async banUser(userId: string) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { status: UserStatus.BANNED },
    });
    this.logger.warn({ message: 'User banned', userId });
    return user;
  }
}
