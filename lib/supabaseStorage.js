/* eslint-disable */
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVteW5xcWx5cWx5cWx5cWx5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTg4ODg4ODgsImV4cCI6MjAxNDQ2NDg4OH0.MOCK_KEY';

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

/**
 * Upload a file to Supabase Storage
 * @param {string} filePath - Local file path to upload
 * @param {string} bucketName - Supabase bucket name (default: 'audio-files')
 * @param {string} fileName - Name for the file in storage
 * @returns {Promise<string>} URL of uploaded file
 */
async function uploadFile(filePath, bucketName = 'audio-files', fileName = null) {
  try {
    // Create bucket if it doesn't exist
    const { data: bucketExists } = await supabase.storage.getBucket(bucketName);
    if (!bucketExists) {
      await supabase.storage.createBucket(bucketName, {
        public: false,
        fileSizeLimit: '100mb',
        allowedMimeTypes: ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp4', 'audio/webm']
      });
    }

    // Read file
    const fileBuffer = fs.readFileSync(filePath);
    const fileStats = fs.statSync(filePath);

    // Use original filename or provided name
    const finalFileName = fileName || path.basename(filePath);

    // Upload file
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(finalFileName, fileBuffer, {
        contentType: getMimeType(filePath),
        upsert: true
      });

    if (error) {
      throw new Error(`Upload failed: ${error.message}`);
    }

    // Get public URL
    const { data: urlData } = await supabase.storage
      .from(bucketName)
      .getPublicUrl(finalFileName);

    return urlData.publicUrl;
  } catch (error) {
    console.error('Supabase upload error:', error);
    throw error;
  }
}

/**
 * Upload audio buffer to Supabase Storage
 * @param {Buffer} buffer - Audio buffer to upload
 * @param {string} fileName - Name for the file in storage
 * @param {string} bucketName - Supabase bucket name
 * @returns {Promise<string>} URL of uploaded file
 */
async function uploadBuffer(buffer, fileName, bucketName = 'audio-files') {
  try {
    // Create bucket if it doesn't exist
    const { data: bucketExists } = await supabase.storage.getBucket(bucketName);
    if (!bucketExists) {
      await supabase.storage.createBucket(bucketName, {
        public: false,
        fileSizeLimit: '100mb',
        allowedMimeTypes: ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp4', 'audio/webm']
      });
    }

    // Upload buffer
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(fileName, buffer, {
        contentType: getMimeType(fileName),
        upsert: true
      });

    if (error) {
      throw new Error(`Upload failed: ${error.message}`);
    }

    // Get public URL
    const { data: urlData } = await supabase.storage
      .from(bucketName)
      .getPublicUrl(fileName);

    return urlData.publicUrl;
  } catch (error) {
    console.error('Supabase buffer upload error:', error);
    throw error;
  }
}

/**
 * Get a signed URL for a file in Supabase Storage
 * @param {string} fileName - Name of the file in storage
 * @param {string} bucketName - Supabase bucket name
 * @param {number} expiresIn - Expiration time in seconds (default: 1 hour)
 * @returns {Promise<string>} Signed URL
 */
async function getSignedUrl(fileName, bucketName = 'audio-files', expiresIn = 3600) {
  try {
    const { data, error } = await supabase.storage
      .from(bucketName)
      .createSignedUrl(fileName, expiresIn);

    if (error) {
      throw new Error(`Failed to create signed URL: ${error.message}`);
    }

    return data.signedUrl;
  } catch (error) {
    console.error('Supabase signed URL error:', error);
    throw error;
  }
}

/**
 * Download a file from Supabase Storage
 * @param {string} fileName - Name of the file in storage
 * @param {string} bucketName - Supabase bucket name
 * @param {string} localPath - Local path to save the file
 * @returns {Promise<void>}
 */
async function downloadFile(fileName, bucketName = 'audio-files', localPath = null) {
  try {
    const { data, error } = await supabase.storage
      .from(bucketName)
      .download(fileName);

    if (error) {
      throw new Error(`Download failed: ${error.message}`);
    }

    // Save to local path if provided
    if (localPath) {
      const buffer = await data.arrayBuffer();
      fs.writeFileSync(localPath, Buffer.from(buffer));
      return localPath;
    }

    // Return buffer
    return Buffer.from(await data.arrayBuffer());
  } catch (error) {
    console.error('Supabase download error:', error);
    throw error;
  }
}

/**
 * Delete a file from Supabase Storage
 * @param {string} fileName - Name of the file in storage
 * @param {string} bucketName - Supabase bucket name
 * @returns {Promise<boolean>} Success status
 */
async function deleteFile(fileName, bucketName = 'audio-files') {
  try {
    const { error } = await supabase.storage
      .from(bucketName)
      .remove([fileName]);

    if (error) {
      throw new Error(`Delete failed: ${error.message}`);
    }

    return true;
  } catch (error) {
    console.error('Supabase delete error:', error);
    throw error;
  }
}

/**
 * Get file metadata from Supabase Storage
 * @param {string} fileName - Name of the file in storage
 * @param {string} bucketName - Supabase bucket name
 * @returns {Promise<Object>} File metadata
 */
async function getFileMetadata(fileName, bucketName = 'audio-files') {
  try {
    const { data, error } = await supabase.storage
      .from(bucketName)
      .list('', {
        search: fileName
      });

    if (error) {
      throw new Error(`Failed to get metadata: ${error.message}`);
    }

    const file = data.find(f => f.name === fileName);
    return file || null;
  } catch (error) {
    console.error('Supabase metadata error:', error);
    throw error;
  }
}

/**
 * Get MIME type from file extension
 * @param {string} fileName - File name or path
 * @returns {string} MIME type
 */
function getMimeType(fileName) {
  const ext = path.extname(fileName).toLowerCase();
  const mimeTypes = {
    '.mp3': 'audio/mpeg',
    '.wav': 'audio/wav',
    '.ogg': 'audio/ogg',
    '.m4a': 'audio/mp4',
    '.aac': 'audio/mp4',
    '.webm': 'audio/webm',
    '.flac': 'audio/flac'
  };
  return mimeTypes[ext] || 'application/octet-stream';
}

module.exports = {
  uploadFile,
  uploadBuffer,
  getSignedUrl,
  downloadFile,
  deleteFile,
  getFileMetadata,
  supabase
};