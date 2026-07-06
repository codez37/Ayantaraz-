# Consultation Management Module

## Pages

### List (`/admin/consultations`)
Same as Phase 8 admin spec. Filters by status, assignedTo, date.

### Detail (`/admin/consultations/:id`)
- User info (name, phone)
- Request details (subject, message, preferredTime)
- Current status (badge + change dropdown)
- Assignment (current + change button)
- Internal notes (list + add form)
- Audit log (read-only)

## Status Transitions (Admin)
| From → To | Allowed |
|-----------|---------|
| pending → contacted | ✅ |
| pending → scheduled | ✅ |
| pending → canceled | ✅ |
| pending → rejected | ✅ |
| contacted → scheduled | ✅ |
| contacted → completed | ✅ |
| contacted → no_response | ✅ |
| contacted → canceled | ✅ |
| scheduled → completed | ✅ |
| scheduled → canceled | ✅ |
| no_response → contacted | ✅ (retry) |
| no_response → canceled | ✅ |
| no_response → rejected | ✅ |

## Critical Actions
- Reject: requires confirmation + reason
- Complete: logged with outcome note
