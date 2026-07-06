# Admin Hardening

## Access Control
- JwtAuthGuard on ALL endpoints (global)
- @Roles() decorator on every admin endpoint
- Default deny: no endpoint accessible without explicit role
- Admin-only: user management, order confirm, settings, audit logs

## Session Security
- Admin sessions use same JWT with 24h expiry
- Optional: re-authentication for critical actions (future)
- Admin actions logged with actor identity in audit_logs

## Critical Action Guards
- Publish content: admin only, logged
- Confirm payment: admin only, payment reference required
- Role change: admin only, logged with before/after
- Block/unblock user: admin only, logged with reason

## Audit Trail
Every admin action logged with:
- actorId, action, entityType, entityId, oldValue, newValue
