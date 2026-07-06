# Order Management Module

## Pages

### List (`/admin/orders`)
| Column | Description |
|--------|-------------|
| ID | Linked to detail |
| User | Name + phone |
| Course | Title |
| Status | Color badge |
| Assigned To | Name |
| Amount | Price |
| Date | Created |

### Filters
- Status (multi-select)
- Search (ID, phone, name)
- Date range

### Detail (`/admin/orders/:id`)
- User info
- Course info
- Current status
- Assignment
- Payment reference (display + input for confirmation)
- Internal notes (list + add)
- Enrollment status
- Audit log

## Critical Actions (Require Confirmation)

### Confirm Payment
1. Admin enters payment reference
2. System requires non-empty reference
3. Confirmation dialog: "آیا از دریافت پرداخت اطمینان دارید؟"
4. On confirm: status → confirmed, enrollment created, audit logged

### Reject Order
1. Confirmation: "آیا از رد این سفارش اطمینان دارید؟"
2. Optional reason
3. On confirm: status → rejected, rejectedAt set

### Refund
1. Only from confirmed status
2. Confirmation: "بازگشت وجه باعث غیرفعال شدن دسترسی می‌شود"
3. Enrollment deactivated
