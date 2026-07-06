# Content Maintenance

## 1. هدف
حفظ کیفیت، صحت، و به‌روزرسانی محتوای سایت.

## 2. Content Review Cycle

### 2.1 Monthly Review
- محتوای مالیاتی: تطابق با قوانین جدید
- FAQها: پاسخ‌های قدیمی یا ناقص
- مقالات: لینک‌های شکسته
- دوره‌ها: وضعیت انتشار

### 2.2 Quarterly Review
- همه محتوای published
- بررسی SEO metrics
- به‌روزرسانی schema markup
- merge محتوای تکراری

## 3. Content States
| وضعیت | توضیح |
|---|---|
| draft | پیش‌نویس |
| review | منتظر تایید |
| published | منتشرشده |
| archived | بایگانی‌شده |
| needs_update | نیاز به بروزرسانی |
| expired | منقضی (برای محتوای مالیاتی با تاریخ) |

## 4. Content Hygiene Checklist
- [ ] لینک‌های داخلی کار می‌کنند
- [ ] CTAها به‌روز هستند
- [ ] تگ‌ها و meta description کامل
- [ ] thumbnail و media وجود دارد
- [ ] تاریخ به‌روزرسانی درج شده
- [ ] محتوای تکراری با canonical مشخص
- [ ] Schema markup درست

## 5. Stale Content Detection
محتوایی که:
- بیش از ۶ ماه از انتشار آن گذشته
- بازدید < ۱۰ در ماه
- لینک‌های خروجی broken
→ به status needs_update منتقل شود

## 6. Content Owner
هر محتوا باید یک owner داشته باشد:
- مقالات مالیاتی: کارشناس مالیاتی
- FAQ: تیم پشتیبانی
- محتوای آموزشی: مدرس دوره
- صفحات اصلی: Product owner

## 7. Expiration Policy
برای محتوای مالیاتی:
- قانون جدید ابلاغ شد → محتوای قدیمی needs_update
- deadline برای بروزرسانی: ۲ هفته
- بعد از deadline: auto-archive

## 8. Mini-Book Versioning
- هر mini-book دارای شماره نسخه
- changelog در انتهای مطلب
- نسخه‌های قدیمی قابل دسترسی (با warning)

## 9. Tools
- Content calendar (Google Sheets یا Notion)
- Periodic audit checklist
- Link checker (crawler ماهانه)
- SEO crawler (Screaming Frog / Sitebulb)
