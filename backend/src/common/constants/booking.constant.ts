export enum BookingStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
}

export enum SlotStatus {
  OPEN = 'OPEN',
  LOCKED = 'LOCKED',
  BOOKED = 'BOOKED',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
}

export const SLOT_LOCK_TTL_SECONDS = 300; // 5 minutes
export const BOOKING_REMINDER_QUEUE = 'booking-reminder';
export const NOTIFICATION_QUEUE = 'notification';
