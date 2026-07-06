import {
  Injectable,
  NestMiddleware,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Request, Response, NextFunction } from 'express';

const MAX_BODY_SIZE = 8192;
const MAX_MESSAGE_SIZE = 2000;
const MAX_URL_SIZE = 2048;

const ZERO_WIDTH_CHARS = /[\u200B\u200C\u200D\u2060\u2061\u2062\u2063\uFEFF]/g;
const INVISIBLE_CHARS = /[\u00AD\u034F\u061C\u17B4\u17B5\u180E]/g;
const ARABIC_PERSIAN_DIGITS: Record<string, string> = {
  '۰': '0',
  '۱': '1',
  '۲': '2',
  '۳': '3',
  '۴': '4',
  '۵': '5',
  '۶': '6',
  '۷': '7',
  '۸': '8',
  '۹': '9',
  '٠': '0',
  '١': '1',
  '٢': '2',
  '٣': '3',
  '٤': '4',
  '٥': '5',
  '٦': '6',
  '٧': '7',
  '٨': '8',
  '٩': '9',
};

const INJECTION_PATTERNS = [
  /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
  /javascript:/gi,
  /on\w+\s*=/gi,
  /data\s*:\s*text\/html/gi,
  /vbscript:/gi,
  /expression\s*\(/gi,
  /eval\s*\(/gi,
  /document\.(cookie|domain|write)/gi,
  /window\.(location|open)/gi,
  /\\x[0-9a-f]{2}/gi,
  /\\u[0-9a-f]{4}/gi,
];

@Injectable()
export class InputSanitizationMiddleware implements NestMiddleware {
  private readonly logger = new Logger(InputSanitizationMiddleware.name);

  use(req: Request, _res: Response, next: NextFunction) {
    // 1. Check body size
    const rawBody = req.body;
    if (rawBody && typeof rawBody === 'object') {
      const bodyStr = JSON.stringify(rawBody);
      if (bodyStr.length > MAX_BODY_SIZE) {
        throw new HttpException(
          { code: 'PAYLOAD_TOO_LARGE', message: 'Maximum body size exceeded' },
          HttpStatus.PAYLOAD_TOO_LARGE,
        );
      }
    }

    // 2. Sanitize string fields recursively
    if (req.body && typeof req.body === 'object') {
      this.sanitizeObject(req.body);
    }

    // 3. Specific field size limits
    if (req.body?.message && typeof req.body.message === 'string') {
      if (req.body.message.length > MAX_MESSAGE_SIZE) {
        throw new HttpException(
          {
            code: 'MESSAGE_TOO_LONG',
            message: `Message must be ${MAX_MESSAGE_SIZE} characters or less`,
          },
          HttpStatus.BAD_REQUEST,
        );
      }
    }

    if (req.body?.url && typeof req.body.url === 'string') {
      if (req.body.url.length > MAX_URL_SIZE) {
        throw new HttpException(
          { code: 'URL_TOO_LONG', message: 'URL exceeds maximum length' },
          HttpStatus.BAD_REQUEST,
        );
      }
    }

    // 4. Check for injection patterns in body string values
    if (rawBody && typeof rawBody === 'object') {
      const bodyStr = JSON.stringify(rawBody);
      for (const pattern of INJECTION_PATTERNS) {
        if (pattern.test(bodyStr)) {
          this.logger.warn(
            JSON.stringify({
              type: 'injection_attempt',
              ip: req.ip,
              url: req.url,
              pattern: pattern.source.slice(0, 60),
            }),
          );
          throw new HttpException(
            {
              code: 'INVALID_INPUT',
              message: 'Request contains prohibited content',
            },
            HttpStatus.BAD_REQUEST,
          );
        }
      }
    }

    next();
  }

  private sanitizeObject(obj: Record<string, unknown>): void {
    for (const key of Object.keys(obj)) {
      const value = obj[key];
      if (typeof value === 'string') {
        obj[key] = this.normalizeString(value);
      } else if (value && typeof value === 'object' && !Array.isArray(value)) {
        this.sanitizeObject(value as Record<string, unknown>);
      } else if (Array.isArray(value)) {
        for (let i = 0; i < value.length; i++) {
          if (typeof value[i] === 'string') {
            value[i] = this.normalizeString(value[i]);
          } else if (value[i] && typeof value[i] === 'object') {
            this.sanitizeObject(value[i] as Record<string, unknown>);
          }
        }
      }
    }
  }

  private normalizeString(input: string): string {
    let result = input;

    // Convert Persian/Arabic digits to ASCII
    result = result.replace(
      /[۰-۹٠-٩]/g,
      (ch) => ARABIC_PERSIAN_DIGITS[ch] || ch,
    );

    // Strip zero-width and invisible characters
    result = result.replace(ZERO_WIDTH_CHARS, '');
    result = result.replace(INVISIBLE_CHARS, '');

    // Normalize whitespace (collapse multiple spaces, remove leading/trailing)
    result = result.replace(/\s+/g, ' ').trim();

    // Normalize Persian-specific chars
    result = result.replace(/[ي]/g, 'ی').replace(/[ك]/g, 'ک');

    return result;
  }
}
