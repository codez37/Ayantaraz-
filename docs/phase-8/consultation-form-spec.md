# Consultation Form Spec

## Layout
Short, professional, low-friction Persian form on `/consultation` page.

## Fields

| Field | Type | Required | Max | Validation |
|-------|------|----------|-----|------------|
| firstName | text | ✅ | 50 chars | Persian/English letters only |
| lastName | text | ✅ | 50 chars | Persian/English letters only |
| phoneNumber | text | ✅ | 11 chars | 09XXXXXXXXX format |
| subject | dropdown | ✅ | - | accounting, tax, general |
| message | textarea | ✅ | 2000 chars | Min 10 chars |
| preferredTime | text | ❌ | 200 chars | Free text |

## Subject Options (Persian)
| Value | Label |
|-------|-------|
| accounting | حسابداری |
| tax | مالیات |
| general | مشاوره عمومی |

## Button
"ثبت درخواست مشاوره" (Persian, primary color, loading state)

## Post-Submit States
- Success: green banner + tracking ID + "کارشناسان ما با شما تماس می‌گیرند"
- Error: red banner with clear reason + retry path
- Rate-limit: "تعداد درخواست‌های شما محدود شده است. لطفاً بعداً تلاش کنید"
