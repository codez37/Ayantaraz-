# Admin Testing Plan

## API Tests

### Dashboard
| Test | Assertions |
|------|------------|
| GET /admin/dashboard | Returns stats + recent orders + recent audits |
| Dashboard permissions | Non-admin gets 403 |

### User Management
| Test | Assertions |
|------|------------|
| List users | Paginated list returned |
| Get user detail | Includes profile + orders + consultations |
| Block user | isActive=false, audit logged |
| Unblock user | isActive=true, audit logged |
| Change role | Role updated, audit logged with before/after |
| Permission denied | content_manager cannot change roles |

### Settings
| Test | Assertions |
|------|------------|
| List settings | All settings returned |
| Update setting | Value updated, audit logged |
| Non-admin cannot update | 403 |

### Audit Logs
| Test | Assertions |
|------|------------|
| List logs | Paginated, ordered by date desc |
| Filter by entityType | Filtered results |
| Filter by actorId | Filtered results |

### Access Control
| Test | Assertions |
|------|------------|
| Unauthenticated request | 401 |
| User role request | 403 |
| content_manager on admin action | 403 |
| Admin on admin action | 200 |
