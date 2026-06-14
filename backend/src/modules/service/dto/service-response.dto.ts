import { ApiProperty } from '@nestjs/swagger';

export class ServiceResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() coachId: string;
  @ApiProperty() title: string;
  @ApiProperty() duration: number;
  @ApiProperty() price: number;
  @ApiProperty({ required: false }) description?: string;
  @ApiProperty() isActive: boolean;
  @ApiProperty() createdAt: Date;
}
