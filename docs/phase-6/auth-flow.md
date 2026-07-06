# Auth Flow

## Core Principle
Single unified auth flow for both registration and login. Phone number is the sole identity key. No passwords, no email login.

## Flow Diagram

```
[Phone Input] → [OTP Request] → [OTP Verify] → [Profile?] → [Dashboard]
                     │                │              │
                     ├─ resend (3x/10min)           └─ new user → name form
                     │                                └─ existing → skip
                     └─ rate limit (5/30min block)
```

## Steps

### 1. Phone Entry
- User enters Iranian mobile number (0912XXXXXXX)
- Frontend validates format before submit
- Server normalizes to 0912XXXXXXX format
- Rate limit checked: 3 OTP sends per 10 minutes per phone

### 2. OTP Request
- Server generates 6-digit code
- Code hashed with SHA-256 (never stored plaintext)
- Code sent via Kavenegar SMS API
- OTP record created with status=active, 5min expiry
- If SMS fails → return message + allow verify with fallback
- Audit log: `auth:otp_send`

### 3. OTP Verify
- User enters 6-digit code
- Server hashes input and compares with stored hash
- On success: mark OTP used, create session, issue JWT
- On failure: increment attempts, block after 5 total failures per 30min
- New user → auto-create profile with isNew flag
- Existing user → update lastLoginAt
- Audit log: `auth:otp_verify` (success/failure)

### 4. Profile Completion (first login only)
- Frontend receives `isNew=true` in verify response
- Shows first name + last name form
- Profile saved via PATCH /api/users/profile
- Redirect to dashboard

### 5. Session & Tokens
- JWT access token (24h) + refresh token (7d)
- Refresh token stored hashed in refresh_tokens table
- Session record created in sessions table (deviceInfo, ip)
- On logout: revoke session + refresh token

## API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /api/auth/otp | Public | Request OTP |
| POST | /api/auth/verify | Public | Verify OTP + login |
| POST | /api/auth/refresh | Public | Refresh JWT tokens |
| POST | /api/auth/logout | JWT | Logout + revoke session |
| GET | /api/auth/session | JWT | Get current session info |
| PATCH | /api/users/profile | JWT | Complete profile |

## Redirections

| Scenario | From | To |
|----------|------|-----|
| Unauthenticated accessing dashboard | /dashboard | /auth |
| Expired session on any page | Any | /auth (with message) |
| New user after OTP verify | /auth | /auth (profile step) |
| Existing user after OTP verify | /auth | /dashboard |
| After profile completion | /auth | /dashboard |
| Logout | Any | / |
