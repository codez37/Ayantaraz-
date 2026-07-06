# Threat Model

## Assets
1. User accounts (phone, profile, enrollments)
2. Admin accounts and panel access
3. Content (articles, pages, videos, minibooks)
4. Consultation requests
5. Orders and payment records
6. Chatbot knowledge base
7. Audit logs
8. System configuration

## Threats

| Threat | Risk | Attack Vector | Mitigation |
|--------|------|--------------|------------|
| OTP brute-force | High | Repeated verify attempts | Rate limit + block after N failures |
| Account enumeration | Medium | OTP response differences | Uniform messages for all phones |
| Session hijacking | High | Token theft via XSS/cookie | Secure cookies, short expiry, rotation |
| XSS via content | High | Malicious HTML in article body | Sanitization + CSP + safe rendering |
| CSRF on admin | High | Forged admin action requests | CSRF token + same-site cookies |
| File upload attack | High | Executable/malicious upload | Type/extension/mime whitelist + rename |
| Privilege escalation | High | Role manipulation | Server-side role guard on every endpoint |
| Spam submissions | Medium | Repeated form submissions | Rate limiting + duplicate detection |
| Chatbot abuse | Medium | Prompt injection / unsafe queries | Risk classification + refusal policy |
| Secret leakage | High | .env in repo / exposed in error | Secrets in env only, redacted logs |
| Dependency vulnerability | Medium | Known CVE in packages | Regular audit + minimal deps |
