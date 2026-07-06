# Settings Policy

## Scope
System settings are limited, controlled configuration values.

## Available Settings
| Key | Type | Default | Description |
|-----|------|---------|-------------|
| site_name | string | 'آینده یاران' | Site title |
| contact_phone | string | '' | Support phone |
| contact_email | string | '' | Support email |
| consultation_rate_limit | number | 5 | Max consultations per hour per user |
| order_rate_limit | number | 5 | Max orders per hour per user |
| chatbot_enabled | boolean | true | Enable/disable chatbot |
| default_content_visibility | string | 'public' | Default visibility for new content |

## Access
- Read: admin, content_manager
- Write: admin only

## Audit
Every setting change is logged in audit_logs with before/after values.

## Security
- No sensitive values (secrets, passwords, API keys) in settings table
- Settings are cached in application memory on startup
- Changing a setting broadcasts a reload event (future feature)
