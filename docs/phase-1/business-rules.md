# Business Rules

## BR1: Data Rule
- Only first name, last name, and phone number stored for users
- Additional data only added when proven necessary for a specific workflow

## BR2: OTP Rule
- OTP is short-lived (5 minute expiry)
- OTP is single-use
- Same OTP cannot verify twice
- Resend is rate-limited (max 3 per 10 minutes)
- Failed attempts reset after successful verification or 30 minute cooldown

## BR3: Content Rule
- Every content item must have a status (draft/review/published/archived)
- Tax and compliance-related content must pass review before publication
- Physical deletion is forbidden; use status-based soft delete
- Content changes are attributable to specific admin/author

## BR4: Sales Rule
- No online payment gateway
- Every order requires manual admin verification
- Access to paid content only activated after payment confirmation
- Payment status must be transparent to user at all times

## BR5: Consultation Rule
- Every consultation request must have a status
- Every request must be trackable by the user
- Admin must be able to record contact notes
- User can cancel before consultation starts

## BR6: Chatbot Rule
- No definitive legal/tax claims without cited source
- Sensitive questions must be escalated to human consultant
- Chatbot must not present itself as a legal authority
- All queries must be logged for audit and improvement

## BR7: Admin Rule
- Every state change must be logged
- Every role must have explicit permission boundaries
- Every admin action must be traceable to a specific user
- Destructive actions require confirmation
- No hard deletes from admin panel

## BR8: Audit Rule
- Audit logs are append-only
- Audit log entries cannot be modified or deleted
- Audit logs must include: actor, action, entity type, entity ID, old/new values, timestamp, IP address
- Audit logs retained for minimum 12 months
