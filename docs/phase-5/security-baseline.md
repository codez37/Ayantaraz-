# Security Baseline

## Implemented in This Phase

### Secret Management
- All secrets via environment variables
- No hardcoded credentials in code
- .env files excluded from version control
- JWT_SECRET required at startup (validation in AuthModule)

### Network Security
- Docker internal network for inter-service communication
- Database not exposed to host in production
- Redis with password authentication
- CORS restricted to production domain

### API Security
- Rate limiting: 100 req/min (global), stricter for auth
- Helmet security headers (HSTS, X-Frame-Options, etc.)
- Input validation on all endpoints (class-validator DTOs)
- Global validation pipe (whitelist, forbidNonWhitelisted)

### Authentication
- OTP-based (no password storage)
- JWT access token (24h) + refresh token (7d)
- Refresh token rotation with invalidation
- OTP hashed with SHA-256
- Rate limits: 3 OTP sends per 10 min, 5 attempts per 30 min

### Authorization
- RBAC with 4 roles: user, consultant, content_manager, admin
- Global JwtAuthGuard (opt-out with @Public())
- RolesGuard for endpoint-level permission

### Audit
- Append-only audit log table
- All state-changing operations logged
- No delete/update on audit records

### Readiness
- Health endpoint unauthenticated
- Docker health checks on all services
- Graceful shutdown handling
