# Auth Error Handling

## Error Response Format
All API errors follow the standard format:
```json
{
  "statusCode": 400,
  "message": ["Persian error message"],
  "timestamp": "2026-06-14T07:00:00.000Z"
}
```

## Auth-Specific Errors

### 400 Bad Request
| Scenario | Message |
|----------|---------|
| Invalid phone format | ["شماره تلفن نامعتبر است"] |
| OTP code not 6 digits | ["کد باید ۶ رقمی باشد"] |
| OTP not found/expired | ["کد نامعتبر یا منقضی شده"] |
| Wrong OTP code | ["کد وارد شده اشتباه است"] |
| OTP already used | ["این کد قبلاً استفاده شده است"] |
| Missing firstName in profile | ["لطفاً نام خود را وارد کنید"] |

### 401 Unauthorized
| Scenario | Message |
|----------|---------|
| No token | ["احراز هویت الزامی است"] |
| Invalid token | ["توکن نامعتبر است"] |
| Expired token | ["نشست شما منقضی شده است"] |
| Session revoked | ["نشست شما باطل شده است"] |

### 403 Forbidden
| Scenario | Message |
|----------|---------|
| Insufficient role | ["شما دسترسی به این بخش را ندارید"] |

### 429 Too Many Requests
| Scenario | Message |
|----------|---------|
| OTP resend limit | ["حداکثر تعداد ارسال کد. ۱۰ دقیقه صبر کنید"] |
| Phone blocked | ["تلاش‌های ناموفق زیاد. ۳۰ دقیقه صبر کنید"] |
| Global rate limit | ["تعداد درخواست بیش از حد مجاز. لطفاً بعداً تلاش کنید"] |

## Frontend Error Handling

### Network Errors
- Detect `fetch` failure (no response)
- Show: "خطا در برقراری ارتباط با سرور. دوباره تلاش کنید."
- After 3 failures: "سرور در دسترس نیست. لطفاً بعداً تلاش کنید."
- Retry button on all error states

### API Errors
- Parse error response JSON
- Extract Persian message from `error.message` (already localized)
- Show in appropriate UI context (inline, toast, or banner)
- Never show raw error codes or stack traces

### Timeout
- Fetch timeout: 15 seconds
- Show: "درخواست با تأخیر مواجه شد. دوباره تلاش کنید."
- Retry button

## Error Recovery Paths

| Scenario | Recovery |
|----------|----------|
| SMS not delivered | Resend OTP (if within limit) |
| Wrong OTP entered | Try again (if within attempt limit) |
| OTP expired | Request new OTP |
| Session expired | Redirect to /auth with message |
| Network error | Retry with exponential backoff |
| Server down | Show "سرور در دسترس نیست" with contact info |
