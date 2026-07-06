# Ayantaraz Production Deployment Reference

## Prerequisites

- Ubuntu 22.04+ server (recommended: 4GB RAM, 2 vCPU, 50GB SSD)
- Docker + Docker Compose v2 installed
- Domain `ayantaraz.ir` pointing to server IP (A record)
- Ports 80 + 443 open in firewall

## Quick Deploy

```bash
# 1. Transfer archive
scp ayantaraz-prod-20260627.tar.gz root@202.133.91.13:/tmp/

# 2. Extract
mkdir -p /opt/ayan-taraz/releases
tar -xzf /tmp/ayantaraz-prod-20260627.tar.gz -C /opt/ayan-taraz/releases/20260627
shopt -s dotglob
mv /opt/ayan-taraz/releases/20260627/ayantaraz/* /opt/ayan-taraz/releases/20260627/
rm -rf /opt/ayan-taraz/releases/20260627/ayantaraz
ln -sfn /opt/ayan-taraz/releases/20260627 /opt/ayan-taraz/current

# 3. Bootstrap (installs Docker, user, secrets, ayan-deploy)
bash /opt/ayan-taraz/current/scripts/bootstrap.sh

# 4. Set SMS key
nano /opt/ayan-taraz/env/current.env

# 5. Deploy
ayan-deploy lock
ayan-deploy release 20260627
ayan-deploy gate 20260627
ayan-deploy activate 20260627
ayan-deploy pass
```

## Service Architecture (Docker)

```
nginx:alpine (80/443) → web:3000 (Next.js standalone)
                    ↘ → api:3001 (NestJS)
                         → postgres:16-alpine (5432)
                         → redis:7-alpine (6379)
```

All services on `ayantaraz-network` bridge. Only nginx exposes ports to host.

## Environment Files

| File | Purpose |
|------|---------|
| `.env.production` | Production secrets (DO NOT COMMIT) |
| `.env.production.example` | Template with safe defaults |
| `docker-compose.yml` | Base compose (all services) |
| `docker-compose.prod.yml` | Production overlays (resource limits, SSL volumes) |

## Key Production Settings

### Database Connection
- Pool: 20 connections
- Pool timeout: 10s
- Statement timeout: 30s
- Idle timeout: 60s
- Set in `DATABASE_URL` query params

### Graceful Shutdown
- `SIGTERM` / `SIGINT` → drain connections (25s max) → `prisma.$disconnect()` → exit
- HTTP `keepAliveTimeout`: 61s (> ALB 60s idle timeout)
- Health endpoint returns 503 when DB is disconnected

### OTP Security
- All failure paths return unified `"Verification failed"` (401)
- Hash comparison via `crypto.timingSafeEqual` (constant-time)
- Actual reason logged server-side only
- 5 max attempts → 30 min block

### Audit Immutability
- Prisma middleware blocks `update`/`delete`/`upsert` on `AuditLog`
- PostgreSQL trigger `audit_log_append_only` (BEFORE UPDATE OR DELETE OR TRUNCATE)
- DB role `app_user` has only `SELECT, INSERT` on `audit_logs`

## SSL (Let's Encrypt)

Setup:
```bash
./infra/scripts/setup-ssl.sh --domains "ayantaraz.ir www.ayantaraz.ir"
```

Auto-renewal cron (daily 3:00 AM) installed automatically. Logs: `logs/certbot-renew.log`

## Backup & Restore

```bash
# Daily backup
./infra/scripts/backup.sh --docker

# List backups
./infra/scripts/backup.sh --list

# Full rollback (code + DB)
./infra/scripts/rollback.sh --full
```

Retention: daily 7d, weekly 4w, monthly 3m. Backups in `backups/`.

## Monitoring

### Health Endpoint
- `GET /health` → `{ status: "ok", db: "connected", timestamp }`
- Returns 503 when DB disconnected (Docker HEALTHCHECK uses this)
- No auth required

### Logging (Structured JSON)
All logs formatted as JSON with fields:
```json
{ "level": "info", "timestamp": "...", "message": "...", "context": "...", "pid": 1, "env": "production" }
```

HTTP request/response logs include: `type`, `correlationId`, `method`, `url`, `statusCode`, `durationMs`

## Load Testing

```bash
./scripts/load-test.sh https://ayantaraz.ir/api 100
```

Exits with code 1 if any errors detected. Reports p50/p95/p99 latency.

## Common Commands

```bash
# View logs
docker compose -f docker-compose.yml -f docker-compose.prod.yml logs -f api
docker compose -f docker-compose.yml -f docker-compose.prod.yml logs -f nginx

# Manual health check
curl -sf https://ayantaraz.ir/health

# Run DB migration
docker compose exec -T api npx prisma migrate deploy

# Seed data
docker compose exec -T api npx tsx prisma/seed.ts

# Restart service
docker compose restart api

# Rebuild without cache
docker compose build --no-cache api
```

## Security Checklist

- [ ] `JWT_SECRET` generated with `openssl rand -base64 48` — not the dev default
- [ ] `POSTGRES_PASSWORD` ≥ 16 chars, not a dictionary word
- [ ] `KAVENEGAR_API_KEY` set (or OTP will only log, not send SMS)
- [ ] Nginx only entrypoint — all other ports firewalled
- [ ] CSP enforced by nginx, not by NestJS
- [ ] Audit log immutable (Prisma + PostgreSQL trigger)
- [ ] SSL with Let's Encrypt (auto-renew via cron)
- [ ] Backups configured (daily cron)
- [ ] JWT `expiresIn: 1h`, refresh token family rotation enabled

## Post-Deploy Verification

```bash
# 1. SSL working
curl -I https://ayantaraz.ir

# 2. Health check
curl -sf https://ayantaraz.ir/health

# 3. API responding
curl -sf https://ayantaraz.ir/api/health

# 4. Load test (no 5xx under 100 concurrent)
./scripts/load-test.sh https://ayantaraz.ir/api 100

# 5. Verify Google Search Console + Analytics
# 6. Submit sitemap: https://ayantaraz.ir/sitemap.xml
# 7. Verify robots.txt: https://ayantaraz.ir/robots.txt
# 8. Verify llms.txt: https://ayantaraz.ir/llms.txt
```
