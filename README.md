# آیان تراز

**Accounting, Tax Consultation & Education Platform**

یک پلتفرم جامع برای خدمات حسابداری، مشاوره مالیاتی و آموزش مالی با احراز هویت تلفنی، پرداخت دستی، چت‌بات محدود به دانشنامه و کنترل مدیریتی کامل.

## ساختار پروژه

```
ayantaraz/
├── apps/
│   ├── web/        # Next.js frontend
│   └── api/        # NestJS backend
├── packages/
│   └── shared/     # Shared types, enums, constants, utils
├── prisma/         # Database schema & migrations
├── docs/           # Phase documentation
├── infra/          # Docker, Nginx, deployment scripts
├── scripts/        # Developer tooling
└── .github/        # CI/CD workflows
```

## شروع سریع

### پیش‌نیازها
- Node.js >= 22
- pnpm >= 9
- Docker (برای PostgreSQL و Redis)

### نصب و راه‌اندازی

```bash
# نصب dependencies
pnpm install

# کپی env
cp .env.example .env.development

# راه‌اندازی دیتابیس
pnpm db:generate
pnpm db:migrate
pnpm db:seed

# اجرای پروژه
pnpm dev
```

### با Docker

```bash
# شروع سرویس‌های زیرساخت
pnpm docker:up

# اجرای پروژه
pnpm dev
```

## اسکریپت‌های اصلی

| دستور | توضیح |
|-------|-------|
| `pnpm dev` | اجرای همزمان backend + frontend |
| `pnpm build` | بیلد همه پکیج‌ها |
| `pnpm test` | اجرای تست‌ها |
| `pnpm lint` | بررسی lint |
| `pnpm db:migrate` | اجرای migration |
| `pnpm db:seed` | پر کردن دیتابیس با داده اولیه |
| `pnpm docker:up` | شروع سرویس‌های Docker |

## معماری

- **Backend**: NestJS + Prisma + PostgreSQL + Redis
- **Frontend**: Next.js + TypeScript + Tailwind CSS
- **Auth**: Phone OTP via SMS + JWT
- **Payment**: Manual (offline) with admin verification
- **Chatbot**: Knowledge-base-only (no LLM)
- **Deployment**: Docker Compose + Nginx

## محیط‌ها

| محیط | فایل env | توضیح |
|------|----------|-------|
| توسعه | `.env.development` | Local development |
| استیجینگ | `.env.staging` | Staging/QA |
| تولید | `.env.production` | Production (secrets in env vars) |

## تکنولوژی‌ها

- **Runtime**: Node.js 22, TypeScript
- **Backend**: NestJS 11, Passport, JWT
- **Frontend**: Next.js 16, React 19, Tailwind CSS 4
- **Database**: PostgreSQL 16, Prisma 5
- **Cache**: Redis 7
- **Infra**: Docker, Nginx, GitHub Actions
