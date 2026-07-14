import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtAuthGuard } from './jwt-auth.guard';
import { RolesGuard } from './roles.guard';
import { SecurityGuard } from '../../modules/security/security.guard';

/**
 * Combined Authentication Guard
 * 
 * Combines SecurityGuard, JwtAuthGuard, and RolesGuard into a single guard
 * to ensure all security checks are applied.
 * 
 * This is necessary because NestJS only uses the LAST registered APP_GUARD.
 */
@Injectable()
export class CombinedAuthGuard implements CanActivate {
  private readonly jwtGuard: JwtAuthGuard;
  private readonly rolesGuard: RolesGuard;
  private readonly securityGuard: SecurityGuard;

  constructor(
    jwtGuard: JwtAuthGuard,
    rolesGuard: RolesGuard,
    securityGuard: SecurityGuard,
    private reflector: Reflector,
  ) {
    this.jwtGuard = jwtGuard;
    this.rolesGuard = rolesGuard;
    this.securityGuard = securityGuard;
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // First: Security Guard (IP validation, rate limiting, etc.)
    const securityPassed = await this.securityGuard.canActivate(context);
    if (!securityPassed) {
      return false;
    }

    // Second: JWT Authentication Guard
    const jwtPassed = await this.jwtGuard.canActivate(context);
    if (!jwtPassed) {
      return false;
    }

    // Third: Roles Guard (authorization)
    const rolesPassed = await this.rolesGuard.canActivate(context);
    if (!rolesPassed) {
      return false;
    }

    return true;
  }
}
