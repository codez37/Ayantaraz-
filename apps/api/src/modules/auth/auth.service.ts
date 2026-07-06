import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
import { SessionService } from './session.service';
import { User } from '@prisma/client';
import type { Response } from 'express';
import * as crypto from 'crypto';
import * as https from 'https';
import {
  TOKEN_ALGORITHM,
  TOKEN_ISSUER,
  TOKEN_AUDIENCE_ACCESS,
  TOKEN_AUDIENCE_REFRESH,
  REFRESH_CLOCK_TOLERANCE,
} from './auth.constants';

const OTP_LOCK_WINDOW = 30 * 60 * 1000;
const OTP_MAX_ATTEMPTS = 5;
const OTP_VERIFY_FAILED = 'Verification failed';

export enum RefreshError {
  EXPIRED = 'expired',
  REVOKED = 'revoked',
  INVALID = 'invalid',
  USER_NOT_FOUND = 'user_not_found',
  AUDIENCE_MISMATCH = 'audience_mismatch',
}

export interface TokensResult {
  accessToken: string;
  refreshToken: string;
}

export interface VerifyOtpResult extends TokensResult {
  user: {
    id: number;
    phone: string;
    firstName: string | null;
    lastName: string | null;
    role: string;
    isActive: boolean;
    lastLoginAt: Date | null;
    createdAt: Date;
  };
  isNew: boolean;
}

export interface SessionInfoResult {
  user: Pick<
    User,
    | 'id'
    | 'phone'
    | 'firstName'
    | 'lastName'
    | 'role'
    | 'isActive'
    | 'lastLoginAt'
    | 'createdAt'
  > | null;
  session: any;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private sessionService: SessionService,
  ) {}

  normalizePhone(input: string): string {
    let phone = input.replace(/[^\d+]/g, '');
    if (phone.startsWith('+98')) phone = '0' + phone.slice(3);
    else if (phone.startsWith('0098')) phone = '0' + phone.slice(4);
    else if (phone.startsWith('98') && phone.length === 12)
      phone = '0' + phone.slice(2);
    return phone;
  }

  private generateOtpCode(): string {
    return String(100000 + crypto.randomInt(0, 900000));
  }

  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  async requestOtp(phone: string): Promise<{ message: string }> {
    const normalized = this.normalizePhone(phone);

    if (!/^09\d{9}$/.test(normalized)) {
      throw new HttpException('شماره تلفن نامعتبر است', HttpStatus.BAD_REQUEST);
    }

    const recentCount = await this.prisma.oTP.count({
      where: {
        phone: normalized,
        createdAt: { gte: new Date(Date.now() - 10 * 60 * 1000) },
      },
    });

    if (recentCount >= 3) {
      throw new HttpException(
        'حداکثر تعداد ارسال کد. ۱۰ دقیقه صبر کنید.',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    const recentFailCount = await this.prisma.oTP.count({
      where: {
        phone: normalized,
        status: 'blocked',
        createdAt: { gte: new Date(Date.now() - OTP_LOCK_WINDOW) },
      },
    });

    if (recentFailCount >= OTP_MAX_ATTEMPTS) {
      throw new HttpException(
        'تلاش‌های ناموفق زیاد. ۳۰ دقیقه صبر کنید.',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    const code = this.generateOtpCode();
    const codeHash = this.hashToken(code);
    const expiresAt = new Date(Date.now() + 300 * 1000);

    await this.prisma.oTP.create({
      data: { phone: normalized, codeHash, expiresAt, sentAt: new Date() },
    });

    await this.prisma.auditLog.create({
      data: {
        action: 'auth:otp_send',
        entityType: 'otp',
        newValue: { phone: normalized },
      },
    });

    const sent = await this.sendSms(normalized, code);
    if (!sent) {
      return {
        message:
          'کد تایید ارسال شد، اما پیامک با تأخیر ارسال می‌شود. در صورت عدم دریافت با پشتیبانی تماس بگیرید.',
      };
    }
    return { message: 'کد تایید ارسال شد' };
  }

  async verifyOtp(
    phone: string,
    code: string,
    ipAddress?: string,
    deviceInfo?: string,
    res?: Response,
  ): Promise<Omit<VerifyOtpResult, 'accessToken' | 'refreshToken'>> {
    const normalized = this.normalizePhone(phone);

    if (!/^09\d{9}$/.test(normalized) || !/^\d{6}$/.test(code)) {
      throw new HttpException(OTP_VERIFY_FAILED, HttpStatus.UNAUTHORIZED);
    }

    const recentBlocked = await this.prisma.oTP.count({
      where: {
        phone: normalized,
        status: 'blocked',
        createdAt: { gte: new Date(Date.now() - OTP_LOCK_WINDOW) },
      },
    });

    if (recentBlocked >= OTP_MAX_ATTEMPTS) {
      throw new HttpException(OTP_VERIFY_FAILED, HttpStatus.UNAUTHORIZED);
    }

    const codeHash = this.hashToken(code);

    const otp = await this.prisma.oTP.findFirst({
      where: {
        phone: normalized,
        status: 'active',
        expiresAt: { gte: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!otp) {
      this.logger.warn(`OTP verify failed: no active code for ${normalized}`);
      throw new HttpException(OTP_VERIFY_FAILED, HttpStatus.UNAUTHORIZED);
    }

    await this.prisma.oTP.update({
      where: { id: otp.id },
      data: { attempts: { increment: 1 } },
    });

    const storedHash = otp.codeHash;

    const hashesEqual =
      storedHash.length === codeHash.length &&
      crypto.timingSafeEqual(Buffer.from(storedHash), Buffer.from(codeHash));

    if (!hashesEqual) {
      if (otp.attempts + 1 >= 5) {
        await this.prisma.oTP.update({
          where: { id: otp.id },
          data: { status: 'blocked' },
        });
      }
      await this.prisma.auditLog.create({
        data: {
          action: 'auth:otp_fail',
          entityType: 'otp',
          entityId: otp.id,
          newValue: { phone: normalized, attempt: otp.attempts + 1 },
        },
      });
      this.logger.warn(
        `OTP verify failed: wrong code for ${normalized} (attempt ${otp.attempts + 1})`,
      );
      throw new HttpException(OTP_VERIFY_FAILED, HttpStatus.UNAUTHORIZED);
    }

    const claimed = await this.prisma.oTP.updateMany({
      where: { id: otp.id, status: 'active' },
      data: { status: 'used', verifiedAt: new Date() },
    });
    if (claimed.count === 0) {
      this.logger.warn(`OTP verify failed: already used for ${normalized}`);
      throw new HttpException(OTP_VERIFY_FAILED, HttpStatus.UNAUTHORIZED);
    }

    const { user, isNew } = await this.prisma.$transaction(async (tx) => {
      let u = await tx.user.findUnique({
        where: { phone: normalized },
      });
      let isNewUser = false;

      if (!u) {
        u = await tx.user.create({
          data: { phone: normalized, role: 'user' },
        });
        isNewUser = true;
      }

      u = await tx.user.update({
        where: { id: u.id },
        data: { lastLoginAt: new Date() },
      });

      await tx.auditLog.create({
        data: {
          actorId: u.id,
          action: 'auth:login',
          entityType: 'user',
          entityId: u.id,
          newValue: { phone: normalized, isNew: isNewUser },
        },
      });

      return { user: u, isNew: isNewUser };
    });

    const tokens = this.generateTokens(user);
    await this.storeRefreshToken(user.id, tokens.refreshToken);

    const jti = crypto.randomUUID();
    await this.sessionService.create(user.id, jti, ipAddress, deviceInfo);

    if (res) {
      this.setAuthCookies(res, tokens.accessToken, tokens.refreshToken);
    }

    return { user: this.sanitizeUser(user), isNew };
  }

  async logout(userId: number, res?: Response): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: { userId, isRevoked: false },
      data: { isRevoked: true },
    });
    await this.sessionService.revokeAll(userId);
    await this.prisma.auditLog.create({
      data: {
        actorId: userId,
        action: 'auth:logout',
        entityType: 'user',
        entityId: userId,
      },
    });
    if (res) {
      this.clearAuthCookies(res);
    }
  }

  async getSessionInfo(userId: number): Promise<SessionInfoResult> {
    const session = await this.sessionService.getActiveSession(userId);
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        phone: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
      },
    });
    return { user, session };
  }

  async refreshTokens(
    refreshToken: string,
    res?: Response,
  ): Promise<{
    tokens: TokensResult;
    user: ReturnType<typeof AuthService.prototype.sanitizeUser>;
  }> {
    let payload: {
      sub: number;
      phone: string;
      role: string;
      iss?: string;
      aud?: string;
    };
    try {
      payload = this.jwtService.verify(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET,
        algorithms: [TOKEN_ALGORITHM],
        issuer: TOKEN_ISSUER,
        audience: TOKEN_AUDIENCE_REFRESH,
        clockTolerance: REFRESH_CLOCK_TOLERANCE,
      });
    } catch (err: any) {
      if (err.name === 'TokenExpiredError') {
        this.logger.warn(`Refresh token expired for sub=${err.payload?.sub}`);
        throw new HttpException('توکن منقضی شده است', HttpStatus.UNAUTHORIZED);
      }
      this.logger.warn(`Refresh token invalid: ${err.message}`);
      throw new HttpException('توکن نامعتبر است', HttpStatus.UNAUTHORIZED);
    }

    if (
      payload.iss !== TOKEN_ISSUER ||
      payload.aud !== TOKEN_AUDIENCE_REFRESH
    ) {
      this.logger.warn(
        `Token audience/issuer mismatch: iss=${payload.iss} aud=${payload.aud}`,
      );
      throw new HttpException('توکن نامعتبر است', HttpStatus.UNAUTHORIZED);
    }

    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
    });
    if (!user || !user.isActive) {
      throw new HttpException('توکن نامعتبر است', HttpStatus.UNAUTHORIZED);
    }

    const hash = this.hashToken(refreshToken);
    const stored = await this.prisma.refreshToken.findFirst({
      where: {
        tokenHash: hash,
        userId: user.id,
        isRevoked: false,
        expiresAt: { gte: new Date() },
      },
    });

    if (!stored) {
      await this.prisma.refreshToken.updateMany({
        where: { userId: user.id, isRevoked: false },
        data: { isRevoked: true },
      });
      await this.sessionService.revokeAll(user.id);
      this.logger.warn(
        `Refresh token reused/revoked for user ${user.id} — all sessions revoked`,
      );
      throw new HttpException('توکن نامعتبر است', HttpStatus.UNAUTHORIZED);
    }

    await this.prisma.refreshToken.update({
      where: { id: stored.id },
      data: { isRevoked: true },
    });

    const tokens = this.generateTokens(user);
    await this.storeRefreshToken(user.id, tokens.refreshToken);

    if (res) {
      this.setAuthCookies(res, tokens.accessToken, tokens.refreshToken);
    }
    return { tokens, user: this.sanitizeUser(user) };
  }

  private async storeRefreshToken(
    userId: number,
    token: string,
  ): Promise<void> {
    const hash = this.hashToken(token);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await this.prisma.refreshToken.create({
      data: { userId, tokenHash: hash, expiresAt },
    });
  }

  private generateTokens(user: User): TokensResult {
    const payload = { sub: user.id, phone: user.phone, role: user.role };
    return {
      accessToken: this.jwtService.sign(payload, {
        algorithm: TOKEN_ALGORITHM,
        expiresIn: (process.env.JWT_EXPIRATION || '15m') as any,
        issuer: TOKEN_ISSUER,
        audience: TOKEN_AUDIENCE_ACCESS,
        header: { typ: 'JWT', alg: TOKEN_ALGORITHM },
      }),
      refreshToken: this.jwtService.sign(payload, {
        algorithm: TOKEN_ALGORITHM,
        secret: process.env.JWT_REFRESH_SECRET,
        expiresIn: (process.env.JWT_REFRESH_EXPIRATION || '7d') as any,
        issuer: TOKEN_ISSUER,
        audience: TOKEN_AUDIENCE_REFRESH,
        header: { typ: 'JWT', alg: TOKEN_ALGORITHM },
      }),
    };
  }

  private sanitizeUser(user: User) {
    return {
      id: user.id,
      phone: user.phone,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      isActive: user.isActive,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
    };
  }

  private setAuthCookies(
    res: Response,
    accessToken: string,
    refreshToken: string,
  ) {
    const isProduction = process.env.NODE_ENV === 'production';
    const isSecure = process.env.COOKIE_SECURE !== 'false';

    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: isSecure,
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000,
      path: '/',
    });
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: isSecure,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/',
    });
  }

  private clearAuthCookies(res: Response) {
    res.clearCookie('accessToken', { path: '/' });
    res.clearCookie('refreshToken', { path: '/' });
  }

  private async sendSms(phone: string, code: string): Promise<boolean> {
    const apiKey = process.env.SMS_API_KEY;
    if (!apiKey) {
      this.logger.warn('SMS_API_KEY not set — SMS not sent');
      return false;
    }
    try {
      const url = 'https://s.api.ir/api/sw1/SmsOTP';
      const body = JSON.stringify({
        code,
        mobile: phone,
        template: 1,
      });
      const response = await new Promise<{ status: number; data: string }>(
        (resolve, reject) => {
          const req = https.request(
            url,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${apiKey}`,
              },
              timeout: 10000,
            },
            (res) => {
              let data = '';
              res.on('data', (chunk) => {
                data += chunk;
              });
              res.on('end', () =>
                resolve({ status: res.statusCode || 0, data }),
              );
            },
          );
          req.on('error', reject);
          req.on('timeout', () => {
            req.destroy();
            reject(new Error('SMS timeout'));
          });
          req.write(body);
          req.end();
        },
      );

      if (response.status !== 200) {
        this.logger.warn(`SMS provider returned status ${response.status}`);
        return false;
      }

      const result = JSON.parse(response.data);
      if (result.success === false) {
        this.logger.warn('SMS provider rejected request');
        return false;
      }

      return true;
    } catch (err) {
      this.logger.error('SMS delivery failed');
      return false;
    }
  }
}
