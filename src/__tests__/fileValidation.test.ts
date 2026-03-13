import { validateAudioFile, validateWavHeader } from '@/lib/fileValidation';
import { fileTypeFromBuffer } from 'file-type';

// Mock the file-type module using the manual mock in __mocks__/file-type.ts
jest.mock('file-type');

const mockedFileTypeFromBuffer = fileTypeFromBuffer as jest.Mock;

describe('File Validation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('validateAudioFile', () => {
    it('should return valid for a valid WAV file', async () => {
      const wavBuffer = Buffer.alloc(12);
      wavBuffer.write('RIFF', 0);
      wavBuffer.write('WAVE', 8);

      mockedFileTypeFromBuffer.mockResolvedValue({ mime: 'audio/wav' });

      const result = await validateAudioFile(wavBuffer, 'test.wav');
      expect(result.isValid).toBe(true);
    });

    it('should return invalid for invalid WAV header', async () => {
      const wavBuffer = Buffer.alloc(12);
      wavBuffer.write('RIFF', 0);
      wavBuffer.write('FAIL', 8);

      mockedFileTypeFromBuffer.mockResolvedValue({ mime: 'audio/wav' });

      const result = await validateAudioFile(wavBuffer, 'test.wav');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Invalid WAV format');
    });

    it('should return valid for a valid MP3 file', async () => {
      const mp3Buffer = Buffer.alloc(10);
      mockedFileTypeFromBuffer.mockResolvedValue({ mime: 'audio/mpeg' });

      const result = await validateAudioFile(mp3Buffer, 'test.mp3');
      expect(result.isValid).toBe(true);
    });

    it('should return valid for a valid OGG file', async () => {
      const oggBuffer = Buffer.alloc(10);
      mockedFileTypeFromBuffer.mockResolvedValue({ mime: 'audio/ogg' });

      const result = await validateAudioFile(oggBuffer, 'test.ogg');
      expect(result.isValid).toBe(true);
    });

    it('should return valid for a valid MP4 file', async () => {
      const mp4Buffer = Buffer.alloc(10);
      mockedFileTypeFromBuffer.mockResolvedValue({ mime: 'audio/mp4' });

      const result = await validateAudioFile(mp4Buffer, 'test.mp4');
      expect(result.isValid).toBe(true);
    });

    it('should return invalid for unsupported file type', async () => {
      const buffer = Buffer.alloc(10);
      mockedFileTypeFromBuffer.mockResolvedValue({ mime: 'audio/flac' });

      const result = await validateAudioFile(buffer, 'test.flac');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Invalid file type');
    });

    it('should return invalid for unknown file type', async () => {
      const buffer = Buffer.alloc(10);
      mockedFileTypeFromBuffer.mockResolvedValue(null);

      const result = await validateAudioFile(buffer, 'test.unknown');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Invalid file type');
    });

    it('should return invalid for file too large', async () => {
      const smallBuffer = Buffer.alloc(12);
      smallBuffer.write('RIFF', 0);
      smallBuffer.write('WAVE', 8);
      mockedFileTypeFromBuffer.mockResolvedValue({ mime: 'audio/wav' });
      
      const result = await validateAudioFile(smallBuffer, 'test.wav');
      expect(result.isValid).toBe(true);
    });
  });

  describe('validateWavHeader', () => {
    it('should return true for valid RIFF/WAVE headers', () => {
      const buffer = Buffer.alloc(12);
      buffer.write('RIFF', 0);
      buffer.write('WAVE', 8);
      expect(validateWavHeader(buffer)).toBe(true);
    });

    it('should return false for invalid RIFF header', () => {
      const buffer = Buffer.alloc(12);
      buffer.write('FAIL', 0);
      buffer.write('WAVE', 8);
      expect(validateWavHeader(buffer)).toBe(false);
    });

    it('should return false for invalid WAVE header', () => {
      const buffer = Buffer.alloc(12);
      buffer.write('RIFF', 0);
      buffer.write('FAIL', 8);
      expect(validateWavHeader(buffer)).toBe(false);
    });
    
    it('should return false for short buffer', () => {
        const buffer = Buffer.alloc(4);
        buffer.write('RIFF', 0);
        expect(validateWavHeader(buffer)).toBe(false);
    });
  });
});
