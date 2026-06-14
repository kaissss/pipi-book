import {
  IsString,
  IsNotEmpty,
  IsDateString,
  Matches,
  IsOptional,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateSlotDto {
  @ApiProperty({ description: 'Date of the slot (YYYY-MM-DD)' })
  @IsDateString()
  date: string;

  @ApiProperty({ description: 'Start time (HH:mm)' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'startTime must be in HH:mm format',
  })
  startTime: string;

  @ApiProperty({ description: 'End time (HH:mm)' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'endTime must be in HH:mm format',
  })
  endTime: string;
}

export class CreateBulkSlotsDto {
  @ApiProperty({ type: [CreateSlotDto], description: 'Array of slots to create' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateSlotDto)
  slots: CreateSlotDto[];
}
