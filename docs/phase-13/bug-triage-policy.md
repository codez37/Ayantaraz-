# Bug Triage Policy

## Severity Levels

| Level | Definition | Response Time | Fix Time |
|-------|-----------|--------------|----------|
| Critical | Security breach, data loss, auth bypass | Immediate | < 4 hours |
| High | Major workflow broken, wrong state transitions | < 4 hours | < 24 hours |
| Medium | Non-critical feature broken, UX issue | < 24 hours | < 72 hours |
| Low | Cosmetic, typo, minor edge case | < 1 week | Next release |

## Triage Flow
1. Bug reported → severity assigned
2. Critical/High → immediate investigation
3. Root cause identified → fix assigned
4. Fix → regression tests → verify on staging
5. Deploy or schedule for next release

## Critical Bugs (Block Release)
- Auth bypass
- Payment confirm without verification
- Admin privilege escalation
- Data exposure
- XSS/CSRF vulnerability in production
