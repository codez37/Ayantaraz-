Production Hardening v3 - Changes Summary

OVERVIEW
This branch addresses critical production security and configuration issues.

VERIFIED ISSUES RESOLVED

1. Missing GitHub Actions Workflows
   - Created .github/workflows/docker-deploy.yml
   - Includes build/test job and deploy job

2. Hardcoded Server IPs
   - Removed 202.133.91.13 from .env.example
   - Removed 202.133.91.13 from docker-compose.prod.yml
   - Standardized nginx CORS to use dynamic origin

3. Hardcoded Credentials
   - docker-compose.yml: Uses env vars for POSTGRES_PASSWORD and REDIS_PASSWORD
   - deploy.bat: Uses env vars instead of hardcoded values
   - Removed direct port exposure in docker-compose.yml

4. Exposed Personal Information
   - Removed admin phone numbers from .env.example

5. Exposed Docker Services
   - Removed port mappings from docker-compose.yml

6. Insecure Deployment Scripts
   - Archived DEPLOY_202.133.91.13.sh and DEPLOY_TO_202.133.91.13.sh
   - Archived root-level bootstrap.sh, setup-env.sh, setup.sh

7. Nginx Routing Inconsistencies
   - Standardized CORS configuration in nginx configs

FILES MODIFIED

Updated:
- docker-compose.yml
- .env.example
- docker-compose.prod.yml
- deploy.bat
- infra/nginx/default-ip.conf
- infra/nginx/default.conf.bak

Created:
- .github/workflows/docker-deploy.yml
- infra/scripts/deprecated/DEPLOY_202.133.91.13.sh
- infra/scripts/deprecated/DEPLOY_TO_202.133.91.13.sh
- infra/scripts/deprecated/bootstrap.sh
- infra/scripts/deprecated/setup-env.sh
- infra/scripts/deprecated/setup.sh

Deleted:
- DEPLOY_202.133.91.13.sh
- DEPLOY_TO_202.133.91.13.sh
- bootstrap.sh
- setup-env.sh
- setup.sh

SECURITY IMPROVEMENTS
- All credentials use environment variables
- No hardcoded IPs in configuration
- No personal information in configuration
- Docker services not directly exposed
- GitHub Actions uses secrets for deployment

ARCHITECTURE DECISIONS
- Single deployment path: docker-compose + GitHub Actions
- Configuration hierarchy: env vars > compose overrides > service configs

REMAINING RISKS (not addressed)
- Multiple Dockerfiles exist and should be consolidated
- deploy/ directory scripts should be reviewed
- infra/docker entrypoint scripts should be reviewed
