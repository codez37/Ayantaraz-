# Logging & Monitoring Baseline

## Logging

### Backend (NestJS)
- Structured JSON logs via built-in Logger
- Request ID tracing (via interceptor)
- Log levels: error, warn, info, debug (configurable via LOG_LEVEL)
- Logged events: all HTTP requests, errors, auth events, state changes

### Frontend (Next.js)
- Server-side: console.log → stdout (Docker logs)
- Client-side: limited, no PII

## Monitoring

### Health Endpoint
- `GET /health` → `{ status, db, timestamp }`
- Checked by Docker health check every 30s

### Audit Logs
- Database table `audit_logs` (append-only)
- Immutable: no UPDATE, no DELETE
- Fields: actor_id, action, entity_type, entity_id, old_value, new_value, ip, timestamp

### Alert Thresholds (Future)
- OTP delivery failure > 5%
- API error rate > 1%
- Database pool exhaustion
- Disk usage > 80%
