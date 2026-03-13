# AI Worker Service Deployment Guide

## Overview
This guide explains how to deploy and run the AI worker services for AI Mixer Pro.

## Prerequisites
- Python 3.8 or higher
- Redis server (for BullMQ queues)
- Node.js 18 or higher
- Supabase project (for storage)

## Local Development Setup

### 1. Install Dependencies
```bash
# Install Python dependencies
cd worker
pip install -r requirements.txt
cd ..

# Install Node.js dependencies
npm install
```

### 2. Configure Environment Variables
Create a `.env.local` file with:
```env
# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Start Redis
```bash
# On macOS with Homebrew
brew install redis
brew services start redis

# On Ubuntu/Debian
sudo apt-get install redis-server
sudo systemctl start redis

# On Windows
# Use WSL2 or Docker
```

### 4. Start the Worker Services
```bash
# Option 1: Using the startup script
./worker/start_workers.sh

# Option 2: Manual start
node lib/queue.js
```

### 5. Start the Next.js Application
```bash
npm run dev
```

## Production Deployment

### Option 1: Docker (Recommended)

Create a `docker-compose.yml` file:
```yaml
version: '3.8'

services:
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis-data:/data

  workers:
    build:
      context: .
      dockerfile: worker/Dockerfile
    environment:
      - REDIS_HOST=redis
      - REDIS_PORT=6379
      - NEXT_PUBLIC_SUPABASE_URL=${SUPABASE_URL}
      - NEXT_PUBLIC_SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY}
    depends_on:
      - redis
    volumes:
      - ./tmp:/tmp

volumes:
  redis-data:
```

Create a `worker/Dockerfile`:
```dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python dependencies
COPY worker/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy worker scripts
COPY worker/ ./worker/
COPY lib/ ./lib/

# Install Node.js dependencies
COPY package*.json ./
RUN npm install --production

# Start workers
CMD ["node", "lib/queue.js"]
```

Run with:
```bash
docker-compose up -d
```

### Option 2: Systemd Service (Linux)

Create `/etc/systemd/system/ai-mixer-workers.service`:
```ini
[Unit]
Description=AI Mixer Pro Workers
After=network.target redis.service

[Service]
Type=simple
User=ai-mixer
WorkingDirectory=/opt/ai-mixer-pro
Environment=REDIS_HOST=localhost
Environment=REDIS_PORT=6379
Environment=NEXT_PUBLIC_SUPABASE_URL=your-url
Environment=NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key
ExecStart=/usr/bin/node /opt/ai-mixer-pro/lib/queue.js
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Enable and start:
```bash
sudo systemctl enable ai-mixer-workers
sudo systemctl start ai-mixer-workers
```

### Option 3: PM2 (Node.js Process Manager)

Install PM2:
```bash
npm install -g pm2
```

Start workers with PM2:
```bash
pm2 start lib/queue.js --name ai-mixer-workers
pm2 save
pm2 startup
```

## Scaling

### Horizontal Scaling
Run multiple worker instances:
```bash
# Start multiple workers
pm2 start lib/queue.js --name ai-mixer-workers-1
pm2 start lib/queue.js --name ai-mixer-workers-2
pm2 start lib/queue.js --name ai-mixer-workers-3
```

BullMQ automatically distributes work across instances.

### Vertical Scaling
Increase concurrency in `lib/queue.js`:
```javascript
const separationWorker = new Worker(
  SEPARATION_QUEUE,
  async (job) => { /* ... */ },
  { connection: redisConfig, concurrency: 4 } // Increase from 2 to 4
);
```

## Monitoring

### Health Checks
Create a health check endpoint:
```javascript
// src/app/api/health/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    workers: 'running',
  });
}
```

### Logging
Workers log to stdout/stderr. Use a log aggregator:
- **Docker**: `docker logs <container>`
- **Systemd**: `journalctl -u ai-mixer-workers -f`
- **PM2**: `pm2 logs ai-mixer-workers`

### Metrics
Monitor these metrics:
- Queue length (should be close to 0)
- Processing time per job
- Error rate
- Worker CPU/memory usage

## Troubleshooting

### Workers not starting
1. Check Redis is running: `redis-cli ping`
2. Check Python is installed: `python3 --version`
3. Check dependencies: `pip list | grep spleeter`

### Stem separation failing
1. Check Spleeter is installed: `pip show spleeter`
2. Check ffmpeg is installed: `ffmpeg -version`
3. Check available memory (Spleeter needs 4GB+ RAM)

### Performance issues
1. Increase worker concurrency
2. Use GPU acceleration (install CUDA-enabled PyTorch)
3. Process larger files in chunks
4. Use cloud-based processing for very large files

## Security Considerations

1. **Never commit secrets** - Use environment variables
2. **Restrict Redis access** - Use password authentication
3. **Secure Supabase** - Set up Row Level Security (RLS)
4. **Rate limiting** - Implement request throttling
5. **Input validation** - Validate all file uploads

## Cost Optimization

1. **Use spot instances** for cloud deployment
2. **Process during off-peak hours**
3. **Cache results** for repeated processing
4. **Use tiered storage** in Supabase
5. **Monitor and optimize** worker utilization