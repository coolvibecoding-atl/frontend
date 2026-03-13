import { v4 as uuidv4 } from 'uuid';
import { createHash } from 'crypto';
import { cookies } from 'next/headers';

export class CSRFProtection {
  private static secret = process.env.CSRF_SECRET || uuidv4();
  
  static generateToken(sessionId: string): string {
    const data = `${sessionId}:${Date.now()}:${uuidv4()}`;
    const hash = createHash('sha256')
      .update(data + this.secret)
      .digest('hex');
    return Buffer.from(`${data}:${hash}`).toString('base64');
  }
  
  static validateToken(token: string, sessionId: string): boolean {
    try {
      const decoded = Buffer.from(token, 'base64').toString('utf-8');
      const [data, hash] = decoded.split(':');
      const expectedHash = createHash('sha256')
        .update(data + this.secret)
        .digest('hex');
      
      return hash === expectedHash && data.startsWith(sessionId);
    } catch {
      return false;
    }
  }
}

// Middleware for Next.js App Router
export function csrfMiddleware(handler: (request: Request) => Promise<Response>) {
  return async (request: Request): Promise<Response> => {
    if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(request.method)) {
      const csrfToken = request.headers.get('x-csrf-token');
      const sessionToken = request.headers.get('x-session-token') || 
                          (await cookies()).get('session-token')?.value;
      
      if (!csrfToken || !sessionToken || 
          !CSRFProtection.validateToken(csrfToken, sessionToken)) {
        return new Response('Invalid CSRF token', { status: 403 });
      }
    }
    
    return handler(request);
  };
}