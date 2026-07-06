# Operational Dashboards

## 1. هدف
داشبوردهای عملیاتی برای تصمیم‌گیری سریع و آگاهانه.

## 2. Dashboard Types

### 2.1 Uptime Dashboard
| معیار | نمایش |
|---|---|
| Current status | ✅ / ❌ |
| Uptime (۷ روز) | ۹۹.۹% |
| Last incident | ۱۴۰۳/۰۱/۱۰ |
| Response time (avg) | ۲۳۰ms |
| 5xx count (today) | ۲ |

### 2.2 Auth Dashboard
| معیار | Value | Trend |
|---|---|---|
| OTP requests (today) | ۴۵ | ↑ |
| OTP success rate | ۸۸% | ↓ (alert > 85%) |
| Blocked phones | ۳ | → |
| Active sessions | ۱۲۸ | ↑ |
| Admin logins (today) | ۵ | → |
| Suspicious attempts | ۱ | ↓ |

### 2.3 Content Dashboard
| معیار | Value |
|---|---|
| Total published | ۲۳ |
| Drafts pending review | ۴ |
| Needs update | ۲ |
| Articles published this month | ۵ |
| Top 5 articles by views | ... |
| Content with broken links | ۱ |

### 2.4 Consultation Dashboard
| معیار | Value |
|---|---|
| Pending consultations | ۷ |
| Avg response time | ۴.۲ hours |
| Today's submissions | ۳ |
| Completion rate | ۶۸% |
| Unassigned | ۲ |

### 2.5 Order Dashboard
| معیار | Value |
|---|---|
| Pending orders | ۵ |
| Confirmed today | ۳ |
| Revenue (this month) | ۱۲,۵۰۰,۰۰۰ IRR |
| Refund rate | ۲% |
| Avg confirmation time | ۶ hours |

### 2.6 Chatbot Dashboard
| معیار | Value | Alert |
|---|---|---|
| Total conversations | ۱۵۶ | → |
| Fallback rate | ۳۲% | > 40% 🔴 |
| Escalations | ۸ | > 15 🔴 |
| Forbidden attempts | ۱۲ | ↑ |
| Avg response time | ۱.۲s | > 3s 🔴 |

### 2.7 Security Dashboard
| معیار | Value |
|---|---|
| Blocked IPs | ۴ |
| Failed auth attempts | ۲۳ |
| 403 responses | ۱۲ |
| Suspicious patterns | ۱ |
| Recent admin actions | ۱۵ |

### 2.8 SEO Dashboard
| معیار | Value | Trend |
|---|---|---|
| Indexed pages | ۴۲ | ↑ |
| Clicks (۷ days) | ۱۵۰ | ↑ |
| Impressions (۷ days) | ۲,۳۰۰ | → |
| Avg CTR | ۶.۵% | → |
| Crawl errors | ۳ | ↓ |
| Core Web Vitals (pass) | ۸۵% | ↑ |

## 3. Dashboard Implementation

### 3.1 Admin Panel Integration
- همه dashboards در پنل ادمین (با نقش مناسب)
- Refresh: هر ۳۰ ثانیه (technical), روزانه (business)
- Export: CSV / PDF

### 3.2 External Tools (اختیاری)
- Grafana: برای metrics فنی
- Google Search Console API: برای SEO data
- Uptime Kuma: برای uptime

## 4. Alert Dashboard
داشبوردی که فقط alertهای active را نشان می‌دهد:
| Alert | Severity | Time | Status |
|---|---|---|---|
| OTP fail rate high | HIGH | ۱۴:۲۳ | ACKNOWLEDGED |
| SSL expiry in 20 days | MEDIUM | ۰۸:۰۰ | PENDING |

## 5. Report Schedule
| Report | زمان | مخاطب |
|---|---|---|
| Daily technical summary |每天早上 ۸:۰۰ | تیم فنی |
| Weekly business report | شنبه‌ها | Product owner |
| Monthly SEO report | اول ماه | SEO reviewer |
| Monthly security review | اول ماه | Security reviewer |
