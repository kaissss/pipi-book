import { ApiProperty } from '@nestjs/swagger';

export class CoachResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() userId: string;
  @ApiProperty() nickname: string;
  @ApiProperty({ required: false }) introduction?: string;
  @ApiProperty({ required: false }) experience?: string;
  @ApiProperty({ type: [String] }) certifications: string[];
  @ApiProperty() hourlyPrice: number;
  @ApiProperty() isApproved: boolean;
  @ApiProperty() createdAt: Date;
  @ApiProperty({ required: false }) user?: {
    id: string;
    displayName: string;
    avatar: string;
    email: string;
  };
}
