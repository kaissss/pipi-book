import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Payment, PaymentStatus, Prisma } from '@prisma/client';

@Injectable()
export class PaymentRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.PaymentCreateInput): Promise<Payment> {
    return this.prisma.payment.create({ data });
  }

  async update(id: string, data: Prisma.PaymentUpdateInput): Promise<Payment> {
    return this.prisma.payment.update({ where: { id }, data });
  }

  async findById(id: string): Promise<Payment | null> {
    return this.prisma.payment.findUnique({
      where: { id },
      include: { booking: true },
    });
  }

  async findByBookingId(bookingId: string): Promise<Payment | null> {
    return this.prisma.payment.findUnique({
      where: { bookingId },
      include: { booking: true },
    });
  }

  async findByEcpayTradeNo(ecpayTradeNo: string): Promise<Payment | null> {
    return this.prisma.payment.findUnique({ where: { ecpayTradeNo } });
  }

  async updateStatus(
    id: string,
    status: PaymentStatus,
    ecpayData?: Record<string, any>,
  ): Promise<Payment> {
    return this.prisma.payment.update({
      where: { id },
      data: {
        paymentStatus: status,
        ...(ecpayData && { ecpayData }),
      },
    });
  }

  async updateByEcpayTradeNo(
    ecpayTradeNo: string,
    status: PaymentStatus,
    ecpayData?: Record<string, any>,
  ): Promise<Payment> {
    return this.prisma.payment.update({
      where: { ecpayTradeNo },
      data: {
        paymentStatus: status,
        ...(ecpayData && { ecpayData }),
      },
    });
  }

  async countByStatus(status?: PaymentStatus): Promise<number> {
    return this.prisma.payment.count({
      where: status ? { paymentStatus: status } : {},
    });
  }

  async sumSuccessfulPayments(): Promise<number> {
    const result = await this.prisma.payment.aggregate({
      where: { paymentStatus: PaymentStatus.PAID },
      _sum: { amount: true },
    });
    return Number(result._sum.amount) || 0;
  }
}
