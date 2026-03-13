import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { PrismaClient } from '@prisma/client';
import { randomBytes } from 'crypto';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await request.json();
    const { trackId, maxDownloads, expiresInDays } = body;

    if (!trackId) {
      return new NextResponse('Track ID required', { status: 400 });
    }

    const track = await prisma.track.findFirst({
      where: {
        id: trackId,
        userId,
      },
    });

    if (!track) {
      return new NextResponse('Track not found', { status: 404 });
    }

    if (track.status !== 'COMPLETED') {
      return new NextResponse('Track must be processed before sharing', { status: 400 });
    }

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + (expiresInDays || 30));

    const shareLink = await prisma.shareLink.create({
      data: {
        trackId: track.id,
        token: randomBytes(32).toString('hex'),
        expiresAt,
        maxDownloads: maxDownloads || 10,
      },
    });

    return NextResponse.json({
      shareUrl: `/share/${shareLink.token}`,
      expiresAt: shareLink.expiresAt,
      maxDownloads: shareLink.maxDownloads,
    });
  } catch (error) {
    console.error('Share creation error:', error);
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
    const trackId = url.searchParams.get('trackId');

    const where = trackId ? { track: { userId }, trackId } : { track: { userId } };

    const shareLinks = await prisma.shareLink.findMany({
      where,
      include: {
        track: {
          select: {
            id: true,
            name: true,
            status: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ shareLinks });
  } catch (error) {
    console.error('Share list error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const url = new URL(request.url);
    const shareId = url.searchParams.get('id');

    if (!shareId) {
      return new NextResponse('Share ID required', { status: 400 });
    }

    const shareLink = await prisma.shareLink.findFirst({
      where: {
        id: shareId,
        track: { userId },
      },
    });

    if (!shareLink) {
      return new NextResponse('Share link not found', { status: 404 });
    }

    await prisma.shareLink.delete({
      where: { id: shareId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Share delete error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
