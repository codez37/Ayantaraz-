# Production Readiness Report — Final & Ruthless

**Date:** 2026-06-15
**Engine:** PSR-Engine v1.0 + 4 parallel deep-dive agents
**Scope:** Full platform — 65 API source files, 30 frontend files, infra, CI/CD, schema

---

## Overall Verdict: 🔴 NOT PRODUCTION-READY

| Domain | Score | Status |
|---|---|---|
| Automated Static Checks (PSR-Engine) | 4.55/5 | 🟢 |
| Manual Auth & Security Audit | 1.8/5 | 🔴 |
| Manual Data Model Audit | 2.5/5 | 🟡 |
| Manual Business Logic Audit | 2.8/5 | 🟡 |
| Manual Frontend & Infrastructure Audit | 2.0/5 | 🔴 |
| **Composite (ruthless)** | **2.73/5** | **🔴 RED** |

---

## Critical Findings (Must Fix Before Any Production Deployment)

### CRIT-01: JWT `'secret'` Fallback
**File:** `apps/api/src/modules/auth/jwt.strategy.ts:12`
If `JWT_SECRET` env var is unset (missed config, deployment error), it falls back to the literal string `'secret'`. An attacker can forge arbitrary admin tokens.
**Fix:** Remove `|| 'secret'` — crash at startup if `JWT_SECRET` is missing.

### CRIT-02: No `$transaction` Anywhere
**All services** perform multi-write operations (create + audit, confirm + enrollment, refund + deactivate) in **zero** Prisma transactions. Any concurrent failure leaves the system permanently inconsistent.
**Fix:** Wrap every multi-write in `this.prisma.$transaction([...])`.

### CRIT-03: Race Condition in OTP Attempt Tracking
**File:** `auth.service.ts:104-119`
TOCTOU — reads `attempts`, then increments, then checks threshold. 5 concurrent requests bypass brute-force lockout entirely.
**Fix:** Atomic `UPDATE ... WHERE attempts < 5` with result check.

### CRIT-04: Race Condition in Duplicate Detection
**Files:** `consultation.service.ts:68-78`, `orders.service.ts:68-79`
`findFirst` then `create` — concurrent requests both pass the duplicate window.
**Fix:** Wrap check + create in `$transaction` interactive API.

### CRIT-05: Auth Tokens in localStorage
**File:** `apps/web/src/lib/api.ts:8`
Access and refresh tokens stored in `localStorage`. Any XSS vulnerability (and there are several) dumps all user tokens.
**Fix:** Use httpOnly cookies for refresh tokens, keep access tokens in JS memory only.

### CRIT-06: `dangerouslySetInnerHTML` with Zero Sanitization
**File:** `apps/web/src/app/articles/[slug]/page.tsx:24`
Article body rendered directly as HTML. Any editor or admin can inject `<script>` tags that execute in every visitor's browser (stored XSS).
**Fix:** Sanitize with DOMPurify before rendering HTML.

### CRIT-07: No FK Cascade/Restrict on Any Relation
**All 21 Prisma models** — zero `onDelete`/`onUpdate` behaviors. Deleting any parent record crashes with FK violation.
**Fix:** Add explicit cascade/restrict/setnull on every `@relation`.

### CRIT-08: Empty SMS API Key Stores Undeliverable OTPs
**File:** `.env.development` + `auth.service.ts:64-70`
When `KAVENEGAR_API_KEY=""`, OTPs are generated and stored but never delivered. Attacker can request OTP for any phone and brute-force the 6-digit code.
**Fix:** Fail closed — refuse to create OTP records if SMS delivery fails.

### CRIT-09: Order Confirm + Enrollment Not Atomic
**File:** `orders.service.ts:170-191`
Order → confirmed, Enrollment → created, AuditLog → written — three separate writes. Failure at step 2 or 3 leaves user paid but without access.
**Fix:** Wrap all three in `$transaction`.

### CRIT-10: SSL Not Configured
**File:** `infra/nginx/default.conf`
Nginx only listens on port 80 (HTTP). No HTTPS server block. All traffic including auth tokens flows in plaintext.
**Fix:** Add HTTPS server block with Let's Encrypt + auto-redirect HTTP→HTTPS.

---

## High Findings (Block Release Without Fix)

### HIGH-01–05: Information Leakage — Internal Notes Exposed to Users
**Files:** `consultation.service.ts`, `orders.service.ts`
`internalNotes` (staff-only discussions) returned in API responses for `user` role. Users can read administrative comments.
**Fix:** Strip `internalNotes` from user-role responses.

### HIGH-06: Visibility Logic Wrong for Authenticated Content
**File:** `content.service.ts:71-82`
Content with `visibility: 'authenticated'` is only shown if `authorId === userId`. All auth users should see it.
**Fix:** Show all `authenticated` content to any logged-in user.

### HIGH-07: Missing Role Guards on Consultation/Order Status
**Files:** `consultation.controller.ts`, `orders.controller.ts`
`PATCH :id/status` has no `@Roles()` decorator. Any authenticated user can call it.
**Fix:** Add `@Roles(UserRole.admin, UserRole.consultant)`.

### HIGH-08: No JWT Algorithm Restriction
**File:** `jwt.strategy.ts:9`
No `algorithms: ['HS256']` in strategy options. Vulnerable to algorithm confusion attacks.
**Fix:** Add explicit algorithm whitelist.

### HIGH-09: No CSRF Protection
**File:** `main.ts:34-38`
CORS with `credentials: true` but zero CSRF protection. Bearer tokens mitigate this partly, but the architecture allows cookie-based fallback without protection.
**Fix:** Implement double-submit cookie pattern or origin/referer validation.

### HIGH-10: Containers Run as Root
**Files:** `Dockerfile.api`, `Dockerfile.web`
No `USER node` directive. Container compromise = full root access.
**Fix:** Add `USER node` in all stages.

### HIGH-11: No Nginx Rate Limiting
**File:** `infra/nginx/default.conf`
Zero rate limiting at the reverse proxy level. Attackers can brute-force all endpoints without constraint.
**Fix:** Add `limit_req_zone` + `limit_req` for `/api/` and stricter for `/api/auth/`.

### HIGH-12: POSTGRES/REDIS PORTS Exposed to Host
**File:** `docker-compose.yml`
Ports 5432 and 6379 mapped to `0.0.0.0`. Database and cache accessible from outside.
**Fix:** Remove ports mapping — use internal Docker network only.

### HIGH-13: No Docker HEALTHCHECK
**Files:** `Dockerfile.api`, `Dockerfile.web`
Docker has no way to detect if the app is actually healthy.
**Fix:** Add `HEALTHCHECK` instruction to both Dockerfiles.

### HIGH-14: No Pagination on Consultation/Order List
**Files:** `consultation.controller.ts`, `orders.controller.ts`
Admin list endpoints return ALL records with no limit. Memory exhaustion risk.
**Fix:** Add mandatory pagination with `page`/`limit`, max 100.

### HIGH-15: No `@Public()` Decorator on Chatbot Conversation Endpoint
**File:** `chatbot.controller.ts` — `GET conversation/:sessionId`
Any authenticated user can read any conversation by guessing sessionId (predictable: `session_{userId}`).
**Fix:** Add role guard + use random session IDs.

---

## Medium Findings (Fix Before Launch if Possible, Otherwise Document)

| ID | Issue | Module | Recommendation |
|---|---|---|---|
| MED-01 | Timing-attack-vulnerable OTP comparison | Auth | Use `crypto.timingSafeEqual` |
| MED-02 | Account enumeration via error messages | Auth | Return generic error for all failures |
| MED-03 | Stack traces leaked in non-prod error responses | Global filter | Remove `error`/`stack` from response |
| MED-04 | CSP/HSTS disabled in non-production | main.ts | Enable in all environments |
| MED-05 | PII (phone number) in JWT payload | Auth | Minimize payload to `sub` only |
| MED-06 | SMS API key in URL, no response validation | Auth | Check response body for success |
| MED-07 | Audit logging silently fails | audit.interceptor | Log errors before swallowing |
| MED-08 | AuditInterceptor is dead code (never registered) | Global | Register or remove |
| MED-09 | SanitizationPipe is dead code (never applied) | Global | Register globally or remove |
| MED-10 | normalizePhone is dead code (DTO regex blocks) | Auth | Fix regex or remove function |
| MED-11 | Missing indexes on 15+ frequently queried fields | Schema | Add indexes (authorId, categoryId, createdAt, expiresAt, etc.) |
| MED-12 | Tags stored as flat string — useless index | Schema | Create Tag model + junction table |
| MED-13 | ChatConversation.status and ChatMessage.role are plain String | Schema | Use Prisma enums |
| MED-14 | Missing cascade deletes on all 21 models | Schema | Add `onDelete` to every relation |
| MED-15 | Three divergent type systems (Prisma/shared/web) | Architecture | Unify, export from shared only |
| MED-16 | Shared types missing 30+ fields from schema | Shared | Sync with Prisma schema |
| MED-17 | Secret committed in docker-compose.yml (JWT_SECRET) | Infra | Remove defaults, use env only |
| MED-18 | No security scanning in CI | CI/CD | Add pnpm audit, CodeQL, Trivy |
| MED-19 | Duplicate Dockerfiles (apps/ vs infra/) | Infra | Remove apps/Dockerfile |
| MED-20 | No .dockerignore | Infra | Create to reduce build context |
| MED-21 | No restart policy in compose | Infra | Add `restart: unless-stopped` |
| MED-22 | No resource limits in compose | Infra | Add memory/CPU limits |
| MED-23 | Deploy runs migration after containers start | Scripts | Run migration before deploy |
| MED-24 | No rollback mechanism in deploy.sh | Scripts | Add rollback flag |
| MED-25 | Consultant double-booking (no atomic assign) | Consultation | Atomic `UPDATE ... WHERE id= AND assignedToId IS NULL` |
| MED-26 | No loading/error/empty states on 10+ pages | Frontend | Add proper React state management |
| MED-27 | Missing SEO meta tags (OG, Twitter, schema) | Frontend | Add to layout.tsx |
| MED-28 | No i18n (all text hardcoded Persian) | Frontend | Integrate next-intl |
| MED-29 | FAQ page hardcoded (not from API) | Frontend | Load from CMS |
| MED-30 | Admin/User sidebar hidden on mobile with no alternative | Frontend | Add hamburger navigation |

---

## Low Findings (Fix Throughout Launch Week / Sprint 1)

| Count | Area | Example Issues |
|---|---|---|
| 8 | Auth/Security | Token logout doesn't invalidate JWT (24h expiry), partial JWT in logs, Redis without auth, global rate limit permissive |
| 15 | Data Model | Redundant indexes, missing `@updatedAt` on 6 models, unused enum values (`consultation` in OrderItemType) |
| 7 | Business Logic | HTTP `DELETE` used for soft-archive, weak slug Farsi regex, `as any` casts, missing GET rate limits |
| 23 | Frontend/Infrastructure | No pagination on articles, chatbot alignment wrong in RTL, video page non-functional, missing ErrorBoundary, no WebSocket nginx config |

---

## Release Blocker Check

| Rule | Status | Detail |
|---|---|---|
| R1: Auth broken | 🔴 FAIL | JWT fallback `'secret'`, timing attack, race condition in OTP |
| R2: Admin unsafe | 🔴 FAIL | Missing role guards on consultation/order status, internal notes leaked |
| R3: Rollback plan missing | 🔴 FAIL | No rollback in deploy.sh |
| R4: Backup restore untested | 🟡 WARN | backup.sh exists, restore not tested in CI |
| R5: Content publish controlled | 🟡 WARN | State machine works but XSS via dangerouslySetInnerHTML |
| R6: Order flow unambiguous | 🔴 FAIL | Confirm/Enrollment not atomic, refund race condition |
| R7: Chatbot safe | 🟢 PASS | Risk classification + escalation works |
| R8: Production env correct | 🔴 FAIL | JWT_SECRET fallback, empty KAVENEGAR key, Docker secrets exposed |

**Result: 4 FAIL, 2 WARN, 1 PASS → RELEASE BLOCKED**

---

## Action Plan — Must Fix Before Deploy

### Week 1 (Pre-Launch Critical)
1. Remove `|| 'secret'` JWT fallback — crash on missing config
2. Wrap all multi-write operations in `$transaction`
3. Fix OTP attempt tracking race condition (atomic update)
4. Fix duplicate detection race condition in consultation + orders
5. Replace `localStorage` with httpOnly cookies for auth tokens
6. Add DOMPurify sanitization before `dangerouslySetInnerHTML`
7. Add FK cascade/restrict to all 21 Prisma relations
8. Fail closed when SMS delivery fails
9. Wrap order confirm (status + enrollment + audit) in transaction
10. Add HTTPS to nginx + HTTP→HTTPS redirect

### Week 2 (Pre-Launch High)
11. Strip `internalNotes` from user-role API responses
12. Fix authenticated visibility logic in content listing
13. Add `@Roles()` decorators to consultation/order status endpoints
14. Add `algorithms: ['HS256']` to JWT strategy
15. Implement CSRF protection
16. Add `USER node` to Dockerfiles
17. Add nginx rate limiting
18. Remove PostgreSQL/Redis port exposure
19. Add HEALTHCHECK to Dockerfiles
20. Add pagination to consultation/order list endpoints

### Month 1 (Post-Launch)
21. Fix timing attack in OTP comparison
22. Add missing indexes to all frequently queried fields
23. Create Tag model + remove flat tags
24. Add Prisma enums for ConversationStatus, MessageRole
25. Unify type system (remove duplication)
26. Add .dockerignore, security scanning to CI
27. Remove duplicate Dockerfiles
28. Add restart policy + resource limits to compose
29. Add all missing frontend states (loading, error, empty)
30. SEO meta tags + i18n

---

## Architecture Scorecard

| Aspect | Grade | Verdict |
|---|---|---|
| Code Modularity | A | Well-structured monorepo with clear module boundaries |
| State Machines | A | Content, Consultation, Order all have proper transition maps |
| Test Coverage | B+ | 55 unit tests, 6 suites, all passing (but zero integration tests) |
| Persian UX | B+ | Good Persian error messages, RTL layout, Vazirmatn font |
| Rate Limiting | C- | Mostly per-IP, missing per-phone, missing nginx layer |
| Audit Trail | C | Manual audit calls in services (good), but AuditInterceptor is dead code (bad) |
| Transaction Safety | F | Zero Prisma `$transaction` calls |
| XSS Protection | F | `dangerouslySetInnerHTML` with no sanitization + SanitizationPipe never registered |
| Session Security | D | localStorage tokens, no CSRF, no jti in JWT |
| Type Safety | D | Three divergent type definitions, `as any` casts, missing 30+ fields |
| Docker Security | D | Root containers, exposed DB ports, no healthcheck |
| Nginx Security | D | No rate limiting, no SSL, no CSP headers |
| CI/CD | C | No security scanning, no Docker caching, no integration test DB |
| Deployment Reliability | D | No rollback, migration-after-deploy, secrets in compose |
| SEO | C- | Missing OG/Twitter/schema, no sitemap, robots.txt may not exist |
| Config Validation | D | JWT_SECRET not validated at bootstrap, fallback to `'secret'` |

---

## Anti-Patterns Found

| Pattern | Location |
|---|---|
| `catch(() => {})` — silent swallow of ALL errors | Multiple frontend pages, audit interceptor |
| `as any` — type system bypass | Consultation service, multiple locations |
| Dead code — files that exist but never execute | SanitizationPipe, AuditInterceptor, normalizePhone |
| Three type systems diverging | Prisma schema, shared package, web types |
| Missing `$transaction` on every multi-write | All 4 services modules |
| Secrets hardcoded/in .env committed | JWT_SECRET fallback, .env in git, docker-compose defaults |
| Root containers | Both Dockerfiles |
| No frontend error boundaries | layout.tsx, all page components |
| No frontend loading states | 10+ pages silently swallow API errors |

---

## What's Actually Good

Despite the harsh verdict, several things are genuinely production-quality:

- ✅ **Full state machines** with valid transition enforcement (content, consultation, orders)
- ✅ **Complete audit trail** in all service methods (once the dead interceptor is removed)
- ✅ **Risk-classified chatbot** with escalation (no free generation)
- ✅ **Phone auth with rate limiting, normalization, and Persian errors**
- ✅ **Role-based access control** (JwtAuthGuard + RolesGuard globally)
- ✅ **Helmet CSP/HSTS** in production mode
- ✅ **Input validation** on all DTOs (whitelist + forbidNonWhitelisted)
- ✅ **Clean monorepo structure** with shared package
- ✅ **55 unit tests all passing**
- ✅ **Comprehensive documentation** across 16 phases
- ✅ **Docker Compose** with multi-stage builds

The codebase **architecture is excellent**. The implementation is **close to production-ready**. But the ~15 critical security bugs and ~50 high/medium issues make it **dangerous to deploy today**.

---

**Bottom Line:** 2-3 weeks of focused work on the critical/high findings. After that, the platform will be genuinely production-grade. The foundation is solid — it's the edge cases, security hardening, and operational maturity that need attention.
