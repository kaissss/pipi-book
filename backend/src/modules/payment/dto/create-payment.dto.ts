import {
  IsUUID,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  IsString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum PaymentMethodDto {
  CREDIT_CARD = 'CREDIT_CARD',
  ATM = 'ATM',
  CVS = 'CVS',
  BARCODE = 'BARCODE',
}

export class CreatePaymentDto {
  @ApiProperty({ description: 'Booking ID to pay for' })
  @IsUUID()
  @IsNotEmpty()
  bookingId: string;

  @ApiProperty({ enum: PaymentMethodDto, description: 'Payment method' })
  @IsEnum(PaymentMethodDto)
  paymentMethod: PaymentMethodDto;

  @ApiProperty({ description: 'Client-side return URL after payment', required: false })
  @IsString()
  @IsOptional()
  returnUrl?: string;
}
