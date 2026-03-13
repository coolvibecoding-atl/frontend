# AI Mixer Pro - Docker Containerization

This directory contains the Docker configuration for AI Mixer Pro, following industry best practices for production-ready containerization.

## Architecture

The application is containerized using a microservices approach:
- **Next.js App**: Frontend and API (Node.js 20 Alpine)
- **Python Worker**: Audio processing services (Python 3.11 Slim)
- **Redis**: Cache and job queue
- **PostgreSQL**: Primary database
- **Nginx**: Load balancer and SSL termination
- **Monitoring Stack**: Prometheus, Grafana, Alertmanager

## Files Overview

### Core Configuration
- `Dockerfile`: Multi-stage build for Next.js application
- `worker/Dockerfile`: Python worker container with audio processing dependencies
- `docker-compose.yml`: Local development environment with all core services
- `docker-compose.monitoring.yml`: Monitoring stack (Prometheus, Grafana, Alertmanager)
- `nginx.conf`: Production load balancer configuration
- `init.sql`: Database initialization script

### Monitoring
- `monitoring/prometheus.yml`: Prometheus configuration
- `monitoring/alertmanager.yml`: Alertmanager configuration
- `monitoring/grafana/provisioning/`: Grafana datasource and dashboard provisioning

### Security
- `ssl/`: SSL certificates (self-signed for development, replace with real certs for production)

## Getting Started

### Prerequisites
- Docker Desktop or Docker Engine 20.10+
- Docker Compose 2.0+

### Development Setup

1. **Start the core services:**
   ```bash
   docker-compose up -d
   ```

2. **Start the monitoring stack (optional):**
   ```bash
   docker-compose -f docker-compose.monitoring.yml up -d
   ```

3. **Access the application:**
   - Main app: http://localhost:3000
   - Nginx (production-like): https://localhost (with self-signed cert)
   - Prometheus: http://localhost:9090
   - Grafana: http://localhost:3001 (admin/admin123)
   - Alertmanager: http://localhost:9093

### Production Deployment

1. **Build images:**
   ```bash
   docker-compose build
   ```

2. **Deploy with production settings:**
   ```bash
   docker-compose -f docker-compose.yml -f docker-compose.monitoring.yml up -d
   ```

3. **SSL Configuration:**
   Replace the self-signed certificates in `ssl/` with real certificates:
   ```bash
   # Using Let's Encrypt
   certbot certonly --standalone -d your-domain.com
   cp /etc/letsencrypt/live/your-domain.com/fullchain.pem ssl/cert.pem
   cp /etc/letsencrypt/live/your-domain.com/privkey.pem ssl/key.pem
   ```

## Service Details

### Next.js App
- **Base Image**: node:20-alpine
- **Build**: Multi-stage (builder + runner)
- **Port**: 3000
- **Health Check**: `/api/health`

### Python Worker
- **Base Image**: python:3.11-slim
- **Dependencies**: ffmpeg, libsndfile1, librosa, torch, spleeter
- **Port**: 8000 (health check)
- **Health Check**: `/health`

### Redis
- **Image**: redis:7-alpine
- **Persistence**: Enabled with AOF
- **Memory Policy**: LRU with 512MB limit

### PostgreSQL
- **Image**: postgres:15-alpine
- **Volume**: Persistent storage
- **Initialization**: `init.sql` script

### Nginx
- **SSL**: TLS 1.2/1.3
- **Security Headers**: CSP, HSTS, X-Frame-Options
- **Rate Limiting**: API and auth endpoints

## Resource Limits

Production deployments include resource constraints:
- **App**: 2 CPU cores, 2GB RAM
- **Worker**: 2 CPU cores, 4GB RAM
- **Redis**: 0.5 CPU cores, 512MB RAM
- **PostgreSQL**: 1 CPU core, 1GB RAM

## Monitoring

The monitoring stack provides:
- **Metrics**: System, application, and custom metrics
- **Dashboards**: Pre-configured Grafana dashboards
- **Alerts**: Email and Slack notifications via Alertmanager

## Security Best Practices

1. **Non-root users**: All containers run as non-root users
2. **Health checks**: All services have health check endpoints
3. **Resource limits**: Prevents resource exhaustion
4. **Network isolation**: Custom Docker networks
5. **Secrets management**: Use Docker secrets or environment files for production

## Troubleshooting

### View logs
```bash
docker-compose logs -f [service]
```

### Rebuild a specific service
```bash
docker-compose build [service]
```

### Reset everything
```bash
docker-compose down -v
docker-compose -f docker-compose.monitoring.yml down -v
```

## References

- [Docker Best Practices](https://docs.docker.com/develop/develop-images/dockerfile_best-practices/)
- [Next.js Docker Deployment](https://nextjs.org/docs/deployment#docker-image)
- [Production Docker Security](https://docs.docker.com/engine/security/)
