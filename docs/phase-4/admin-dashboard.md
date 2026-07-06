# Admin Dashboard

## Layout
```
+------------------------------------------+
|  Header (admin badge, user menu, logout)  |
+------------------------------------------+
|  Sidebar            | Main Content Area   |
|  - داشبورد          |                     |
|  - محتوا             |                     |
|  - دوره‌ها           |                     |
|  - کاربران           |                     |
|  - مشاوره‌ها         |                     |
|  - سفارش‌ها          |                     |
|  - چت‌بات           |                     |
|  - لاگ‌ها            |                     |
+------------------------------------------+
```

## Statistics Cards (Top Row)
- Total users, total content, total courses, total orders, total consultations
- Each card: number + label + trend indicator (optional)

## Recent Orders Table
- Columns: ID, user, item, amount, status, date
- Status with color-coded badges
- Quick action: confirm/reject

## Recent Audit Logs
- Columns: timestamp, actor, action, entity
- Read-only: click to expand details

## Content Management
- Filterable table: title, type, status, author, date
- Bulk actions: publish, archive
- Individual: edit, status change, delete (soft)

## States

### Empty (no content yet)
- "هنوز محتوایی ایجاد نشده است. اولین مطلب را ایجاد کنید."
- "هنوز سفارشی ثبت نشده است."

### Loading
- Skeleton tables

### Error
- "خطا در بارگذاری اطلاعات. دوباره تلاش کنید."
