#!/bin/bash
set -euo pipefail

ENV="${1:-production}"
echo "Deploying to ${ENV}..."

if [ "$ENV" = "production" ]; then
  COMPOSE_FILE="-f docker-compose.yml -f docker-compose.prod.yml"
  ENV_FILE=".env.production"
elif [ "$ENV" = "staging" ]; then
  COMPOSE_FILE="-f docker-compose.yml -f docker-compose.prod.yml"
  ENV_FILE=".env.staging"
else
  echo "Usage: $0 {production|staging}"
  exit 1
fi

if [ ! -f "$ENV_FILE" ]; then
  echo "Error: ${ENV_FILE} not found"
  exit 1
fi

echo "Pulling latest images..."
docker compose $COMPOSE_FILE --env-file "$ENV_FILE" pull

echo "Starting services..."
docker compose $COMPOSE_FILE --env-file "$ENV_FILE" up -d --remove-orphans

echo "Waiting for health check..."
for i in $(seq 1 30); do
  if docker compose $COMPOSE_FILE --env-file "$ENV_FILE" exec -T api wget --no-verbose --tries=1 --spider http://localhost:3001/health 2>/dev/null; then
    echo "API is healthy"
    break
  fi
  sleep 2
done

echo "Running migrations..."
docker compose $COMPOSE_FILE --env-file "$ENV_FILE" exec -T api npx prisma migrate deploy

echo "Seeding database..."
docker compose $COMPOSE_FILE --env-file "$ENV_FILE" exec -T api npx tsx prisma/seed.ts

echo "Verifying health after migration..."
for i in $(seq 1 10); do
  if docker compose $COMPOSE_FILE --env-file "$ENV_FILE" exec -T api wget --no-verbose --tries=1 --spider http://localhost:3001/health 2>/dev/null; then
    echo "API healthy after migration"
    break
  fi
  sleep 2
done

echo "Deploy to ${ENV} completed successfully"
