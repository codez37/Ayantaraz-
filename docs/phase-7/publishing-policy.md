# Publishing Policy

## Principles
1. No content goes live without appropriate review
2. Tax/financial content MUST be reviewed before publishing
3. Every publish action is audited with actor identity
4. Published content can be unpublished (→ draft) but never deleted

## Publishing Flow

### Standard (recommended)
draft → review → published

### Express (admin only)
draft → published (skip review, audited)

### Re-publish
archived → draft → review → published

## Roles & Permissions

| Action | Editor | Content Manager | Admin |
|--------|--------|----------------|-------|
| Create draft | ✅ | ✅ | ✅ |
| Submit for review | ✅ | ✅ | ✅ |
| Review & approve | ❌ | ✅ | ✅ |
| Review & reject | ❌ | ✅ | ✅ |
| Publish | ❌ | ✅ (after review) | ✅ |
| Express publish | ❌ | ❌ | ✅ |
| Archive | ❌ | ❌ | ✅ |
| Restore | ❌ | ❌ | ✅ |

## Audit Requirements
Every status change is logged with:
- Actor (userId)
- Action (content_${transition})
- Old value (previous status)
- New value (new status)
- Timestamp
