# syntax=docker/dockerfile:1.7
FROM node:22.16-alpine AS deps
RUN apk add --no-cache libc6-compat
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
RUN apk add --no-cache libc6-compat
ENV CI=true
RUN corepack enable && corepack prepare pnpm@11.9.0 --activate
ENV PRISMA_BINARY_TARGETS=linux-musl-openssl-3.0.x
WORKDIR /app
COPY --from=deps /app/ .

COPY apps/api apps/api/
COPY apps/web apps/web/
COPY packages/shared packages/shared/
COPY prisma prisma/
COPY turbo.json tsconfig.base.json ./

RUN npx prisma generate --schema=prisma/schema.prisma
RUN pnpm --config.confirmModulesPurge=false --filter @ayantaraz/shared build

COPY scripts/validate-build.ts scripts/
RUN npx tsx scripts/validate-build.ts

RUN pnpm prune --prod

FROM node:22.16-alpine AS runner
RUN apk add --no-cache libc6-compat postgresql-client wget dumb-init
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nestjs

WORKDIR /app

COPY --from=builder --chown=nestjs:nodejs /app/apps/api/dist ./dist
COPY --from=builder --chown=nestjs:nodejs /app/apps/api/package.json ./package.json
COPY --from=builder --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nestjs:nodejs /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=builder --chown=nestjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nestjs:nodejs /app/packages ./packages

COPY infra/docker/entrypoint-api.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

USER nestjs

EXPOSE 3001

ENV NODE_ENV=production
ENV PORT=3001
ENV NODE_VERSION_MAJOR=22
ENV NODE_PATH=/app/node_modules:/app/apps/api/node_modules

HEALTHCHECK --interval=30s --timeout=5s --start-period=60s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:3001/health || exit 1

ENTRYPOINT ["dumb-init", "--", "/entrypoint.sh"]
