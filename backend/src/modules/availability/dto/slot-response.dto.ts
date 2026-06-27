import { ApiProperty } from '@nestjs/swagger';

export class SlotResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() coachId: string;
  @ApiProperty({ description: 'ISO 8601 start datetime' }) startTime: string;
  @ApiProperty({ description: 'ISO 8601 end datetime' }) endTime: string;
  @ApiProperty({ enum: ['AVAILABLE', 'BOOKED', 'BLOCKED'] }) status: string;
}
