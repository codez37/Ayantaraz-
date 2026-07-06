# Auth Security Rules

## Authentication
1. All endpoints except `@Public()` require valid JWT
2. JWT verified on every request via Passport JwtStrategy
3. Public endpoints: /api/auth/otp, /api/auth/verify, /api/auth/refresh, /health
4. Logout requires valid JWT (must be authenticated to logout)
5. Session info requires valid JWT

## Rate Limiting
1. Global: 100 requests per minute per IP
2. Auth endpoints: stricter limits
   - POST /api/auth/otp: 10 requests per minute per IP
   - POST /api/auth/verify: 10 requests per minute per IP
3. OTP business rules (regardless of IP):
   - 3 OTP sends per 10 minutes per phone
   - 5 failed attempts per 30 minutes per phone
4. Rate limit violations return 429 with Persian message

## OTP Security
1. Code generated with crypto.randomInt (secure)
2. Stored as SHA-256 hash (not plaintext)
3. One-time use (status changes to 'used' after verify)
4. 5-minute expiry
5. 5 failed attempts = phone blocked for 30 minutes

## Session Security
1. Access token: 24h, refresh token: 7d
2. Refresh token rotation: old token invalidated on refresh
3. Token theft detection: if revoked token is reused → all sessions revoked
4. Logout: revokes all sessions for user
5. All tokens stored hashed (SHA-256)

## Input Validation
| Field | Validation |
|-------|-----------|
| phone | /^09\d{9}$/ (after normalization) |
| otp code | exactly 6 digits |
| firstName | 1-50 chars, string |
| lastName | 0-50 chars, optional string |

## Audit
All auth events logged: otp_send, otp_verify (success/fail), login, logout, token_refresh, phone_blocked
