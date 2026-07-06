# Auth UX States

## Phone Input Screen

### Default
- Single input field for phone number
- Placeholder: "شماره تلفن (مثال: 09123456789)"
- Submit button: "دریافت کد تایید"
- Helper text: "پیامک کد تایید به این شماره ارسال می‌شود"

### Validation Error
- Invalid format: "شماره تلفن نامعتبر است. فرمت: 09123456789"
- Rate limited: "تعداد درخواست بیش از حد مجاز. ۱۰ دقیقه صبر کنید"
- Phone blocked: "حساب شما به دلیل تلاش‌های ناموفق موقتاً مسدود شد. ۳۰ دقیقه صبر کنید"

### Loading
- Button text: "در حال ارسال..."
- Button disabled, spinner shown

### API Error (network/SMS)
- "خطا در برقراری ارتباط با سرور. دوباره تلاش کنید"
- "SMS failed, contact support" (with fallback instructions)

## OTP Screen

### Default
- 6 individual digit inputs (auto-advance)
- Label: "کد ارسال شده به 0912******* را وارد کنید"
- Timer: 5:00 countdown
- Resend button (disabled during countdown)
- Submit button: "تایید"

### Validation Error
- Incomplete code: "لطفاً کد ۶ رقمی را کامل وارد کنید"
- Wrong code: "کد وارد شده اشتباه است"
- Expired code: "کد منقضی شده است. درخواست کد جدید"
- Blocked: "تلاش‌های ناموفق زیاد. ۳۰ دقیقه صبر کنید"

### Timer States
- Running: show MM:SS (red when < 60s)
- Expired: show "منقضی شده", enable resend
- Resend cooldown: disable button during resend

### Resend
- Max 3 times
- Show remaining: "ارسال مجدد (2)"
- After limit: "حداکثر ارسال مجدد. ۱۰ دقیقه صبر کنید"

### Loading
- Button text: "در حال بررسی..."
- All inputs disabled

## Profile Completion Screen

### Default
- First name input (required)
- Last name input (optional)
- Helper text: "این اطلاعات برای ارتباط بهتر با شماست"
- Submit button: "ورود به پنل"

### Validation Error
- Empty first name: "لطفاً نام خود را وارد کنید"

### Loading
- Button text: "در حال ثبت..."
- Inputs disabled

## Session Expired
- Toast/banner: "نشست شما منقضی شده است. لطفاً دوباره وارد شوید."
- Redirect to /auth
- Clear stored tokens

## Error Messages (Summary)

| Condition | Persian Message |
|-----------|----------------|
| Invalid phone | شماره تلفن نامعتبر است |
| OTP resend limit | حداکثر تعداد ارسال کد. ۱۰ دقیقه صبر کنید |
| Phone blocked | تلاش‌های ناموفق زیاد. ۳۰ دقیقه صبر کنید |
| Wrong OTP | کد وارد شده اشتباه است |
| Expired OTP | کد منقضی شده است |
| Max attempts | تعداد تلاش‌های ناموفق بیش از حد مجاز |
| Server error | خطا در برقراری ارتباط با سرور |
| Session expired | نشست شما منقضی شده است |
| Unauthorized | شما دسترسی به این بخش را ندارید |
