import { NextResponse } from 'next/server';

interface LogEntry {
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  context?: Record<string, unknown>;
  service?: string;
}

interface Metrics {
  timestamp: string;
  service: string;
  metric: string;
  value: number;
  tags?: Record<string, string>;
}

// Simple in-memory storage for logs (replace with proper logging service in production)
const logs: LogEntry[] = [];
const metrics: Metrics[] = [];

// Maximum number of logs to keep in memory
const MAX_LOGS = 10000;

// Log levels
export const LOG_LEVELS = {
  DEBUG: 'debug',
  INFO: 'info',
  WARN: 'warn',
  ERROR: 'error',
} as const;

/**
 * Log a message with optional context
 */
export function log(
  level: typeof LOG_LEVELS[keyof typeof LOG_LEVELS],
  message: string,
  context?: Record<string, unknown>,
  service?: string
): void {
  const entry: LogEntry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    context,
    service,
  };

  // Add to logs array
  logs.push(entry);

  // Keep only recent logs
  if (logs.length > MAX_LOGS) {
    logs.shift();
  }

  // Also log to console for development
  if (process.env.NODE_ENV === 'development') {
    const prefix = service ? `[${service}] ` : '';
    console.log(`${prefix}[${level.toUpperCase()}] ${message}`, context || '');
  }

  // In production, you might send to a logging service like Datadog, Logtail, etc.
  // if (process.env.NODE_ENV === 'production') {
  //   sendToLoggingService(entry);
  // }
}

// Convenience methods
export const logger = {
  debug: (message: string, context?: Record<string, unknown>, service?: string) =>
    log(LOG_LEVELS.DEBUG, message, context, service),
  info: (message: string, context?: Record<string, unknown>, service?: string) =>
    log(LOG_LEVELS.INFO, message, context, service),
  warn: (message: string, context?: Record<string, unknown>, service?: string) =>
    log(LOG_LEVELS.WARN, message, context, service),
  error: (message: string, context?: Record<string, unknown>, service?: string) =>
    log(LOG_LEVELS.ERROR, message, context, service),
};

/**
 * Record a metric
 */
export function recordMetric(
  service: string,
  metric: string,
  value: number,
  tags?: Record<string, string>
): void {
  const entry: Metrics = {
    timestamp: new Date().toISOString(),
    service,
    metric,
    value,
    tags,
  };

  metrics.push(entry);

  // Keep only recent metrics
  if (metrics.length > 5000) {
    metrics.shift();
  }
}

/**
 * Get recent logs
 */
export function getLogs(
  limit: number = 100,
  level?: typeof LOG_LEVELS[keyof typeof LOG_LEVELS],
  service?: string
): LogEntry[] {
  let filtered = [...logs];

  if (level) {
    filtered = filtered.filter((log) => log.level === level);
  }

  if (service) {
    filtered = filtered.filter((log) => log.service === service);
  }

  return filtered.slice(-limit).reverse();
}

/**
 * Get metrics for a service
 */
export function getMetrics(
  service: string,
  metric?: string,
  limit: number = 100
): Metrics[] {
  let filtered = metrics.filter((m) => m.service === service);

  if (metric) {
    filtered = filtered.filter((m) => m.metric === metric);
  }

  return filtered.slice(-limit);
}

// Error handling wrapper
export function withErrorHandling<T extends (...args: unknown[]) => unknown>(
  fn: T,
  context?: string
): T {
  return ((...args: unknown[]) => {
    try {
      return fn(...args);
    } catch (error) {
      logger.error(`Error in ${context || fn.name}`, {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        args,
      });
      throw error;
    }
  }) as T;
}

// Performance monitoring
export function withPerformanceMonitoring<T extends (...args: unknown[]) => unknown>(
  fn: T,
  context: string
): T {
  return ((...args: unknown[]) => {
    const start = performance.now();
    const result = fn(...args);
    
    if (result instanceof Promise) {
      return result.finally(() => {
        const duration = performance.now() - start;
        recordMetric('performance', `${context}.duration`, duration);
        if (duration > 1000) {
          logger.warn(`Slow operation: ${context} took ${duration}ms`);
        }
      });
    } else {
      const duration = performance.now() - start;
      recordMetric('performance', `${context}.duration`, duration);
      return result;
    }
  }) as T;
}

// API Route handler for metrics endpoint
export async function GET(request: Request) {
  const url = new URL(request.url);
  const service = url.searchParams.get('service');
  const metric = url.searchParams.get('metric');
  const limit = parseInt(url.searchParams.get('limit') || '100');

  const data = service ? getMetrics(service, metric || undefined, limit) : metrics.slice(-limit);
  
  return NextResponse.json({
    metrics: data,
    total: data.length,
  });
}