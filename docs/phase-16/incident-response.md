# Incident Response Plan

## 1. هدف
مسیر مشخص برای تشخیص، مهار، رفع، و یادگیری از incidents.

## 2. Severity Levels

| سطح | توضیح | مثال |
|---|---|---|
| Critical | سیستم از دسترس خارج یا نقض امنیت | OTP down, admin lockout, data breach |
| High | بخش مهم مختل شده | consultation down, order failure |
| Medium | بخش غیربحرانی مشکل دارد | chatbot degraded, slow response |
| Low | جزئی بدون impact کاربر | visual bug, wrong label |

## 3. مراحل پاسخ

### 3.1 Detect
- Alert از monitoring system
- گزارش کاربر
- مشاهده دستی ادمین

### 3.2 Classify
- تعیین severity
- تعیین owner
- ثبت در log incident

### 3.3 Contain
- قطع دسترسی در صورت حمله
- فعال‌سازی rate limit سخت‌تر
- disable feature موقتاً

### 3.4 Communicate
- اطلاع تیم داخلی
- اطلاع کاربران (در صورت لزوم)
- ثبت در status page

### 3.5 Fix or Rollback
- Rollback به آخرین stable version
- یا hotfix مستقیم
- تست سریع

### 3.6 Verify
- تست اینکه issue رفع شده
- تست اینکه issue جدید ایجاد نشده
- مانیتور به مدت ۳۰ دقیقه

### 3.7 Postmortem
- root cause analysis
- اقدامات پیشگیرانه
- به‌روزرسانی docs

## 4. Runbook سناریوهای Critical

### 4.1 OTP Down
۱. چک Kavenegar API status
۲. چک rate limit config
۳. چک database connection
۴. اگر API مشکل دارد → fallback manual
۵. اطلاع‌رسانی در سایت

### 4.2 Admin Lockout
۱. بررسی JWT_SECRET تغییر نکرده
۲. بررسی session table
۳. بررسی rate limit روی admin login
۴. دسترسی مستقیم به DB برای unlock

### 4.3 Database Corruption
۱. فعال‌سازی maintenance mode
۲. restore از آخرین backup
۳. بررسی data integrity
۴. شناسایی علت فساد
۵. Prevent recurrence

## 5. Communication Template
```
Severity: [CRITICAL/HIGH/MEDIUM/LOW]
Status: [DETECTED/CONTAINED/RESOLVED]
Time: YYYY-MM-DD HH:MM
Impact: ...
Action: ...
Owner: ...
ETA: ...
```

## 6. Postmortem Template
```
Date: ...
Severity: ...
Duration: ...
Root Cause: ...
Impact: ...
Action Taken: ...
Preventive: ...
Lessons: ...
```
