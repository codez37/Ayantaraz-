# Role & Permission Matrix

## Roles
| Role | Level | Description |
|------|-------|-------------|
| user | 0 | Regular authenticated user |
| consultant | 1 | Can manage consultations assigned to them |
| content_manager | 2 | Can create/edit content, manage KB |
| admin | 3 | Full access to all operational features |

## Permission Mapping

| Action | user | consultant | content_manager | admin |
|--------|------|------------|-----------------|-------|
| View own profile | ✅ | ✅ | ✅ | ✅ |
| Create consultation | ✅ | ✅ | ✅ | ✅ |
| View own orders | ✅ | ✅ | ✅ | ✅ |
| View own enrollments | ✅ | ✅ | ✅ | ✅ |
| View dashboard | ❌ | ❌ | ✅ | ✅ |
| Create/edit content | ❌ | ❌ | ✅ | ✅ |
| Submit content for review | ❌ | ❌ | ✅ | ✅ |
| Publish content | ❌ | ❌ | ❌ | ✅ |
| Archive content | ❌ | ❌ | ❌ | ✅ |
| Manage knowledge base | ❌ | ❌ | ✅ | ✅ |
| View consultations list | ❌ | ✅ (assigned) | ❌ | ✅ |
| Update consultation status | ❌ | ✅ (assigned) | ❌ | ✅ |
| View orders list | ❌ | ❌ | ❌ | ✅ |
| Confirm/reject orders | ❌ | ❌ | ❌ | ✅ |
| Manage users | ❌ | ❌ | ❌ | ✅ |
| Change user roles | ❌ | ❌ | ❌ | ✅ (admin+) |
| Block/unblock users | ❌ | ❌ | ❌ | ✅ |
| View audit logs | ❌ | ❌ | ❌ | ✅ |
| Manage settings | ❌ | ❌ | ❌ | ✅ |

## Default Deny
If a permission is not explicitly granted, it is denied.
