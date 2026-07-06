# Order Statuses

## Enum Values

| Status | Persian | Description |
|--------|---------|-------------|
| pending | در انتظار بررسی | Order created, not yet reviewed |
| waiting_for_call | منتظر تماس | Need to contact user for coordination |
| waiting_for_payment | منتظر پرداخت | Payment method agreed, awaiting payment |
| confirmed | تایید شده | Payment confirmed, access activated |
| rejected | رد شده | Order denied (operational/scope) |
| canceled | لغو شده | Canceled by user or admin |
| refunded | بازگشت وجه | Payment refunded (if applicable) |
| expired | منقضی شده | No follow-up within timeframe |

## Allowed Transitions

| From → To | Allowed | Who | Note |
|-----------|---------|-----|------|
| pending → waiting_for_call | ✅ | admin | Needs phone coordination |
| pending → waiting_for_payment | ✅ | admin | Direct payment instruction |
| pending → canceled | ✅ | user, admin | |
| pending → rejected | ✅ | admin | |
| pending → expired | ✅ | system | No follow-up |
| waiting_for_call → waiting_for_payment | ✅ | admin | Contact done |
| waiting_for_call → canceled | ✅ | admin | |
| waiting_for_call → rejected | ✅ | admin | |
| waiting_for_call → expired | ✅ | system | No follow-up |
| waiting_for_payment → confirmed | ✅ | admin | Payment received |
| waiting_for_payment → canceled | ✅ | admin | |
| waiting_for_payment → rejected | ✅ | admin | |
| confirmed → refunded | ✅ | admin | Rare, with audit |
| confirmed → (other) | ❌ | - | Terminal except refund |
| rejected → (any) | ❌ | - | Terminal |
| canceled → (any) | ❌ | - | Terminal |
| refunded → confirmed | ❌ | - | New order needed |
| expired → waiting_for_call | ✅ | admin | Re-activate |
