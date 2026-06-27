import { ApiProperty } from '@nestjs/swagger';

// Mirrors the client-facing Booking shape. Nested relations are loosely typed
// here because they are assembled by the service's mappers.
export class BookingResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() studentId: string;
  @ApiProperty() coachId: string;
  @ApiProperty() serviceId: string;
  @ApiProperty() slotId: string;
  @ApiProperty() status: string;
  @ApiProperty({ required: false }) notes?: string;
  @ApiProperty({ required: false }) meetingUrl?: string;
  @ApiProperty() createdAt: Date;
  @ApiProperty() updatedAt: Date;
  @ApiProperty({ required: false }) student?: Record<string, any>;
  @ApiProperty({ required: false }) coach?: Record<string, any>;
  @ApiProperty({ required: false }) service?: Record<string, any>;
  @ApiProperty({ required: false }) slot?: Record<string, any>;
  @ApiProperty({ required: false }) payment?: Record<string, any>;
}
