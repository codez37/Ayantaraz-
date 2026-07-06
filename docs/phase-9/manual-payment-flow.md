# Manual Payment Flow

## Purpose
Enable course purchases without an online payment gateway, using admin-managed offline payment workflow.

## High-Level Flow

```
User views course details
→ clicks "درخواست خرید"
→ fills short form (name, phone, optional note)
→ order created as pending
→ admin reviews request
→ contacts user → status → waiting_for_call/waiting_for_payment
→ user pays offline (bank transfer, in-person, etc.)
→ admin confirms payment with reference
→ order → confirmed
→ enrollment created (access activated)
→ user notified
```

## State Machine

```
                    ┌─────────┐
                    │ pending │
                    └────┬────┘
                         │
              ┌──────────┼──────────┐
              ▼          ▼          ▼
        ┌─────────┐ ┌─────────┐ ┌─────────┐
        │wfc_call │ │wfc_pay  │ │canceled │
        └────┬────┘ └────┬────┘ └─────────┘
             │           │
             ▼           ▼
        ┌─────────┐ ┌─────────┐
        │wfc_pay  │ │confirmed│
        └────┬────┘ └─────────┘
             ▼
        ┌─────────┐
        │confirmed│
        └─────────┘

     (any except confirmed) → rejected (admin)
     (pending/wfc_call/wfc_pay) → expired (cron/no-follow-up)
```

## Actors
| Role | Actions |
|------|---------|
| User | Create order, view own orders, cancel own pending orders |
| Admin | View all orders, assign, contact, confirm payment, reject, activate access |
