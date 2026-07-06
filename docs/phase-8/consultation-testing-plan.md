# Consultation Testing Plan

## Unit Tests

### Create
| Test | Assertions |
|------|------------|
| Create with valid data | Returns request with status=pending, audit logged |
| Create without phone | Throws validation error |
| Create with short message | Throws validation error |
| Create duplicate (same phone+subject < 5min) | Blocks or flags as duplicate |
| Create for authenticated user | userId set, firstName/lastName from profile |
| Create rate limit | Blocks after N requests per hour |

### Status Transitions
| Test | Assertions |
|------|------------|
| pending → contacted | Status updated, contactedAt set, audit logged |
| pending → scheduled | Status updated, audit logged |
| pending → canceled | Status updated, canceledAt set, audit logged |
| pending → rejected (admin) | Status updated, audit logged |
| contacted → scheduled | OK |
| contacted → completed | OK |
| contacted → no_response | OK |
| scheduled → completed | OK |
| completed → pending | ❌ Rejected |
| canceled → completed | ❌ Rejected |

### Assignment
| Test | Assertions |
|------|------------|
| Admin assigns to operator | assignedToId set, audit logged |
| Operator claims to self | assignedToId set, audit logged |
| Re-assignment overwrites | audit shows old+new assignee |

### Notes
| Test | Assertions |
|------|------------|
| Add internal note | Note appended, audit logged |
| Notes shown chronologically | |

### Access Control
| Test | Assertions |
|------|------------|
| User sees own requests only | Filtered |
| Admin sees all requests | All returned |
| Operator sees unassigned + own | Filtered |
| Unauthenticated user can create | Allowed |
