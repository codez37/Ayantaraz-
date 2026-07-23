# syntax=docker/dockerfile:1.7

FROM node:22.16-alpine AS deps

ENV CI=true

RUN corepack enable && corepack prepare pnpm@11.9.0 --activate

WORKDIR /app

COPY pnpm-workspace.yaml package.json pnpm-lock.yaml .npmrc ./

COPY apps/api/package.json apps/api/
COPY apps/web/package.json apps/web/
COPY packages/shared/package.json packages/shared/
COPY prisma/schema.prisma prisma/

RUN pnpm install --frozen-lockfile --shamefully-hoist


FROM node:22.16-alpine AS builder

ENV CI=true

RUN corepack enable && corepack prepare pnpm@11.9.0 --activate

WORKDIR /app

COPY --from=deps /app/ .

COPY apps/api apps/api/
COPY apps/web apps/web/
COPY packages/shared packages/shared/
COPY prisma prisma/
COPY turbo.json tsconfig.base.json ./


ENV NEXT_PUBLIC_SITE_URL=http://202.133.91.13
ENV NEXT_PUBLIC_API_URL=http://202.133.91.13:3001


RUN pnpm --config.confirmModulesPurge=false --filter @ayantaraz/shared build

RUN CI=true npx turbo run build --filter=web


FROM node:22.16-alpine AS runner

RUN apk add --no-cache redis coreutils

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs


WORKDIR /app


ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0


# Next standalone output
COPY --from=builder \
 --chown=nextjs:nodejs \
 /app/apps/web/.next/standalone/apps/web \
 ./apps/web


# Static assets
COPY --from=builder \
 --chown=nextjs:nodejs \
 /app/apps/web/.next/static \
 ./apps/web/.next/static


# Public assets
COPY --from=builder \
 --chown=nextjs:nodejs \
 /app/apps/web/public \
 ./apps/web/public


COPY --from=builder \
 --chown=nextjs:nodejs \
 /app/node_modules \
 ./node_modules


COPY infra/docker/entrypoint-web.sh /entrypoint.sh

RUN chmod +x /entrypoint.sh


USER nextjs


EXPOSE 3000


HEALTHCHECK \
 --interval=30s \
 --timeout=5s \
 --start-period=60s \
 --retries=3 \
 CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:3000 || exit 1


ENTRYPOINT ["/entrypoint.sh"]
