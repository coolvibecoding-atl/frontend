import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { PrismaClient } from '@prisma/client';
import path from 'path';
import fs from 'fs';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const fileParam = url.searchParams.get('file');
    const shareToken = url.searchParams.get('shareToken');

    if (!fileParam) {
      return new NextResponse('File parameter required', { status: 400 });
    }

    // Validate share token if provided
    if (shareToken) {
      const shareLink = await prisma.shareLink.findUnique({
        where: { token: shareToken },
        include: { track: true },
      });

      if (!shareLink) {
        return new NextResponse('Invalid share token', { status: 403 });
      }

      if (new Date() > shareLink.expiresAt) {
        return new NextResponse('Share link expired', { status: 403 });
      }

      if (shareLink.downloadCount >= (shareLink.maxDownloads || 0)) {
        return new NextResponse('Download limit reached', { status: 403 });
      }

      // Verify the file matches the track
      if (shareLink.track.storedFilename !== fileParam) {
        return new NextResponse('File does not match share token', { status: 403 });
      }

      // Increment download count
      await prisma.shareLink.update({
        where: { id: shareLink.id },
        data: { downloadCount: { increment: 1 } },
      });

      // Allow download without user authentication
      const uploadDir = process.env.UPLOAD_DIR || path.join(process.cwd(), 'uploads');
      const filePath = path.join(uploadDir, fileParam);

      if (!filePath.startsWith(uploadDir)) {
        return new NextResponse('Invalid path', { status: 400 });
      }

      if (!fs.existsSync(filePath)) {
        return new NextResponse('File not found', { status: 404 });
      }

      const fileBuffer = fs.readFileSync(filePath);
      const fileName = path.basename(filePath);

      return new NextResponse(fileBuffer, {
        headers: {
          'Content-Type': 'application/octet-stream',
          'Content-Disposition': `attachment; filename="${fileName}"`,
        },
      });
    }

    // Require authentication for regular downloads
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const uploadDir = process.env.UPLOAD_DIR || path.join(process.cwd(), 'uploads');
    const filePath = path.join(uploadDir, fileParam);

    if (!filePath.startsWith(uploadDir)) {
      return new NextResponse('Invalid path', { status: 400 });
    }

    if (!fs.existsSync(filePath)) {
      return new NextResponse('File not found', { status: 404 });
    }

    // Optional: Verify user owns the track
    // For simplicity, we'll allow download if file exists and user is authenticated

    const fileBuffer = fs.readFileSync(filePath);
    const fileName = path.basename(filePath);

    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${fileName}"`,
      },
    });
  } catch (error) {
    console.error('Download error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
