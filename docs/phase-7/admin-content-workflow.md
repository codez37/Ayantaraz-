# Admin Content Workflow

## Pages

### Content List (/admin/contents)
- Filter by: type, status, visibility, category, date, search
- Columns: title, type, status, visibility, author, date
- Actions: edit, preview, submit for review, publish, archive

### Create/Edit (/admin/contents/new, /admin/contents/:id/edit)
- Title, slug (auto-generated from title, editable)
- Content type selector
- Category selector
- Tags input
- Visibility selector
- Meta description
- Body (textarea for now)
- Media URL (video/minibook)
- Save draft / Submit for review

### Review (/admin/contents/:id/review)
- Preview of content
- Approve / Reject with reason
- Only visible to reviewers/admin

## Status Indicators

| Status | Badge Color |
|--------|-------------|
| draft | gray |
| review | yellow |
| published | green |
| archived | red |
