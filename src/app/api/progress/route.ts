import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// In-memory store for progress updates (in production, use Redis or similar)
const progressListeners = new Map<string, Set<ReadableStreamDefaultController>>();

export async function GET(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const url = new URL(request.url);
  const trackId = url.searchParams.get('trackId');

  if (!trackId) {
    return new NextResponse('Track ID required', { status: 400 });
  }

  // Verify user owns this track
  const track = await prisma.track.findFirst({
    where: {
      id: trackId,
      userId,
    },
  });

  if (!track) {
    return new NextResponse('Track not found', { status: 404 });
  }

  // Create SSE stream
  const stream = new ReadableStream({
    start(controller) {
      // Add listener
      if (!progressListeners.has(trackId)) {
        progressListeners.set(trackId, new Set());
      }
      progressListeners.get(trackId)!.add(controller);

      // Send initial status
      controller.enqueue(
        `data: ${JSON.stringify({
          type: 'status',
          trackId,
          status: track.status,
          progress: track.progress,
        })}\n\n`
      );

      // Clean up on close
      request.signal.addEventListener('abort', () => {
        progressListeners.get(trackId)?.delete(controller);
      });
    },
  });

  return new NextResponse(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const body = await request.json();
  const { trackId, progress, status, step, error } = body;

  if (!trackId) {
    return new NextResponse('Track ID required', { status: 400 });
  }

  // Update track in database
  try {
    await prisma.track.update({
      where: { id: trackId, userId },
      data: {
        progress: progress ?? undefined,
        status: status ?? undefined,
        updatedAt: new Date(),
      },
    });

    // Broadcast to listeners
    const listeners = progressListeners.get(trackId);
    if (listeners) {
      const message = JSON.stringify({
        type: 'progress',
        trackId,
        progress,
        status,
        step,
        error,
        timestamp: new Date().toISOString(),
      });

      listeners.forEach((controller) => {
        try {
          controller.enqueue(`data: ${message}\n\n`);
        } catch (error) {
          // Controller might be closed
          listeners.delete(controller);
        }
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to update track progress:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}