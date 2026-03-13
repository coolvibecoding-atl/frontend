import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { PrismaClient, Track } from '@prisma/client';
import { addAudioJob } from '@/lib/audio-queue';

const prisma = new PrismaClient();

interface BatchResult {
  trackId: string;
  trackName: string;
  status: string;
  jobId?: string;
  error?: string;
}

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await request.json();
    const { trackIds } = body;

    if (!trackIds || !Array.isArray(trackIds) || trackIds.length === 0) {
      return new NextResponse('Track IDs array required', { status: 400 });
    }

    const tracks = await prisma.track.findMany({
      where: {
        id: { in: trackIds },
        userId,
      },
    });

    if (tracks.length === 0) {
      return new NextResponse('No valid tracks found', { status: 404 });
    }

    const pendingTracks = tracks.filter((t: Track) => t.status === 'UPLOADED');
    
    if (pendingTracks.length === 0) {
      return new NextResponse('No tracks available for processing', { status: 400 });
    }

    const results: BatchResult[] = await Promise.all(
      pendingTracks.map(async (track: Track) => {
        try {
          const jobId = await addAudioJob({
            trackId: track.id,
            userId,
            filename: track.filename,
            storedFilename: track.storedFilename,
            fileType: track.fileType,
          });

          await prisma.track.update({
            where: { id: track.id },
            data: { status: 'PROCESSING' },
          });

          return {
            trackId: track.id,
            trackName: track.name,
            status: 'queued',
            jobId,
          };
        } catch (error) {
          return {
            trackId: track.id,
            trackName: track.name,
            status: 'error',
            error: error instanceof Error ? error.message : 'Unknown error',
          };
        }
      })
    );

    const successCount = results.filter((r: BatchResult) => r.status === 'queued').length;

    return NextResponse.json({
      message: `Queued ${successCount} of ${trackIds.length} tracks for processing`,
      results,
      summary: {
        total: trackIds.length,
        queued: successCount,
        failed: results.filter((r: BatchResult) => r.status === 'error').length,
        skipped: tracks.length - pendingTracks.length,
      },
    });
  } catch (error) {
    console.error('Batch processing error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const url = new URL(request.url);
    const status = url.searchParams.get('status');

    const where: Record<string, string> = { userId };
    if (status) {
      where.status = status;
    }

    const tracks = await prisma.track.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        status: true,
        progress: true,
        stemCount: true,
        createdAt: true,
        processedAt: true,
      },
    });

     const processing = tracks.filter((t) => t.status === 'PROCESSING' || t.status === 'QUEUED') as unknown as Array<{ status: string; id: string; createdAt: Date; name: string; progress: number; stemCount: number; processedAt: Date | null; userId: string; updatedAt: Date; filename: string; storedFilename: string; fileSize: number; fileType: string; duration: number | null; waveformData: string | null }>;
     const completed = tracks.filter((t) => t.status === 'COMPLETED') as unknown as Array<{ status: string; id: string; createdAt: Date; name: string; progress: number; stemCount: number; processedAt: Date | null; userId: string; updatedAt: Date; filename: string; storedFilename: string; fileSize: number; fileType: string; duration: number | null; waveformData: string | null }>;
     const pending = tracks.filter((t) => t.status === 'UPLOADED') as unknown as Array<{ status: string; id: string; createdAt: Date; name: string; progress: number; stemCount: number; processedAt: Date | null; userId: string; updatedAt: Date; filename: string; storedFilename: string; fileSize: number; fileType: string; duration: number | null; waveformData: string | null }>;

    return NextResponse.json({
      tracks,
      summary: {
        processing: processing.length,
        completed: completed.length,
        pending: pending.length,
        total: tracks.length,
      },
    });
  } catch (error) {
    console.error('Batch status error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
