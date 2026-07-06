# Consultation Flow

## User Side

### Entry Points
- Homepage hero CTA: "دریافت مشاوره"
- Services page: "مشاوره تلفنی"
- Floating CTA (mobile): "مشاوره رایگان"
- All content pages: sidebar CTA "نیاز به مشاوره دارید؟"

### Form Page
```
Fields:
  1. موضوع مشاوره  [dropdown: حسابداری | مالیاتی | عمومی ]
  2. توضیحات       [textarea, 100-500 chars]
  3. زمان پیشنهادی [optional text input]

CTA: "ثبت درخواست مشاوره"

Success: "درخواست شما با موفقیت ثبت شد.
          همکاران ما در اسرع وقت با شما تماس خواهند گرفت."
```

### Status Tracking (in dashboard)
- Pending: "درخواست شما ثبت شده و در انتظار بررسی است"
- Contacted: "کارشناس ما با شما تماس گرفته است"
- Completed: "مشاوره انجام شده است"
- Canceled: "درخواست لغو شده است"

### States

#### Empty
- "هنوز درخواست مشاوره‌ای ثبت نکرده‌اید"

#### Loading
- Spinner on submit button + "در حال ثبت..."

#### Error
- Validation: "لطفاً توضیحات را وارد کنید"
- Network: "خطا در ثبت درخواست. دوباره تلاش کنید."

## Admin Side

### Table View
- Columns: ID, user phone, type, status, date, actions
- Filter: by status, by type, date range
- Sort: by date (default desc)

### Detail View
- User info
- Request details (type, description, preferred time)
- Status update controls
- Internal notes textarea
- Assignment to consultant

### Actions
- Approve → status: contacted
- Assign consultant → status: in_progress
- Complete → status: completed
- Cancel → status: canceled
- Add internal note (always logged)
