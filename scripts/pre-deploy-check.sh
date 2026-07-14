#!/bin/bash

# Pre-Deployment Check Script
# This script verifies all conditions before deployment

set -e

echo "Starting pre-deployment checks..."

# 1. Check if we are on main branch
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
if [ "$CURRENT_BRANCH" != "main" ]; then
    echo "ERROR: Deployment must be from main branch. Current branch: $CURRENT_BRANCH"
    exit 1
fi

# 2. Check for uncommitted changes
if [ -n "$(git status --porcelain)" ]; then
    echo "ERROR: Uncommitted changes detected. Please commit all changes before deployment."
    exit 1
fi

# 3. Run lint
echo "Running lint..."
pnpm lint

# 4. Run typecheck
echo "Running typecheck..."
pnpm typecheck

# 5. Run tests
echo "Running tests..."
pnpm test

# 6. Check build
echo "Running build..."
pnpm build

# 7. Verify Docker configuration
echo "Verifying Docker configuration..."
if [ ! -f "docker-compose.yml" ]; then
    echo "ERROR: docker-compose.yml not found"
    exit 1
fi

if [ ! -f "docker-compose.prod.yml" ]; then
    echo "ERROR: docker-compose.prod.yml not found"
    exit 1
fi

# 8. Check environment variables
echo "Checking environment variables..."
if [ ! -f ".env" ]; then
    echo "WARNING: .env file not found"
fi

# 9. Check for tag
LATEST_TAG=$(git describe --tags --abbrev=0 2>/dev/null)
if [ -z "$LATEST_TAG" ]; then
    echo "WARNING: No tags found. Consider creating a release tag."
fi

echo "All pre-deployment checks passed!"
echo "You can now proceed with deployment."
