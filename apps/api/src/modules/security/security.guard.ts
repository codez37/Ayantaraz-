import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { CaptchaService } from './captcha.service';
import { RateLimiterService } from './rate-limiter.service';

export const CAPTCHA_REQUIRED_KEY = 'captcha_required';
export const RATE_LIMIT_TIER_KEY = 'rate_limit_tier';
export const IS_PUBLIC_KEY = 'isPublic';

const RATE_LIMITS: Record<string, { limit: number; windowMs: number }> = {
  auth: { limit: 5, windowMs: 60_000 },
  default: { limit: 100, windowMs: 60_000 },
  strict: { limit: 10, windowMs: 60_000 },
};

@Injectable()
export class SecurityGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private captchaService: CaptchaService,
    private rateLimiterService: RateLimiterService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const clientKey = this.extractClientKey(request);

    // 1. Rate Limiting (cheapest first)
    const tier = this.reflector.getAllAndOverride<string>(RATE_LIMIT_TIER_KEY, [
      context.getHandler(),
      context.getClass(),
    ]) || 'default';

    const rateConfig = RATE_LIMITS[tier] || RATE_LIMITS.default;
    const allowed = await this.rateLimiterService.isAllowed(
      `${tier}:${clientKey}`,
      rateConfig.limit,
      rateConfig.windowMs,
    );
    if (!allowed) {
      throw new ForbiddenException('Too many requests. Please try again later.');
    }

    // 2. Captcha Verification
    const requiresCaptcha = this.reflector.getAllAndOverride<boolean>(
      CAPTCHA_REQUIRED_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (requiresCaptcha) {
      const captchaToken = request.headers['x-captcha-token'] as string;
      if (!captchaToken) {
        throw new UnauthorizedException('Captcha required');
      }
      const valid = await this.captchaService.verify(captchaToken);
      if (!valid) {
        throw new UnauthorizedException('Invalid captcha');
      }
    }

    return true;
  }

  private extractClientKey(req: Request): string {
    const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim()
      || req.ip
      || req.socket.remoteAddress
      || 'unknown';
    const ua = req.headers['user-agent'] || '';
    return `${ip}:${ua.slice(0, 50)}`;
  }
}
