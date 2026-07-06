# ============================================
# Ayantaraz — Security Checklist
# ============================================

## فایل‌های حساس (هرگز commit نشوند)

| فایل | دلیل | وضعیت |
|------|-------|-------|
| `.env` | رمزها و JWT secrets | .gitignore ✅ |
| `.env.local` | توسعه محلی | .gitignore ✅ |
| `*.pem` | SSL certificates | .gitignore ✅ |
| `*.key` | Private keys | .gitignore ✅ |
| `docker-compose.override.yml` | overrides محلی | .gitignore ✅ |

## دسترسی فایل‌ها روی سرور

```bash
# Env file - فقط root
sudo chmod 600 /opt/ayan-taraz/.env
sudo chown root:root /opt/ayan-taraz/.env

# SSL certs
sudo chmod 600 /etc/letsencrypt/live/ayantaraz.ir/privkey.pem

# Backup directory
sudo chmod 700 /opt/ayan-taraz-backup*
```

## .gitignore فعلی

```
.env
.env.local
.env*.local
*.pem
*.key
dist/
.next/
node_modules/
*.log
```

## بررسی قبل از commit

```bash
# آیا فایل حساسی staged شده؟
git status

# آیا .env در gitignore هست؟
cat .gitignore | grep env

# جستجوی accidentally committed secrets
git log --all --diff-filter=A --name-only | grep -E '\.env|\.pem|\.key'
```

## rotates Secretها

هر ۹۰ روز:
```bash
# روی سرور
sudo openssl rand -hex 32  # JWT_SECRET
sudo openssl rand -hex 32  # JWT_REFRESH_SECRET
sudo nano /opt/ayan-taraz/.env
sudo docker compose restart api
```

## Monitor کردن

```bash
# لاگ‌های auth
docker compose logs -f api | grep -i "auth\|login\|otp"

# IPهای مشکوک
docker compose logs api | grep "401\|403" | awk '{print $NF}' | sort | uniq -c | sort -rn
```
