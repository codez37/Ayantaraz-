# CI/CD Skeleton

## CI Pipeline (GitHub Actions)

### Triggers
- Push to `main` or `develop`
- Pull request to `main` or `develop`

### Jobs

1. **lint**: ESLint on apps/api + apps/web + packages/shared
2. **typecheck**: TypeScript strict check on all packages
3. **test**: Jest unit tests (apps/api)
4. **build**: NestJS build + Next.js build
5. **schema**: Prisma validation (`prisma validate`)

### Artifacts
- Build output for deployment

## CD Pipeline (Future)

- Staging deploy: automatic on `develop` push
- Production deploy: manual trigger from `main`
- Rollback: one-click to previous version

## Branch Protection Rules

- `main`: requires PR review, CI pass
- `develop`: requires CI pass
