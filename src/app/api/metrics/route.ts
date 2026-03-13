import { NextResponse } from 'next/server';
import { 
  httpRequestsTotal,
  httpRequestDuration,
  uploadTotal,
  processingDuration,
  activeConnections,
  queueSize,
  cacheHits,
  cacheMisses
} from '@/lib/metrics';

export async function GET() {
  try {
    const metrics = await Promise.all([
      httpRequestsTotal.get(),
      httpRequestDuration.get(),
      uploadTotal.get(),
      processingDuration.get(),
      activeConnections.get(),
      queueSize.get(),
      cacheHits.get(),
      cacheMisses.get()
    ]);

    const lines: string[] = [];
    
    for (const metric of metrics) {
      if (metric.values) {
        for (const value of metric.values) {
          let labelStr = '';
          if (value.labels && Object.keys(value.labels).length > 0) {
            const labels = Object.entries(value.labels)
              .map(([k, v]) => `${k}="${v}"`)
              .join(',');
            labelStr = `{${labels}}`;
          }
          lines.push(`${metric.name}${labelStr} ${value.value}`);
        }
      }
    }

    return new NextResponse(lines.join('\n'), {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
      },
    });
  } catch (error) {
    console.error('Error generating metrics:', error);
    return new NextResponse('# No metrics available', {
      status: 200,
      headers: {
        'Content-Type': 'text/plain',
      },
    });
  }
}
