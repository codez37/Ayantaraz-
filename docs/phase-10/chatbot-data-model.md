# Chatbot Data Model

## Tables

### knowledge_base
| Field | Type | Notes |
|-------|------|-------|
| id | Int PK | |
| question | String | Q&A question |
| answer | String | Q&A answer |
| category | String | Grouping |
| riskLevel | Enum(RiskLevel) | low default |
| isActive | Boolean | Active/inactive |
| createdAt | DateTime | |
| updatedAt | DateTime | |

### chat_messages
| Field | Type | Notes |
|-------|------|-------|
| id | Int PK | |
| conversationId | Int FK → chat_conversations | |
| sessionId | String | Legacy session ID |
| userId | Int? FK | |
| role | String | user/bot/system |
| content | String | Message text |
| createdAt | DateTime | |

### chat_conversations
| Field | Type | Notes |
|-------|------|-------|
| id | Int PK | |
| sessionId | String | UUID |
| userId | Int? FK | |
| status | String | active/closed |
| createdAt | DateTime | |
| updatedAt | DateTime | |

### escalation_tickets
| Field | Type | Notes |
|-------|------|-------|
| id | Int PK | |
| conversationId | Int FK | |
| userId | Int? FK | |
| reason | String | Why escalated |
| status | Enum(EscalationStatus) | open/assigned/resolved/closed |
| assignedToId | Int? FK | |
| createdAt | DateTime | |
| resolvedAt | DateTime? | |

### Enums
- RiskLevel: low, medium, high, forbidden
- EscalationStatus: open, assigned, resolved, closed
