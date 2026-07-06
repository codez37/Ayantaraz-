# Logging & Redaction Policy

## What to Log
- HTTP request method, URL, status, duration, IP (anonymized)
- Admin actions: actor, action, entity, before/after
- Auth events: OTP sent (phone partial masked), verify attempts, login
- Errors: message, code, context (NOT stack trace in production)

## What NOT to Log
- Full phone numbers (mask: 0912****321)
- OTP codes (never logged)
- JWT tokens
- Password hashes
- API keys
- Internal secrets
- Full stack traces (production)

## Redaction Implementation
- Request logger masks `authorization` header
- Auth service masks phone in logs (last 4 digits only)
- Error filter strips stack traces in production (NODE_ENV=production)
- Audit logs do NOT include sensitive values in oldValue/newValue
