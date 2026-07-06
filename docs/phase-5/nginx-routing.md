# Nginx Routing

## Routes

| Path | Target | Notes |
|------|--------|-------|
| `/` | Next.js (web) | Frontend |
| `/api/*` | NestJS (api) | API backend |
| `/health` | NestJS (api) | Health check (no auth) |

## Security Headers

All responses include:
- HSTS (Strict-Transport-Security)
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- X-XSS-Protection: 1; mode=block
- Content-Security-Policy (restrictive)

## SSL

- Production: Let's Encrypt via certbot
- Staging: self-signed or Let's Encrypt
- Development: no SSL
