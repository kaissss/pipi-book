import { ApiProperty } from '@nestjs/swagger';

export class UserProfileDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  lineUserId: string;

  @ApiProperty({ required: false })
  email?: string;

  @ApiProperty({ required: false })
  displayName?: string;

  @ApiProperty({ required: false })
  avatar?: string;

  @ApiProperty()
  role: string;

  @ApiProperty()
  status: string;
}

export class AuthResponseDto {
  @ApiProperty()
  accessToken: string;

  @ApiProperty()
  refreshToken: string;

  @ApiProperty()
  expiresIn: number;

  @ApiProperty({ type: () => UserProfileDto })
  user: UserProfileDto;
}

export class RefreshResponseDto {
  @ApiProperty()
  accessToken: string;

  @ApiProperty()
  expiresIn: number;
}
