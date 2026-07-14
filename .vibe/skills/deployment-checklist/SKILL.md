---
name: deployment-checklist
description: Generate and verify comprehensive deployment checklists to ensure production readiness
license: MIT
compatibility: Vibe Work
user-invocable: true
allowed-tools:
  - read_file
  - write_file
  - search_replace
  - bash
  - run_typescript
  - github_app
---

# Deployment Checklist Skill

## Purpose
This skill generates and verifies comprehensive deployment checklists to ensure all requirements are met before deploying applications to production.

## When to Use
- Before production deployments
- When creating release processes
- During deployment planning
- When troubleshooting deployment issues
- For regular deployment reviews

## Checklist Categories

### 1. Code Quality Checks
- All tests pass in CI/CD
- Linting passes without errors
- Type checking passes without errors
- Code coverage meets minimum threshold (80%+)
- No console.log or debug statements in production code
- All TODO and FIXME comments addressed

### 2. Configuration Checks
- All environment variables configured
- Production configuration files exist
- Configuration validated for production
- Secrets properly managed (not in code)
- Feature flags configured for production

### 3. Infrastructure Checks
- Docker images built and tested
- Container configurations verified
- Network configurations correct
- Storage/volume configurations correct
- Resource limits set appropriately

### 4. Security Checks
- Security scanning passes
- No known vulnerabilities in dependencies
- Security headers configured
- Authentication/authorization working
- HTTPS configured for all endpoints
- Rate limiting configured

### 5. Monitoring & Logging Checks
- Logging configured and working
- Monitoring endpoints available
- Health checks implemented
- Alerting configured
- Error tracking configured

## Output Format

### Deployment Checklist Report
# Deployment Checklist - [Project Name] - [Version]

## Deployment Date: [Date]
## Environment: [Production/Staging/Development]

## Status: [Ready | Needs Review | Not Ready]

### Code Quality: [X/Y] complete
### Configuration: [X/Y] complete
### Infrastructure: [X/Y] complete
### Security: [X/Y] complete
### Monitoring: [X/Y] complete

## Blocking Issues
1. Issue 1 - Must be fixed before deployment

## Warnings
1. Warning 1 - Should be addressed soon

## Next Steps
1. Fix blocking issues
2. Address warnings
3. Schedule deployment