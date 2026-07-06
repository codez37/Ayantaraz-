# Scope Boundary — Ayantaraz

**Last updated**: 2026-06-29
**Status**: FROZEN

---

## IN SCOPE

| Domain | Components | Status |
|--------|-----------|--------|
| **Auth** | OTP phone login (SMS.ir), JWT access/refresh tokens, session management | ✅ Production |
| **Users** | Profile CRUD, admin user management (role/block) | ✅ Production |
| **Content** | Articles, videos, minibooks, FAQs with lifecycle (draft→review→published→archived) | ✅ Production |
| **Courses** | Course catalog, enrollment via order | ✅ Production |
| **Consultation** | Request workflow with status transitions, assignment, notes | ✅ Production |
| **Orders** | Order lifecycle (pending→waiting→confirmed→fulfilled), auto-enrollment | ✅ Production |
| **Tax Engine** | Session management, Persian search, tax calculation, confidence scoring, response formatting | ✅ Production |
| **Tax Chatbot** | Keyword-based Persian Q&A via KnowledgeBase, risk classification (forbidden/high/medium/low), escalation for unmatched queries | ✅ Production |
| **Admin Panel** | Dashboard, user/content/course/order/consultation/chatbot management, audit logs, system settings | ✅ Production |
| **Upload** | File upload (image/video/PDF), magic byte validation, 200MB limit, local storage | ✅ Production |
| **Health** | DB + Redis + disk + memory health checks | ✅ Production |
| **SEO** | Sitemap XML, JSON-LD schema.org structured data | ✅ Production |
| **Security** | Helmet, CORS, CSRF, rate limiting, CAPTCHA, input sanitization, abuse detection | ✅ Production |
| **Audit** | Full audit trail for all domain actions | ✅ Production |
| **routing-rules.ts** | Regex-based Persian text classification (TAX vs GENERAL) | ✅ Kept (rule-based, no AI) |

---

## OUT OF SCOPE

| Item | Reason | Disposition |
|------|--------|-------------|
| **AI Orchestrator** (`POST /ai/query`) | Agent-added dead code, zero frontend usage, violates "No AI" | ❌ Deleted Jun 29 |
| **routing-rules.ts** (rule-based intent classification) | Regex engine with zero runtime consumers after orchestrator deletion; preserved in git history only | ❌ Deleted Jun 29 |
| **AI/LLM integration** | Out of scope per "No AI" constraint | ❌ Forbidden |
| **Agent-proposed architecture** | Any module/service/component not explicitly approved | ❌ Reject |
| **Performance optimization projects** | Not a bug fix or incident | ❌ Reject |
| **Refactoring without defect** | Not a bug fix or incident | ❌ Reject |
| **New features** | Scope is frozen | ❌ Reject |
| **Scope expansion** | Scope is frozen | ❌ Reject |
| **Architecture changes** | Architecture is frozen | ❌ Reject |
| **Dashboard expansion** | Scope is frozen | ❌ Reject |
| **Workflow expansion** | Scope is frozen | ❌ Reject |
| **AI layer addition** | Violates "No AI" | ❌ Reject |
| **Module addition** | Architecture is frozen | ❌ Reject |

---

## KNOWN GAPS (Not blocking production, tracked for reference)

| Gap | Impact | Notes |
|-----|--------|-------|
| No virus scan on upload | Security | Consider ClamAV integration |
| No CSP headers | Security | `contentSecurityPolicy: false` in helmet config |
| No loading/error/not-found pages | UX | Default Next.js pages are used |
| Redis not consumed by business logic | Resource waste | Only used for health check ping |
| `SMS_API_KEY=CHANGE_ME` in .env.production | Auth | Must be configured per environment |
| No backup strategy documented | Operations | Postgres volume needs backup plan |
| 5 pre-existing test failures | Quality | 3 architecture + 2 dependency resolution + 1 test env |
| No tests for 8 modules | Quality | users, courses, upload, admin, audit, health, seo, security |

---

## CHANGE DECISION MATRIX

For any proposed change, ALL of these must be true:
1. ✅ It fixes a real bug
2. ✅ OR it fixes a regression (behavior that was correct and is now broken)
3. ✅ OR it fixes a security vulnerability
4. ✅ OR it addresses a production incident
5. ✅ OR it corrects stored data

If ALL answers are "NO" → **Action = No Change**
