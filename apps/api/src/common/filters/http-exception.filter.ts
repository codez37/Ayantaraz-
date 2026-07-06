import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';

interface ErrorResponseBody {
  statusCode: number;
  message: string[];
  timestamp: string;
  error?: string;
  stack?: string;
  correlationId?: string;
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger('Exception');

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request & { correlationId?: string }>();
    const response = ctx.getResponse<Response>();
    const isProduction = process.env.NODE_ENV === 'production';
    const correlationId = request.correlationId || '-';

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();
      if (typeof res === 'string') {
        message = res;
      } else if (typeof res === 'object' && res !== null) {
        const resObj = res as Record<string, unknown>;
        message = Array.isArray(resObj.message)
          ? (resObj.message as string[]).join('; ')
          : typeof resObj.message === 'string'
            ? resObj.message
            : message;
      }
    } else if (exception instanceof Error) {
      this.logger.error(
        JSON.stringify({
          type: 'unhandled',
          correlationId,
          message: exception.message,
          stack: isProduction ? undefined : exception.stack,
        }),
      );
    }

    const body: ErrorResponseBody = {
      statusCode: status,
      message: [message],
      timestamp: new Date().toISOString(),
    };

    if (correlationId !== '-') {
      body.correlationId = correlationId;
    }

    if (!isProduction && exception instanceof Error) {
      body.error = exception.message;
      body.stack = exception.stack;
    }

    this.logger.error(
      JSON.stringify({
        type: 'http-error',
        correlationId,
        statusCode: status,
        message,
      }),
    );

    response.status(status).json(body);
  }
}
