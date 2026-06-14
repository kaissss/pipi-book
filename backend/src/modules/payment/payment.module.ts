import { Module } from '@nestjs/common';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { PaymentRepository } from './payment.repository';
import { EcpayService } from './ecpay.service';
import { BookingModule } from '../booking/booking.module';

@Module({
  imports: [BookingModule],
  controllers: [PaymentController],
  providers: [PaymentService, PaymentRepository, EcpayService],
  exports: [PaymentService, PaymentRepository],
})
export class PaymentModule {}
