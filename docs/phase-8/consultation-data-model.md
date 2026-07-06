# Consultation Data Model

## Tables

### consultation_requests
| Field | Type | Notes |
|-------|------|-------|
| id | Int PK | Auto-increment |
| userId | Int FK → users | |
| firstName | String | Captured at request time |
| lastName | String | Captured at request time |
| phoneNumber | String | 09XXXXXXXXX |
| subject | Enum(ConsultationType) | accounting, tax, general |
| message | String | User description (10-2000 chars) |
| preferredTime | String | Free-text hint |
| status | Enum(ConsultationStatus) | pending → ... |
| assignedToId | Int? FK → users | Current assignee |
| internalNotes | String | Appended chronologically |
| contactedAt | DateTime? | First contact |
| completedAt | DateTime? | Completion |
| canceledAt | DateTime? | Cancellation |
| createdAt | DateTime | |
| updatedAt | DateTime | |

### Indexes
- (userId, status) — user dashboard
- (status) — admin filters
- (assignedToId) — my assignments
- (phoneNumber) — search

## Audit
All status changes + assignments + notes logged in `audit_logs` table with:
- actorId, action (`consultation_*`), entityType='consultation', entityId, oldValue, newValue
