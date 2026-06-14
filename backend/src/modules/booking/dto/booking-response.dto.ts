import { ApiProperty } from '@nestjs/swagger';

export class BookingResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() memberId: string;
  @ApiProperty() coachId: string;
  @ApiProperty() serviceId: string;
  @ApiProperty() slotId: string;
  @ApiProperty() bookingStatus: string;
  @ApiProperty() createdAt: Date;
  @ApiProperty({ required: false }) service?: {
    title: string;
    duration: number;
    price: number;
  };
  @ApiProperty({ required: false }) slot?: {
    date: string;
    startTime: string;
    endTime: string;
  };
  @ApiProperty({ required: false }) coach?: {
    nickname: string;
    userId: string;
  };
}
