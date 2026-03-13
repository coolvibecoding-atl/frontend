import client from 'prom-client';

export const prometheusRegistry = client.register;

export const httpRequestsTotal = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'status', 'path'],
});

export const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'status', 'path'],
  buckets: [0.01, 0.05, 0.1, 0.5, 1, 2, 5],
});

export const uploadTotal = new client.Counter({
  name: 'audio_uploads_total',
  help: 'Total number of audio uploads',
  labelNames: ['status', 'format'],
});

export const processingDuration = new client.Histogram({
  name: 'audio_processing_duration_seconds',
  help: 'Duration of audio processing in seconds',
  labelNames: ['operation'],
  buckets: [1, 5, 10, 30, 60, 120, 300],
});

export const activeConnections = new client.Gauge({
  name: 'active_connections',
  help: 'Number of active connections',
  labelNames: ['type'],
});

export const queueSize = new client.Gauge({
  name: 'queue_size',
  help: 'Current size of processing queue',
  labelNames: ['queue'],
});

export const cacheHits = new client.Counter({
  name: 'cache_hits_total',
  help: 'Total number of cache hits',
  labelNames: ['cache'],
});

export const cacheMisses = new client.Counter({
  name: 'cache_misses_total',
  help: 'Total number of cache misses',
  labelNames: ['cache'],
});

export function initMetrics() {
  client.collectDefaultMetrics({ prefix: 'ai_mixer_' });
}
