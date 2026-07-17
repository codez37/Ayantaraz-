// JWT Configuration
export const TOKEN_ALGORITHM = 'HS256';
export const TOKEN_ISSUER = 'ayantaraz';
export const TOKEN_AUDIENCE_ACCESS = 'access';
export const TOKEN_AUDIENCE_REFRESH = 'refresh';
export const JWT_EXPIRATION = '15m';
export const JWT_REFRESH_EXPIRATION = '7d';
export const REFRESH_CLOCK_TOLERANCE = 60;

// OTP Configuration
export const OTP_CODE_LENGTH = 6;
export const OTP_EXPIRATION_MS = 5 * 60 * 1000;
export const OTP_REQUEST_LIMIT = 3;
export const OTP_REQUEST_WINDOW_MS = 10 * 60 * 1000;
export const OTP_LOCK_WINDOW_MS = 30 * 60 * 1000;
export const OTP_MAX_ATTEMPTS = 5;
export const OTP_VERIFY_FAILED = 'Verification failed';

// Cookie Configuration
export const COOKIE_SECURE = false;
export const COOKIE_HTTP_ONLY = true;
export const COOKIE_SAME_SITE = 'lax';
export const COOKIE_ACCESS_TOKEN_MAX_AGE = 15 * 60 * 1000;
export const COOKIE_REFRESH_TOKEN_MAX_AGE = 7 * 24 * 60 * 60 * 1000;

// Security Configuration
export const CSRF_COOKIE_NAME = 'csrf-token';
export const CSRF_HEADER_NAME = 'x-csrf-token';
export const CSRF_COOKIE_MAX_AGE = 24 * 60 * 60 * 1000;
