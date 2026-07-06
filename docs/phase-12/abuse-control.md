# Abuse Control

## Rate Limiting by Endpoint

| Endpoint | Limit | Window |
|----------|-------|--------|
| POST /api/auth/otp | 3 per phone | 10 min |
| POST /api/auth/verify | 5 per phone | 30 min |
| POST /api/auth/refresh | 10 per user | 10 min |
| POST /api/consultation | 5 per user | 1 hour |
| POST /api/orders | 5 per user | 1 hour |
| POST /api/chatbot/query | 30 per session | 10 min |
| All others | 100 per IP | 1 min |

## Duplicate Detection
- Consultation: same user + same subject within 5 min → blocked
- Orders: same user + same course within 30 min → blocked
- OTP: resend cooldown 60s

## Spam Prevention
- Rate limits enforced server-side
- Phone validation on all contact forms
- Honeypot fields on frontend forms (future)
- Admin review queue for all consultation/order requests
