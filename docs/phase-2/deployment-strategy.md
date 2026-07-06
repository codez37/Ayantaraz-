# Deployment Strategy

## Containerization
- Docker Compose for all services
- Separate docker-compose.yml for dev and prod
- Multi-stage builds for NestJS and Next.js

## Services
1. **postgres**: PostgreSQL 16 with persistent volume
2. **redis**: Redis 7 for cache/queue
3. **api**: NestJS application
4. **web**: Next.js application (SSR mode)
5. **nginx**: Reverse proxy with SSL termination
6. **minio**: S3-compatible storage (optional, for production)

## Environments
| Environment | Purpose | Config |
|-------------|---------|--------|
| development | Local dev | SQLite fallback, DEBUG=true |
| staging | Pre-prod | Full stack, DEBUG=false |
| production | Live | Full stack, SSL, monitoring |

## CI/CD
- Branch: main (production), staging (pre-prod)
- Merge to main requires: code review + tests passing
- Deployment: build images → run migrations → restart services
- Rollback: revert to previous Docker image

## Backup
- Daily PostgreSQL dump (pg_dump)
- WAL archiving for point-in-time recovery
- 30-day retention for daily backups
- 12-month retention for monthly backups
- Backup stored on separate volume

## Rollback Procedure
1. `docker-compose down api`
2. `docker-compose up -d api:<previous-tag>`
3. Run reverse migration if needed
4. Verify health endpoint
