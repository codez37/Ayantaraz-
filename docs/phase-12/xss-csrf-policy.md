# XSS & CSRF Policy

## XSS Prevention

### Input
- All text input validated via class-validator DTOs
- HTML body content sanitized before storage
- No raw HTML accepted from user input
- Content body stored safely, rendered through safe template

### Output
- CSP headers restrict script execution
- Frontend uses React (auto-escaping by default)
- No dangerouslySetInnerHTML without explicit sanitization

### CSP Policy (Production)
```
default-src 'self';
script-src 'self';
style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
font-src 'self' https://fonts.gstatic.com;
img-src 'self' data:;
connect-src 'self' https://api.ayantaraz.ir;
frame-ancestors 'none';
base-uri 'self';
form-action 'self';
```

## CSRF Prevention
- SameSite=Strict on all cookies
- CSRF token via double-submit cookie pattern (cookie + header)
- State-changing requests require valid CSRF token
- Admin forms include hidden CSRF token field (frontend)
