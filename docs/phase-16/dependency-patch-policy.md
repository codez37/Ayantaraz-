# Dependency & Patch Policy

## 1. هدف
مدیریت به‌روزرسانی وابستگی‌ها به صورت امن و کنترل‌شده.

## 2. Dependency Scan

### 2.1 Automated Scanning
- `pnpm audit` در CI
- npm audit بعد از هر install
- بررسی vulnerabilityها

### 2.2 Frequency
| نوع | زمان |
|---|---|
| Security scan | هر commit (CI) |
| Full audit | هفتگی (دستی یا cron) |
| Dependency review | ماهانه |

## 3. Patch Types

### 3.1 Security Patches (فوری)
- CVE با severity CRITICAL/HIGH
- action: ظرف ۲۴ ساعت
- process:
  1. بررسی impact روی پروژه
  2. Update dependency
  3. تست کامل
  4. Deploy

### 3.2 Minor Updates (هفتگی)
- Patch version bumps
- Non-breaking changes
- process:
  1. `pnpm update` روی packages مشخص
  2. تست
  3. Deploy در release بعدی

### 3.3 Major Updates (ماهانه)
- Breaking changes
- نیاز به code changes
- process:
  1. بررسی changelog
  2. Migration plan
  3. تست گسترده
  4. برنامه‌ریزی برای release جداگانه

## 4. Update Rules
- هر update با `pnpm update` (نه manual edit)
- lockfile (`pnpm-lock.yaml`) همیشه commit شود
- updateهای بزرگ در branch جدا
- قبل از update: backup از lockfile فعلی

## 5. Deprecation Watch
- `pnpm outdated` به صورت هفتگی
- بررسی packages approaching EOL
- برنامه migration قبل از EOL

## 6. Security Contacts
- برای vulnerabilityهای بحرانی: اطلاع فوری به تیم
- کانال: ایمیل + group chat

## 7. Anti-Patterns
- `pnpm update --latest` بدون بررسی ❌
- ignore کردن vulnerability warnings ❌
- اضافه کردن package بدون دلیل ❌
- packages با maintainer نامشخص ❌
- pinning بدون دلیل ❌
- به‌روزرسانی در production بدون تست ❌
