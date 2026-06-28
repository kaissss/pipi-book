import { IsUUID, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class InitPaymentDto {
  @ApiProperty({ description: 'Booking ID to pay for' })
  @IsUUID()
  @IsNotEmpty()
  bookingId: string;

  @ApiProperty({
    description: 'Provider/method hint from the client (e.g. ECPAY, CREDIT_CARD)',
    required: false,
  })
  @IsString()
  @IsOptional()
  method?: string;

  @ApiProperty({ description: 'Browser return URL after payment', required: false })
  @IsString()
  @IsOptional()
  returnUrl?: string;
}
