# Accessibility Baseline

## Color and Contrast
- Text on background: minimum 4.5:1 ratio (AA)
- Large text (18px+ bold or 24px+ regular): minimum 3:1
- Focus indicators: 2px solid visible outline
- Do not rely solely on color for status/state

## Forms
- Every input has a visible `<label>`
- Error messages linked to input via aria-describedby
- Required fields marked with visible indicator
- Autocomplete attributes on auth forms

## Navigation
- Skip to content link (first focusable element)
- Logical tab order (left-to-right in RTL)
- Current page indicator in nav
- Breadcrumb trail on content pages

## Images and Media
- All images have alt text
- Videos have captions (where feasible)
- Icons have aria-hidden="true" + text alternative

## Keyboard
- All interactive elements keyboard-accessible
- Tab stops at all controls, links, and form fields
- Escape key closes modals/drawers
- Enter/Space activates buttons

## Screen Reader
- Semantic HTML (nav, main, article, section, aside)
- ARIA landmarks where HTML5 semantics insufficient
- Dynamic content updates announced via aria-live
- Status messages (success/error) use role="alert"

## Focus Management
- Focus trap in modals
- Focus returns to trigger after modal close
- Focus visible at all times
- No focus order violations

## RTL Specific
- dir="rtl" on html element
- Logical CSS properties (margin-inline-start, padding-inline-end)
- Proper alignment for Persian text
- Number formatting (Persian digits optional, Latin digits acceptable)
