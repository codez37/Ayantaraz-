# Consultation Statuses

## Enum Values

| Status | Persian | Description |
|--------|---------|-------------|
| pending | در انتظار بررسی | Request submitted, not yet reviewed |
| contacted | تماس گرفته شده | Team reached out or attempted contact |
| scheduled | زمان‌بندی شده | Appointment time agreed |
| completed | تکمیل شده | Consultation done |
| canceled | لغو شده | Cancelled by user or team |
| no_response | بدون پاسخ | Contacted but no response received |
| rejected | رد شده | Out of scope or operational rejection |

## Allowed Transitions

| From → To | Allowed | Who | Note |
|-----------|---------|-----|------|
| pending → contacted | ✅ | operator/admin | First contact attempt |
| pending → scheduled | ✅ | operator/admin | Direct scheduling |
| pending → canceled | ✅ | user, admin | User cancellation |
| pending → rejected | ✅ | admin only | Out of scope |
| contacted → scheduled | ✅ | operator/admin | |
| contacted → completed | ✅ | operator/admin | |
| contacted → no_response | ✅ | operator/admin | |
| contacted → canceled | ✅ | admin | |
| scheduled → completed | ✅ | operator/admin | |
| scheduled → canceled | ✅ | user, admin | |
| completed → (any) | ❌ | - | Terminal state |
| canceled → (any) | ❌ | - | Terminal state |
| no_response → contacted | ✅ | operator/admin | Retry |
| no_response → canceled | ✅ | admin | |
| no_response → rejected | ✅ | admin | |
| rejected → (any) | ❌ | - | Terminal state |
