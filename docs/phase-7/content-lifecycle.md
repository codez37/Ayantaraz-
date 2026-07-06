# Content Lifecycle

## State Machine

```
                    ┌─────────┐
                    │  draft  │
                    └────┬────┘
                         │ submit for review
                         ▼
                    ┌─────────┐
              ┌─────│ review  │─────┐
              │     └────┬────┘     │
              │          │          │
         reject         approve    request changes
              │          │          │
              ▼          ▼          │
         ┌─────────┐ ┌──────────┐  │
         │  draft  │ │published │  │
         └─────────┘ └────┬─────┘  │
                          │        │
                          ▼        │
                    ┌──────────┐   │
                    │ archived │   │
                    └──────────┘   │
                          ▲        │
                          └────────┘
                     (republish)
```

## Transitions

| From | To | Who | Audit |
|------|-----|-----|-------|
| draft | review | editor | content_submit_review |
| draft | published | admin (skip review) | content_publish_skip |
| review | draft | reviewer (reject) | content_review_reject |
| review | published | reviewer/admin | content_publish |
| published | draft | admin (unpublish) | content_unpublish |
| published | archived | admin | content_archive |
| archived | draft | admin (restore) | content_restore |

## Rules
- draft → review: only author or editor
- review → published: only reviewer or admin
- review → draft: only reviewer or admin
- published → archived: only admin
- No hard deletes (soft archive only)
- All transitions logged in audit
