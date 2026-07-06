#!/bin/bash
set -euo pipefail

ENV="${1:-development}"
echo "Running migrations for ${ENV}..."

if [ "$ENV" = "production" ] || [ "$ENV" = "staging" ]; then
  echo "Running in production/staging mode: prisma migrate deploy"
  npx prisma migrate deploy --schema=prisma/schema.prisma
elif [ "$ENV" = "development" ]; then
  echo "Running in development mode: prisma migrate dev"
  npx prisma migrate dev --schema=prisma/schema.prisma
else
  echo "Usage: $0 {development|staging|production}"
  exit 1
fi

echo "Migration completed successfully"
