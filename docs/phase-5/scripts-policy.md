# Scripts Policy

## Principle
Any repeatable operational task must have a script. No manual-only operations for critical tasks.

## Root Scripts (via pnpm)

| Script | Command | Description |
|--------|---------|-------------|
| dev | `pnpm --parallel -r dev` | Run all apps in dev mode |
| build | `pnpm --parallel -r build` | Build all apps |
| lint | `pnpm -r lint` | Lint all packages |
| format | `prettier --write .` | Format all files |
| test | `pnpm -r test` | Run all tests |
| typecheck | `pnpm -r typecheck` | TypeScript check |
| clean | `pnpm -r clean` | Clean build artifacts |
| db:generate | `prisma generate` | Generate Prisma client |
| db:migrate | `prisma migrate dev` | Run migrations |
| db:seed | `prisma db seed` | Seed database |
| db:studio | `prisma studio` | Open Prisma Studio |
| docker:up | `docker compose up -d` | Start dev stack |
| docker:down | `docker compose down` | Stop dev stack |
| healthcheck | `curl localhost:3001/health` | Check API health |

## Infra Scripts (`infra/scripts/`)

| Script | Purpose |
|--------|---------|
| backup.sh | Database backup with rotation |
| deploy.sh | Production deployment |
| healthcheck.sh | Service health check |

## Dev Scripts (`scripts/`)

| Script | Purpose |
|--------|---------|
| init.sh | First-time project setup |
| seed.ts | Database seed script |
| migrate.sh | Run migrations with safety checks |
