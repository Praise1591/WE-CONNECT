// utils/storj.js
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// Initialize Storj S3 Client
const storjClient = new S3Client({
  region: 'us-east-1',
  endpoint: process.env.NEXT_PUBLIC_STORJ_ENDPOINT || 'https://gateway.storjshare.io',
  credentials: {
    accessKeyId: process.env.NEXT_PUBLIC_STORJ_ACCESS_KEY_ID,
    secretAccessKey: process.env.NEXT_PUBLIC_STORJ_SECRET_ACCESS_KEY,
  },
  forcePathStyle: true,
});

const BUCKET_NAME = process.env.NEXT_PUBLIC_STORJ_BUCKET_NAME || 'weconnect';

/**
 * Generate a presigned URL for uploading a file directly to Storj
 */
export async function generateUploadUrl(fileName, fileType, userId, category) {
  const timestamp = Date.now();
  const uniqueId = `${timestamp}_${Math.random().toString(36).substring(2, 10)}`;
  const fileKey = `users/${userId}/materials/${category}/${uniqueId}_${fileName}`;
  
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: fileKey,
    ContentType: fileType,
  });
  
  const uploadUrl = await getSignedUrl(storjClient, command, {
    expiresIn: 3600, // 1 hour for large uploads
  });
  
  return { uploadUrl, fileKey };
}

/**
 * Generate a presigned URL for downloading a file from Storj
 */
export async function generateDownloadUrl(fileKey, expiresIn = 3600) {
  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: fileKey,
  });
  
  const downloadUrl = await getSignedUrl(storjClient, command, {
    expiresIn: expiresIn,
  });
  
  return downloadUrl;
}

/**
 * Upload preview images to Storj
 */
export async function uploadPreviewImages(images, userId, materialId) {
  const uploadPromises = images.map(async (imageFile, index) => {
    const timestamp = Date.now();
    const fileKey = `users/${userId}/materials/previews/${materialId}/${timestamp}_preview_${index + 1}.${imageFile.type.split('/')[1]}`;
    
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: fileKey,
      ContentType: imageFile.type,
    });
    
    const uploadUrl = await getSignedUrl(storjClient, command, {
      expiresIn: 1800, // 30 minutes
    });
    
    // Upload directly to Storj
    const response = await fetch(uploadUrl, {
      method: 'PUT',
      body: imageFile,
      headers: {
        'Content-Type': imageFile.type,
      },
    });
    
    if (!response.ok) {
      throw new Error(`Failed to upload preview image ${index + 1}`);
    }
    
    // Return the public URL (or generate a download URL)
    return `https://gateway.storjshare.io/${BUCKET_NAME}/${fileKey}`;
  });
  
  return Promise.all(uploadPromises);
}

/**
 * Delete a file from Storj (requires admin/backend call for security)
 * Note: This should be called from a backend API route
 */
export async function deleteFile(fileKey) {
  // This should be implemented in a backend API route for security
  // because it requires admin credentials
  const response = await fetch('/api/storj/delete', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fileKey }),
  });
  
  if (!response.ok) {
    throw new Error('Failed to delete file');
  }
  
  return response.json();
}

export { storjClient, BUCKET_NAME };