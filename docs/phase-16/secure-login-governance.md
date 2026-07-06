# Secure Login Governance

## 1. هدف
حفظ امنیت مسیر ورود کاربران و ادمین‌ها در طول زمان.

## 2. OTP Governance

### 2.1 Current Policy
- ارسال: ۳ بار در ۱۰ دقیقه
- تلاش ناموفق: ۵ بار → بلاک ۳۰ دقیقه
- کد: ۶ رقمی، ۲ دقیقه معتبر
- مسیریابی: ۰۹۱۲ → ۰۹۱۲

### 2.2 Monitoring Metrics
| معیار | آستانه | اقدام |
|---|---|---|
| OTP fail rate | > 15% | بررسی Kavenegar |
| Resend abuse | > 3/phone/10min | اعمال rate limit |
| Blocked phones | > 5/day | بررسی الگوی حمله |
| OTP delivery time | > 10s | بررسی API |

### 2.3 Adjustments
اگر fail rate بالا رفت:
- افزایش time window برای resend
- یا کاهش max attempts
- یا فعال‌سازی captcha

## 3. Session Governance
- JWT access: ۲۴ ساعت
- Refresh token: ۷ روز
- Rotation: هر refresh یک access جدید
- Theft detection: reuse revoked token → همه sessions terminate

## 4. Admin Login Hardening
- مسیر مجزا: `/admin/login`
- Rate limit سخت‌تر: ۳ تلاش در ۱۵ دقیقه
- Session timeout: ۲ ساعت
- Re-authentication: برای critical actions
- لاگ کامل: IP, User-Agent, Timestamp

## 5. Logout Governance
- logout باید:
  - Revoke session
  - Revoke refresh token
  - Clear client-side storage
  - Log event

## 6. Blocked Phone Behavior
کاربر بلاک‌شده:
- در OTP: "حساب شما موقتاً مسدود شده است"
- در ورود: پیام مشابه
- در admin panel: قابل مشاهده با status blocked
- بعد از ۳۰ دقیقه: auto-unblock

## 7. Login Anomaly Detection
الگوهای مشکوک:
- تلاش از IPهای مختلف در زمان کوتاه
- تلاش با phoneهای مختلف از یک IP
- تلاش خارج از ساعات عادی
- admin login از IP ناشناس

## 8. Recovery Path
اگر کاربر گوشی ندارد:
- از طریق پشتیبانی با تأیید هویت
- یا ایمیل پشتیبان (در صورت تنظیم)
- یا احراز هویت حضوری

## 9. Anti-Patterns
- امنیت بیش از حد که UX را خراب کند ❌
- recovery path فراموش‌شده ❌
- لاگ ناقص login events ❌
- session timeout یکسان برای admin و user ❌
