# Content Testing Plan

## Unit Tests (ContentService)

### Create
| Test | Assertions |
|------|------------|
| Create article as draft | Returns content with status=draft, audit logged |
| Create with invalid type | Throws validation error |
| Create with duplicate slug | Throws error |
| Create without required fields | Throws validation error |

### Lifecycle Transitions
| Test | Assertions |
|------|------------|
| Submit draft for review | Status → review, audit logged |
| Approve review → published | Status → published, audit logged |
| Reject review → draft | Status → draft, audit logged |
| Archive published | Status → archived, audit logged |
| Restore archived → draft | Status → draft, audit logged |
| Skip review (admin express) | Status → published, audit logged |

### Invalid Transitions
| Test | Assertions |
|------|------------|
| Publish directly from draft (non-admin) | Throws error |
| Archive from draft | Allowed (admin only) |
| Review → review (no change) | Throws error |

### Visibility
| Test | Assertions |
|------|------------|
| Public content visible to all | Returned for any user |
| Authenticated content hidden from anonymous | Not returned |
| Course-only content filtered by enrollment | Handled correctly |

### Search/Filter
| Test | Assertions |
|------|------------|
| Filter by type | Only matching type returned |
| Filter by status | Only matching status returned |
| Filter by category | Only matching category returned |
| Search by title | Matching contents returned |
| Pagination | Correct page/limit/total |
