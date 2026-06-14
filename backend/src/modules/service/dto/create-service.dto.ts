import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsBoolean,
  Min,
  MaxLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateServiceDto {
  @ApiProperty({ description: 'Service title' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title: string;

  @ApiProperty({ description: 'Duration in minutes' })
  @IsNumber()
  @Min(15)
  @Type(() => Number)
  duration: number;

  @ApiProperty({ description: 'Price in TWD' })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Type(() => Number)
  price: number;

  @ApiProperty({ description: 'Service description', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(1000)
  description?: string;

  @ApiProperty({ description: 'Whether service is active', required: false, default: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
