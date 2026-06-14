import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { NotificationRepository } from './notification.repository';
import { LineMessagingService } from './line-messaging.service';
import { NotificationType } from '@prisma/client';
import { BOOKING_REMINDER_QUEUE } from '../../common/constants/booking.constant';
import { BookingReminderJobData } from './jobs/send-booking-reminder.job';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    private readonly notificationRepository: NotificationRepository,
    private readonly lineMessagingService: LineMessagingService,
    @InjectQueue(BOOKING_REMINDER_QUEUE) private readonly reminderQueue: Queue,
  ) {}

  /**
   * Send a booking confirmation notification (LINE + DB).
   */
  async sendBookingConfirmation(
    data: BookingReminderJobData & { amount: number },
  ): Promise<void> {
    const message = this.lineMessagingService.buildBookingConfirmationMessage({
      coachNickname: data.coachNickname,
      date: data.date,
      startTime: data.startTime,
      endTime: data.endTime,
      serviceTitle: data.serviceTitle,
      amount: data.amount,
    });

    await Promise.all([
      this.lineMessagingService.pushMessage(data.memberLineUserId, message),
      this.notificationRepository.create({
        user: { connect: { id: data.memberId } },
        type: NotificationType.BOOKING_CONFIRMED,
        content: message,
      }),
    ]);

    this.logger.log({
      message: 'Booking confirmation notification sent',
      bookingId: data.bookingId,
      memberId: data.memberId,
    });
  }

  /**
   * Send a booking cancellation notification (LINE + DB).
   */
  async sendBookingCancellation(data: BookingReminderJobData): Promise<void> {
    const message = this.lineMessagingService.buildBookingCancellationMessage({
      coachNickname: data.coachNickname,
      date: data.date,
      startTime: data.startTime,
    });

    await Promise.all([
      this.lineMessagingService.pushMessage(data.memberLineUserId, message),
      this.notificationRepository.create({
        user: { connect: { id: data.memberId } },
        type: NotificationType.BOOKING_CANCELLED,
        content: message,
      }),
    ]);

    this.logger.log({
      message: 'Booking cancellation notification sent',
      bookingId: data.bookingId,
    });
  }

  /**
   * Send a booking reminder notification (LINE + DB).
   */
  async sendBookingReminder(data: BookingReminderJobData): Promise<void> {
    const message = this.lineMessagingService.buildReminderMessage({
      coachNickname: data.coachNickname,
      date: data.date,
      startTime: data.startTime,
      serviceTitle: data.serviceTitle,
    });

    await Promise.all([
      this.lineMessagingService.pushMessage(data.memberLineUserId, message),
      this.notificationRepository.create({
        user: { connect: { id: data.memberId } },
        type: NotificationType.BOOKING_REMINDER,
        content: message,
      }),
    ]);

    this.logger.log({
      message: 'Booking reminder sent',
      bookingId: data.bookingId,
      memberId: data.memberId,
    });
  }

  /**
   * Enqueue a booking reminder job to run 24h before the session.
   */
  async scheduleBookingReminder(
    data: BookingReminderJobData,
    sessionDatetime: Date,
  ): Promise<void> {
    const reminderTime = new Date(sessionDatetime.getTime() - 24 * 60 * 60 * 1000);
    const delay = Math.max(0, reminderTime.getTime() - Date.now());

    await this.reminderQueue.add('send-reminder', data, {
      delay,
      attempts: 3,
      backoff: { type: 'exponential', delay: 5000 },
      removeOnComplete: true,
      removeOnFail: false,
    });

    this.logger.log({
      message: 'Booking reminder scheduled',
      bookingId: data.bookingId,
      reminderAt: reminderTime.toISOString(),
      delayMs: delay,
    });
  }

  /**
   * Enqueue a booking confirmation notification job.
   */
  async queueBookingConfirmation(
    data: BookingReminderJobData & { amount: number },
  ): Promise<void> {
    await this.reminderQueue.add('send-confirmation', data, {
      attempts: 3,
      backoff: { type: 'fixed', delay: 2000 },
      removeOnComplete: true,
    });
  }

  /**
   * Enqueue a booking cancellation notification job.
   */
  async queueBookingCancellation(data: BookingReminderJobData): Promise<void> {
    await this.reminderQueue.add('send-cancellation', data, {
      attempts: 3,
      backoff: { type: 'fixed', delay: 2000 },
      removeOnComplete: true,
    });
  }

  async getUserNotifications(userId: string, unreadOnly: boolean = false) {
    return this.notificationRepository.findByUserId(userId, unreadOnly);
  }

  async markAsRead(id: string, userId: string) {
    return this.notificationRepository.markAsRead(id, userId);
  }

  async markAllAsRead(userId: string): Promise<{ count: number }> {
    const count = await this.notificationRepository.markAllAsRead(userId);
    return { count };
  }

  async getUnreadCount(userId: string): Promise<{ count: number }> {
    const count = await this.notificationRepository.countUnread(userId);
    return { count };
  }
}
