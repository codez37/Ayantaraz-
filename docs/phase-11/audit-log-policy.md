# Audit Log Policy

## What Gets Logged
All state-changing actions in admin panel:
- Content: create, update, submit for review, publish, archive, restore, unpublish
- Users: block, unblock, role change
- Consultations: status change, assignment, note
- Orders: status change, assignment, confirm, reject, refund
- Chatbot: KB create, update, archive
- Settings: update
- System: login (admin)

## Log Structure
| Field | Description |
|-------|-------------|
| actorId | Who did it |
| action | Machine-readable action name |
| entityType | Content/User/Order/Consultation/etc |
| entityId | Target entity ID |
| oldValue | JSON: previous state (for changes) |
| newValue | JSON: new state |
| ipAddress | Optional, from request |
| createdAt | Auto timestamp |

## Queries
- Filter by entityType + entityId (audit trail for a specific record)
- Filter by actorId (what did a specific admin do)
- Filter by action type
- Date range filter
- Pagination

## Retention
Logs are append-only. No deletion. No editing.

## Export
Admin can export filtered logs as JSON/CSV (frontend feature).
