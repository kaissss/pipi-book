import { Module } from '@nestjs/common';
import { BookingController } from './booking.controller';
import { BookingService } from './booking.service';
import { BookingRepository } from './booking.repository';
import { BookingRedisLockService } from './booking.redis-lock.service';
import { AvailabilityModule } from '../availability/availability.module';
import { CoachModule } from '../coach/coach.module';

@Module({
  imports: [AvailabilityModule, CoachModule],
  controllers: [BookingController],
  providers: [
    BookingService,
    BookingRepository,
    BookingRedisLockService,
  ],
  exports: [BookingService, BookingRepository],
})
export class BookingModule {}
