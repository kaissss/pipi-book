import { Module } from '@nestjs/common';
import { BookingController } from './booking.controller';
import { BookingService } from './booking.service';
import { BookingRepository } from './booking.repository';
import { BookingRedisLockService } from './booking.redis-lock.service';
import { AvailabilityModule } from '../availability/availability.module';

@Module({
  imports: [AvailabilityModule],
  controllers: [BookingController],
  providers: [
    BookingService,
    BookingRepository,
    BookingRedisLockService,
  ],
  exports: [BookingService, BookingRepository],
})
export class BookingModule {}
