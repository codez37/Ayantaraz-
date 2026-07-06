# File Upload Policy

## Allowed File Types

| Type | Extensions | Max Size |
|------|-----------|----------|
| Images | .jpg, .jpeg, .png, .webp | 5 MB |
| Documents | .pdf | 20 MB |
| Video | .mp4, .webm | 100 MB |
| Thumbnails | .jpg, .png, .webp | 2 MB |

## Validation Rules
1. Extension check (whitelist)
2. MIME type verification (server-side)
3. File size enforcement
4. File rename on storage (UUID-based, no user-controlled name)
5. Storage outside web root (files/ directory)

## Prohibited
- .exe, .bat, .sh, .js, .html, .svg (risk of XSS)
- Double extensions (.pdf.exe)
- Files exceeding size limits
- Empty files
- Files failing MIME check

## Security Headers for Upload Endpoint
- X-Content-Type-Options: nosniff
- Content-Disposition: attachment (for downloads)
