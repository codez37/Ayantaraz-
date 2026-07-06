# Smoke Test Checklist (Post-Deploy)

## Backend
- [ ] `GET /api/health` returns 200
- [ ] `POST /api/auth/otp` returns 200
- [ ] `POST /api/consultation` returns 200
- [ ] `GET /api/content` returns JSON array
- [ ] `POST /api/chatbot/query` returns answer or fallback
- [ ] Admin endpoints require auth (401 without JWT)

## Frontend
- [ ] Homepage loads
- [ ] /auth page loads
- [ ] /consultation page loads
- [ ] /courses page loads
- [ ] /articles page loads
- [ ] /admin page redirects to auth if not logged in

## Database
- [ ] Prisma migration applied
- [ ] Seed data exists
- [ ] Audit log table accessible
