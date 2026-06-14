import { IsString, IsNotEmpty, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateBookingDto {
  @ApiProperty({ description: 'Coach ID to book' })
  @IsUUID()
  @IsNotEmpty()
  coachId: string;

  @ApiProperty({ description: 'Service ID' })
  @IsUUID()
  @IsNotEmpty()
  serviceId: string;

  @ApiProperty({ description: 'Slot ID to book' })
  @IsUUID()
  @IsNotEmpty()
  slotId: string;
}

export class CancelBookingDto {
  @ApiProperty({ description: 'Cancellation reason', required: false })
  @IsString()
  reason?: string;
}
