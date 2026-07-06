import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import type { Request, Response } from 'express';

@Injectable()
export class RequestLoggerInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  private maskPhone(phone: string): string {
    return phone.length >= 7
      ? phone.slice(0, 4) + '***' + phone.slice(-3)
      : '***';
  }

  private maskAuthHeader(auth?: string): string {
    return auth ? `Bearer ${auth.slice(0, 20)}...${auth.slice(-4)}` : 'none';
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<Request & { correlationId?: string }>();
    const { method, url, ip } = request;
    const correlationId = request.correlationId || '-';
    const start = Date.now();
    const safeAuth = this.maskAuthHeader(request.headers?.authorization);

    this.logger.log(
      JSON.stringify({
        type: 'request',
        correlationId,
        method,
        url,
        auth: safeAuth,
        ip,
      }),
    );

    return next.handle().pipe(
      tap({
        next: () => {
          const response = ctx.getResponse<Response>();
          const ms = Date.now() - start;
          this.logger.log(
            JSON.stringify({
              type: 'response',
              correlationId,
              method,
              url,
              statusCode: response.statusCode,
              durationMs: ms,
            }),
          );
        },
        error: (error: Error) => {
          const ms = Date.now() - start;
          const status =
            error && typeof error === 'object' && 'status' in error
              ? (error as { status: number }).status
              : 500;
          this.logger.error(
            JSON.stringify({
              type: 'error',
              correlationId,
              method,
              url,
              statusCode: status,
              durationMs: ms,
              message: error.message,
            }),
          );
        },
      }),
    );
  }
}
