import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { PrismaClient } from '@prisma/client';
import path from 'path';
import fs from 'fs';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await request.json();
    const { trackId, stemType } = body;

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
      return new NextResponse('Track processing not complete', { status: 400 });
    }

    const uploadDir = process.env.UPLOAD_DIR || path.join(process.cwd(), 'uploads');
    const stemsDir = path.join(uploadDir, track.id, 'stems');
    
    let fileName: string = 'full.wav';
    let filePath: string = '';

    if (stemType === 'all') {
      const zipPath = path.join(uploadDir, track.id, 'stems.zip');
      if (fs.existsSync(zipPath)) {
        return NextResponse.json({
          downloadUrl: `/api/download?file=${track.id}/stems.zip`,
          fileName: `${track.name}-stems.zip`,
        });
      }
      return new NextResponse('Stems not available', { status: 404 });
    }

    const stemFileNames: Record<string, string> = {
      drums: 'drums.wav',
      bass: 'bass.wav',
      vocals: 'vocals.wav',
      other: 'other.wav',
      full: 'full.wav',
    };

    fileName = stemFileNames[stemType] || 'full.wav';
    filePath = path.join(stemsDir, fileName);

    if (!fs.existsSync(filePath)) {
      return new NextResponse('Stem file not found', { status: 404 });
    }

    return NextResponse.json({
      downloadUrl: `/api/download?file=${track.id}/stems/${fileName}`,
      fileName: `${track.name}-${stemType || 'full'}.wav`,
    });
  } catch (error) {
    console.error('Export error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
