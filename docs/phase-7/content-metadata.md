# Content Metadata

## Required Fields

| Field | Type | Description |
|-------|------|-------------|
| title | String | Content title (3-200 chars) |
| slug | String | URL-safe unique identifier |
| contentType | Enum | article, static_page, video, minibook, faq |
| status | Enum | draft, review, published, archived |
| visibility | Enum | public, authenticated, course_only, admin_only |

## SEO Fields

| Field | Type | Max | Description |
|-------|------|-----|-------------|
| metaDescription | String | 320 chars | Meta description for search engines |
| slug | String | 200 chars | URL path (must be unique) |

## Classification Fields

| Field | Type | Description |
|-------|------|-------------|
| categoryId | Int? | Content category FK |
| tags | String | Comma-separated tags |

## Ownership Fields

| Field | Type | Description |
|-------|------|-------------|
| authorId | Int? | Creator (FK to User) |
| reviewedBy | Int? | Last reviewer (FK to User) |

## Timestamp Fields

| Field | Type | Description |
|-------|------|-------------|
| publishedAt | DateTime? | First publication date |
| archivedAt | DateTime? | Archive date |
| reviewedAt | DateTime? | Last review date |
| createdAt | DateTime | Creation date |
| updatedAt | DateTime | Last update date |
