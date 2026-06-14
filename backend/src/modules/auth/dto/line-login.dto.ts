import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LineLoginDto {
  @ApiProperty({ description: 'Authorization code from LINE Login redirect' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({ description: 'State parameter for CSRF protection' })
  @IsString()
  @IsNotEmpty()
  state: string;

  @ApiProperty({ description: 'Redirect URI used during authorization', required: false })
  @IsString()
  @IsOptional()
  redirectUri?: string;
}

export class RefreshTokenDto {
  @ApiProperty({ description: 'Refresh token' })
  @IsString()
  @IsNotEmpty()
  refreshToken: string;
}
