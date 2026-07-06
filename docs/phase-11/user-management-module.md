# User Management Module

## Pages

### User List (`/admin/users`)
| Column | Description |
|--------|-------------|
| ID | |
| Phone | Searchable |
| Name | firstName + lastName |
| Role | Badge |
| Status | Active/Blocked badge |
| Last Login | Date |
| Orders | Count |
| Consultations | Count |
| Actions | View, Block, Role Change |

### User Detail (`/admin/users/:id`)
- Profile info (name, phone, role, status, lastLogin)
- Orders list (linked to order detail)
- Consultations list (linked)
- Enrollments (active courses)
- Activity timeline (recent audit logs involving this user)

## Actions

### Block/Unblock
- Toggle `isActive` on User
- Requires confirmation dialog
- Audit logged with reason
- Blocked user cannot log in

### Role Change
- Only admin can change roles
- Cannot self-demote to user
- Audit logged with before/after
- Confirmation required

### What NOT to Show
- Password hashes
- OTP codes
- Internal notes from other modules (only user's own data)
