import { Injectable, CanActivate, ExecutionContext, Logger } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RateLimiterService } from './rate-limiter.service';

@Injectable()
export class SecurityGuard implements CanActivate {
  private readonly logger = new Logger(SecurityGuard.name);
  constructor(private reflector: Reflector, private rateLimiter: RateLimiterService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const ip = this.getClientIp(request);
    const userId = request.user?.id?.toString();
    const identifier = userId || ip;

    const isPublic = this.reflector.getAllAndOverride<boolean>('isPublic', [context.getHandler(), context.getClass()]);
    if (isPublic) return true;

    const routePath = this.getRoutePath(context);
    const configName = this.getRateLimitConfig(routePath);

    try {
      const result = await this.rateLimiter.increment(identifier, configName);
      if (!result.allowed) {
        this.logger.warn(`Rate limit exceeded for ${identifier} on ${routePath}: ${result.remaining} remaining`);
        return false;
      }

      const response = context.switchToHttp().getResponse();
      response.setHeader('X-RateLimit-Limit', '100');
      response.setHeader('X-RateLimit-Remaining', result.remaining.toString());
      response.setHeader('X-RateLimit-Reset', Math.ceil(result.resetTime.getTime() / 1000).toString());
      return true;
    } catch (error) {
      this.logger.error(`Rate limit check failed: ${error instanceof Error ? error.message : String(error)}`);
      return true;
    }
  }

  private getClientIp(request: any): string {
    const forwarded = request.headers['x-forwarded-for'];
    if (typeof forwarded === 'string') return forwarded.split(',')[0].trim();
    return request.ip || request.connection?.remoteAddress || 'unknown';
  }

  private getRoutePath(context: ExecutionContext): string {
    try { const request = context.switchToHttp().getRequest(); return request.route?.path || request.path || 'unknown'; } catch { return 'unknown'; }
  }

  private getRateLimitConfig(routePath: string): string {
    if (routePath.includes('/auth/') || routePath.includes('/login') || routePath.includes('/otp')) return 'auth';
    if (routePath.startsWith('/api/')) return 'api';
    return 'default';
  }
}