# Responsive Governance

## 1. هدف
اطمینان از اینکه سایت در همه دستگاه‌ها و viewportها به درستی کار می‌کند.

## 2. Breakpoints
| Device | Width |
|---|---|
| Mobile | < 640px |
| Tablet | 640px - 1024px |
| Desktop | > 1024px |

## 3. Responsive Checklist

### 3.1 Layout
- [ ] همه sections در موبایل full-width
- [ ] Sidebar در موبایل collapse شود
- [ ] Gridها در موبایل single-column
- [ ] Margin/padding مناسب در همه viewportها
- [ ] RTL behavior درست در همه sizes

### 3.2 Typography
- [ ] Font size در موبایل readable (min 16px)
- [ ] Line-height مناسب (۱.۶-۱.۸)
- [ ] Heading scale متناسب با viewport
- [ ] Vazirmatn در همه sizes خوانا

### 3.3 Media
- [ ] Images max-width: 100%
- [ ] Videos responsive (aspect-ratio)
- [ ] Thumbnail‌ها در grid درست display شوند
- [ ] Lazy loading فعال

### 3.4 Forms
- [ ] Inputها در موبایل full-width
- [ ] Buttonها تپ‌فرندلی (min 44px)
- [ ] Labels در بالای input (موبایل)
- [ ] Validation messages قابل خواندن

### 3.5 Tables
- [ ] در موبایل: card view یا horizontal scroll
- [ ] در تبلت: responsive table با fewer columns
- [ ] در دسکتاپ: full table

### 3.6 Navigation
- [ ] Hamburger menu در موبایل
- [ ] Dropdown‌ها touch-friendly
- [ ] Sticky header در موبایل (با height کمتر)
- [ ] Back to top button

### 3.7 Admin Panel
- [ ] Sidebar در موبایل hidden (toggle)
- [ ] Tables در موبایل card view
- [ ] Forms در موبایل full-width
- [ ] Modalها responsive

## 4. Testing Regime
| تست | ابزار | دوره |
|---|---|---|
| Manual responsive check | Browser DevTools | هر release |
| Mobile touch test | Device یا emulator | هر release |
| RTL layout check | Browser | هر release |
| Lighthouse mobile | Chrome DevTools | هفتگی |
| Cross-browser | BrowserStack (اختیاری) | ماهانه |

## 5. Common Issues & Fixes
| مشکل | علت | راه‌حل |
|---|---|---|
| Text overflow | fixed width + long text | max-width + word-break |
| Table broken | too many columns | horizontal scroll / card view |
| Image stretched | no aspect-ratio | object-fit + aspect-ratio |
| Modal off-screen | fixed position + small screen | centering + max-width |
| Tap target too small | small buttons | min-height: 44px |
| RTL misalignment | missing dir="rtl" | راستی‌آزمایی در responsive |
| Font too small | px-based sizing | rem + clamp() |

## 6. Anti-Patterns
- overflow-x: hidden برای مخفی کردن مشکل ❌
- touch events بدون fallback ❌
- جداول با ستون‌های زیاد در موبایل ❌
- modal با height ثابت ❌
- sticky elements که space را اشغال می‌کنند ❌
