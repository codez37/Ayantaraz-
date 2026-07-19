import { LoggerService, Injectable } from '@nestjs/common';
import * as process from 'process';

@Injectable()
export class JsonLogger implements LoggerService {
  private format(
    level: string,
    message: string,
    context?: string,
    trace?: string,
    metadata?: Record<string, unknown>,
  ): string {
    const entry: Record<string, unknown> = {
      level,
      timestamp: new Date().toISOString(),
      message,
      context,
      pid: process.pid,
      hostname: process.env.HOSTNAME || 'localhost',
      env: process.env.NODE_ENV || 'development',
      ...metadata,
    };
    if (trace) entry.trace = trace;
    return JSON.stringify(entry);
  }
  log(
    message: string,
    context?: string,
    metadata?: Record<string, unknown>,
  ): void {
    console.log(this.format('info', message, context, undefined, metadata));
  }
  error(
    message: string,
    trace?: string,
    context?: string,
    metadata?: Record<string, unknown>,
  ): void {
    console.error(this.format('error', message, context, trace, metadata));
  }
  warn(
    message: string,
    context?: string,
    metadata?: Record<string, unknown>,
  ): void {
    console.warn(this.format('warn', message, context, undefined, metadata));
  }
  debug(
    message: string,
    context?: string,
    metadata?: Record<string, unknown>,
  ): void {
    console.debug(this.format('debug', message, context, undefined, metadata));
  }
  verbose(
    message: string,
    context?: string,
    metadata?: Record<string, unknown>,
  ): void {
    console.log(this.format('verbose', message, context, undefined, metadata));
  }
}
