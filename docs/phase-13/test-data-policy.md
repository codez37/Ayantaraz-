# Test Data Policy

## Test Phone Numbers
- `09120000001` through `09120000010` reserved for testing
- These phones will NOT receive real SMS
- OTP codes for test phones are hardcoded in test config

## Test Content
- Articles with "TEST" prefix in title
- FAQ entries with "TEST" category
- All test content has `_test_` suffix in slug

## Test Accounts
| Phone | Role | Use |
|-------|------|-----|
| 09120000001 | user | Standard user flow |
| 09120000002 | content_manager | Content management tests |
| 09120000003 | admin | Admin panel tests |

## Cleanup
- Test data is cleared between test suites
- No test data persists to production
- Seed file includes test data for development
