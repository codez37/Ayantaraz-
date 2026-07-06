# Non-Functional Requirements

## Security
- NFR1: OTP codes must expire after 5 minutes
- NFR2: Max 5 OTP verification attempts per phone per 30 minutes
- NFR3: Max 3 OTP send requests per phone per 10 minutes
- NFR4: All passwords/sensitive data hashed (OTP stored as SHA-256)
- NFR5: Session tokens with 24h expiry, refresh tokens with 7d expiry
- NFR6: Role-based access control on every endpoint
- NFR7: All admin actions logged with actor identity
- NFR8: Input validation on all API endpoints
- NFR9: File uploads restricted by type and size (max 50MB)
- NFR10: HTTPS required for all communication

## Performance
- NFR11: Content pages must load within 2 seconds
- NFR12: API responses under 500ms for 95% of requests
- NFR13: Mobile-responsive design (RTL support)
- NFR14: Static content cacheable (CDN-ready)

## Reliability
- NFR15: System must handle SMS provider failure gracefully (log + retry)
- NFR16: File upload failures must not break the request
- NFR17: Database backups daily with point-in-time recovery
- NFR18: System must function with Redis failure (fallback to DB)

## Maintainability
- NFR19: Modular Django apps with clear boundaries
- NFR20: All state transitions documented in code
- NFR21: Comprehensive logging with structured format
- NFR22: Migration files for all schema changes
- NFR23: Environment-based configuration

## Deployability
- NFR24: Docker Compose for local and production
- NFR25: Staging and production environments
- NFR26: Zero-downtime deployment capability
- NFR27: Rollback procedure for every deployment
- NFR28: All secrets in environment variables, not code
