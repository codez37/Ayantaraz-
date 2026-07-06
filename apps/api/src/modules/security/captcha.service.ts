import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

interface RecaptchaResponse {
  success: boolean;
  score?: number;
  action?: string;
  challenge_ts?: string;
  hostname?: string;
  'error-codes'?: string[];
}

@Injectable()
export class CaptchaService {
  private readonly logger = new Logger(CaptchaService.name);
  private readonly secretKey: string;
  private readonly minScore: number;
  private readonly verifyUrl = 'https://www.google.com/recaptcha/api/siteverify';

  constructor(private config: ConfigService) {
    this.secretKey = this.config.getOrThrow<string>('RECAPTCHA_SECRET_KEY');
    this.minScore = this.config.get<number>('RECAPTCHA_MIN_SCORE', 0.5);
  }

  async verify(token: string): Promise<boolean> {
    if (!token || typeof token !== 'string') {
      this.logger.warn('Captcha token missing or invalid type');
      return false;
    }

    try {
      const response = await fetch(this.verifyUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          secret: this.secretKey,
          response: token,
        }).toString(),
      });

      if (!response.ok) {
        this.logger.error(`reCAPTCHA HTTP error: ${response.status}`);
        return false;
      }

      const data: RecaptchaResponse = await response.json();

      if (!data.success) {
        this.logger.warn(`reCAPTCHA failed: ${data['error-codes']?.join(', ') || 'unknown'}`);
        return false;
      }

      if (data.score !== undefined && data.score < this.minScore) {
        this.logger.warn(`reCAPTCHA low score: ${data.score}`);
        return false;
      }

      return true;
    } catch (err) {
      this.logger.error('reCAPTCHA verification error', err as Error);
      return false; // Fail closed
    }
  }
}
