---
name: security-audit
description: Perform comprehensive security audits including secret scanning, vulnerability detection, and security best practice compliance
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

# Security Audit Skill

## Purpose
This skill performs comprehensive security audits to identify vulnerabilities, secrets exposure, and security best practice violations.

## When to Use
- Before deploying to production
- During code reviews
- When onboarding new team members
- After security incidents
- During regular security maintenance

## Security Checklist

### 1. Secrets Detection
- Scan for API keys in code
- Check for passwords in configuration files
- Look for tokens in environment files
- Search for database credentials
- Check for encryption keys

### 2. Dependency Security
- Run dependency vulnerability scanning
- Check for outdated packages
- Verify package signatures
- Review dependency licenses
- Check for known CVEs

### 3. Authentication & Authorization
- Review authentication mechanisms
- Check authorization logic
- Verify JWT token handling
- Review password policies
- Check session management

### 4. Input Validation
- Check for SQL injection vulnerabilities
- Review XSS protection
- Verify CSRF protection
- Check for command injection
- Review file upload security

### 5. Data Protection
- Check for sensitive data exposure
- Review encryption practices
- Verify data sanitization
- Check for PII handling
- Review logging practices

## Output Format

### Security Audit Report
# Security Audit Report - [Project Name]

## Overall Security Score: [X/100]

### Critical Vulnerabilities: [X] found
### High Risk Issues: [Y] found
### Medium Risk Issues: [Z] found

### Security Recommendations
1. Action 1
2. Action 2