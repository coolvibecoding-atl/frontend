import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { storageService } from '@/lib/storage';
import { prisma } from '@/lib/prisma';
import { validateAudioFile } from '@/lib/fileValidation';

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return new NextResponse('No file provided', { status: 400 });
    }

    // Read file into buffer for validation
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Validate file using the new validation logic
    const validationResult = await validateAudioFile(buffer, file.name);

    if (!validationResult.isValid) {
      return new NextResponse(validationResult.error || 'Invalid file', { status: 400 });
    }

    // Store the file
    const storageResult = await storageService.uploadFile(file, userId);

    // Create track record in database
    const track = await prisma.track.create({
      data: {
        userId,
        name: file.name,
        filename: file.name, // original filename
        storedFilename: storageResult.storedFilename, // stored filename
        fileSize: file.size,
        fileType: file.type,
        status: 'UPLOADED',
        progress: 0,
      },
    });

    return NextResponse.json({
      success: true,
      trackId: track.id,
      message: 'File uploaded successfully',
      track: {
        id: track.id,
        name: track.name,
        fileSize: track.fileSize,
        status: track.status,
      }
    });
  } catch (error) {
    console.error('Upload error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
