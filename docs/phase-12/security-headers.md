# Security Headers

## Nginx (Production)
```
add_header X-Frame-Options "DENY" always;
add_header X-Content-Type-Options "nosniff" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Permissions-Policy "camera=(), microphone=(), geolocation=()" always;
add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;
```

## Express/Helmet (Backend)
Enabled via `helmet()` in main.ts:
- X-DNS-Prefetch-Control
- X-Frame-Options (SAMEORIGIN or DENY)
- X-Content-Type-Options (nosniff)
- Strict-Transport-Security (HSTS in production)
- X-XSS-Protection (legacy)
- Referrer-Policy
- Permissions-Policy

CSP is configured separately (see xss-csrf-policy.md).

## Frontend (Next.js)
- next.config.js can set additional headers
- Metadata API for per-page CSP
```
meta: [
  { httpEquiv: 'X-Content-Type-Options', content: 'nosniff' },
  { httpEquiv: 'X-Frame-Options', content: 'DENY' },
]
```
