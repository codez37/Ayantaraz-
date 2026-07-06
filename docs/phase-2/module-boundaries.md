# Module Boundaries

## Backend Modules (NestJS)

### 1. Auth Module
- Request OTP, verify OTP, session management
- Rate limiting, brute-force protection
- No user data storage beyond phone verification

### 2. Users Module
- Profile CRUD (first name, last name, phone)
- Role management (user, consultant, content_manager, admin)
- User status (active, blocked)
- User audit trail

### 3. Content Module
- Article, Video, MiniBook management
- Lifecycle: draft → review → published → archived
- Category management
- Slug-based routing

### 4. Courses Module
- Course definition (title, description, price)
- Course videos with ordering
- Sample video marking
- Enrollment management

### 5. Consultation Module
- Request creation
- Status lifecycle: pending → contacted → scheduled → completed → canceled
- Assignment to consultants
- Internal notes

### 6. Orders Module
- Order creation (course/consultation)
- Manual payment workflow
- Status: pending → waiting_for_call → waiting_for_payment → confirmed/rejected/canceled
- Access activation on confirmation

### 7. Chatbot Module
- Knowledge base CRUD
- Constrained Q&A matching
- Escalation to human
- Refusal policy
- Query logging

### 8. Audit Module
- Append-only logging
- All state changes recorded
- Actor, action, entity, old/new values, timestamp, IP

### 9. Admin Module
- Dashboard data
- Management endpoints
- Permission enforcement
- Audit log browsing

## Module Isolation Rules
- Modules communicate through Services (not directly)
- Each module owns its database tables
- Cross-module access via injected services
- No circular dependencies
