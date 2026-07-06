# Knowledge Base Policy

## Authorized Sources
- KnowledgeBase table entries (curated Q&A)
- FAQ content type (published + public visibility)
- Article content type (published + public visibility, title + summary only)

## Unauthorized Sources
- Unreviewed content
- User-generated content
- External web sources
- Free-form generation

## Search Strategy
```
User question
→ normalize (remove diacritics, normalize Persian chars)
→ keyword extraction (split, filter stop-words)
→ search KnowledgeBase (keyword match with riskLevel filter)
→ search Content (FAQ type, published, public)
→ search Content (Article type, published, public → title/summary)
→ if match found → return approved answer with source reference
→ else → classify risk level
   → high/forbidden → refuse or escalate
   → low/medium → safe fallback + suggest consultation
```

## Answer Format
All answers must include:
- The answer text
- Source reference (e.g., "منبع: سوالات متداول")
- For medium risk: disclaimer "این پاسخ عمومی است"
