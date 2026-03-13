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

    const activity = [
      {
        id: '1',
        type: 'upload',
        user: 'user@example.com',
        track: 'Track_001.wav',
        status: 'success',
        timestamp: new Date(Date.now() - 60000).toISOString()
      },
      {
        id: '2',
        type: 'process',
        user: 'user2@example.com',
        track: 'Track_002.wav',
        status: 'success',
        timestamp: new Date(Date.now() - 120000).toISOString()
      },
      {
        id: '3',
        type: 'download',
        user: 'user3@example.com',
        track: 'Track_003.wav',
        status: 'success',
        timestamp: new Date(Date.now() - 180000).toISOString()
      },
      {
        id: '4',
        type: 'process',
        user: 'user4@example.com',
        track: 'Track_004.wav',
        status: 'failed',
        timestamp: new Date(Date.now() - 240000).toISOString()
      },
      {
        id: '5',
        type: 'upload',
        user: 'user5@example.com',
        track: 'Track_005.wav',
        status: 'pending',
        timestamp: new Date(Date.now() - 300000).toISOString()
      }
    ];

    return NextResponse.json(activity);
  } catch (error) {
    console.error('Admin activity error:', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
