# Kernel Policy

## Core Rules

### Rule 1: Reality
The system must be real, not demonstrative.
- Forbidden: mock data, placeholder architecture, fake workflows, demo logic as production
- Required: real registration, real consultation, real order, real manual verification, real content management

### Rule 2: Data Minimization
Only necessary data is stored.
- User data: first name, last name, phone number only
- System data: status, timestamps, role, audit log
- Forbidden: unnecessary profiling, storing data "just in case"

### Rule 3: Domain Transparency
Every part of the system must be unambiguous.
- Who is the user? What is the admin?
- What is published? What is sold? What is free?
- What requires approval? What can be deleted? What can be restored?

### Rule 4: Chatbot Containment
The chatbot is constrained and knowledge-base-driven.
- Allowed: approved FAQ answers, cautious guidance, referral to human
- Forbidden: deterministic legal/tax claims without source, unsafe estimates, claims of absolute knowledge

### Rule 5: State-First Design
Every workflow has explicit, documented states.
- Users: anonymous, otp_pending, verified, active, blocked
- Content: draft, review, published, archived
- Consultation: pending, contacted, scheduled, completed, canceled
- Orders: pending, waiting_for_call, waiting_for_payment, confirmed, rejected, canceled
- OTP: active, expired, used, blocked

### Rule 6: Audit Mandate
Every significant operation leaves a trace.
- Must log: login, OTP send/verify, content CRUD, publish, soft delete, consultation request, order, payment confirmation, role change, admin activity
- Forbidden: state change without log, physical deletion without trace, publish without attribution

### Rule 7: Production Readiness
Everything built must be deployable.
- Real architecture, real config, real env, real backup, real rollback, real security, real monitoring
- Forbidden: demo-only design, placeholder code, "fix it later" decisions

## Decision Hierarchy
When multiple options exist, decide in this order:
1. Safety
2. Correctness
3. Domain fit
4. Maintainability
5. Recoverability
6. Auditability
7. Simplicity
8. Performance
9. Elegance
10. Novelty
