# User Dashboard

## Layout
```
+----------------------------------+
|  Header (logo, nav, user menu)    |
+----------------------------------+
|  Sidebar (minimal) | Main Area    |
|  - پروفایل         |              |
|  - سفارش‌ها        |              |
|  - مشاوره‌ها        |              |
|  - دوره‌های من      |              |
|  - خروج            |              |
+----------------------------------+
|  Footer                           |
+----------------------------------+
```

## Profile Page
- Display: phone (read-only), first name, last name (editable)
- Actions: save profile, view order history

## Orders Page
- Table: course name, amount, status, date
- Status badges with Persian labels
- Color coding: confirmed=green, pending=yellow, rejected=red

## Consultation Requests Page
- Table: type, status, date, description (truncated)
- Click to expand detail
- Status badges with Persian labels

## My Courses Page
- Grid of enrolled courses
- Each card: title, progress indicator (if tracked), link to videos
- If not enrolled in any: empty state message

## States

### Empty
- No orders: "هنوز سفارشی ثبت نکرده‌اید. برای مشاهده دوره‌ها به صفحه دوره‌ها بروید."
- No consultations: "هنوز درخواست مشاوره‌ای ثبت نکرده‌اید."
- No courses: "در هیچ دوره‌ای ثبت‌نام نکرده‌اید."

### Loading
- Skeleton cards for each section

### Error
- "خطا در دریافت اطلاعات. لطفاً دوباره تلاش کنید."
- Retry button for each failed section
