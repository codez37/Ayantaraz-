# Security Architecture

## Authentication
- OTP-based login (no password)
- OTP expiry: 5 minutes
- OTP max attempts: 5 per phone per 30 minutes
- OTP resend limit: 3 per 10 minutes
- JWT access token (24h) + refresh token (7d)
- Refresh token rotation

## Authorization (RBAC)
| Role | Capabilities |
|------|-------------|
| user | View public content, manage own profile, create orders/consultations, use chatbot |
| consultant | View assigned consultations, update consultation status |
| content_manager | Create/edit/draft content, submit for review |
| admin | Full access: publish, manage users, verify payments, view audit logs, manage all content |

## Data Protection
- OTP codes stored hashed (SHA-256)
- No plaintext secrets in code
- All secrets via environment variables
- Environment-specific .env files (never committed)

## API Security
- Rate limiting per IP (100 req/min)
- Stricter rate limiting for auth endpoints
- CORS restricted to production domain
- Input validation on all endpoints
- CSRF protection for session-based auth

## File Upload Security
- File type restrictions (images: jpg/png/webp; documents: pdf)
- Max file size: 50MB
- Uploaded files scanned for malicious content
- Files stored outside application root

## Production Security
- HTTPS only (via Nginx + Let's Encrypt)
- Security headers (HSTS, X-Frame-Options, X-Content-Type-Options)
- Database accessible only from application container
- Redis with password authentication
- Regular security updates via Docker rebuild
