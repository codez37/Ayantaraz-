# Regression Suite

## Must-Run Before Every Release

### Auth (always)
- OTP request + verify + refresh
- Session creation + logout
- Rate limits

### Content
- Create draft → publish → archive
- Visibility filtering
- Slug uniqueness

### Consultation
- Full lifecycle (pending → contacted → completed)
- Assignment
- Notes

### Orders
- Full lifecycle (pending → waiting → confirmed + enrollment)
- Refund → enrollment deactivated

### Chatbot
- Known question → answer
- Forbidden → refusal
- High risk → escalation

### Admin
- Dashboard loads
- User list + block
- Audit log search
