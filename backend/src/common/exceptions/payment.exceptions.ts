import { HttpStatus } from '@nestjs/common';
import { BaseException } from './base.exception';

export class PaymentNotFoundException extends BaseException {
  constructor(paymentId?: string) {
    super(
      paymentId ? `Payment ${paymentId} not found` : 'Payment not found',
      'PAYMENT_NOT_FOUND',
      HttpStatus.NOT_FOUND,
    );
  }
}

export class PaymentAlreadyProcessedException extends BaseException {
  constructor() {
    super(
      'Payment has already been processed',
      'PAYMENT_ALREADY_PROCESSED',
      HttpStatus.CONFLICT,
    );
  }
}

export class PaymentSignatureInvalidException extends BaseException {
  constructor() {
    super(
      'ECPay webhook signature verification failed',
      'PAYMENT_SIGNATURE_INVALID',
      HttpStatus.BAD_REQUEST,
    );
  }
}

export class PaymentCreationFailedException extends BaseException {
  constructor(message?: string) {
    super(
      message || 'Failed to create payment order',
      'PAYMENT_CREATION_FAILED',
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}

export class PaymentBookingMismatchException extends BaseException {
  constructor() {
    super(
      'Payment does not match the provided booking',
      'PAYMENT_BOOKING_MISMATCH',
      HttpStatus.BAD_REQUEST,
    );
  }
}
