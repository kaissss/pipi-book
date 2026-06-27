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
import { CreatePaymentDto } from './dto/create-payment.dto';
import { EcpayWebhookDto } from './dto/ecpay-webhook.dto';
import {
  PaymentAlreadyProcessedException,
  PaymentSignatureInvalidException,
  PaymentNotFoundException,
} from '../../common/exceptions/payment.exceptions';
import { PaymentStatus, BookingStatus, PaymentMethod } from '@prisma/client';

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);

  constructor(
    private readonly paymentRepository: PaymentRepository,
    private readonly bookingRepository: BookingRepository,
    private readonly bookingService: BookingService,
    private readonly ecpayService: EcpayService,
  ) {}

  async createPayment(userId: string, dto: CreatePaymentDto) {
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
    const merchantTradeNo = this.ecpayService.generateMerchantTradeNo(booking.id);
    const merchantTradeDate = this.ecpayService.formatTradeDate();

    const ecpayData = this.ecpayService.buildOrderParams({
      merchantTradeNo,
      merchantTradeDate,
      totalAmount: servicePrice,
      tradeDesc: `PiPiBook booking ${booking.id.slice(0, 8)}`,
      itemName: booking.service?.name || 'Coaching Session',
      returnURL: dto.returnUrl ?? '',
      choosePayment: dto.paymentMethod,
    });

    const payment = await this.paymentRepository.create({
      booking: { connect: { id: dto.bookingId } },
      amount: servicePrice,
      paymentMethod: dto.paymentMethod as PaymentMethod,
      paymentStatus: PaymentStatus.PENDING,
      ecpayTradeNo: merchantTradeNo,
      ecpayData: ecpayData.params,
    });

    this.logger.log({
      message: 'Payment created',
      paymentId: payment.id,
      bookingId: dto.bookingId,
      amount: servicePrice,
      merchantTradeNo,
    });

    return {
      paymentId: payment.id,
      bookingId: dto.bookingId,
      amount: servicePrice,
      ecpayFormUrl: ecpayData.formUrl,
      ecpayParams: { ...ecpayData.params, CheckMacValue: ecpayData.checkMacValue },
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
