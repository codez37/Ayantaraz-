# Authentication Hardening

## OTP Protection
- Rate limit: 3 sends / 10 minutes per phone
- Verify attempts: max 5 failed / 30 minutes → block
- OTP code: stored as bcrypt hash, never plaintext
- Expiry: 2 minutes (configurable via OTP_EXPIRY_MS)
- Resend cooldown: 60 seconds minimum
- Phone normalization: strip non-digits +98/0098 → 0

## Session Protection
- JWT access token: 24h expiry
- Refresh token: 7d expiry, rotation on each use
- Server-side session: Session model with revoke support
- Logout: revokes all sessions + refresh tokens for user
- Theft detection: revoked token reuse → revoke ALL user sessions

## Brute Force Prevention
- Global throttler: 100 req / 60s
- OTP send throttled per phone
- Auth endpoints throttled per IP
- No account enumeration: same message for valid/invalid phone
