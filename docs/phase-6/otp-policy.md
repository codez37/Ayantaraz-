# OTP Policy

## Code Generation
- Algorithm: 6-digit random number (100000-999999)
- Entropy: ~20 bits (cryptographically secure random)
- Storage: SHA-256 hash only (never plaintext)
- Length: fixed 6 digits

## Expiry
- TTL: 300 seconds (5 minutes) from creation
- After expiry: status changes to `expired` (via application check, not DB cron)
- Expired OTP cannot be verified

## Resend Policy
- Max 3 OTP requests per phone per 10-minute sliding window
- Counter resets after 10 minutes of no requests
- Resend creates a NEW OTP record (previous becomes stale/expired)
- User notified of remaining resends

## Attempt Limit
- Max 5 failed verification attempts per phone per 30-minute sliding window
- Counter is aggregated across all OTP records for that phone (not per-OTP)
- After 5 failures: phone is blocked for 30 minutes
- Blocked phone cannot request new OTP or verify
- Audit log: `auth:phone_blocked`

## Verification
- Input normalized (digits only, trim whitespace)
- Hashed with SHA-256
- Compared against latest active OTP for phone
- First active OTP by creation time (descending) is used
- On match: OTP status → `used`, verification succeeds
- On mismatch: OTP attempts +1, if attempts >= 5 → status → `blocked`

## Edge Cases
| Case | Behavior |
|------|----------|
| No OTP found for phone | "کد نامعتبر یا منقضی شده" |
| OTP expired | "کد منقضی شده است. درخواست کد جدید" |
| OTP already used | "کد قبلاً استفاده شده است" |
| Phone blocked | "تلاش‌های ناموفق زیاد. ۳۰ دقیقه صبر کنید" |
| SMS failed | Return message: "SMS failed, contact support" (still allow known flow) |
