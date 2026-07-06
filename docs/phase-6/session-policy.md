# Session Policy

## Session Type
Hybrid: JWT tokens (stateless) + Server-side session records (stateful for revocation).

## Session Lifecycle

```
created (on OTP verify)
  → active
    → expired (after 7d of no refresh)
    → revoked (on logout)
    → revoked (on security event)
```

## Session Record (DB: sessions)
| Field | Type | Description |
|-------|------|-------------|
| id | Int | Primary key |
| userId | Int | FK to users |
| tokenId | String | JWT jti for correlation |
| deviceInfo | String? | User-agent / device description |
| ipAddress | String? | IP at session creation |
| lastActiveAt | DateTime | Last token refresh |
| expiresAt | DateTime | Session expiry (7d) |
| revokedAt | DateTime? | When revoked |
| createdAt | DateTime | Creation timestamp |

## Token Lifetime
- Access token: 24 hours (short-lived)
- Refresh token: 7 days (longer-lived, single-use)
- Refresh token rotation: each refresh issues new tokens, invalidates old
- Old refresh tokens are soft-deleted (revoked=true)

## Revocation
| Trigger | Action |
|---------|--------|
| User logout | Revoke all sessions for user |
| Token reuse (suspected theft) | Revoke ALL sessions for user |
| Admin force logout | Revoke specific user session |
| Password/phone changed | Revoke all sessions (future) |

## Session Validation
- On each API call: JWT validated (signature + expiry)
- On sensitive actions: additional session record check (optional for future)
- Refresh: token record must be active + not revoked + not expired

## Inactivity
- No explicit inactivity timeout (token expiry handles it)
- Future: configurable idle timeout via Redis
