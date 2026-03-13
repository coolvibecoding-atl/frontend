import { POST } from '@/app/api/upload/route';
import { auth } from '@clerk/nextjs/server';
import { validateAudioFile } from '@/lib/fileValidation';
import { storageService } from '@/lib/storage';
import { prisma } from '@/lib/prisma';

// Mock dependencies
jest.mock('@clerk/nextjs/server', () => ({
  auth: jest.fn(),
}));

jest.mock('@/lib/fileValidation', () => ({
  validateAudioFile: jest.fn(),
}));

jest.mock('@/lib/storage', () => ({
  storageService: {
    uploadFile: jest.fn(),
  },
}));

jest.mock('@/lib/prisma', () => ({
  prisma: {
    track: {
      create: jest.fn(),
    },
  },
}));

describe('POST /api/upload', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Authentication', () => {
    it('should reject unauthorized requests', async () => {
      // @ts-expect-error - Mocking auth response
      auth.mockResolvedValue({ userId: null });

      const formData = new FormData();
      const file = new File(['test'], 'test.wav', { type: 'audio/wav' });
      formData.append('file', file);

      const request = new Request('http://localhost/api/upload', {
        method: 'POST',
        body: formData,
      });

      const response = await POST(request);
      expect(response.status).toBe(401);
    });

    it('should allow authorized requests', async () => {
      // @ts-expect-error - Mocking auth response
      auth.mockResolvedValue({ userId: 'user_123' });
      // @ts-expect-error - Mocking validateAudioFile response
      validateAudioFile.mockResolvedValue({ isValid: true });
      // @ts-expect-error - Mocking storage service response
      storageService.uploadFile.mockResolvedValue({
        storedFilename: 'stored_test.wav',
        url: 'https://example.com/stored_test.wav',
        fileSize: 1024,
        fileType: 'audio/wav',
      });
      // @ts-expect-error - Mocking prisma response
      prisma.track.create.mockResolvedValue({
        id: 'track_123',
        name: 'test.wav',
        filename: 'test.wav',
        storedFilename: 'stored_test.wav',
        userId: 'user_123',
        fileSize: 1024,
        fileType: 'audio/wav',
        status: 'UPLOADED',
        progress: 0,
        duration: null,
        waveformData: null,
        stemCount: 0,
        processedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const formData = new FormData();
      const file = new File(['test'], 'test.wav', { type: 'audio/wav' });
      formData.append('file', file);

      const request = new Request('http://localhost/api/upload', {
        method: 'POST',
        body: formData,
      });

      const response = await POST(request);
      expect(response.status).toBe(200);
    });
  });

  describe('File Validation', () => {
    it('should reject requests without files', async () => {
      // @ts-expect-error - Mocking auth response
      auth.mockResolvedValue({ userId: 'user_123' });

      const formData = new FormData();

      const request = new Request('http://localhost/api/upload', {
        method: 'POST',
        body: formData,
      });

      const response = await POST(request);
      expect(response.status).toBe(400);
      const text = await response.text();
      expect(text).toContain('No file provided');
    });

    it('should validate file type', async () => {
      // @ts-expect-error - Mocking auth response
      auth.mockResolvedValue({ userId: 'user_123' });
      // @ts-expect-error - Mocking validateAudioFile response
      validateAudioFile.mockResolvedValue({
        isValid: false,
        error: 'Invalid file type',
      });

      const formData = new FormData();
      const file = new File(['fake data'], 'test.exe', { type: 'application/x-msdownload' });
      formData.append('file', file);

      const request = new Request('http://localhost/api/upload', {
        method: 'POST',
        body: formData,
      });

      const response = await POST(request);
      expect(response.status).toBe(400);
    });

    it('should reject invalid file types', async () => {
      // @ts-expect-error - Mocking auth response
      auth.mockResolvedValue({ userId: 'user_123' });
      // @ts-expect-error - Mocking validateAudioFile response
      validateAudioFile.mockResolvedValue({
        isValid: false,
        error: 'Invalid file type',
      });

      const formData = new FormData();
      const file = new File(['fake data'], 'test.txt', { type: 'text/plain' });
      formData.append('file', file);

      const request = new Request('http://localhost/api/upload', {
        method: 'POST',
        body: formData,
      });

      const response = await POST(request);
      expect(response.status).toBe(400);
    });
  });

  describe('File Size Limits', () => {
    it('should enforce maximum file size', async () => {
      // @ts-expect-error - Mocking auth response
      auth.mockResolvedValue({ userId: 'user_123' });
      // @ts-expect-error - Mocking validateAudioFile response
      validateAudioFile.mockResolvedValue({
        isValid: false,
        error: 'File too large',
      });

      // Create 600MB file
      const largeFileContent = new ArrayBuffer(600 * 1024 * 1024);
      const formData = new FormData();
      const file = new File([largeFileContent], 'large.wav', { type: 'audio/wav' });
      formData.append('file', file);

      const request = new Request('http://localhost/api/upload', {
        method: 'POST',
        body: formData,
      });

      const response = await POST(request);
      expect(response.status).toBe(400);
    });

    it('should accept files under size limit', async () => {
      // @ts-expect-error - Mocking auth response
      auth.mockResolvedValue({ userId: 'user_123' });
      // @ts-expect-error - Mocking validateAudioFile response
      validateAudioFile.mockResolvedValue({ isValid: true });
      // @ts-expect-error - Mocking storage service response
      storageService.uploadFile.mockResolvedValue({
        storedFilename: 'stored_test.wav',
        url: 'https://example.com/stored_test.wav',
        fileSize: 1024,
        fileType: 'audio/wav',
      });
      // @ts-expect-error - Mocking prisma response
      prisma.track.create.mockResolvedValue({
        id: 'track_123',
        name: 'test.wav',
        filename: 'test.wav',
        storedFilename: 'stored_test.wav',
        userId: 'user_123',
        fileSize: 1024,
        fileType: 'audio/wav',
        status: 'UPLOADED',
        progress: 0,
        duration: null,
        waveformData: null,
        stemCount: 0,
        processedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const formData = new FormData();
      const file = new File(['small audio data'], 'test.wav', { type: 'audio/wav' });
      formData.append('file', file);

      const request = new Request('http://localhost/api/upload', {
        method: 'POST',
        body: formData,
      });

      const response = await POST(request);
      expect(response.status).toBe(200);
    });
  });

  describe('File Processing', () => {
    it('should upload file to storage service', async () => {
      // @ts-expect-error - Mocking auth response
      auth.mockResolvedValue({ userId: 'user_123' });
      // @ts-expect-error - Mocking validateAudioFile response
      validateAudioFile.mockResolvedValue({ isValid: true });
      // @ts-expect-error - Mocking storage service response
      storageService.uploadFile.mockResolvedValue({
        storedFilename: 'stored_test.wav',
        url: 'https://example.com/stored_test.wav',
        fileSize: 1024,
        fileType: 'audio/wav',
      });
      // @ts-expect-error - Mocking prisma response
      prisma.track.create.mockResolvedValue({
        id: 'track_123',
        name: 'test.wav',
        filename: 'test.wav',
        storedFilename: 'stored_test.wav',
        userId: 'user_123',
        fileSize: 1024,
        fileType: 'audio/wav',
        status: 'UPLOADED',
        progress: 0,
        duration: null,
        waveformData: null,
        stemCount: 0,
        processedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const formData = new FormData();
      const file = new File(['test audio data'], 'test.wav', { type: 'audio/wav' });
      formData.append('file', file);

      const request = new Request('http://localhost/api/upload', {
        method: 'POST',
        body: formData,
      });

      await POST(request);

      expect(storageService.uploadFile).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'test.wav' }),
        'user_123'
      );
    });

    it('should create track record in database', async () => {
      // @ts-expect-error - Mocking auth response
      auth.mockResolvedValue({ userId: 'user_123' });
      // @ts-expect-error - Mocking validateAudioFile response
      validateAudioFile.mockResolvedValue({ isValid: true });
      // @ts-expect-error - Mocking storage service response
      storageService.uploadFile.mockResolvedValue({
        storedFilename: 'stored_test.wav',
        url: 'https://example.com/stored_test.wav',
        fileSize: 1024,
        fileType: 'audio/wav',
      });
      // @ts-expect-error - Mocking prisma response
      prisma.track.create.mockResolvedValue({
        id: 'track_123',
        name: 'test.wav',
        filename: 'test.wav',
        storedFilename: 'stored_test.wav',
        userId: 'user_123',
        fileSize: 1024,
        fileType: 'audio/wav',
        status: 'UPLOADED',
        progress: 0,
        duration: null,
        waveformData: null,
        stemCount: 0,
        processedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const formData = new FormData();
      const file = new File(['test audio data'], 'test.wav', { type: 'audio/wav' });
      formData.append('file', file);

      const request = new Request('http://localhost/api/upload', {
        method: 'POST',
        body: formData,
      });

      await POST(request);

      expect(prisma.track.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          userId: 'user_123',
          name: 'test.wav',
          filename: 'test.wav',
          storedFilename: 'stored_test.wav',
          status: 'UPLOADED',
          progress: 0,
        }),
      });
    });

    it('should return success response with track info', async () => {
      // @ts-expect-error - Mocking auth response
      auth.mockResolvedValue({ userId: 'user_123' });
      // @ts-expect-error - Mocking validateAudioFile response
      validateAudioFile.mockResolvedValue({ isValid: true });
      // @ts-expect-error - Mocking storage service response
      storageService.uploadFile.mockResolvedValue({
        storedFilename: 'stored_test.wav',
        url: 'https://example.com/stored_test.wav',
        fileSize: 1024,
        fileType: 'audio/wav',
      });
      // @ts-expect-error - Mocking prisma response
      prisma.track.create.mockResolvedValue({
        id: 'track_123',
        name: 'test.wav',
        filename: 'test.wav',
        storedFilename: 'stored_test.wav',
        userId: 'user_123',
        fileSize: 1024,
        fileType: 'audio/wav',
        status: 'UPLOADED',
        progress: 0,
        duration: null,
        waveformData: null,
        stemCount: 0,
        processedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const formData = new FormData();
      const file = new File(['test audio data'], 'test.wav', { type: 'audio/wav' });
      formData.append('file', file);

      const request = new Request('http://localhost/api/upload', {
        method: 'POST',
        body: formData,
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.trackId).toBe('track_123');
      expect(data.message).toBe('File uploaded successfully');
    });
  });

  describe('Error Handling', () => {
    it('should handle storage service errors', async () => {
      // @ts-expect-error - Mocking auth response
      auth.mockResolvedValue({ userId: 'user_123' });
      // @ts-expect-error - Mocking validateAudioFile response
      validateAudioFile.mockResolvedValue({ isValid: true });
      // @ts-expect-error - Mocking storage service error
      storageService.uploadFile.mockRejectedValue(
        new Error('Storage service error')
      );

      const formData = new FormData();
      const file = new File(['test audio data'], 'test.wav', { type: 'audio/wav' });
      formData.append('file', file);

      const request = new Request('http://localhost/api/upload', {
        method: 'POST',
        body: formData,
      });

      const response = await POST(request);
      expect(response.status).toBe(500);
    });

    it('should handle database errors', async () => {
      // @ts-expect-error - Mocking auth response
      auth.mockResolvedValue({ userId: 'user_123' });
      // @ts-expect-error - Mocking validateAudioFile response
      validateAudioFile.mockResolvedValue({ isValid: true });
      // @ts-expect-error - Mocking storage service response
      storageService.uploadFile.mockResolvedValue({
        storedFilename: 'stored_test.wav',
        url: 'https://example.com/stored_test.wav',
        fileSize: 1024,
        fileType: 'audio/wav',
      });
      // @ts-expect-error - Mocking prisma error
      prisma.track.create.mockRejectedValue(new Error('Database error'));

      const formData = new FormData();
      const file = new File(['test audio data'], 'test.wav', { type: 'audio/wav' });
      formData.append('file', file);

      const request = new Request('http://localhost/api/upload', {
        method: 'POST',
        body: formData,
      });

      const response = await POST(request);
      expect(response.status).toBe(500);
    });

    it('should handle unexpected errors', async () => {
      // @ts-expect-error - Mocking auth error
      auth.mockRejectedValue(new Error('Unexpected error'));

      const formData = new FormData();
      const file = new File(['test audio data'], 'test.wav', { type: 'audio/wav' });
      formData.append('file', file);

      const request = new Request('http://localhost/api/upload', {
        method: 'POST',
        body: formData,
      });

      const response = await POST(request);
      expect(response.status).toBe(500);
    });
  });
});
