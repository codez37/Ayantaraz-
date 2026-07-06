# Shared Code Policy

## What Goes in packages/shared

### Types
- API request/response contracts
- Domain models shared between frontend and backend
- Pagination types

### Enums
- UserRole: user, consultant, content_manager, admin
- ContentType: article, video, minibook
- ContentStatus: draft, review, published, archived
- CourseStatus: draft, review, published, archived
- ConsultationStatus: pending, contacted, scheduled, completed, canceled
- OrderStatus: pending, waiting_for_call, waiting_for_payment, confirmed, rejected, canceled, refunded
- OTPStatus: active, expired, used, blocked

### Constants
- OTP_EXPIRY_MS: 300000 (5 min)
- OTP_RESEND_LIMIT: 3
- OTP_RESEND_WINDOW_MS: 600000 (10 min)
- OTP_MAX_ATTEMPTS: 5
- OTP_LOCK_WINDOW_MS: 1800000 (30 min)
- JWT_ACCESS_EXPIRY: '24h'
- JWT_REFRESH_EXPIRY: '7d'

### Validators
- Phone regex for Iranian numbers
- Slug sanitizer
- Persian text utilities
- Validation error formatter

## What Does NOT Go Here
- UI components
- Backend-only business logic
- Infrastructure code
- Environment-specific config

## Usage
- Apps import from `@ayantaraz/shared`
- No circular dependencies
- Zero runtime dependencies beyond TypeScript
