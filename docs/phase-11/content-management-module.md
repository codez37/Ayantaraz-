# Content Management Module

## Sections
- Articles (`/admin/content?type=article`)
- Static Pages (`/admin/content?type=static_page`)
- Videos (`/admin/content?type=video`)
- Mini-books (`/admin/content?type=minibook`)
- FAQs (`/admin/content?type=faq`)
- Courses (`/admin/courses`)

## List View (shared)
| Column | Description |
|--------|-------------|
| Title | Linked to edit |
| Type | Badge (article/page/video/etc) |
| Status | Color-coded badge |
| Visibility | public/authenticated/etc |
| Category | If applicable |
| Author | Name |
| Date | Created/updated |

## Filters
- Type (tab or dropdown)
- Status (multi-select)
- Category (dropdown)
- Search (title)
- Date range

## Actions
| Action | Role Required |
|--------|---------------|
| Create draft | content_manager+ |
| Edit | content_manager+ |
| Submit for review | content_manager+ |
| Publish (after review) | admin |
| Publish (skip review) | admin |
| Archive | admin |
| Restore | admin |
| Delete | ❌ (No hard delete) |

## Workflow Enforcement
- content_manager cannot publish directly
- admin can skip review (audited as `content_publish_skip`)
- Archived content can be restored to draft
- All transitions logged in audit_logs
