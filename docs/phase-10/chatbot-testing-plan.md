# Chatbot Testing Plan

## Unit Tests

### Query
| Test | Assertions |
|------|------------|
| Query with KB match | Returns answer from KB, message logged |
| Query with FAQ match | Returns answer from FAQ content |
| Query with no match | Returns fallback, message logged |
| Query low risk | Direct answer |
| Query medium risk | Answer + disclaimer |
| Query high risk | Escalation triggered, ticket created |
| Query forbidden | Refusal message |

### Risk Classification
| Test | Assertions |
|------|------------|
| Normal question → low | classified as low |
| Tax calculation → medium | classified as medium |
| Evasion keyword → forbidden | classified as forbidden |
| Specific liability → high | classified as high |

### Escalation
| Test | Assertions |
|------|------------|
| High risk question | Ticket created, status=open |
| User requests consultant | Escalation triggered |
| Multiple unanswered questions | Escalation on 3rd+ try |

### Admin KB Management
| Test | Assertions |
|------|------------|
| Create KB entry | Saved, audit logged |
| Update KB entry | Updated, audit logged |
| Archive KB entry | Archived, not returned in queries |

### Conversation Logging
| Test | Assertions |
|------|------------|
| Every question logged | ChatMessage created with role=user |
| Every answer logged | ChatMessage created with role=bot |
| Refusal logged | Message logged with refusal text |
| Escalation logged | EscalationTicket created |
