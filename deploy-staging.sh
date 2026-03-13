#!/bin/bash
# Staging deployment script for AI Mixer Pro

set -e  # Exit on error

echo "🚀 Starting staging deployment for AI Mixer Pro..."

# Change to project directory
cd /Users/coolvibecoding/Desktop/AI_Mixer_Pro

# Load NVM
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Check if required environment variables are set
if [ -z "$VERCEL_TOKEN" ]; then
    echo "❌ VERCEL_TOKEN environment variable is not set"
    exit 1
fi

if [ -z "$VERCEL_ORG_ID" ]; then
    echo "❌ VERCEL_ORG_ID environment variable is not set"
    exit 1
fi

if [ -z "$VERCEL_PROJECT_ID" ]; then
    echo "❌ VERCEL_PROJECT_ID environment variable is not set"
    exit 1
fi

echo "✅ Environment variables validated"

# Build the application
echo "📦 Building application..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed"
    exit 1
fi

echo "✅ Build successful"

# Deploy to Vercel staging
echo "🚀 Deploying to Vercel staging..."
vercel deploy --yes --env NODE_ENV=staging

if [ $? -ne 0 ]; then
    echo "❌ Deployment failed"
    exit 1
fi

echo "✅ Staging deployment completed successfully!"

# Run post-deployment checks
echo "🔍 Running post-deployment checks..."

# Wait for deployment to be ready
sleep 10

# Check if the deployment is accessible
DEPLOYMENT_URL=$(vercel ls --prod --no-color | grep -o 'https://[^ ]*' | head -1)
if [ -n "$DEPLOYMENT_URL" ]; then
    echo "🌍 Staging URL: $DEPLOYMENT_URL"
    
    # Test health endpoint
    if curl -f "${DEPLOYMENT_URL}/api/health" > /dev/null 2>&1; then
        echo "✅ Health check passed"
    else
        echo "⚠️  Health check failed - please verify deployment manually"
    fi
else
    echo "⚠️  Could not determine deployment URL"
fi

echo "🎉 Staging deployment process completed!"