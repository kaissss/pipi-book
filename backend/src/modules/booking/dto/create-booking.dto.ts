import { IsString, IsNotEmpty, IsUUID, IsOptional, MaxLength } from 'class-validator';
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

  @ApiProperty({ description: 'Notes for the coach', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(1000)
  notes?: string;
}

export class CancelBookingDto {
  @ApiProperty({ description: 'Cancellation reason', required: false })
  @IsString()
  @IsOptional()
  reason?: string;
}

export class AddMeetingUrlDto {
  @ApiProperty({ description: 'Meeting URL' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  meetingUrl: string;
}
