import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsInt,
  IsBoolean,
  IsEnum,
  Min,
  MaxLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ServiceType } from '@prisma/client';

export class CreateServiceDto {
  @ApiProperty({ description: 'Service name' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  name: string;

  @ApiProperty({ description: 'Service description', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(1000)
  description?: string;

  @ApiProperty({ enum: ServiceType, required: false, default: ServiceType.ONE_ON_ONE })
  @IsEnum(ServiceType)
  @IsOptional()
  type?: ServiceType;

  @ApiProperty({ description: 'Duration in minutes' })
  @IsInt()
  @Min(15)
  @Type(() => Number)
  durationMinutes: number;

  @ApiProperty({ description: 'Price in TWD' })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Type(() => Number)
  price: number;

  @ApiProperty({ description: 'Currency code', required: false, default: 'TWD' })
  @IsString()
  @IsOptional()
  @MaxLength(10)
  currency?: string;

  @ApiProperty({ description: 'Max participants', required: false, default: 1 })
  @IsInt()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  maxParticipants?: number;

  @ApiProperty({ description: 'Whether service is active', required: false, default: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
