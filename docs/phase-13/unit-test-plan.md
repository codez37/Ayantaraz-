# Unit Test Plan

## AuthService (17 existing tests)
- OTP request success/rate-limit/invalid phone
- OTP verify correct/wrong/expired/max-attempts
- Phone normalization
- Session creation + revocation
- Logout + theft detection

## ContentService
- Create article as draft
- Submit for review → review status
- Publish → published status
- Archive → archived status
- Invalid transitions rejected
- Visibility filtering by role

## ConsultationService
- Create request with valid data
- Duplicate detection
- Rate limiting
- All valid status transitions
- Invalid status transitions rejected
- Assignment flow
- Internal notes append

## OrdersService
- Create order
- Duplicate + rate limit
- All valid status transitions
- Payment confirmation + enrollment
- Refund + enrollment deactivation
- Cancel by user

## ChatbotService
- KB match returns answer
- FAQ match returns answer
- Low risk returns direct
- Medium risk returns + disclaimer
- High risk escalates
- Forbidden refuses
- Fallback on no match
