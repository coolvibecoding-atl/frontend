import { fileTypeFromBuffer } from 'file-type';

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export async function validateAudioFile(
  buffer: Buffer,
  fileName: string
): Promise<ValidationResult> {
  // 1. Magic number verification
  const fileType = await fileTypeFromBuffer(buffer);
  const allowedTypes = ['audio/wav', 'audio/mpeg', 'audio/ogg', 'audio/mp4'];

  if (!fileType || !allowedTypes.includes(fileType.mime)) {
    return { isValid: false, error: 'Invalid file type' };
  }

  // 2. File size validation (prevent ZIP bombs)
  const MAX_FILE_SIZE = 500 * 1024 * 1024; // 500MB
  if (buffer.length > MAX_FILE_SIZE) {
    return { isValid: false, error: 'File too large' };
  }

  // 3. Header validation for WAV files
  if (fileType.mime === 'audio/wav') {
    const isValidWav = validateWavHeader(buffer);
    if (!isValidWav) {
      return { isValid: false, error: 'Invalid WAV format' };
    }
  }

  return { isValid: true };
}

export function validateWavHeader(buffer: Buffer): boolean {
  // Check RIFF header (bytes 0-3)
  if (buffer[0] !== 0x52 || buffer[1] !== 0x49 ||
      buffer[2] !== 0x46 || buffer[3] !== 0x46) {
    return false;
  }

  // Check WAVE header (bytes 8-11)
  if (buffer[8] !== 0x57 || buffer[9] !== 0x41 ||
      buffer[10] !== 0x56 || buffer[11] !== 0x45) {
    return false;
  }

  return true;
}
