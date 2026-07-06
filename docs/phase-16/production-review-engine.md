# Production Stability Review Engine (PSR-Engine)

## Version: 1.0
## Status: Formal Policy Document
## Scope: Production Readiness Audit for the Entire Platform

---

## 1. Kernel Goal

PSR-Engine exists to evaluate whether the platform is **stable, secure, SEO-correct, responsive, auditable, and operationally trustworthy** at any point in its lifecycle — before, during, and after release.

## 2. Core Principles

1. **Never approve based on appearance.** Always verify functional correctness.
2. **Always verify security and permissions.** Assume nothing is safe by default.
3. **Always verify freshness.** Content, rules, dependencies, and docs all decay.
4. **Always verify monitoring and rollback.** If you can't see it or undo it, it's not production-ready.
5. **Always classify risk by severity.** Critical blockers block release. Period.
6. **Always output actionable fixes.** Vague findings are noise; specific findings drive action.
7. **Always recheck after correction.** Fixing without verification is not fixing.

---

## 3. High-Level Algorithm

```
INPUT
  ↓
INVENTORY — discover all project assets
  ↓
VALIDATION — check existence, correctness, freshness, safety
  ↓
SCORING — assign 0–5 per domain
  ↓
GAP DETECTION — identify what's missing, stale, inconsistent, risky
  ↓
RISK CLASSIFICATION — Critical / High / Medium / Low
  ↓
ACTION PLAN — what → who → priority → ETA
  ↓
RECHECK — verify all fixes before sign-off
  ↓
OUTPUT — report
```

---

## 4. Inventory Phase

The engine must discover and catalogue:

### 4.1 Code Assets
- All NestJS modules (auth, content, consultation, orders, chatbot, admin, health)
- All API endpoints and their guards/decorators
- All Prisma models and enums
- All shared package types, constants, utils

### 4.2 Configuration Assets
- Environment files (.env.example, .env.development, .env.staging, .env.production)
- Dockerfiles and docker-compose files
- Nginx configuration
- CI/CD pipeline (`.github/workflows/ci.yml`)
- Prisma schema and seed

### 4.3 Documentation Assets
- `docs/phase-*/*.md` files (Phases 0–16)
- AGENTS.md or equivalent runbook

### 4.4 Infrastructure Assets
- Health endpoint
- Backup scripts
- Deploy scripts
- Monitoring hooks (healthcheck.sh)

### 4.5 Test Assets
- Unit tests
- Test configuration (jest, ts-jest)
- Coverage reports

---

## 5. Validation Criteria

For each discovered asset, check:

| Criterion | Description |
|---|---|
| Existence | Does the file/endpoint/module exist? |
| Completeness | Are all required parts present? |
| Freshness | Is it up-to-date with current requirements? |
| Domain Alignment | Does it match the business domain (Persian tax/accounting)? |
| Production Safety | Are there any dev-only artifacts leaking? |
| Dependency Integrity | Are imports and references correct? |
| Documentation | Is there corresponding documentation? |

---

## 6. Scoring Methodology

### 6.1 Score Scale

| Score | Meaning |
|---|---|
| 0 | Missing — does not exist |
| 1 | Weak — exists but fundamentally broken |
| 2 | Partial — exists with major gaps |
| 3 | Acceptable — exists with minor gaps |
| 4 | Good — complete and well-implemented |
| 5 | Production-Ready — no issues found |

### 6.2 Scoring Domains

| Domain | Weight |
|---|---|
| Security | 0.20 |
| Correctness | 0.25 |
| Stability | 0.15 |
| Observability | 0.10 |
| Maintainability | 0.10 |
| Freshness | 0.10 |
| Production Safety | 0.10 |

### 6.3 Composite Score Formula

```
Score(domain) = 
  0.25 × correctness +
  0.20 × security +
  0.15 × stability +
  0.10 × observability +
  0.10 × maintainability +
  0.10 × freshness +
  0.10 × production_safety
```

### 6.4 Overall Status Thresholds

| Status | Condition |
|---|---|
| 🟢 Green | No Critical/High issues, average score ≥ 4.0 |
| 🟡 Yellow | No Critical issues, High issues ≤ 3, average score ≥ 3.0 |
| 🔴 Red | Any Critical issue, or High issues > 3, or average score < 3.0 |

---

## 7. Module-Level Checklists

### 7.1 Auth Module
- [ ] OTP rate-limited (3/10min per phone)
- [ ] Failed attempts rate-limited (5/30min → block)
- [ ] Sessions use JWT access (24h) + refresh (7d) with rotation
- [ ] Theft detection active (reuse revoked token → terminate all sessions)
- [ ] Logout revokes both session and refresh token
- [ ] Phone normalization handles +98/0098/98 → 0
- [ ] Persian error messages throughout
- [ ] Admin login uses stricter rate limits (3/15min)
- [ ] Blocked phone behavior returns Persian message

### 7.2 Admin Module
- [ ] Permission-based access (JwtAuthGuard + RolesGuard)
- [ ] All admin actions logged to audit_log table
- [ ] Content publish requires role (content_manager/admin)
- [ ] Order confirm/refund requires admin role
- [ ] Dashboard aggregates pending items correctly
- [ ] Pagination works on all list endpoints
- [ ] User list/search works with filters

### 7.3 Content Module
- [ ] Full state machine: draft → review → published → archived
- [ ] Visibility levels: public, authenticated, course_only, admin_only
- [ ] Unauthorized access to non-public content returns proper error
- [ ] Slug auto-generation from title
- [ ] Tags, metaDescription, thumbnailUrl stored
- [ ] Audit log created for each status change
- [ ] ReviewedBy and reviewedAt tracked on publish
- [ ] Valid transitions enforced (canTransition guard)

### 7.4 Consultation Module
- [ ] Duplicate detection within 5-minute window
- [ ] Rate limit: 5 requests per hour per user
- [ ] Unauthenticated user support (find-or-create by phone)
- [ ] Status transitions enforced (VALID_TRANSITIONS map)
- [ ] Internal notes formatted with timestamp + actor name
- [ ] Assignment logic: admin assigns to anyone, consultant to self
- [ ] Audit log on create, status change, assign, addNote
- [ ] No hard deletes (status-based archive)

### 7.5 Orders Module
- [ ] Duplicate detection within 30-minute window
- [ ] Rate limit: 5 orders per hour per user
- [ ] Unauthenticated user support (find-or-create by phone)
- [ ] Payment reference required for confirm
- [ ] Confirm creates Enrollment (access grant)
- [ ] Refund deactivates Enrollment
- [ ] Status transitions enforced
- [ ] Audit log on all status changes

### 7.6 Chatbot Module
- [ ] Risk classification: low / medium / high / forbidden
- [ ] Forbidden questions refused with Persian message
- [ ] Multi-source search: KB → FAQ → article
- [ ] High-risk + no match → escalates with ticket
- [ ] Medium-risk answers include disclaimer
- [ ] Fallback response for unanswered low/medium risk
- [ ] Conversation tracking with message history
- [ ] All messages logged to chat_message table

### 7.7 SEO Module
- [ ] Every public page has unique title and meta description
- [ ] Canonical tags on similar/duplicate pages
- [ ] Single H1 per page with logical H2/H3 structure
- [ ] Internal linking between related content
- [ ] Schema markup per page type (Article, FAQPage, Organization, BreadcrumbList)
- [ ] Sitemap.xml generated and submitted
- [ ] Robots.txt disallows admin/auth/api/dashboard
- [ ] Admin/dashboard pages set to noindex

### 7.8 Responsive Module
- [ ] All pages tested at < 640px, 640–1024px, > 1024px
- [ ] Tables use card view or horizontal scroll on mobile
- [ ] Forms full-width on mobile with top-labels
- [ ] CTA buttons visible and tappable (min 44px)
- [ ] RTL layout correct at all breakpoints
- [ ] Navigation collapses to hamburger on mobile
- [ ] Admin sidebar collapses on mobile

### 7.9 Security Module
- [ ] XSS protection: SanitizationPipe strips script/event handlers/javascript: URIs
- [ ] CSP headers enabled in production (helmet)
- [ ] HSTS enabled (max-age=63072000)
- [ ] No secrets in logs (tokens masked, OTP masked)
- [ ] No stack traces in production error responses
- [ ] Per-endpoint rate limiting via @Throttle()
- [ ] Whitelist + forbidNonWhitelisted on all DTOs
- [ ] Input validation with class-validator

### 7.10 Monitoring Module
- [ ] Health endpoint returns DB status + timestamp
- [ ] Healthcheck script runs periodically (healthcheck.sh)
- [ ] Error tracking in place (structured JSON logs)
- [ ] Backup script with rotation (backup.sh)
- [ ] Backup retention policy documented

---

## 8. Release Blocker Rules

Release MUST be blocked if any of the following are true:

| Rule | Condition |
|---|---|
| R1 | Auth is broken (OTP/session/login/logout) |
| R2 | Admin is unsafe (missing permission/role checks) |
| R3 | Rollback plan is missing or unverified |
| R4 | Backup restore has not been tested |
| R5 | Content publish is uncontrolled (no review state) |
| R6 | Order flow is ambiguous (missing status or trace) |
| R7 | Chatbot responds unsafely (no refusal/scalation) |
| R8 | Production environment variables are wrong/missing |

---

## 9. Freshness Rules

The engine must flag items needing update when:

| Item | Frequency |
|---|---|
| Tax/legal content | Monthly (check for law changes) |
| FAQ entries | Monthly (verify accuracy) |
| SEO metadata | Quarterly (review performance) |
| Dependencies | Weekly (security scan) |
| Environment variables | Per release |
| Security policies | Quarterly |
| Tests | Per release (update for new code) |
| Documentation | Per release (keep in sync) |
| Monitoring thresholds | Quarterly (adjust to baseline) |

---

## 10. Output Format

### 10.1 Standard Report Template

```markdown
# Production Review Report

## Scope
[What was reviewed — modules, endpoints, configs, docs]

## Overall Status
🟢 Green / 🟡 Yellow / 🔴 Red

## Critical Findings
- [C-001] [Module] [Issue] → [Severity] → [Action]

## High Findings
- [H-001] [Module] [Issue] → [Severity] → [Action]

## Medium Findings
- [M-001] [Module] [Issue] → [Severity] → [Action]

## Low Findings
- [L-001] [Module] [Issue] → [Severity] → [Action]

## Domain Scores
| Domain | Score | Status |
|---|---|---|
| Security | 4.2 | 🟢 |
| Correctness | 3.8 | 🟡 |
| Stability | 4.5 | 🟢 |
| Observability | 3.0 | 🟡 |
| Maintainability | 4.0 | 🟢 |
| Freshness | 2.5 | 🔴 |
| Production Safety | 4.0 | 🟢 |
| **Composite** | **3.7** | **🟡** |

## Action Plan
| ID | Issue | Fix | Owner | Priority | ETA |
|---|---|---|---|---|---|
| C-001 | ... | ... | ... | Critical | 24h |
| H-001 | ... | ... | ... | High | 1 week |

## Recheck List
- [ ] C-001 verified fixed
- [ ] H-001 verified fixed
- [ ] Regression: auth module still passes tests
- [ ] Regression: all existing tests pass
```

### 10.2 Machine-Readable Output (JSON)

```json
{
  "version": "1.0",
  "timestamp": "2026-06-15T08:00:00Z",
  "scope": ["auth", "admin", "content", "consultation", "orders", "chatbot", "seo", "responsive", "security", "monitoring"],
  "overallStatus": "yellow",
  "compositeScore": 3.7,
  "findings": [
    {
      "id": "C-001",
      "module": "auth",
      "issue": "OTP rate limit not enforced on admin login",
      "severity": "critical",
      "action": "Add @Throttle() decorator to admin OTP endpoint"
    }
  ],
  "domainScores": { "security": 4.2, "correctness": 3.8 },
  "actionPlan": [ { "id": "C-001", "fix": "...", "owner": "...", "priority": "critical", "eta": "24h" } ],
  "recheckList": [ "C-001 verified fixed" ]
}
```

---

## 11. Analysis Layers

### 11.1 Static Analysis
- Read code, configs, docs, policies
- Verify existence and correctness
- No runtime dependencies required

### 11.2 Runtime Analysis (when available)
- Read logs, errors, metrics, alerts
- Requires access to running system

### 11.3 Domain Analysis
- Verify business rules, workflows, state machines, permissions
- Ensure domain alignment (Persian tax/accounting)

### 11.4 Freshness Analysis
- Check content dates, dependency versions, security patches
- Flag stale items

---

## 12. Anti-Patterns

The engine must flag these as findings:

- Production without monitoring hooks
- Backup without restore test
- SEO abandoned (no titles, missing meta, broken links)
- Admin panel without permission governance
- Insecure login (no rate limit, no session management)
- Content stale and unowned
- Responsive regression (broken mobile layout)
- Release without changelog
- Alerts ignored or spamming
- Dependency updates applied blindly

---

## 13. Policy Summary

```
- Never approve based on appearance.
- Always verify functional correctness.
- Always verify security and permissions.
- Always verify freshness of content and rules.
- Always verify monitoring and rollback.
- Always classify risk by severity.
- Never ignore a critical blocker.
- Always output actionable fixes.
- Always recheck after correction.
```

---

## 14. Version History

| Version | Date | Author | Changes |
|---|---|---|---|
| 1.0 | 2026-06-15 | PSR-Engine | Initial release — formal policy document |
