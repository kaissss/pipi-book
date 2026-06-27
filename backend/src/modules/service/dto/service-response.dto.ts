import { ApiProperty } from '@nestjs/swagger';

export class ServiceResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() coachId: string;
  @ApiProperty() name: string;
  @ApiProperty() description: string;
  @ApiProperty({ enum: ['ONE_ON_ONE', 'GROUP', 'WORKSHOP'] }) type: string;
  @ApiProperty() durationMinutes: number;
  @ApiProperty() price: number;
  @ApiProperty() currency: string;
  @ApiProperty() maxParticipants: number;
  @ApiProperty() isActive: boolean;
  @ApiProperty() createdAt: Date;
  @ApiProperty() updatedAt: Date;
}
