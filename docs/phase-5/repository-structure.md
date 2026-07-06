# Repository Structure

## Type: Monorepo (pnpm workspace)

```
ayantaraz/
├── apps/
│   ├── web/                          # Next.js frontend
│   │   ├── app/                      # App Router pages
│   │   ├── components/               # Shared components
│   │   ├── lib/                      # Utilities, API client
│   │   ├── styles/                   # RTL styles, globals
│   │   └── public/                   # Static assets
│   └── api/                          # NestJS backend
│       ├── src/
│       │   ├── modules/              # Feature modules
│       │   ├── common/               # Shared guards, decorators, filters
│       │   ├── prisma/               # Prisma service
│       │   └── main.ts               # Entry point
│       ├── Dockerfile
│       └── package.json
│
├── packages/
│   └── shared/                       # Shared types, enums, constants, utils
│       ├── src/
│       │   ├── types/                # Domain types
│       │   ├── enums/                # Status enums
│       │   ├── constants/            # Shared constants
│       │   └── utils/                # Utility helpers
│       └── package.json
│
├── prisma/                           # Root Prisma schema
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts
│
├── docs/
│   ├── phase-0/
│   ├── phase-1/
│   ├── phase-2/
│   ├── phase-4/
│   └── phase-5/
│
├── infra/
│   ├── nginx/
│   │   └── default.conf
│   ├── docker/
│   │   ├── Dockerfile.api
│   │   └── Dockerfile.web
│   └── scripts/
│       ├── backup.sh
│       ├── deploy.sh
│       └── healthcheck.sh
│
├── scripts/
│   ├── dev.sh
│   ├── seed.ts
│   ├── migrate.sh
│   └── init.sh
│
├── .github/
│   └── workflows/
│       └── ci.yml
│
├── .env.example
├── .env.development
├── .env.staging
├── .env.production
├── .gitignore
├── .prettierrc
├── pnpm-workspace.yaml
├── package.json
├── tsconfig.base.json
└── README.md
```

## Section Responsibilities

| Path | Responsibility |
|------|---------------|
| `apps/web/` | Next.js frontend (public, auth, dashboard, admin) |
| `apps/api/` | NestJS backend (all API modules) |
| `packages/shared/` | Shared types, enums, constants, validation helpers |
| `prisma/` | Database schema, migrations, seed data |
| `infra/` | Docker, Nginx, deployment scripts |
| `scripts/` | Developer tooling (init, migrate, seed, backup) |
| `.github/` | CI/CD workflows |
| `docs/` | All phase documentation |
