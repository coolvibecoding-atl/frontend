#!/bin/bash
# Deployment script for staging environment

echo "Deploying to staging environment..."
echo "Running build: npm run build"
npm run build

# For Vercel deployment to preview (staging)
echo "Deploying to Vercel (preview)"
npx vercel --token=${{ secrets.VERCEL_TOKEN }} --scope=${{ secrets.VERCEL_ORG_ID }}

echo "Staging deployment completed"