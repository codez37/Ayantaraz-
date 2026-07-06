# Environment Strategy

## Principle
Three isolated environments: development, staging, production.
Secrets NEVER in source code.

## Environment Files

| File | Purpose | In Repo? |
|------|---------|----------|
| `.env.example` | Template with all vars documented | Yes |
| `.env.development` | Local dev defaults | No (template only) |
| `.env.staging` | Staging overrides | No (template only) |
| `.env.production` | Production secrets | Never |

## Required Variables

```
# Database
DATABASE_URL=postgresql://user:password@host:5432/ayantaraz

# Redis
REDIS_URL=redis://:password@host:6379

# Auth
JWT_SECRET=
KAVENEGAR_API_KEY=

# URLs
APP_URL=http://localhost:3000
API_URL=http://localhost:3001

# Environment
NODE_ENV=development
LOG_LEVEL=debug

# CORS
CORS_ORIGINS=http://localhost:3000

# Storage (optional)
STORAGE_ENDPOINT=
STORAGE_KEY=
STORAGE_SECRET=
```

## Environment Detection

- `NODE_ENV` determines behavior
- `development`: verbose logging, hot reload, mock SMS
- `staging`: production-like, real SMS but test DB
- `production`: strict logging, no debug endpoints
