# Testing Strategy

## Layers
1. Unit tests — business logic, state transitions, validation
2. Integration tests — service + database via mocked Prisma
3. API tests — endpoint contracts, auth guards, error formats
4. Security tests — XSS, OTP abuse, role escalation, unsafe input
5. Smoke tests — post-deploy health checks

## Principles
- Every state machine has transition tests
- Every role has permission enforcement tests
- Every input has validation tests
- Every security rule has bypass-attempt tests

## Coverage Targets
- Auth: 100% of state transitions + rate limits
- Content: all lifecycle states + visibility rules
- Consultation: all status transitions + assignment
- Orders: all status transitions + payment + enrollment
- Chatbot: all risk levels + refusal + escalation
- Admin: every endpoint role-checked
