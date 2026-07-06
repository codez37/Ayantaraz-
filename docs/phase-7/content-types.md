# Content Types

## Supported Types

| Type | Enum Value | Description | SEO | Lifecycle |
|------|-----------|-------------|-----|-----------|
| Article | `article` | Educational, analytical, or guide content | ✅ Full SEO | ✅ Full |
| Static Page | `static_page` | About, services, contact, terms | ✅ Full SEO | ✅ Full |
| Video | `video` | Educational or intro videos | ✅ Basic SEO | ✅ Full |
| Mini-book | `minibook` | Downloadable PDF/ebook | ✅ Basic SEO | ✅ Full |
| FAQ | `faq` | Q&A item (also feeds chatbot) | ❌ No index | ✅ Full |

## Common Fields (all types)
- id, title, slug, summary, body/mediaUrl
- status (draft/review/published/archived)
- visibility (public/authenticated/course_only/admin_only)
- categoryId, tags
- metaDescription (SEO)
- authorId, reviewedBy, reviewedAt
- publishedAt, archivedAt, createdAt, updatedAt

## Type-Specific Fields

### Article
- body (rich text)
- categoryId
- metaDescription
- tags

### Static Page
- body (rich text)
- metaDescription (optional)

### Video
- mediaUrl (video source)
- thumbnailUrl
- duration (seconds)

### Mini-book
- mediaUrl (file URL)
- fileSize (bytes)
- pageCount (optional)

### FAQ
- summary → question
- body → answer
- tags for categorization
