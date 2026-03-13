// File storage service for AI Mixer Pro
// Handles local file storage for development and S3 for production

import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { promises as fs } from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";

const s3Client = new S3Client({
  region: process.env.AWS_BUCKET_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

const BUCKET_NAME = process.env.AWS_BUCKET_NAME || "ai-mixer-pro-storage";
const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

export class StorageService {
  private isProduction: boolean;
  
  constructor() {
    this.isProduction = !!(
      process.env.AWS_ACCESS_KEY_ID && 
      process.env.AWS_SECRET_ACCESS_KEY && 
      process.env.AWS_BUCKET_NAME
    );
    
    // Ensure upload directory exists in development
    if (!this.isProduction) {
      fs.mkdir(UPLOAD_DIR, { recursive: true }).catch(console.error);
    }
  }
  
  /**
   * Upload a file to storage
   * @param file - File object to upload
   * @param userId - ID of the user uploading the file
   * @returns Promise with storage information
   */
  async uploadFile(file: File, userId: string): Promise<{
    storedFilename: string;
    url: string;
    fileSize: number;
    fileType: string;
  }> {
    // Generate unique filename
    const fileExtension = file.name.split('.').pop() || '';
    const storedFilename = `${userId}/${uuidv4()}.${fileExtension}`;
    
    if (this.isProduction) {
      // Upload to S3
      const buffer = Buffer.from(await file.arrayBuffer());
      
      await s3Client.send(
        new PutObjectCommand({
          Bucket: BUCKET_NAME,
          Key: storedFilename,
          Body: buffer,
          ContentType: file.type,
        })
      );
      
      // Get URL for the uploaded file
      const url = `https://${BUCKET_NAME}.s3.amazonaws.com/${storedFilename}`;
      
      return {
        storedFilename,
        url,
        fileSize: file.size,
        fileType: file.type,
      };
    } else {
      // Store locally
      const filePath = path.join(UPLOAD_DIR, storedFilename);
      const buffer = Buffer.from(await file.arrayBuffer());
      
      await fs.writeFile(filePath, buffer);
      
      // Return local URL
      const url = `/uploads/${storedFilename}`;
      
      return {
        storedFilename,
        url,
        fileSize: file.size,
        fileType: file.type,
      };
    }
  }
  
  /**
   * Get a URL for accessing a file
   * @param storedFilename - The stored filename
   * @returns URL for accessing the file
   */
  getFileUrl(storedFilename: string): string {
    if (this.isProduction) {
      return `https://${BUCKET_NAME}.s3.amazonaws.com/${storedFilename}`;
    } else {
      return `/uploads/${storedFilename}`;
    }
  }
  
  /**
   * Delete a file from storage
   * @param storedFilename - The stored filename to delete
   */
  async deleteFile(storedFilename: string): Promise<void> {
    if (this.isProduction) {
      await s3Client.send(
        new DeleteObjectCommand({
          Bucket: BUCKET_NAME,
          Key: storedFilename,
        })
      );
    } else {
      const filePath = path.join(UPLOAD_DIR, storedFilename);
      try {
        await fs.unlink(filePath);
      } catch {
        // File might not exist, which is OK for deletion
        console.warn(`File not found for deletion: ${filePath}`);
      }
    }
  }
  
  /**
   * Get a temporary signed URL for secure file access (S3 only)
   * @param storedFilename - The stored filename
   * @param expiresIn - Seconds until URL expires (default: 3600)
   * @returns Signed URL string
   */
  async getSignedUrl(storedFilename: string, expiresIn = 3600): Promise<string> {
    if (!this.isProduction) {
      // For local storage, just return the regular URL
      return this.getFileUrl(storedFilename);
    }
    
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: storedFilename,
    });
    
    return await getSignedUrl(s3Client, command, { expiresIn });
  }
}

// Export a singleton instance
export const storageService = new StorageService();