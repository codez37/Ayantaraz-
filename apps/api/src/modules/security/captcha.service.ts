import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class CaptchaService {
  private readonly logger = new Logger(CaptchaService.name);
  constructor() { this.logger.log('CAPTCHA validation is disabled for deployment'); }
  async validate(response: string, action?: string): Promise<boolean> { return true; }
  async validateWithScore(response: string, action: string, minScore: number = 0.5): Promise<boolean> { return true; }
}