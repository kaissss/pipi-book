import { ApiProperty } from '@nestjs/swagger';

export class SlotResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() coachId: string;
  @ApiProperty() date: string;
  @ApiProperty() startTime: string;
  @ApiProperty() endTime: string;
  @ApiProperty() status: string;
  @ApiProperty({ required: false }) lockedUntil?: Date;
  @ApiProperty() createdAt: Date;
}
