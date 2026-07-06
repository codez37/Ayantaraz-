# API Strategy

## Design
- RESTful API
- JSON request/response
- Versioned via URL prefix (/api/v1/)
- Consistent error format
- Pagination for list endpoints

## Authentication
- JWT-based (access + refresh tokens)
- Access token: 24h expiry
- Refresh token: 7d expiry, rotatable
- Token returned after OTP verification
- All protected endpoints require Bearer token

## Authorization
- Role-based access control (RBAC)
- Guard-based permission checks
- Roles: user, consultant, content_manager, admin

## Error Format
```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "errors": [
    { "field": "phone", "message": "Invalid phone format" }
  ]
}
```

## Pagination Format
```json
{
  "data": [...],
  "meta": {
    "total": 100,
    "page": 1,
    "limit": 20,
    "totalPages": 5
  }
}
```

## Endpoint Naming
- Plural nouns for resources: /users, /contents, /orders
- Specific actions under resource: /orders/:id/status
- Auth-specific: /auth/otp, /auth/verify
