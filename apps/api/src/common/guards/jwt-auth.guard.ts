import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { AuthenticatedUser } from '../types/authenticated-user';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  private readonly logger = new Logger(JwtAuthGuard.name);
  constructor(private reflector: Reflector) {
    super();
  }
  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;
    return super.canActivate(context);
  }
  handleRequest<TUser = AuthenticatedUser>(
    err: Error | null,
    user: TUser | null,
  ): TUser {
    if (err || !user) {
      this.logger.warn(`Authentication failed: ${err?.message ?? 'No user'}`);
      throw err || new UnauthorizedException('Invalid token');
    }
    const authenticatedUser = user as unknown as AuthenticatedUser | null;
    if (!authenticatedUser?.id) {
      this.logger.warn('Authenticated user missing ID');
      throw new UnauthorizedException('Invalid token');
    }
    return user;
  }
}
