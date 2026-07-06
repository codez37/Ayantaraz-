# Docker Strategy

## Services

| Service | Image | Port | Purpose |
|---------|-------|------|---------|
| web | node:22-alpine | 3000 | Next.js frontend |
| api | node:22-alpine | 3001 | NestJS backend |
| postgres | postgres:16-alpine | 5432 | Database |
| redis | redis:7-alpine | 6379 | Cache/queue |
| nginx | nginx:alpine | 80/443 | Reverse proxy |

## Docker Compose Files

| File | Purpose |
|------|---------|
| `docker-compose.yml` | Development stack |
| `docker-compose.prod.yml` | Production stack override |

## Principles

- Each service has health check
- Independent restart policy
- Data persistence via volumes
- Network isolation (internal bridge)
- Environment via .env files (never hardcoded)
