import {
  IsDateString,
  IsOptional,
  IsString,
  IsUUID,
  IsArray,
  ValidateNested,
  ArrayMinSize,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateSlotDto {
  @ApiProperty({ description: 'ISO 8601 start datetime' })
  @IsDateString()
  startTime: string;

  @ApiProperty({ description: 'ISO 8601 end datetime' })
  @IsDateString()
  endTime: string;

  @ApiProperty({ description: 'Optional service this slot is for', required: false })
  @IsUUID()
  @IsOptional()
  serviceId?: string;

  @ApiProperty({ description: 'Optional recurrence rule (RRULE)', required: false })
  @IsString()
  @IsOptional()
  recurrenceRule?: string;
}

export class CreateBulkSlotsDto {
  @ApiProperty({ type: [CreateSlotDto], description: 'Slots to create' })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateSlotDto)
  slots: CreateSlotDto[];
}
