import { Process, Processor, OnQueueFailed, OnQueueCompleted } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { NotificationService } from '../notification.service';
import { BOOKING_REMINDER_QUEUE } from '../../../common/constants/booking.constant';

export interface BookingReminderJobData {
  bookingId: string;
  memberId: string;
  memberLineUserId: string;
  coachLineUserId: string;
  coachNickname: string;
  serviceTitle: string;
  date: string;
  startTime: string;
  endTime: string;
}

@Processor(BOOKING_REMINDER_QUEUE)
export class SendBookingReminderJob {
  private readonly logger = new Logger(SendBookingReminderJob.name);

  constructor(private readonly notificationService: NotificationService) {}

  @Process('send-reminder')
  async handleReminderJob(job: Job<BookingReminderJobData>): Promise<void> {
    const data = job.data;

    this.logger.log({
      message: 'Processing booking reminder job',
      jobId: job.id,
      bookingId: data.bookingId,
      memberId: data.memberId,
    });

    await this.notificationService.sendBookingReminder(data);
  }

  @Process('send-confirmation')
  async handleConfirmationJob(
    job: Job<BookingReminderJobData & { amount: number }>,
  ): Promise<void> {
    const data = job.data;

    this.logger.log({
      message: 'Processing booking confirmation notification job',
      jobId: job.id,
      bookingId: data.bookingId,
    });

    await this.notificationService.sendBookingConfirmation(data);
  }

  @Process('send-cancellation')
  async handleCancellationJob(job: Job<BookingReminderJobData>): Promise<void> {
    const data = job.data;

    this.logger.log({
      message: 'Processing booking cancellation notification job',
      jobId: job.id,
      bookingId: data.bookingId,
    });

    await this.notificationService.sendBookingCancellation(data);
  }

  @OnQueueFailed()
  onFailed(job: Job, error: Error): void {
    this.logger.error({
      message: 'Notification job failed',
      jobId: job.id,
      jobName: job.name,
      error: error.message,
      attempts: job.attemptsMade,
    });
  }

  @OnQueueCompleted()
  onCompleted(job: Job): void {
    this.logger.log({
      message: 'Notification job completed',
      jobId: job.id,
      jobName: job.name,
    });
  }
}
