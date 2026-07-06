# Escalation Policy

## When to Escalate
1. Question classified as `high` risk
2. No KB match AND user asks 3+ times
3. User explicitly requests human consultant
4. Question about personal tax liability specifics
5. Question requiring legal/financial commitment

## Escalation Flow
```
System detects escalation trigger
→ creates EscalationTicket
→ logs intent as escalated
→ returns message: "این موضوع نیاز به بررسی تخصصی دارد"
→ includes link: "/consultation" or "/dashboard/requests"
→ admin notification (dashboard badge)
```

## Ticket Status
| Status | Description |
|--------|-------------|
| open | Created, not yet assigned |
| assigned | Assigned to consultant |
| resolved | Handled |
| closed | Archived |
