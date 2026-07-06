import { LoggerService } from '@nestjs/common';

export class JsonLogger implements LoggerService {
  private format(
    level: string,
    message: string,
    context?: string,
    trace?: string,
  ): string {
    const entry: Record<string, unknown> = {
      level,
      timestamp: new Date().toISOString(),
      message,
      context,
      pid: process.pid,
      env: process.env.NODE_ENV || 'development',
    };
    if (trace) entry.trace = trace;
    return JSON.stringify(entry);
  }

  log(message: string, context?: string): void {
    console.log(this.format('info', message, context));
  }

  error(message: string, trace?: string, context?: string): void {
    console.error(this.format('error', message, context, trace));
  }

  warn(message: string, context?: string): void {
    console.warn(this.format('warn', message, context));
  }

  debug(message: string, context?: string): void {
    console.debug(this.format('debug', message, context));
  }

  verbose(message: string, context?: string): void {
    console.log(this.format('verbose', message, context));
  }
}
