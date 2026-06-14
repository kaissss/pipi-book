import { HttpException, HttpStatus } from '@nestjs/common';

export interface ExceptionResponse {
  success: false;
  message: string;
  errorCode: string;
  statusCode: number;
}

export class BaseException extends HttpException {
  public readonly errorCode: string;

  constructor(
    message: string,
    errorCode: string,
    statusCode: HttpStatus = HttpStatus.BAD_REQUEST,
  ) {
    const response: ExceptionResponse = {
      success: false,
      message,
      errorCode,
      statusCode,
    };
    super(response, statusCode);
    this.errorCode = errorCode;
  }
}
