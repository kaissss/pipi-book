import { IsString, IsOptional, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RejectCoachDto {
  @ApiProperty({ description: 'Reason for rejection', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(1000)
  reason?: string;
}
