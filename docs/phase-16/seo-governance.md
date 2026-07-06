# SEO Governance

## 1. هدف
حفظ و بهبود دیده‌شدن سایت در موتورهای جستجو بعد از launch.

## 2. Page-Level Requirements

### 2.1 Title & Description
| صفحه | Title | Description |
|---|---|---|
| Home | آکادمی حسابدرای و مالیاتی آیانتاراز | آموزش حسابداری، مشاوره مالیاتی و دوره‌های حرفه‌ای |
| Courses | دوره‌های آموزشی حسابداری و مالیات | ... |
| Consultation | مشاوره مالیاتی تخصصی | ... |
| Content | مقالات و منابع آموزشی مالیات | ... |
| About | درباره آکادمی آیانتاراز | ... |

هر صفحه باید:
- title یکتا (۵۰-۶۰ کاراکتر)
- description یکتا (۱۵۰-۱۶۰ کاراکتر)
- keyword طبیعی (بدون stuffing)
- intent روشن

### 2.2 Canonical Policy
- صفحات تکراری → canonical به اصلی
- صفحات paginated → rel next/prev + canonical به خود
- پارامترهای URL بدون impact → canonical به base
- صفحات sort/filter → noindex

### 2.3 Heading Structure
```
H1: عنوان اصلی صفحه
├─ H2: بخش اصلی
│  ├─ H3: زیربخش
│  └─ H3: زیربخش
└─ H2: بخش بعدی
```
- فقط یک H1
- بدون heading spam
- سلسله‌مراتب منطقی

## 3. Technical SEO

### 3.1 Sitemap
- شامل: همه صفحات عمومی
-不包括: admin, dashboard, login, API routes
- بروزرسانی: بعد از هر content publish
- submission: Google Search Console

### 3.2 Robots.txt
```
User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/
Disallow: /auth/
Disallow: /dashboard/
```

### 3.3 Indexing Policy
| نوع | index | follow |
|---|---|---|
| Public pages | yes | yes |
| Paginated (page 2+) | yes | yes (با canonical) |
| Admin | no | no |
| Auth pages | no | no |
| Filter/sort pages | no | no |
| 404/error | no | no |

## 4. Schema Markup
| نوع صفحه | Schema |
|---|---|
| Article | Article |
| FAQ | FAQPage |
| Course | Course (schema.org) |
| Home | Organization + WebSite |
| All pages | BreadcrumbList |
| Video content | VideoObject |

## 5. Internal Linking
- هر مقاله → مقالات مرتبط
- هر مقاله → مشاوره (CTA)
- هر مقاله → دوره مرتبط
- FAQ → مقالات مرتبط
- صفحه اصلی → همه بخش‌ها

## 6. SEO Monitoring
| معیار | ابزار | دوره |
|---|---|---|
| Impressions / Clicks | Google Search Console | هفتگی |
| Index Coverage | GSC | هفتگی |
| Crawl Errors | GSC | روزانه |
| Core Web Vitals | GSC / CrUX | ماهانه |
| Broken Links | Screaming Frog | ماهانه |
| Duplicate Content | Sitebulb | ماهانه |

## 7. Content Freshness
- مقالات > ۶ ماه → بازبینی
- به‌روزرسانی date modified
- محتوای مالیاتی > ۱ سال → بررسی تطابق قانونی
- CTA قدیمی → بروزرسانی

## 8. Anti-Patterns
- keyword stuffing ❌
- duplicate content ❌
- broken internal links ❌
- thin content (< 300 words) ❌
- missing meta tags ❌
- noindex روی pages عمومی ❌
