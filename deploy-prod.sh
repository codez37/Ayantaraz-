#!/bin/bash

# Ayantaraz Production Deployment Script
# This script deploys the application to production using Docker Compose

set -e  # Exit on error

echo "Starting Ayantaraz production deployment..."
echo "==========================================="

# Change to the deploy directory
cd "$(dirname "$0")/deploy" || exit 1

# Check if ayan-deploy exists
if [ -f "ayan-deploy" ]; then
    echo "Running ayan-deploy script..."
    ./ayan-deploy
else
    echo "ERROR: ayan-deploy script not found in deploy/ directory"
    exit 1
fi

echo "Deployment completed successfully!"
