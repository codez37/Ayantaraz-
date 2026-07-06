# Integration Test Plan

## Test Patterns
Each integration test follows:
1. Arrange — set up mock Prisma return values
2. Act — call the service method
3. Assert — verify return value + verify Prisma calls

## Key Integrations
- Auth: OTP creation + verification via Prisma
- Content: DB persistence across status changes
- Consultation: DB + audit log coordination
- Orders: Order → Enrollment link on confirm
- Chatbot: KnowledgeBase + Content multi-source lookup

## What to Mock
- PrismaService (all DB calls)
- JwtService
- External SMS (Kavenegar)

## What NOT to Mock
- Service classes themselves (test real logic)
- Validators and pipes (test real decorators)
