# Monitoring Strategy

## 1. هدف
پایش مداوم سلامت فنی، امنیتی، و کسب‌وکاری سیستم بعد از launch.

## 2. لایه‌های پایش

### 2.1 Technical Monitoring
| معیار | ابزار پیشنهادی | آستانه هشدار |
|---|---|---|
| Uptime | Healthcheck endpoint (۳۰s) | < 99.9% |
| API Response Time | Logger + metrics | > 2000ms (p95) |
| 4xx Rate | Error filter stats | > 5% requests |
| 5xx Rate | Error filter stats | > 1% requests |
| DB Connection Pool | Prisma metrics | > 80% usage |
| Disk Usage | OS monitoring | > 85% |
| SSL Expiry | External checker | < 30 days |

### 2.2 Business Monitoring
| معیار | منبع | هشدار |
|---|---|---|
| OTP Success Rate | Auth logs | < 90% |
| Consultation Submissions/hr | DB count | Drop > 50% vs avg |
| Order Completion Rate | Orders | < 60% confirmed |
| Chatbot Fallback Rate | Chat logs | > 40% |
| Content Publish Failures | Audit logs | Any failure |

### 2.3 Security Monitoring
| رویداد | منبع | اقدام |
|---|---|---|
| Brute-force OTP | Rate limit logs | Block IP |
| Admin login anomaly | Audit logs | Notify admin |
| Suspicious role changes | Audit logs | Immediate review |
| Repeated 403 | Access logs | Review pattern |

## 3. پیاده‌سازی

### 3.1 Healthcheck Endpoint
یک endpoint ساده در NestJS:

```
GET /api/health
← { status: 'ok', uptime: 12345, timestamp: '...' }
```

چک‌های داخلی:
- DB connection alive
- Redis ping (در صورت استفاده)
- Disk space (اختیاری)

### 3.2 لاگ‌های ساختاریافته
- همه لاگ‌ها JSON با سطح (info/warn/error)
- شامل requestId, timestamp, module
- لاگ خطا شامل stack trace (فقط development)

### 3.3 Cron-based Healthcheck
یک اسکریپت ساده (healthcheck.sh) که:
- هر ۳۰ ثانیه endpoint را می‌زند
- در صورت ۳ بار failure متوالی → alert

## 4. Alerting Strategy
- Critical: پیامک + ایمیل + لاگ → پاسخ < ۱۵ دقیقه
- High: ایمیل + لاگ → پاسخ < ۱ ساعت
- Medium: لاگ + report روزانه
- Low: report هفتگی

## 5. ابزارهای پیشنهادی
- Uptime Kuma (self-hosted, ساده)
- Prometheus + Grafana (برای metrics پیشرفته)
- Sentry (error tracking)
- Healthchecks.io (cron-based)

## 6. لاگ جمع‌آوری
- همه لاگ‌ها در فایل JSON
- چرخش روزانه (log rotation)
- retention: ۳۰ روز
- فشرده‌سازی روز هفتم
