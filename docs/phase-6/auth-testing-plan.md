# Auth Testing Plan

## Unit Tests (AuthService)

### OTP Request
| Test | Assertions |
|------|------------|
| Request OTP with valid phone | Returns message, creates OTP record, logs audit |
| Request OTP with invalid phone | Throws 400 |
| Request OTP exceeding resend limit | Throws 429 |
| Request OTP when phone is blocked | Throws 429 |
| Request OTP when SMS fails | Returns fallback message, OTP still created |

### OTP Verify
| Test | Assertions |
|------|------------|
| Verify correct OTP | Returns tokens + user, OTP marked used, session created |
| Verify wrong OTP | Throws 400, increments attempts |
| Verify expired OTP | Throws 400 |
| Verify already used OTP | Throws 400 |
| Verify after max attempts | Throws 429, phone blocked |
| Verify for new user (first login) | User created, isNew=true |
| Verify for existing user | isNew=false, lastLoginAt updated |

### Session / Tokens
| Test | Assertions |
|------|------------|
| Refresh valid token | Returns new tokens, old token revoked |
| Refresh revoked token | Throws 401, all sessions revoked (theft detection) |
| Refresh expired token | Throws 401 |
| Logout | All sessions revoked |

## Controller Tests

| Test | Assertions |
|------|------------|
| POST /api/auth/otp with valid body | 200, returns message |
| POST /api/auth/otp with invalid body | 400, validation error |
| POST /api/auth/verify with valid body | 200, returns tokens + user |
| POST /api/auth/verify with invalid body | 400, validation error |
| POST /api/auth/logout with JWT | 200, sessions revoked |
| POST /api/auth/logout without JWT | 401 |
| GET /api/auth/session with JWT | 200, returns session info |
| GET /api/auth/session without JWT | 401 |

## E2E Tests

| Test | Steps |
|------|-------|
| Full auth flow | Phone → OTP → verify → profile → dashboard |
| Resend flow | Phone → OTP → resend → verify with new code |
| New user flow | Phone → OTP → verify → profile → dashboard |
| Existing user flow | Phone → OTP → verify → dashboard (no profile step) |
| Rate limiting | Request OTP 4 times → 429 |
| Block flow | Enter wrong OTP 5 times → blocked |
| Logout flow | Login → logout → cannot access dashboard |
