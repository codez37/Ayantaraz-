# Chatbot Knowledge Base

## Sources
The chatbot queries from these approved sources:

1. **KnowledgeBase table** — Explicit Q&A entries created by admin
2. **Content table (FAQ type)** — Published FAQs with `visibility=public`
3. **Content table (Article type)** — Published articles with `visibility=public` (title + summary)

## Query Strategy

```
User question
→ Search KnowledgeBase (exact match + keyword)
→ Search Content (FAQ, title match)
→ Search Content (Article, keyword match)
→ Fallback: "متأسفم، نمی‌توانم به این سوال پاسخ دهم..."
```

## Safety
- Only `published` and `public` content is searchable
- Content with `visibility=admin_only` or `course_only` is excluded
- All chatbot answers are logged
- Escalation to human support is offered on fallback
