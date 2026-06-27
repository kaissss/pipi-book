import { ApiProperty } from '@nestjs/swagger';
import { ServiceResponseDto } from '../../service/dto/service-response.dto';

export class CoachResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() userId: string;
  @ApiProperty() bio: string;
  @ApiProperty({ type: [String] }) specialties: string[];
  @ApiProperty() experience: number;
  // Placeholders until the review system exists (Phase 5).
  @ApiProperty() rating: number;
  @ApiProperty() reviewCount: number;
  @ApiProperty({ enum: ['PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED'] }) status: string;
  @ApiProperty() timezone: string;
  @ApiProperty({ required: false }) location?: string;
  @ApiProperty({ type: [String] }) languages: string[];
  @ApiProperty({ type: [String] }) certifications: string[];
  @ApiProperty({ required: false }) coverImageUrl?: string;
  @ApiProperty({ type: [ServiceResponseDto] }) services: ServiceResponseDto[];
  @ApiProperty() createdAt: Date;
  @ApiProperty() updatedAt: Date;
  @ApiProperty({ required: false }) user?: {
    id: string;
    displayName: string;
    avatar: string;
    email: string;
  };
}
