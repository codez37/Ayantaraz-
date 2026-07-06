# Constraints

## Immutable Constraints
These constraints cannot be changed without restarting Phase 0:

1. **No payment gateway**: All payments are manual/offline with admin verification
2. **No excessive data storage**: Only first name, last name, phone number for users
3. **No mock/demo in production**: All code must be production-viable
4. **No unconstrained chatbot**: Chatbot must be knowledge-base-only with escalation
5. **No missing audit trail**: Every state-changing operation must be logged
6. **No uncontrolled content publishing**: Content must go through lifecycle states
7. **No unnecessary architecture complexity**: Monolith by default, microservices only if bottleneck proven
8. **No hard deletes**: All deletion is status-based soft delete
9. **No implicit permissions**: Every endpoint must enforce role-based access
10. **No prototype code in production**: Every commit must be production-ready

## Technical Constraints
- Django + PostgreSQL + Redis stack
- Next.js for frontend
- Docker Compose for deployment
- Kavenegar for SMS/OTP
- Persian (RTL) support required throughout
- Mobile-responsive design required
