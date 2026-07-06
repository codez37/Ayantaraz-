# Staging Validation

## Pre-Production Gates

### Auth
- Full OTP flow on staging phone number
- Session persists across page reload
- Logout clears session

### Content
- Create article → submit → publish → visible on public
- FAQ visible in chatbot responses

### Consultation
- Submit request → admin sees → assign → update → complete
- User dashboard shows request status

### Orders
- Request purchase → admin sees → confirm → enrollment active
- User can access course content

### Chatbot
- All risk levels trigger correct response
- Forbidden questions refused
- Escalation creates ticket

### Admin
- All tabs load without error
- Status changes saved correctly
- Audit logs show recent actions
