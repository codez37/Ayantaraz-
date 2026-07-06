# Audit Log Governance

## 1. هدف
مدیریت چرخه حیات لاگ‌های حسابرسی: ثبت، نگهداری، و پایش.

## 2. چه رویدادهایی باید Log شوند

### 2.1 Auth Events
- OTP request (masked phone)
- Login success/failure
- Logout
- Session revocation
- Token refresh
- Blocked user attempt

### 2.2 Admin Events
- Admin login / logout
- Role change
- User block/unblock
- Content status change
- Order confirm / refund
- Consultation assign / update
- Settings change
- Knowledge base CRUD

### 2.3 Content Events
- Create
- Update
- Status change (draft → review → published → archived)
- Visibility change

### 2.4 Business Events
- Consultation create
- Order create
- Order status change
- Enrollment create/deactivate

### 2.5 Security Events
- Forbidden resource access (403)
- Invalid role attempt
- Suspicious activity pattern
- Rate limit exceeded
- Theft detection trigger

## 3. Data Retention
| نوع لاگ | Retention | Action |
|---|---|---|
| Auth events | ۶ ماه | سپس archive |
| Admin actions | ۲ سال | نگهداری کامل |
| Business events | ۱ سال | سپس archive |
| Security events | ۲ سال | نگهداری کامل |
| Error events | ۳۰ روز | سپس حذف |
| Debug events | ۷ روز | سپس حذف |

## 4. Sensitive Data Masking
- شماره تلفن: `***` (۳ رقم آخر نمایش)
- OTP code: `***`
- Token: `***…XXXX` (۴ رقم آخر)
- Password (if any): `******`

## 5. Audit Log Structure
```typescript
{
  id: number;
  actorId: number;
  action: string;        // e.g. content_status_published
  entityType: string;    // e.g. content, order, consultation
  entityId: number;
  oldValue: Record<string, any> | null;
  newValue: Record<string, any> | null;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}
```

## 6. Review Cycle
- روزانه: چک لاگ‌های security و error
- هفتگی: بررسی الگوهای مشکوک
- ماهانه: audit log retention review
- س‌ماهانه: full audit review با تیم

## 7. Audit Dashboard
در پنل ادمین:
- فیلتر بر اساس: action, entityType, actor, date range
- جستجو در oldValue و newValue
- Export به CSV
- Graph از activity روزانه

## 8. Anti-Patterns
- لاگ ناقص یا بدون context ❌
- نگهداری همه چیز برای همیشه ❌
- حذف بی‌برنامه ❌
- حساس‌زدایی ناقص ❌
- لاگ‌های بدون timestamp ❌
