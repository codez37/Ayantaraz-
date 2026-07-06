# Order Data Model

## Tables

### orders
| Field | Type | Notes |
|-------|------|-------|
| id | Int PK | Auto-increment |
| userId | Int FK → users | |
| itemType | Enum(OrderItemType) | course, consultation |
| itemId | Int | course id or consultation id |
| amount | Int | Price in Tomans (0 = TBD) |
| status | Enum(OrderStatus) | pending → ... |
| paymentReference | String | Admin-recorded proof |
| internalNotes | String | Appended chronologically |
| firstName | String | Captured at order time |
| lastName | String | Captured at order time |
| phoneNumber | String | 09XXXXXXXXX |
| assignedToId | Int? FK → users | Current assignee |
| verifiedById | Int? FK → users | Who confirmed |
| verifiedAt | DateTime? | Confirmation timestamp |
| createdAt | DateTime | |
| updatedAt | DateTime | |

### Indexes
- (userId, status) — user dashboard
- (status) — admin filters
- (assignedToId) — my assignments
- (phoneNumber) — search

### enrollments (existing)
| Field | Type |
|-------|------|
| id | Int PK |
| userId | Int FK |
| courseId | Int FK |
| orderId | Int? FK |
| isActive | Boolean |
| createdAt | DateTime |

## Audit
All status changes + assignments + confirmations logged in audit_logs.
