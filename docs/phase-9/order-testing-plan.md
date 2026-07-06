# Order Testing Plan

## Unit Tests

### Create
| Test | Assertions |
|------|------------|
| Create order with auth | userId set, status=pending, audit logged |
| Create without auth (phone provided) | User created or found, order created |
| Create without phone (no auth) | Throws validation error |
| Create duplicate (same user+course pending) | Blocked with conflict message |
| Create rate limit | Blocked after N orders per hour |

### Status Transitions
| Test | Assertions |
|------|------------|
| pending → waiting_for_call | Status updated, audit logged |
| pending → waiting_for_payment | Status updated, audit logged |
| waiting_for_call → waiting_for_payment | OK |
| waiting_for_payment → confirmed | Enrollment created, audit logged |
| confirmed → refunded | Enrollment deactivated, audit logged |
| pending → rejected | Status updated, rejectedAt set |
| pending → canceled | Status updated, canceledAt set |

### Invalid Transitions
| Test | Assertions |
|------|------------|
| pending → confirmed (no payment) | ❌ Rejected |
| confirmed → pending | ❌ Rejected |
| rejected → confirmed | ❌ Rejected |
| confirmed → waiting_for_payment | ❌ Rejected |

### Access Activation
| Test | Assertions |
|------|------------|
| Order confirmed → enrollment created | Enrollment exists, isActive=true |
| Duplicate enrollment prevented | No duplicate userId+courseId |
| Refund → enrollment deactivated | isActive=false |

### Assignment
| Test | Assertions |
|------|------------|
| Admin assigns to operator | assignedToId set, audit logged |
| Only admin can assign to others | Consultant limited to self |

### Notes
| Test | Assertions |
|------|------------|
| Add internal note | Note appended, audit logged |
| Notes shown chronologically | |

### Access Control
| Test | Assertions |
|------|------------|
| User sees own orders only | Filtered |
| Admin sees all orders | All returned |
| Unauthenticated can create with phone | Allowed |
