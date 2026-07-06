# Access Activation Policy

## Trigger
Access is activated when order status changes to `confirmed`.

## Mechanism
An Enrollment record is created:
- userId = order.userId
- courseId = order.itemId (when itemType=course)
- isActive = true
- orderId = order.id

## If Confirmation Was Erroneous
1. Admin can refund the order (status → refunded)
2. Enrollment is set to isActive = false
3. A new order is required for re-purchase

## Audit
- Enrollment creation is logged in audit_logs with action `access_activated`
- Refund/enrollment deactivation is logged with action `access_revoked`
