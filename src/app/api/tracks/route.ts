import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const url = new URL(request.url);
    const includeLogs = url.searchParams.get('includeLogs') === 'true';

    const tracks = await prisma.track.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: includeLogs ? {
        processingLogs: {
          orderBy: { startedAt: 'asc' },
        },
      } : undefined,
    });

    return NextResponse.json({ tracks });
  } catch (error) {
    console.error('Fetch tracks error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
