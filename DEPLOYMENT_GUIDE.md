# Ayantaraz - Docker Deployment Guide

## Overview

This guide provides complete instructions for deploying the Ayantaraz application using Docker on server IP `202.133.91.13`.

### Key Features

- **100% Docker-based deployment** - All services run in containers
- **pnpm support** - Uses pnpm for dependency management
- **Production-ready** - Optimized for production environments
- **Complete automation** - Single script handles everything
- **GitHub Actions CI/CD** - Automated build and deployment pipeline

---

## Prerequisites

### Server Requirements
- Ubuntu 20.04/22.04 LTS
- Root or sudo access
- Minimum 4GB RAM
- Minimum 2 CPU cores
- 50GB free disk space
- Internet connection

### Required Ports
- **3001** - API service
- **5432** - PostgreSQL database
- **6379** - Redis cache
- **80/443** - Optional: Nginx reverse proxy

---

## Quick Deployment

### Method 1: Automatic (Recommended)

```bash
# Download and run deployment script
curl -O https://raw.githubusercontent.com/codez37/Ayantaraz-/main/DEPLOY_DOCKER_202.133.91.13.sh
chmod +x DEPLOY_DOCKER_202.133.91.13.sh
sudo ./DEPLOY_DOCKER_202.133.91.13.sh
```

### Method 2: Manual

```bash
# Clone repository
git clone https://github.com/codez37/Ayantaraz- /opt/ayantaraz
cd /opt/ayantaraz

# Install Docker (if not installed)
curl -fsSL https://get.docker.com | sh
systemctl enable docker
systemctl start docker

# Build and start containers
docker-compose -f docker-compose.prod.yml build
docker-compose -f docker-compose.prod.yml up -d

# Run migrations and seed
docker-compose -f docker-compose.prod.yml exec api pnpm exec prisma migrate deploy
docker-compose -f docker-compose.prod.yml exec api node scripts/seed-admin.js
```

---

## Configuration

### Environment Variables

The `.env` file contains all configuration. Key variables:

```env
# Application
NODE_ENV=production
PORT=3001
API_URL=http://202.133.91.13:3001

# Database
DATABASE_URL=postgresql://ayantaraz:ayantaraz2024@db:5432/ayantaraz?schema=public

# JWT
JWT_SECRET=ayantaraz-production-secret-key-2024-change-me
JWT_REFRESH_SECRET=ayantaraz-production-refresh-secret-2024-change-me

# Redis
REDIS_HOST=redis
REDIS_PORT=6379

# Security
CAPTCHA_SECRET=  # Empty = DISABLED
ALLOW_ALL_ORIGINS=true
COOKIE_SECURE=false  # Set to true with HTTPS

# Admin Phones
# Seeded automatically: 09133374162, 09134292329
```

### IMPORTANT Security Notes

⚠️ **Before production use, you MUST:**

1. **Change all secrets** in `.env` file
2. **Generate strong JWT secrets**:
   ```bash
   openssl rand -hex 32  # For JWT_SECRET
   openssl rand -hex 32  # For JWT_REFRESH_SECRET
   ```
3. **Generate file encryption key** (32 characters)
4. **Enable CAPTCHA** by setting `CAPTCHA_SECRET`
5. **Enable HTTPS** with Nginx or Traefik
6. **Set COOKIE_SECURE=true** when using HTTPS
7. **Set ALLOW_ALL_ORIGINS=false** and configure specific origins

---

## Docker Architecture

### Services

| Service | Container | Port | Description |
|---------|-----------|------|-------------|
| API | ayantaraz-api | 3001 | Main application server |
| Database | ayantaraz-db | 5432 | PostgreSQL database |
| Redis | ayantaraz-redis | 6379 | Caching and rate limiting |

### Docker Compose Commands

```bash
# Start all services
docker-compose -f docker-compose.prod.yml up -d

# Stop all services
docker-compose -f docker-compose.prod.yml down

# View logs
docker-compose -f docker-compose.prod.yml logs -f

# View container status
docker-compose -f docker-compose.prod.yml ps

# Restart services
docker-compose -f docker-compose.prod.yml restart

# Rebuild and restart
docker-compose -f docker-compose.prod.yml up -d --build --no-cache

# Execute command in container
docker-compose -f docker-compose.prod.yml exec api <command>
```

---

## Database Management

### Migrations

```bash
# Apply pending migrations
docker-compose -f docker-compose.prod.yml exec api pnpm exec prisma migrate deploy

# Create new migration
docker-compose -f docker-compose.prod.yml exec api pnpm exec prisma migrate dev --name <migration_name>

# Rollback migration
docker-compose -f docker-compose.prod.yml exec api pnpm exec prisma migrate reset
```

### Database Access

```bash
# Connect to PostgreSQL
docker-compose -f docker-compose.prod.yml exec db psql -U ayantaraz -d ayantaraz

# Backup database
docker-compose -f docker-compose.prod.yml exec db pg_dump -U ayantaraz ayantaraz > backup.sql

# Restore database
cat backup.sql | docker-compose -f docker-compose.prod.yml exec -T db psql -U ayantaraz ayantaraz
```

---

## Admin Management

### Admin Users

Two admin phone numbers are automatically seeded:
- **09133374162**
- **09134292329**

### Manual Admin Creation

```bash
# Connect to API container
docker-compose -f docker-compose.prod.yml exec api sh

# Run seed script manually
node scripts/seed-admin.js
```

---

## Monitoring and Health Checks

### Health Endpoints

| Endpoint | Description |
|----------|-------------|
| GET /health | Full health check |
| GET /health/ping | Simple ping/pong |
| GET /health/database | Database connectivity |
| GET /health/ready | Readiness check |
| GET /health/info | Application info |
| GET /health/metrics | Performance metrics |

### Check Health

```bash
# Check API health
curl http://202.133.91.13:3001/health

# Check database
curl http://202.133.91.13:3001/health/database

# Ping
curl http://202.133.91.13:3001/health/ping
```

### Docker Health Checks

```bash
# View service health
docker inspect --format='{{json .State.Health}}' $(docker ps -q)

# View container logs
docker-compose -f docker-compose.prod.yml logs -f api
```

---

## GitHub Actions CI/CD

### Workflow

The repository includes a GitHub Actions workflow (`.github/workflows/docker-deploy.yml`) that:

1. **Builds and tests** on every push and pull request
2. **Builds Docker image** and pushes to GitHub Container Registry
3. **Deploys to production** on main branch push

### Required Secrets

To enable automatic deployment, add these secrets to your GitHub repository:

| Secret | Description |
|--------|-------------|
| `SSH_PRIVATE_KEY` | SSH private key for server access |
| `SSH_USER` | SSH username (e.g., root) |

### Manual Setup

1. Generate SSH key pair on your server:
   ```bash
   ssh-keygen -t ed25519 -C "github-actions"
   ```

2. Add public key to `~/.ssh/authorized_keys` on server

3. Copy private key and add as GitHub secret `SSH_PRIVATE_KEY`

4. Add server username as GitHub secret `SSH_USER`

---

## Troubleshooting

### Common Issues

#### Port already in use
```bash
# Find and kill process on port 3001
sudo lsof -i :3001
sudo kill -9 <PID>
```

#### Docker permission denied
```bash
# Add user to docker group
sudo usermod -aG docker $USER
# Log out and log back in
newgrp docker
```

#### Database connection failed
```bash
# Check database container logs
docker-compose -f docker-compose.prod.yml logs db

# Test database connection
docker-compose -f docker-compose.prod.yml exec api pnpm exec prisma migrate deploy
```

#### Redis connection failed
```bash
# Check Redis container logs
docker-compose -f docker-compose.prod.yml logs redis

# Test Redis connection
docker-compose -f docker-compose.prod.yml exec api redis-cli ping
```

#### Build fails
```bash
# Clean and rebuild
docker-compose -f docker-compose.prod.yml down -v
docker-compose -f docker-compose.prod.yml build --no-cache
docker-compose -f docker-compose.prod.yml up -d
```

---

## Backup and Restore

### Backup

```bash
cd /opt/ayantaraz

# Create backup directory
mkdir -p backups
DATE=$(date +%Y%m%d_%H%M%S)

# Backup database
docker-compose -f docker-compose.prod.yml exec db pg_dump -U ayantaraz ayantaraz > backups/db_${DATE}.sql

# Backup volumes
docker run --rm \
  -v ayantaraz_postgres_data:/volume \
  -v $(pwd)/backups:/backup \
  alpine tar cvf /backup/postgres_${DATE}.tar /volume

# Backup .env file
cp .env backups/env_${DATE}.bak
```

### Restore

```bash
cd /opt/ayantaraz

# Stop services
docker-compose -f docker-compose.prod.yml down

# Restore database
docker-compose -f docker-compose.prod.yml up -d db
sleep 10
cat backups/db_20240101_120000.sql | docker-compose -f docker-compose.prod.yml exec -T db psql -U ayantaraz ayantaraz

# Restore volumes
docker run --rm \
  -v ayantaraz_postgres_data:/volume \
  -v $(pwd)/backups:/backup \
  alpine tar xvf /backup/postgres_20240101_120000.tar -C /

# Restore .env file
cp backups/env_20240101_120000.bak .env

# Restart services
docker-compose -f docker-compose.prod.yml up -d
```

---

## Performance Optimization

### Docker Optimization

```yaml
# In docker-compose.prod.yml, add resource limits:
services:
  api:
    deploy:
      resources:
        limits:
          cpus: '1.5'
          memory: 2G
        reservations:
          cpus: '0.5'
          memory: 512M
```

### Database Optimization

```env
# In .env file:
DB_POOL_MAX_CONNECTIONS=30
DB_POOL_MIN_CONNECTIONS=10
DB_POOL_MAX_REQUESTS_PER_CONNECTION=50
DB_POOL_IDLE_TIMEOUT_MS=60000
DB_POOL_CONNECTION_TIMEOUT_MS=10000
```

---

## Security Hardening

### Docker Security

```bash
# Run containers as non-root
# Already configured in Dockerfile.api

# Use read-only filesystem where possible
# Limit capabilities
```

### Network Security

```bash
# Use Docker network isolation
docker network create --internal ayantaraz-internal

# Expose only necessary ports
# Already configured in docker-compose.prod.yml
```

### SSL/TLS

```bash
# Use Let's Encrypt with Nginx
# Add to docker-compose.prod.yml:

services:
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx:/etc/nginx
      - ./certs:/etc/letsencrypt
    depends_on:
      - api
```

---

## Scaling

### Horizontal Scaling

```yaml
# In docker-compose.prod.yml:
services:
  api:
    deploy:
      replicas: 3
      update_config:
        parallelism: 2
        delay: 10s
      restart_policy:
        condition: on-failure
```

Note: Requires Docker Swarm mode:
```bash
docker swarm init
docker stack deploy -c docker-compose.prod.yml ayantaraz
```

---

## Updates

### Application Update

```bash
cd /opt/ayantaraz

# Pull latest changes
git pull origin main

# Rebuild and restart
docker-compose -f docker-compose.prod.yml build --no-cache
docker-compose -f docker-compose.prod.yml up -d

# Run migrations
docker-compose -f docker-compose.prod.yml exec api pnpm exec prisma migrate deploy
```

### Docker Images Update

```bash
cd /opt/ayantaraz

# Pull latest images
docker-compose -f docker-compose.prod.yml pull

# Rebuild and restart
docker-compose -f docker-compose.prod.yml up -d --build
```

---

## Monitoring

### Docker Stats

```bash
# View resource usage
docker stats

# View detailed container info
docker inspect ayantaraz-api
```

### Logs

```bash
# View all logs
docker-compose -f docker-compose.prod.yml logs -f

# View API logs only
docker-compose -f docker-compose.prod.yml logs -f api

# View last 100 lines
docker-compose -f docker-compose.prod.yml logs --tail=100
```

---

## Support

For issues or questions:

1. Check logs: `docker-compose -f docker-compose.prod.yml logs`
2. Check health: `curl http://202.133.91.13:3001/health`
3. Review this documentation
4. Check GitHub Actions logs

---

## License

This deployment guide is provided as-is for the Ayantaraz project.

**Last Updated:** July 14, 2026
**Version:** 2.0
