import { Injectable, ExecutionContext, UnauthorizedException, Logger } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  private readonly logger = new Logger(JwtAuthGuard.name);
  constructor(private reflector: Reflector) { super(); }
  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [context.getHandler(), context.getClass()]);
    if (isPublic) return true;
    return super.canActivate(context);
  }
  handleRequest<TUser = any>(err: any, user: TUser) {
    if (err || !user) {
      this.logger.warn(`Authentication failed: ${err?.message || 'No user'}`);
      throw err || new UnauthorizedException('Invalid token');
    }
    if (!user?.id) {
      this.logger.warn('Authenticated user missing ID');
      throw new UnauthorizedException('Invalid token');
    }
    return user;
  }
}