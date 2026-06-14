import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsArray,
  IsNumber,
  Min,
  MaxLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateCoachDto {
  @ApiProperty({ description: 'Coach display nickname' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  nickname: string;

  @ApiProperty({ description: 'Coach introduction / bio', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(2000)
  introduction?: string;

  @ApiProperty({ description: 'Years or description of experience', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(1000)
  experience?: string;

  @ApiProperty({ description: 'List of certifications', required: false, type: [String] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  certifications?: string[];

  @ApiProperty({ description: 'Hourly price in TWD' })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Type(() => Number)
  hourlyPrice: number;
}
