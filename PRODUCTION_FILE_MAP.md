# Production file map

This map describes the deployable production loop implemented in the repository.

## Runtime services

- `docker-compose.yml` — canonical Compose stack for `api`, `web`, `nginx`, `db`, and `redis`.
- `docker-compose.prod.yml` — production resource and environment overrides layered on top of the canonical stack.
- `apps/api/Dockerfile` — API image build and runtime definition.
- `apps/web/Dockerfile` — web image build and runtime definition.
- `infra/nginx/default.conf` — public HTTP gateway for health, API, uploads, and frontend routes.

## Entrypoints

- `infra/docker/entrypoint-api.sh` — API container startup and Prisma migration hook.
- `infra/docker/entrypoint-web.sh` — Next.js standalone server startup.

## Deployment loop

- `scripts/env.sh create` — creates `.env` from `.env.example` and generates local production secrets.
- `scripts/env.sh validate` — validates required production `.env` keys and Compose service hostnames.
- `scripts/deploy-production.sh` — validates env, builds images, starts stateful services, applies migrations, starts the app stack, and checks public health endpoints.
- `scripts/final-verification.sh` — post-deploy verification for env, Compose, Prisma, service health, and public endpoints.
- `scripts/rollback.sh` — operator rollback wrapper for the installed `ayan-deploy` runtime when present.

## Data and secrets

- `.env.example` — committed template only; never store real secrets here.
- `.env` — uncommitted production values consumed by Compose and scripts.
- `postgres_data` — PostgreSQL volume.
- `redis_data` — Redis volume.
- `uploads_data` — uploaded files volume.
