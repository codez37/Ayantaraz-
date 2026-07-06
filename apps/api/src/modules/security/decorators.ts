import { SetMetadata } from '@nestjs/common';
import { CAPTCHA_REQUIRED_KEY, RATE_LIMIT_TIER_KEY } from './security.guard';

export const RequireCaptcha = () => SetMetadata(CAPTCHA_REQUIRED_KEY, true);
export const RateLimitTier = (tier: string) =>
  SetMetadata(RATE_LIMIT_TIER_KEY, tier);
