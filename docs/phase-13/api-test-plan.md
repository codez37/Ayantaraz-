# API Test Plan

## Endpoints to Test

### Auth
| Endpoint | Status | Tests |
|----------|--------|-------|
| POST /api/auth/otp | 200 | Valid phone, invalid phone, rate limit |
| POST /api/auth/verify | 200 | Correct code, wrong code, expired |
| POST /api/auth/refresh | 200 | Valid token, expired token |
| POST /api/auth/logout | 200 | Authenticated, no auth |
| GET /api/auth/session | 200 | Active session, expired session |

### Content
| Endpoint | Status | Tests |
|----------|--------|-------|
| GET /api/content | 200 | Public list, filtered, paginated |
| GET /api/content/:slug | 200 | Published, draft (admin), not found |
| POST /api/content | 201 | Admin creates, user forbidden |

### Consultation
| Endpoint | Status | Tests |
|----------|--------|-------|
| POST /api/consultation | 200 | Valid, invalid phone, duplicate |
| GET /api/consultation | 200 | User sees own, admin sees all |
| PATCH /api/consultation/:id/status | 200 | Valid transition, invalid |

### Orders
| Endpoint | Status | Tests |
|----------|--------|-------|
| POST /api/orders | 200 | Valid course, no auth with phone |
| PATCH /api/orders/:id/status | 200 | Confirm with reference |

### Chatbot
| Endpoint | Status | Tests |
|----------|--------|-------|
| POST /api/chatbot/query | 200 | Known question, unknown, forbidden |

### Admin
| Endpoint | Status | Tests |
|----------|--------|-------|
| GET /api/admin/dashboard | 200 | Admin, user (403) |
| GET /api/admin/users | 200 | Admin, content_manager (403) |
