# Chatbot Security

## Input Validation
- Question: 1-500 chars, validated via DTO
- Rate limited: per IP, per session
- Refusal on empty/spam/minimal input

## Risk Classification
- Low: direct answer
- Medium: answer + disclaimer
- High: escalate to human
- Forbidden: refusal

## Prompt Injection Protection
- User input is NOT trusted as policy instructions
- No raw user input is executed or evaluated
- Answers only come from approved KB/FAQ/article sources
- No free text generation

## Logging
- Every query logged with risk level and decision
- Sensitive queries flagged
- Conversation history stored for audit

## Admin Controls
- All KB entries are admin-approved
- Risk levels set by admin
- Answers can be archived (not deleted) for audit trail
