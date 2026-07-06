# Admin Order UI

## Pages

### All Orders `/admin/orders`
- Table: ID, user, course, status, assignedTo, amount, date
- Filters: status, date range
- Search: phone, name, order ID
- Sort: date (desc default)
- Actions: view, assign, update status

### Pending `/admin/orders/pending`
Filtered to `status=pending`.

### Waiting for Payment `/admin/orders/waiting-for-payment`
Orders awaiting payment confirmation.

### Confirmed `/admin/orders/confirmed`
Completed orders.

### Detail `/admin/orders/:id`
- User info (name, phone, course, note)
- Current status (badge)
- Assignment (current + change button)
- Payment reference (display + input field for confirmation)
- Internal notes (list + add form)
- Status update (dropdown with allowed transitions)
- Enrollment status (active/inactive)
- Audit log (read-only, chronological)

## Actions per Status
| Status | Available Actions |
|--------|-------------------|
| pending | assign, mark_waiting_call, mark_waiting_payment, reject, cancel |
| waiting_for_call | assign, mark_waiting_payment, reject, cancel |
| waiting_for_payment | confirm (+reference), reject, cancel |
| confirmed | refund (rare) |
| rejected/canceled/expired | view only |
