#!/bin/bash
# Comprehensive production deployment script for AI Mixer Pro

set -e

echo "=========================================="
echo "AI Mixer Pro - Production Deployment"
echo "=========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Environment
ENV="production"
APP_NAME="ai-mixer-pro"

# Check required environment variables
required_vars=(
  "DATABASE_URL"
  "REDIS_HOST"
  "AWS_ACCESS_KEY_ID"
  "AWS_SECRET_ACCESS_KEY"
  "AWS_S3_BUCKET"
  "STRIPE_SECRET_KEY"
  "CLERK_SECRET_KEY"
)

echo -e "${YELLOW}Checking environment variables...${NC}"
for var in "${required_vars[@]}"; do
  if [ -z "${!var}" ]; then
    echo -e "${RED}Error: $var is not set${NC}"
    exit 1
  fi
done
echo -e "${GREEN}All required environment variables are set${NC}"

# Run tests
echo -e "${YELLOW}Running tests...${NC}"
npm test
echo -e "${GREEN}Tests passed${NC}"

# Build application
echo -e "${YELLOW}Building application...${NC}"
npm run build
echo -e "${GREEN}Build completed${NC}"

# Run database migrations
echo -e "${YELLOW}Running database migrations...${NC}"
npx prisma migrate deploy
echo -e "${GREEN}Migrations completed${NC}"

# Deploy based on platform
if [ "$DEPLOY_PLATFORM" = "vercel" ]; then
  echo -e "${YELLOW}Deploying to Vercel...${NC}"
  npx vercel --prod --token="$VERCEL_TOKEN" --scope="$VERCEL_ORG_ID"
elif [ "$DEPLOY_PLATFORM" = "aws" ]; then
  echo -e "${YELLOW}Deploying to AWS...${NC}"
  ./scripts/deploy-aws.sh
elif [ "$DEPLOY_PLATFORM" = "docker" ]; then
  echo -e "${YELLOW}Deploying with Docker...${NC}"
  docker-compose -f docker-compose.prod.yml up -d --build
else
  echo -e "${YELLOW}Starting application locally...${NC}"
  npm run start
fi

echo -e "${GREEN}=========================================="
echo "Production deployment completed successfully!"
echo "==========================================${NC}"
