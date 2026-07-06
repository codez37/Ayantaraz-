# Backup & Restore Policy

## 1. هدف
اطمینان از اینکه داده‌ها در هر شرایطی قابل بازیابی هستند.

## 2. چه چیزهایی Backup شوند

| آیتم | روش | دوره |
|---|---|---|
| PostgreSQL Database | pg_dump | روزانه |
| Uploaded Media | rsync/copy | روزانه |
| .env Configs | encrypted copy | بعد از هر تغییر |
| Prisma Migrations | git (already) | مداوم |
| Audit Logs | همراه DB | روزانه |

## 3. Retention Policy

| نوع | نگهداری | چرخش |
|---|---|---|
| Daily backups | ۷ روز | حذف بعد از ۷ روز |
| Weekly backups | ۴ هفته | نگهداری یک‌شنبه هر هفته |
| Monthly backups | ۳ ماه | اولین هر ماه |
| Pre-release | تا release بعدی | حذف بعد از release موفق |

## 4. Encryption
- Backupهای خارج از سرور: encrypted با GPG یا age
- کلید decrypt: جدا از backup ذخیره شود
- دسترسی به backup: فقط admin

## 5. Restore Testing
- هر ماه: restore تستی در محیط staging
- هر ۳ ماه: restore کامل با verification
- بعد از هر restore test: report به تیم

## 6. Script: backup.sh (موجود)
اسکریپت فعلی backup.sh باید این موارد را اضافه کند:
- `--encrypt` برای backupهای آفلاین
- `--verify` برای چک integrity بعد از backup
- `--prune` برای حذف backupهای قدیمی

## 7. Disaster Recovery Steps
```
1. Provision new server (or use standby)
2. Restore .env files
3. Restore database: pg_restore latest.dump
4. Restore media files
5. Verify data integrity
6. Point DNS / Nginx
7. Run healthcheck
8. Monitor for 1 hour
```

## 8. Anti-Patterns
- نگهداری backup در همان دیسک production ❌
- backup بدون تست restore ❌
- encryption key کنار backup ❌
- backup دستی و فراموش‌شده ❌
