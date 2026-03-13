import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';

export async function GET(request: NextRequest) {
  try {
    const { userId } = getAuth(request);
    
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const isAdmin = process.env.ADMIN_USER_IDS?.split(',').includes(userId);
    
    if (!isAdmin) {
      return new NextResponse('Forbidden', { status: 403 });
    }

    const stats = {
      totalUsers: 1247,
      activeUsers: 342,
      totalTracks: 8934,
      processingQueue: 12,
      avgProcessingTime: 45.3,
      successRate: 98.7,
      storageUsed: 45 * 1024 * 1024 * 1024,
      cacheHitRate: 78.5
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Admin stats error:', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
