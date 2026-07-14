---
name: github-production-hardening
description: Analyze GitHub repositories for production readiness, identify critical issues, and provide actionable recommendations for deployment preparation
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
  - web_search
---

# GitHub Production Hardening Skill

## Purpose
This skill helps analyze GitHub repositories to ensure they are production-ready by identifying critical issues, security vulnerabilities, and deployment blockers.

## When to Use
- Before deploying a project to production
- When performing code audits
- When preparing for release
- When troubleshooting deployment issues

## Analysis Checklist

### 1. Repository Structure Analysis
- Check for proper branch protection
- Verify tag and release strategy
- Review branch naming conventions
- Check for existence of required files

### 2. CI/CD Pipeline Analysis
- Verify CI workflows exist and are properly configured
- Check for test execution in CI
- Verify linting and type checking
- Check for build verification
- Review security scanning
- Verify deployment pipelines

### 3. Code Quality Analysis
- Check for hardcoded secrets
- Review environment variable usage
- Analyze test coverage
- Check for code duplication
- Review error handling

### 4. Security Analysis
- Check for security headers
- Review authentication/authorization
- Analyze dependency security
- Check for sensitive data exposure
- Review CORS configuration

### 5. Configuration Analysis
- Review Docker configuration
- Check Kubernetes/Compose files
- Verify environment configurations
- Check for proper secrets management

### 6. Documentation Analysis
- Check for README completeness
- Verify deployment documentation
- Review API documentation
- Check for architecture documentation

## Common Issues to Detect

### Critical Issues (Must Fix Before Deployment)
1. Hardcoded Secrets: API keys, passwords, tokens in code
2. Missing Branch Protection: Main branch without protection
3. No CI/CD Pipelines: Missing or incomplete workflows
4. Failed Tests: Tests not passing in CI
5. Security Vulnerabilities: Known CVEs in dependencies
6. Missing Environment Variables: Required env vars not documented

### High Priority Issues (Should Fix Before Deployment)
1. Low Test Coverage: Insufficient test coverage
2. No Linting: Missing ESLint/Prettier configuration
3. No Type Checking: Missing TypeScript type checking
4. Poor Error Handling: Unhandled exceptions
5. Missing Health Checks: No health check endpoints
6. No Monitoring: Missing logging and monitoring

### Medium Priority Issues (Should Fix Soon)
1. Code Duplication: Duplicate code that should be refactored
2. Poor Documentation: Missing or incomplete documentation
3. No Backup Strategy: Missing backup procedures
4. No Disaster Recovery: Missing rollback plans
5. Performance Issues: Slow queries or inefficient code

## Output Format

### Summary Report
# Production Readiness Report - [Repository Name]

## Overall Status: [Status]
- Critical Issues: [X] found
- High Priority Issues: [Y] found  
- Medium Priority Issues: [Z] found

### Recommendations
1. Action 1
2. Action 2