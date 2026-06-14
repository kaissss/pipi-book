import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { Request, Response } from 'express';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();
    const { method, url, body, headers } = request;
    const userId = (request as any).user?.sub;
    const startTime = Date.now();

    this.logger.log({
      message: 'Incoming request',
      method,
      url,
      userId: userId || 'anonymous',
      userAgent: headers['user-agent'],
    });

    return next.handle().pipe(
      tap(() => {
        const duration = Date.now() - startTime;
        this.logger.log({
          message: 'Request completed',
          method,
          url,
          statusCode: response.statusCode,
          duration: `${duration}ms`,
          userId: userId || 'anonymous',
        });
      }),
      catchError((error) => {
        const duration = Date.now() - startTime;
        this.logger.error({
          message: 'Request failed',
          method,
          url,
          statusCode: error.status || 500,
          duration: `${duration}ms`,
          userId: userId || 'anonymous',
          error: error.message,
          errorCode: error.errorCode,
        });
        return throwError(() => error);
      }),
    );
  }
}
