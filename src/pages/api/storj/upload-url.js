// app/api/storj/upload-url/route.js (or pages/api/storj/upload-url.js)
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase-admin'; // You'll need to set this up

const storjClient = new S3Client({
  region: 'us-east-1',
  endpoint: process.env.STORJ_ENDPOINT || 'https://gateway.storjshare.io',
  credentials: {
    accessKeyId: process.env.STORJ_ACCESS_KEY_ID,
    secretAccessKey: process.env.STORJ_SECRET_ACCESS_KEY,
  },
  forcePathStyle: true,
});

const BUCKET_NAME = process.env.STORJ_BUCKET_NAME || 'weconnect';

export async function POST(request) {
  try {
    // Verify Firebase Auth token
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.split('Bearer ')[1];
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Verify the token with Firebase Admin
    const decodedToken = await adminAuth.verifyIdToken(token);
    const userId = decodedToken.uid;
    
    const { fileName, fileType, category } = await request.json();
    
    if (!fileName || !fileType) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    // Create unique file key
    const timestamp = Date.now();
    const uniqueId = `${timestamp}_${Math.random().toString(36).substring(2, 10)}`;
    const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
    const fileKey = `users/${userId}/materials/${category}/${uniqueId}_${sanitizedFileName}`;
    
    // Generate presigned URL for upload
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: fileKey,
      ContentType: fileType,
    });
    
    const uploadUrl = await getSignedUrl(storjClient, command, {
      expiresIn: 3600, // 1 hour
    });
    
    return NextResponse.json({
      uploadUrl,
      fileKey,
      publicUrl: `https://gateway.storjshare.io/${BUCKET_NAME}/${fileKey}`,
    });
  } catch (error) {
    console.error('Error generating upload URL:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate upload URL' },
      { status: 500 }
    );
  }
}