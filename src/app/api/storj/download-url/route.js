// app/api/storj/download-url/route.js
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase-admin';

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
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.split('Bearer ')[1];
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const decodedToken = await adminAuth.verifyIdToken(token);
    const userId = decodedToken.uid;
    
    const { fileKey, expiresIn = 3600 } = await request.json();
    
    if (!fileKey) {
      return NextResponse.json({ error: 'Missing fileKey' }, { status: 400 });
    }
    
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: fileKey,
    });
    
    const downloadUrl = await getSignedUrl(storjClient, command, {
      expiresIn: expiresIn,
    });
    
    return NextResponse.json({ downloadUrl });
  } catch (error) {
    console.error('Error generating download URL:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate download URL' },
      { status: 500 }
    );
  }
}
