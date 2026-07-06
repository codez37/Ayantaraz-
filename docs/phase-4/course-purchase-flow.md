# Course Purchase Flow

## User Side

### Entry Points
- Course list page
- Course detail page (main CTA)
- Sample video end card
- Recommended courses section

### Course Detail Page
```
Layout:
  1. Title + price
  2. Description
  3. Video list (samples marked, full locked)
  4. CTA: "درخواست خرید دوره" (if not enrolled)
     OR "دسترسی دارید" (if enrolled)

Note: Price displayed in Persian format: "۱,۵۰۰,۰۰۰ ریال"
Note: Always show: "پرداخت پس از تماس کارشناسان انجام می‌شود"
```

### Purchase Request Flow
```
1. User clicks "درخواست خرید دوره"
2. [If not logged in] redirect to /auth
3. [If logged in] API POST /api/orders { itemType: 'course', itemId }
4. Success: "درخواست خرید ثبت شد. 
             همکاران ما برای هماهنگی پرداخت با شما تماس خواهند گرفت."
5. Order status: pending → waiting_for_call
```

### Post-Request States
- Order visible in user dashboard
- Status tracking: pending → waiting_for_call → waiting_for_payment → confirmed
- User can see: "منتظر تماس کارشناسان" | "منتظر تایید پرداخت" | "دسترسی فعال شد"

### Important UX Rules
- Never show "خرید" button (no online payment)
- Always explain: "پرداخت به صورت دستی پس از تماس"
- Never pretend payment is automatic
- Status must be transparent at all times

## Admin Side

### Order Table
- Columns: ID, user, item, amount, status, date
- Filter: by status
- Quick actions: confirm, reject

### Order Detail
- User info + contact
- Item details
- Status history
- Admin notes
- Action buttons: confirm payment, reject, add note

### Confirmation Flow
1. Admin reviews request
2. Contacts user (outside system)
3. Verifies payment
4. Clicks "تایید پرداخت" → status: confirmed
5. System auto-creates enrollment
6. User gets access
