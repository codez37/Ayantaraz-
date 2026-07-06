# Security Testing Plan

## Automated Tests

### Auth
| Test | Assertions |
|------|------------|
| OTP brute-force blocked after 5 attempts | 429 status |
| OTP resend within cooldown | 429 status |
| Expired OTP rejected | 401 status |
| Invalid token rejected | 401 status |
| Revoked token theft detection | All sessions revoked |

### Authorization
| Test | Assertions |
|------|------------|
| User cannot access admin endpoints | 403 status |
| content_manager cannot publish | 403 status |
| Admin can access all | 200 status |
| Unauthenticated request blocked | 401 status |

### Input Validation
| Test | Assertions |
|------|------------|
| XSS payload in title | Sanitized or rejected |
| Phone with invalid format | 400 status |
| Oversized text fields | 400 status |
| Extra fields in request | 400 (forbidNonWhitelisted) |

### File Upload
| Test | Assertions |
|------|------------|
| .exe upload rejected | 400 status |
| Oversized file rejected | 400 status |
| Valid image accepted | 201 status |

### Rate Limiting
| Test | Assertions |
|------|------------|
| OTP rate limit exceeded | 429 status |
| Consultation spam blocked | 429 status |

### Error Handling
| Test | Assertions |
|------|------------|
| No stack trace in production response | Response has no stack field |
| Invalid JSON body | 400 with safe message |
| Unknown route | 404 with safe message |
