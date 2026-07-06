# Observability Strategy

## Logging
- **Structured JSON logs** in production
- Log levels: error, warn, info, debug
- Request ID for tracing
- Logged: all HTTP requests, errors, auth events, state changes

## Audit Logs
- **Append-only** table in PostgreSQL
- Immutable records (no delete, no update)
- Fields: actor_id, action, entity_type, entity_id, old_value (JSON), new_value (JSON), ip_address, timestamp
- Retention: 12 months minimum

## Monitoring
- Health endpoint: GET /api/health
- Uptime checks (cron-based or external service)
- Error tracking via Sentry
- Database connection pool monitoring
- Redis connectivity monitoring

## Alerts
- OTP delivery failure rate > 5%
- API error rate > 1%
- Database connection pool exhausted
- Disk usage > 80%

## Metrics (Minimum Viable)
- Request count and duration
- Error count by endpoint
- Active users (daily)
- OTP send/verify counts
- Order counts by status
- Consultation counts by status
