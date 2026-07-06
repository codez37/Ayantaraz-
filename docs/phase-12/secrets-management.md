# Secrets Management

## Principle
All secrets are environment variables. No secrets in code, config files, or repository.

## Required Secrets
| Variable | Description | Required |
|----------|-------------|----------|
| DATABASE_URL | PostgreSQL connection string | Yes |
| JWT_SECRET | JWT signing key (min 32 chars) | Yes |
| KAVENEGAR_API_KEY | SMS API key | Yes |
| CORS_ORIGINS | Allowed CORS origins | No (dev default) |
| PORT | API port | No (3001 default) |
| NODE_ENV | Environment (development/staging/production) | No |

## Rules
- .env files are in .gitignore
- .env.example documents all required vars with placeholder values
- Production secrets loaded from secure vault / CI secrets
- No secrets in Docker image layers
- No secrets in logs, error messages, or frontend bundle
- JWT_SECRET checked at startup; process exits if missing

## Rotation
- JWT_SECRET: rotate on compromise, re-issue tokens
- KAVENEGAR_API_KEY: rotate per vendor policy
- DATABASE_URL: rotate on credential change
