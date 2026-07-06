# Order Form Spec

## Layout
Short Persian form on `/courses/:slug/request` page.

## Fields

| Field | Type | Required | Max | Validation |
|-------|------|----------|-----|------------|
| firstName | text | ✅ (if no auth) | 50 chars | Persian/English letters |
| lastName | text | ✅ (if no auth) | 50 chars | Persian/English letters |
| phoneNumber | text | ✅ (if no auth) | 11 chars | 09XXXXXXXXX |
| courseId | hidden | ✅ | - | From URL param |
| note | textarea | ❌ | 1000 chars | Optional user message |

## Pre-Fill
If user is authenticated, firstName/lastName/phoneNumber are pre-filled from profile.

## Pre-Submit Info
- Clear message: "درگاه پرداخت آنلاین وجود ندارد. پس از ثبت درخواست، کارشناسان ما با شما تماس می‌گیرند."
- Price display (if configured)

## Post-Submit States
- Success: "درخواست خرید شما ثبت شد. شماره پیگیری: #1234. کارشناسان ما با شما تماس می‌گیرند."
- Error: Red banner with clear reason
