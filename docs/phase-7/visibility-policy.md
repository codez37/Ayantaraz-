# Visibility Policy

## Levels

| Level | Enum | Access |
|-------|------|--------|
| Public | `public` | Anyone, no auth required |
| Authenticated | `authenticated` | Any logged-in user |
| Course Only | `course_only` | Enrolled users only |
| Admin Only | `admin_only` | Admin/editor only (drafts) |

## Default

| Content Type | Default Visibility |
|-------------|-------------------|
| Article | public |
| Static Page | public |
| Video | public (sample) / course_only (full) |
| Mini-book | public |
| FAQ | public |

## Enforcement

| Visibility | Public API | Authenticated API | Admin API |
|------------|-----------|------------------|-----------|
| public | ✅ Visible | ✅ Visible | ✅ Visible |
| authenticated | ❌ Hidden | ✅ Visible | ✅ Visible |
| course_only | ❌ Hidden | ❌ Hidden (no enrollment) | ✅ Visible |
| admin_only | ❌ Hidden | ❌ Hidden | ✅ Visible |

## Frontend Behavior
- public: shown on all pages
- authenticated: shown with "ورود برای مشاهده" overlay
- course_only: shown only in course dashboard
- admin_only: shown only in admin panel
