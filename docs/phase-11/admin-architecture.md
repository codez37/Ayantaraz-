# Admin Panel Architecture

## Overview
The admin panel is a role-based operational console for managing all business workflows. It sits behind JWT auth + role guards and exposes REST endpoints under `/api/admin`.

## Structure
```
/api/admin
├── GET /dashboard            — System stats + recent activity
├── GET /logs                 — Filtered audit logs
│
├── users/                    — User management
│   ├── GET /                 — List users
│   ├── GET /:id              — User detail
│   ├── PATCH /:id/role       — Change role
│   └── PATCH /:id/block      — Block/unblock
│
├── contents/                 — Content management (delegated to content module)
│
├── consultations/            — Consultation management (delegated)
│
├── orders/                   — Order management (delegated)
│
├── chatbot/                  — Knowledge base management (delegated)
│
├── settings/                 — System settings
│   ├── GET /                 — List settings
│   ├── PATCH /:key           — Update setting
│
└── permissions/              — Role permission mapping
    ├── GET /                 — List permissions
    └── PATCH /:id            — Update permission
```

## Backend vs Frontend
This phase defines the backend admin API. The frontend admin UI (Next.js pages under `/admin/`) consumes these endpoints but is built separately.

## Auth
All admin endpoints require:
- Valid JWT
- Role in [admin, content_manager]
- Individual endpoint role checks via @Roles() decorator

## Stack
- NestJS 11 controllers + services
- JwtAuthGuard (global) + @Roles() for role granularity
- Audit logging via Prisma AuditLog table
