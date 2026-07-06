# Empty / Loading / Error States

## Empty States

### Pages
| Page | Empty Message | Action CTA |
|------|--------------|------------|
| /articles | "هنوز مقاله‌ای منتشر نشده است." | "به زودی..." |
| /videos | "هنوز ویدیویی بارگذاری نشده است." | "به زودی..." |
| /courses | "هنوز دوره‌ای منتشر نشده است." | "به زودی..." |
| /dashboard/orders | "هنوز سفارشی ثبت نکرده‌اید." | "مشاهده دوره‌ها" → /courses |
| /dashboard/consultations | "هنوز درخواست مشاوره‌ای ثبت نکرده‌اید." | "درخواست مشاوره" → /consultation |
| /dashboard/courses | "در هیچ دوره‌ای ثبت‌نام نکرده‌اید." | "مشاهده دوره‌ها" → /courses |
| /admin/contents | "هنوز محتوایی ایجاد نشده است." | "ایجاد مطلب جدید" |
| /admin/orders | "هنوز سفارشی ثبت نشده است." | (auto-refresh) |
| /admin/consultations | "هنوز درخواستی ثبت نشده است." | (auto-refresh) |

### Design
- Centered layout
- Relevant icon (64px, gray)
- Message in 16px, gray-600
- Optional CTA button

## Loading States

### Patterns
- **Skeleton**: gray animated placeholder matching content shape
- **Spinner**: for buttons and inline actions (16-24px)
- **Page loader**: full-page spinner for initial loads (only if > 1s)

### Implementation
- Tables: skeleton rows (3-5)
- Cards: skeleton cards matching grid layout
- Detail pages: skeleton block for each section
- Buttons: spinner inside button, width preserved

### Timing
- < 300ms: no loading state needed
- 300ms - 1s: subtle spinner
- > 1s: skeleton skeleton + "در حال بارگذاری..."

## Error States

### Network Errors
- "خطا در برقراری ارتباط با سرور"
- Retry button
- After 3 retries: "سرور در دسترس نیست. لطفاً بعداً تلاش کنید."

### Validation Errors
- Inline: red border + error message below field
- Form top: summary of errors
- Persian messages: "شماره تلفن نامعتبر است"

### API Errors
- Toast notification (top-right, auto-dismiss 5s)
- Persian message extracted from API response
- No raw error codes shown to user

### 404
- Custom page with logo + "صفحه مورد نظر یافت نشد"
- Link to homepage

### 500
- Custom page with logo + "خطای داخلی سرور"
- "لطفاً بعداً تلاش کنید یا با پشتیبانی تماس بگیرید"
- Error logged automatically

### Auth Errors
- Session expired: redirect to /auth with message "نشست شما منقضی شده است. لطفاً دوباره وارد شوید."
- Unauthorized: redirect to /auth
- Forbidden: "شما دسترسی به این بخش را ندارید."

## Offline State
- Detect via navigator.onLine
- Banner (not modal): "اتصال اینترنت قطع شده است"
- Auto-dismiss on reconnection
- Cacheable content still accessible (if implemented)
