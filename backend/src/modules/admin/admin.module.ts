import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { CoachModule } from '../coach/coach.module';
import { BookingModule } from '../booking/booking.module';

@Module({
  imports: [CoachModule, BookingModule],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
