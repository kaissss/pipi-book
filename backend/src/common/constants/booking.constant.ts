export enum BookingStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED',
  NO_SHOW = 'NO_SHOW',
}

export enum SlotStatus {
  OPEN = 'OPEN',
  LOCKED = 'LOCKED',
  BOOKED = 'BOOKED',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
  CANCELLED = 'CANCELLED',
}

export const SLOT_LOCK_TTL_SECONDS = 300; // 5 minutes
export const BOOKING_REMINDER_QUEUE = 'booking-reminder';
export const NOTIFICATION_QUEUE = 'notification';
