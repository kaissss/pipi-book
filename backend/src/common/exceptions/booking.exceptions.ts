import { HttpStatus } from '@nestjs/common';
import { BaseException } from './base.exception';

export class BookingSlotUnavailableException extends BaseException {
  constructor(slotId?: string) {
    super(
      slotId
        ? `Slot ${slotId} is not available for booking`
        : 'The requested slot is not available',
      'BOOKING_SLOT_UNAVAILABLE',
      HttpStatus.CONFLICT,
    );
  }
}

export class BookingSlotLockedException extends BaseException {
  constructor(slotId?: string) {
    super(
      slotId
        ? `Slot ${slotId} is currently locked by another user`
        : 'The requested slot is currently locked',
      'BOOKING_SLOT_LOCKED',
      HttpStatus.CONFLICT,
    );
  }
}

export class BookingNotFoundException extends BaseException {
  constructor(bookingId?: string) {
    super(
      bookingId ? `Booking ${bookingId} not found` : 'Booking not found',
      'BOOKING_NOT_FOUND',
      HttpStatus.NOT_FOUND,
    );
  }
}

export class BookingAlreadyCancelledException extends BaseException {
  constructor() {
    super(
      'Booking has already been cancelled',
      'BOOKING_ALREADY_CANCELLED',
      HttpStatus.BAD_REQUEST,
    );
  }
}

export class BookingUnauthorizedException extends BaseException {
  constructor() {
    super(
      'You are not authorized to perform this action on this booking',
      'BOOKING_UNAUTHORIZED',
      HttpStatus.FORBIDDEN,
    );
  }
}

export class SlotNotFoundException extends BaseException {
  constructor(slotId?: string) {
    super(
      slotId ? `Slot ${slotId} not found` : 'Slot not found',
      'SLOT_NOT_FOUND',
      HttpStatus.NOT_FOUND,
    );
  }
}
