import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { addAudioJob } from '@/lib/audio-queue';

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await request.json();
    const { trackId, storedFilename, filename, fileType } = body;

    if (!trackId || !storedFilename) {
      return new NextResponse('Missing required fields', { status: 400 });
    }

    const jobId = await addAudioJob({
      trackId,
      userId,
      filename,
      storedFilename,
      fileType,
    });

    return NextResponse.json({
      success: true,
      jobId,
      message: 'Processing job queued',
    });
  } catch (error) {
    console.error('Queue error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
