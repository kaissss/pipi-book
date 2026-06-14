import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { NotificationService } from './notification.service';
import { NotificationRepository } from './notification.repository';
import { LineMessagingService } from './line-messaging.service';
import { SendBookingReminderJob } from './jobs/send-booking-reminder.job';
import { BOOKING_REMINDER_QUEUE } from '../../common/constants/booking.constant';

@Module({
  imports: [
    BullModule.registerQueue({
      name: BOOKING_REMINDER_QUEUE,
      defaultJobOptions: {
        attempts: 3,
        backoff: { type: 'exponential', delay: 5000 },
        removeOnComplete: 100,
        removeOnFail: 200,
      },
    }),
  ],
  providers: [
    NotificationService,
    NotificationRepository,
    LineMessagingService,
    SendBookingReminderJob,
  ],
  exports: [NotificationService],
})
export class NotificationModule {}
