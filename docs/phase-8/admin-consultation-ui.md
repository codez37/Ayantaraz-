# Admin Consultation UI

## Pages

### All Requests `/admin/consultations`
- Table: ID, name, phone, subject, status, assignedTo, date
- Filters: status, subject, assignedTo, date range
- Search: phone, name
- Sort: date (desc default)
- Actions per row: view, assign, update status

### Pending `/admin/consultations/pending`
Same as All but filtered to `status=pending`.

### My Assignments `/admin/consultations/assigned-to-me`
Same but filtered to `assignedToId=currentUser`.

### Detail `/admin/consultations/:id`
- User info (name, phone, subject, message, preferred time)
- Current status (badge)
- Assignment (current + change button)
- Internal notes (list + add form)
- Status update (dropdown + submit)
- Audit log (read-only, chronological)
- Timeline view of status changes

## Actions per Status
| Current Status | Available Actions |
|----------------|-------------------|
| pending | assign, contact, schedule, reject, cancel |
| contacted | assign, schedule, complete, no-response, cancel |
| scheduled | assign, complete, cancel |
| completed | view only |
| canceled | view only |
| no_response | reassign, contact again, reject, cancel |
| rejected | view only |
