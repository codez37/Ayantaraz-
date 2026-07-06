import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class CsrfMiddleware implements NestMiddleware {
  private readonly logger = new Logger(CsrfMiddleware.name);

  private readonly skipPaths = [
    '/api/auth/otp',
    '/api/auth/verify',
    '/api/auth/refresh',
    '/api/health',
    '/api/csrf/token',
    '/auth/otp',      // بدون prefix
    '/auth/verify',
    '/auth/refresh',
    '/health',
    '/csrf/token',
  ];

  use(req: Request, res: Response, next: NextFunction) {
    // Safe methods need no CSRF
    if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
      return next();
    }

    const path = req.path || req.url || '';

    // Skip auth endpoints
    if (this.skipPaths.some(sp => path.startsWith(sp))) {
      return next();
    }

    const csrfHeader = req.headers['x-csrf-token'] as string | undefined;
    const csrfCookie = req.cookies?.['csrf-token'];

    if (!csrfHeader || !csrfCookie) {
      this.logger.warn(`CSRF missing: header=${!!csrfHeader} cookie=${!!csrfCookie} path=${path}`);
      return res.status(403).json({ message: 'CSRF token required' });
    }

    // Constant-time comparison
    const match = this.timingSafeEqual(csrfHeader, csrfCookie);
    if (!match) {
      this.logger.warn(`CSRF mismatch: path=${path}`);
      return res.status(403).json({ message: 'Invalid CSRF token' });
    }

    next();
  }

  private timingSafeEqual(a: string, b: string): boolean {
    if (a.length !== b.length) return false;
    let result = 0;
    for (let i = 0; i < a.length; i++) {
      result |= a.charCodeAt(i) ^ b.charCodeAt(i);
    }
    return result === 0;
  }
}
