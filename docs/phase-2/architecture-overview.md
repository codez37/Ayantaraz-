# Architecture Overview

## Type: Modular Monolith + API-first + Frontend/Backend Separation

### Why Modular Monolith?
- Project complexity does not require distributed architecture
- Team size is small to medium
- Fast development and maintenance
- Admin panel and workflows are centralized
- Content, OTP, manual payment, chatbot need central control
- Avoids microservice overhead (network complexity, deployment, observability)

### Architecture Layers

```
┌─────────────────────────────────────────────────┐
│                 Presentation                     │
│          Next.js + TypeScript                    │
│  (SSR, SSG, ISR, Client Components, RTL)         │
├─────────────────────────────────────────────────┤
│                 Application                      │
│          NestJS + TypeScript                     │
│  (Modules, Services, Guards, Interceptors)        │
├─────────────────────────────────────────────────┤
│                 Domain                           │
│  (Entities, State Machines, Business Rules)       │
├─────────────────────────────────────────────────┤
│               Infrastructure                     │
│  Prisma → PostgreSQL  │  Redis  │  MinIO/S3      │
│  Kavenegar SMS        │  Logger │  Sentry        │
└─────────────────────────────────────────────────┘
```

### Data Flow

```
Request → Validation → Auth Guard → Service → Domain Rule → Prisma/DB → Audit Log → Response
```

No undocumented paths. Every request follows the defined pipeline.
