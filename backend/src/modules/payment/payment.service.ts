import {
  Injectable,
  Logger,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PaymentRepository } from './payment.repository';
import { BookingRepository } from '../booking/booking.repository';
import { BookingService } from '../booking/booking.service';
import { EcpayService } from './ecpay.service';
import { InitPaymentDto } from './dto/init-payment.dto';
import { EcpayWebhookDto } from './dto/ecpay-webhook.dto';
import {
  PaymentAlreadyProcessedException,
  PaymentSignatureInvalidException,
  PaymentNotFoundException,
} from '../../common/exceptions/payment.exceptions';
import { PaymentStatus, BookingStatus, PaymentMethod, Prisma } from '@prisma/client';

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);

  constructor(
    private readonly paymentRepository: PaymentRepository,
    private readonly bookingRepository: BookingRepository,
    private readonly bookingService: BookingService,
    private readonly ecpayService: EcpayService,
  ) {}

  async initPayment(userId: string, dto: InitPaymentDto) {
    const booking = await this.bookingRepository.findById(dto.bookingId);
    if (!booking) {
      throw new NotFoundException(`Booking ${dto.bookingId} not found`);
    }

    if (booking.memberId !== userId) {
      throw new ForbiddenException('You are not authorized to pay for this booking');
    }

    if (booking.bookingStatus === BookingStatus.CANCELLED) {
      throw new ForbiddenException('Cannot pay for a cancelled booking');
    }

    const existing = await this.paymentRepository.findByBookingId(dto.bookingId);
    if (existing && existing.paymentStatus === PaymentStatus.PAID) {
      throw new PaymentAlreadyProcessedException();
    }

    const servicePrice = Number(booking.service?.price || 0);

    // `existing` is the (unpaid) payment from a prior attempt — e.g. the buyer
    // closed the ECPay page. Reuse it: bookingId is unique, so creating a second
    // payment row would fail.

    // Cash: no online payment. Record an unpaid CASH payment; the coach settles
    // it in person and confirms the booking. No ECPay redirect.
    if (dto.method === 'CASH') {
      if (existing) {
        await this.paymentRepository.update(existing.id, {
          amount: servicePrice,
          paymentMethod: PaymentMethod.CASH,
          paymentStatus: PaymentStatus.PENDING,
          ecpayTradeNo: null,
          ecpayData: Prisma.DbNull,
        });
      } else {
        await this.paymentRepository.create({
          booking: { connect: { id: dto.bookingId } },
          amount: servicePrice,
          paymentMethod: PaymentMethod.CASH,
          paymentStatus: PaymentStatus.PENDING,
        });
      }
      this.logger.log({ message: 'Cash payment recorded', bookingId: dto.bookingId, amount: servicePrice });
      return { cash: true as const };
    }

    const merchantTradeNo = this.ecpayService.generateMerchantTradeNo(booking.id);
    const merchantTradeDate = this.ecpayService.formatTradeDate();

    const ecpayData = this.ecpayService.buildOrderParams({
      merchantTradeNo,
      merchantTradeDate,
      totalAmount: servicePrice,
      tradeDesc: `PiPiBook booking ${booking.id.slice(0, 8)}`,
      itemName: booking.service?.name || 'Coaching Session',
      // ReturnURL (server-to-server webhook) comes from config; the client's
      // returnUrl is where the buyer's browser returns afterwards.
      orderResultURL: dto.returnUrl,
      choosePayment: 'Credit',
    });

    // A fresh ECPay order needs a fresh MerchantTradeNo, so reuse the row but
    // overwrite the trade number/params on each attempt.
    if (existing) {
      await this.paymentRepository.update(existing.id, {
        amount: servicePrice,
        paymentMethod: PaymentMethod.CREDIT_CARD,
        paymentStatus: PaymentStatus.PENDING,
        ecpayTradeNo: merchantTradeNo,
        ecpayData: ecpayData.params,
      });
    } else {
      await this.paymentRepository.create({
        booking: { connect: { id: dto.bookingId } },
        amount: servicePrice,
        // Actual method is confirmed via webhook; store a placeholder for now.
        paymentMethod: PaymentMethod.CREDIT_CARD,
        paymentStatus: PaymentStatus.PENDING,
        ecpayTradeNo: merchantTradeNo,
        ecpayData: ecpayData.params,
      });
    }

    this.logger.log({
      message: 'Payment initialized',
      bookingId: dto.bookingId,
      amount: servicePrice,
      merchantTradeNo,
    });

    // The client renders these as a hidden form and POSTs to ECPay.
    return {
      tradeNo: merchantTradeNo,
      formUrl: ecpayData.formUrl,
      params: { ...ecpayData.params, CheckMacValue: ecpayData.checkMacValue },
    };
  }

  async handleWebhook(dto: EcpayWebhookDto): Promise<string> {
    const params = { ...dto } as Record<string, string>;

    // Verify signature
    const isValid = this.ecpayService.verifyCheckMacValue(params);
    if (!isValid) {
      this.logger.warn({
        message: 'ECPay webhook signature invalid',
        merchantTradeNo: dto.MerchantTradeNo,
      });
      throw new PaymentSignatureInvalidException();
    }

    const payment = await this.paymentRepository.findByEcpayTradeNo(
      dto.MerchantTradeNo,
    );

    if (!payment) {
      this.logger.error({
        message: 'Payment not found for ECPay trade',
        merchantTradeNo: dto.MerchantTradeNo,
      });
      return '0|OrderNotFound';
    }

    // RtnCode 1 = success
    const isSuccess = dto.RtnCode === '1';
    const newStatus = isSuccess ? PaymentStatus.PAID : PaymentStatus.FAILED;

    await this.paymentRepository.updateByEcpayTradeNo(
      dto.MerchantTradeNo,
      newStatus,
      params,
    );

    if (isSuccess) {
      // Auto-confirm booking on successful payment
      await this.bookingService.confirmBooking(payment.bookingId);

      this.logger.log({
        message: 'Payment successful, booking confirmed',
        paymentId: payment.id,
        bookingId: payment.bookingId,
        ecpayTradeNo: dto.TradeNo,
        amount: dto.TradeAmt,
      });
    } else {
      this.logger.warn({
        message: 'Payment failed',
        paymentId: payment.id,
        rtnCode: dto.RtnCode,
        rtnMsg: dto.RtnMsg,
      });
    }

    // ECPay expects '1|OK' on success
    return '1|OK';
  }

  async getPaymentByBooking(userId: string, bookingId: string) {
    const booking = await this.bookingRepository.findById(bookingId);
    if (!booking) {
      throw new NotFoundException(`Booking ${bookingId} not found`);
    }

    if (booking.memberId !== userId) {
      throw new ForbiddenException('Not authorized to view this payment');
    }

    const payment = await this.paymentRepository.findByBookingId(bookingId);
    if (!payment) {
      throw new PaymentNotFoundException();
    }

    return {
      id: payment.id,
      bookingId: payment.bookingId,
      amount: Number(payment.amount),
      paymentMethod: payment.paymentMethod,
      paymentStatus: payment.paymentStatus,
      ecpayTradeNo: payment.ecpayTradeNo,
      createdAt: payment.createdAt,
    };
  }
}
