import { Module } from '@nestjs/common';
import { AvailabilityController } from './availability.controller';
import { AvailabilityService } from './availability.service';
import { AvailabilityRepository } from './availability.repository';
import { CoachModule } from '../coach/coach.module';

@Module({
  imports: [CoachModule],
  controllers: [AvailabilityController],
  providers: [AvailabilityService, AvailabilityRepository],
  exports: [AvailabilityService, AvailabilityRepository],
})
export class AvailabilityModule {}
