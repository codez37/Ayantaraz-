# Chatbot Management Module

## Pages

### Knowledge Base (`/admin/chatbot/knowledge`)
List of KB entries with search, filter by riskLevel.

### Detail (`/admin/chatbot/knowledge/:id`)
- Question text
- Answer text
- Category
- Risk Level (low/medium/high/forbidden)
- Status (active/archived)
- Created/Updated dates

### Actions
| Action | Description |
|--------|-------------|
| Create | New Q&A entry with risk level |
| Edit | Update question/answer/category/risk |
| Archive | Disable without deleting |
| Activate | Re-enable archived entry |

### Conversation Logs (`/admin/chatbot/conversations`)
- Session ID
- User (if authenticated)
- Message count
- Last message time
- Link to detail

### Conversation Detail (`/admin/chatbot/conversations/:sessionId`)
- Full message history (chronological)
- Risk level per query
- Escalation status (if escalated)

### Safety Rules
- Risk level cannot be lowered without review (enforced in frontend)
- Answer changes logged in audit
- Archived answers not served to users
