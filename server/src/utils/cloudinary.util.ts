import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';
import fs from 'fs';
import path from 'path';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export interface CloudinaryUploadResult {
  secure_url: string;
  public_id: string;
  resource_type: string;
  format: string;
  bytes: number;
}

/**
 * Upload file buffer to Cloudinary
 */
export const uploadToCloudinary = async (
  fileBuffer: Buffer,
  fileName: string,
  folder: string = 'sasakawa-uploads'
): Promise<CloudinaryUploadResult> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        public_id: `${Date.now()}-${fileName.replace(/[^a-zA-Z0-9.-]/g, '_')}`,
        resource_type: 'auto', // Automatically detect file type
        use_filename: true,
        unique_filename: true,
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else if (result) {
          resolve(result as CloudinaryUploadResult);
        } else {
          reject(new Error('Upload failed - no result returned'));
        }
      }
    );

    // Create readable stream from buffer
    const readableStream = new Readable();
    readableStream.push(fileBuffer);
    readableStream.push(null);
    
    // Pipe the stream to Cloudinary
    readableStream.pipe(uploadStream);
  });
};

/**
 * Extract public_id from Cloudinary URL
 */
export const extractPublicIdFromUrl = (url: string): string | null => {
  try {
    // Cloudinary URLs look like: https://res.cloudinary.com/{cloud}/image/upload/v1234567890/{folder}/{public_id}.{ext}
    const regex = /\/v\d+\/(.+)\.[^.]+$/;
    const match = url.match(regex);
    return match ? match[1] : null;
  } catch (error) {
    console.error('Error extracting public_id from URL:', error);
    return null;
  }
};

/**
 * Delete file from Cloudinary
 */
export const deleteFromCloudinary = async (publicId: string): Promise<void> => {
  try {
    console.log(`🗑️ Deleting from Cloudinary: ${publicId}`);
    const result = await cloudinary.uploader.destroy(publicId);
    console.log(`✅ Cloudinary deletion result:`, result);
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
    throw error;
  }
};

/**
 * Delete file from Cloudinary using URL
 */
export const deleteFromCloudinaryByUrl = async (url: string): Promise<void> => {
  const publicId = extractPublicIdFromUrl(url);
  if (publicId) {
    await deleteFromCloudinary(publicId);
  } else {
    console.warn('Could not extract public_id from URL:', url);
  }
};

/**
 * Delete local file from uploads folder
 */
export const deleteLocalFile = async (filePath: string): Promise<void> => {
  try {
    const uploadDir = process.env.UPLOAD_DIR || 'uploads';
    // Extract filename from path (e.g., /uploads/filename.jpg -> filename.jpg)
    const fileName = filePath.replace(/^\/uploads\//, '');
    const fullPath = path.join(uploadDir, fileName);
    
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
      console.log(`🗑️ Deleted local file: ${fullPath}`);
    }
  } catch (error) {
    console.error('Error deleting local file:', error);
  }
};

/**
 * Delete attachment from storage (Cloudinary or local)
 */
export const deleteAttachment = async (fileUrl: string): Promise<void> => {
  const isProduction = process.env.NODE_ENV === 'production';
  
  if (isProduction && fileUrl.includes('cloudinary.com')) {
    // Delete from Cloudinary in production
    await deleteFromCloudinaryByUrl(fileUrl);
  } else if (fileUrl.startsWith('/uploads/')) {
    // Delete local file in development
    await deleteLocalFile(fileUrl);
  }
};

/**
 * Get optimized URL for an image
 */
export const getOptimizedImageUrl = (
  publicId: string, 
  width?: number, 
  height?: number
): string => {
  return cloudinary.url(publicId, {
    width,
    height,
    crop: 'limit',
    quality: 'auto',
    fetch_format: 'auto',
  });
};

export default cloudinary;
