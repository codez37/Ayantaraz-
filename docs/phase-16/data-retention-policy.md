# Data Retention Policy

## 1. هدف
مشخص کردن مدت نگهداری، بایگانی، و حذف داده‌ها.

## 2. Retention Table

| Entity | Active Retention | Archive After | Purge After | Notes |
|---|---|---|---|---|
| User accounts | indefinite | - | - | قابل غیرفعال‌سازی |
| OTP codes | ۱۰ دقیقه | - | ۲۴ ساعت | auto-delete |
| Sessions | تا logout یا expiry | - | ۳۰ روز بعد از expiry |
| Refresh tokens | تا ۷ روز | - | ۳۰ روز بعد از expiry |
| Content (published) | indefinite | ۲ سال بدون ویرایش | - | archive به needs_update |
| Content (draft) | ۶ ماه | - | ۶ ماه بدون ویرایش |
| Content (archived) | indefinite | - | - | قابل restore |
| Consultations | indefinite | ۱ سال بعد از completed | - | audit حفظ شود |
| Orders | indefinite | ۲ سال بعد از completed | - | برای accounting |
| Enrollments | indefinite | - | - | وابسته به دوره |
| Knowledge Base | indefinite | - | - | همیشه active |
| Chat Messages | ۶ ماه | ۶ ماه | ۱ سال | حفظ برای training |
| Escalation Tickets | ۱ سال | ۱ سال | ۲ سال | |
| Audit Logs | indefinite | ۲ سال (auth: ۶ ماه) | - | security: ۲ سال |
| System Settings | indefinite | - | - | |
| Role Permissions | indefinite | - | - | |
| Error Logs | ۳۰ روز | - | ۳۰ روز | |
| Backup Files | ۷ روز (daily) | ۴ هفته (weekly) | ۳ ماه (monthly) | |

## 3. Archival Process
۱. داده‌های مشخص شده → export به JSON/CSV
۲. فشرده‌سازی + encryption
۳. ذخیره در cold storage (S3 یا مشابه)
۴. حذف از production DB
۵. ثبت در audit log

## 4. Purge Process
۱. تأیید دو مرحله‌ای
۲. حذف قطعی (بدون امکان recovery)
۳. ثبت در audit log
۴. تأیید Integrity باقی‌مانده

## 5. Legal Considerations
- اطلاعات کاربران: بر اساس قوانین ایران (حفظ حریم خصوصی)
- اطلاعات مالی: حداقل ۵ سال (قانون مالیات)
- اطلاعات پزشکی/حساس: N/A

## 6. Audit Log Special Policy
- لاگ‌های امنیتی: ۲ سال (غیرقابل حذف)
- لاگ‌های admin: ۲ سال
- لاگ‌های auth: ۶ ماه
- لاگ‌های business: ۱ سال
- لاگ‌های error: ۳۰ روز

## 7. Anti-Patterns
- حذف داده بدون backup ❌
- نگهداری همه داده برای همیشه ❌
- حذف audit log قبل از موعد ❌
- عدم رعایت الزامات قانونی ❌
