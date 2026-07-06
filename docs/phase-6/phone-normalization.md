# Phone Normalization

## Normalization Rules
1. Strip all non-digit characters (spaces, dashes, parentheses)
2. If starts with `+98` → replace with `0`
3. If starts with `0098` → replace with `0`
4. Must be exactly 11 digits starting with `09`
5. Store in format: `0912XXXXXXX` (11 digits, starts with 09)

## Validation Regex
```
/^09\d{9}$/
```

## Examples

| Input | Normalized | Valid |
|-------|-----------|-------|
| 09123456789 | 09123456789 | ✅ |
| 9123456789 | 09123456789 | ✅ (add leading 0) |
| +989123456789 | 09123456789 | ✅ |
| 00989123456789 | 09123456789 | ✅ |
| 02112345678 | 02112345678 | ❌ (not mobile) |
| 0912 | 0912 | ❌ (too short) |

## Implementation
- Normalization happens on the backend before storage
- Frontend also validates before sending (UX only, not security)
- All DB queries use normalized phone
- Unique constraint on phone ensures no duplicates
