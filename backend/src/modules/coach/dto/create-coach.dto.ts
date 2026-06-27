import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsArray,
  IsInt,
  Min,
  MaxLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateCoachDto {
  @ApiProperty({ description: 'Coach bio / introduction' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  bio: string;

  @ApiProperty({ description: 'Coaching specialties', required: false, type: [String] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  specialties?: string[];

  @ApiProperty({ description: 'Years of experience', required: false })
  @IsInt()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  experience?: number;

  @ApiProperty({ description: 'Languages spoken', required: false, type: [String] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  languages?: string[];

  @ApiProperty({ description: 'Location', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(200)
  location?: string;

  @ApiProperty({ description: 'IANA timezone, e.g. Asia/Taipei', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  timezone?: string;

  @ApiProperty({ description: 'List of certifications', required: false, type: [String] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  certifications?: string[];
}
