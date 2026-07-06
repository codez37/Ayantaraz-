# Authentication Flow

## User Journey

```
1. [Public] User clicks "ورود / ثبت‌نام"
2. [Screen] Phone input page
   - Input: phone number (09XXXXXXXXX)
   - Validation: regex pattern, RTL display
   - CTA: "دریافت کد تایید"
   - Display: rate limit info "حداکثر ۳ بار در ۱۰ دقیقه"
3. [API] POST /api/auth/otp { phone }
4. [Screen] OTP verification page
   - 6-digit input fields (auto-focus, paste support)
   - Timer: 5-minute countdown
   - Resend link: enabled after 60s, max 3 times
   - Attempt display: "۵ تلاش مجاز"
   - CTA: "تایید"
   - Link: "تغییر شماره"
5. [API] POST /api/auth/verify { phone, code }
6. [Screen - New User] Profile completion page
   - Fields: first name, last name
   - Skip option (minimal profile)
   - CTA: "ورود به پنل"
7. [Screen - Returning User] Redirect to dashboard or previous page
```

## States

### Empty
- Phone input: placeholder text "شماره تلفن خود را وارد کنید"
- OTP input: empty 6 dashes

### Loading
- Button: spinner + "در حال ارسال..."
- Button: spinner + "در حال بررسی..."

### Error
- Invalid phone: "شماره تلفن نامعتبر است (مثال: 09123456789)"
- OTP expired: "کد منقضی شده است. دوباره درخواست دهید."
- Too many attempts: "تعداد تلاش بیش از حد. ۳۰ دقیقه صبر کنید."
- Network error: "خطا در ارتباط با سرور. دوباره تلاش کنید."
- SMS send failed: "ارسال پیامک با مشکل مواجه شد. با پشتیبانی تماس بگیرید."

### Edge Cases
- User enters wrong phone → back to phone step
- User closes browser during OTP → OTP still valid for 5 min
- Resend before timer → blocked until 60s
- Multiple tabs → each has independent OTP state

## Security UX Notes
- OTP code never displayed in full (masked in logs)
- No password field ever shown
- Session persists for 24h
- No sensitive data stored client-side beyond tokens
