import { IsIn, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

// Dev-only: see AuthService.devLogin. Never enabled in production.
export class DevLoginDto {
  @ApiProperty({ enum: ['STUDENT', 'COACH', 'ADMIN'], required: false, default: 'STUDENT' })
  @IsIn(['STUDENT', 'COACH', 'ADMIN'])
  @IsOptional()
  role?: 'STUDENT' | 'COACH' | 'ADMIN';
}
