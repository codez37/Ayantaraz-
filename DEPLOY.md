# ============================================
# Ayantaraz — Server Deployment Guide
# ============================================
# From Windows to Production Server (IP-based, no domain)
# ============================================


## STEP 0: Prerequisites on Windows
# --------------------------------
# You need: Git, SSH access to server
# Server IP: 202.133.91.13
# Server user: root (for first setup only)


## STEP 1: Create .tar.gz on Windows (PowerShell)
# --------------------------------
# Run from project root on Windows:

cd C:\Users\moji\ayantaraz

# Create tar archive (excludes node_modules, .env, dist via .gitignore)
tar -czf ayantaraz.tar.gz ^
  --exclude="node_modules" ^
  --exclude=".env" ^
  --exclude=".env.*" ^
  --exclude="dist" ^
  --exclude=".next" ^
  --exclude="coverage" ^
  --exclude=".git" ^
  --exclude="*.log" ^
  --exclude="pgdata" ^
  --exclude="docker-data" ^
  .

# Verify archive size (should be ~5-15MB, NOT hundreds of MB)
Get-Item ayantaraz.tar.gz | Select-Object @{N='SizeMB';E={[math]::Round($_.Length/1MB,2)}}


## STEP 2: Upload to Server
# --------------------------------
# From Windows PowerShell:

scp ayantaraz.tar.gz root@202.133.91.13:/tmp/

# Or using Git Bash:
# scp ayantaraz.tar.gz root@202.133.91.13:/tmp/


## STEP 3: SSH into Server
# --------------------------------

ssh root@202.133.91.13


## STEP 4: Extract on Server
# --------------------------------

cd /tmp
tar -xzf ayantaraz.tar.gz -C /opt/
mv /opt/ayantaraz /opt/ayan-taraz 2>/dev/null || true
rm /tmp/ayantaraz.tar.gz

# Verify
ls -la /opt/ayan-taraz/
ls -la /opt/ayan-taraz/docker-compose.yml


## STEP 5: Install Docker + System Setup
# --------------------------------
# This runs bootstrap.sh (installs Docker, creates user, firewall, etc.)

cd /opt/ayan-taraz
sudo bash scripts/bootstrap.sh


## STEP 6: Generate All Secrets
# --------------------------------
# This creates /opt/ayan-taraz/env/current.env with:
#   - JWT_SECRET (64 chars)
#   - JWT_REFRESH_SECRET (64 chars)
#   - POSTGRES_PASSWORD (32 chars)
#   - REDIS_PASSWORD (32 chars)
#   - DEPLOY_KEY (64 chars)

sudo bash /opt/ayan-taraz/current/scripts/bootstrap.sh

# You'll see output like:
#   JWT_SECRET:         abc123...xyz789  (64 chars)
#   JWT_REFRESH_SECRET: def456...uvw012  (64 chars)
#   POSTGRES_PASSWORD:  ghi789...rst345  (32 chars)
#   REDIS_PASSWORD:     jkl012...qrs678  (32 chars)
#   DEPLOY_KEY:         mno345...pqr901  (64 chars)
#   SMS_API_KEY:        CHANGE_ME  ← SET THIS MANUALLY


## STEP 7: Set SMS API Key (YOUR ONLY MANUAL STEP)
# --------------------------------

nano /opt/ayan-taraz/env/current.env

# Find this line:
# SMS_API_KEY=CHANGE_ME

# Replace with your real key:
# SMS_API_KEY=your_actual_s_api_ir_key

# Also set admin phone (optional but recommended):
# ADMIN_PHONE=0912xxxxxxx

# Save: Ctrl+X, Y, Enter


## STEP 8: Fix docker-compose.yml PATH
# --------------------------------
# The docker-compose.yml uses relative ./.env
# We need to symlink it to the generated env file

ln -sf /opt/ayan-taraz/env/current.env /opt/ayan-taraz/.env
chmod 600 /opt/ayan-taraz/.env


## STEP 9: Build and Start Docker
# --------------------------------
# This builds the Docker images and starts all services

cd /opt/ayan-taraz
docker compose build --no-cache
docker compose up -d

# Watch startup logs (wait 2-3 minutes for first boot)
docker compose logs -f api


## STEP 10: Verify All Services
# --------------------------------

# Check all containers are running
docker compose ps

# Expected output:
#   ayantaraz-api      ... running (healthy)
#   ayantaraz-web      ... running (healthy)
#   ayantaraz-postgres  ... running (healthy)
#   ayantaraz-redis     ... running (healthy)
#   ayantaraz-nginx     ... running

# Check API health
curl http://localhost/health

# Expected: {"status":"ok","db":"ok","redis":"ok","timestamp":"..."}

# Check frontend
curl -I http://localhost/

# Expected: HTTP/1.1 200 OK


## STEP 11: Access from Anywhere
# --------------------------------
# Open browser on your local machine:
#   http://202.133.91.13

# The site should load without domain/SSL


## Troubleshooting
# --------------------------------

# If API won't start:
docker compose logs api --tail=50

# If database error:
docker compose exec postgres psql -U ayantaraz -d ayantaraz -c "\dt"

# If Redis connection fails:
docker compose exec redis redis-cli -a $(grep REDIS_PASSWORD /opt/ayan-taraz/.env | cut -d= -f2) ping

# Restart everything:
docker compose down && docker compose up -d

# Rebuild after code changes:
docker compose build api && docker compose up -d api


## What Was Auto-Generated (NO manual input needed)
# --------------------------------
# JWT_SECRET=          64 chars (openssl rand -base64 48)
# JWT_REFRESH_SECRET=  64 chars (openssl rand -base64 48)
# POSTGRES_PASSWORD=   32 chars (openssl rand -hex 16)
# REDIS_PASSWORD=      32 chars (openssl rand -hex 16)
# DEPLOY_KEY=          64 chars (openssl rand -hex 32)

## What YOU Set Manually
# --------------------------------
# SMS_API_KEY=         your s.api.ir key
# ADMIN_PHONE=         your phone number (optional)


## Security Summary
# --------------------------------
# Docker:     cap_drop ALL, no-new-privileges, resource limits
# Nginx:      rate limiting (5/30/2 rps), server_tokens off, security headers
# Redis:      password authenticated
# Database:   password authenticated, append-only audit log
# JWT:        64-char entropy-validated secrets
# All files:  chmod 600 root:root (secrets)
# No domain:  HTTP only, COOKIE_SECURE=false
