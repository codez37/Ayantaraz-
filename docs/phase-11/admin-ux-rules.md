# Admin UX Rules

## Design Principles
1. **Clarity over decoration** — Tables, filters, status badges. No visual noise.
2. **Speed** — Common actions (filter, search, status change) are 1-2 clicks.
3. **Safety** — Dangerous actions require confirmation dialog + audit.
4. **Feedback** — Every action shows success/error clearly.

## Table Conventions
- Sortable columns (date desc by default)
- Status badges with consistent colors:
  - Draft/gray, Review/yellow, Published/green, Archived/red
  - Pending/gray, Contacted/blue, Completed/green, Canceled/red
- Action column on the right: view, edit, status change
- Empty state: "موردی یافت نشد" with create button if applicable

## Form Conventions
- Persian labels
- Validation errors inline (red text below field)
- Save as draft / Submit for review (two buttons)
- Cancel returns to list

## High-Risk Action UX
For publish, confirm payment, block user, role change:
1. Show confirmation dialog with action summary
2. Require explicit confirm button
3. On success: green toast + audit logged
4. On error: red toast with clear reason

## Navigation
- Sidebar with section icons
- Active section highlighted
- Breadcrumb on detail pages
- Back to list link on every detail page
