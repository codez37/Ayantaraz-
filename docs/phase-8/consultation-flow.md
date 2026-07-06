# Consultation Flow

## Purpose
Convert site traffic into actionable, traceable support workflows for accounting/tax consultation.

## High-Level Flow

```
User visits /consultation
→ fills short form (name, phone, subject, message, preferred time)
→ submits
→ system validates phone + rate limit
→ saved as pending
→ admin dashboard shows new request
→ admin assigns to self/operator
→ contact attempt → status updated
→ completion or escalation
→ audit logged at every step
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
        │contacted│ │scheduled│ │canceled │
        └────┬────┘ └────┬────┘ └─────────┘
             │           │
             │           ▼
             │    ┌──────────┐
             │    │completed │
             │    └──────────┘
             ▼
        ┌───────────┐
        │no_response│
        └───────────┘

     pending → rejected (admin only)
     contacted → no_response
```

## Actors
| Role | Actions |
|------|---------|
| User | Create request, view own requests, cancel own pending requests |
| Operator | View assigned, update status, add notes |
| Admin | View all, assign, update status, reject, add notes |
