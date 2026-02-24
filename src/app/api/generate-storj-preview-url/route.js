// pages/api/generate-storj-preview-url.js
// (or app/api/generate-storj-preview-url/route.js if using App Router)

import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3Client = new S3Client({
  region: 'auto',                           // Storj requires 'auto'
  endpoint: 'https://gateway.storjshare.io',
  // If you know your bucket is in a specific region, you can try:
  // endpoint: 'https://gateway.eu1.storjshare.io',
  // endpoint: 'https://gateway.us1.storjshare.io',
  // endpoint: 'https://gateway.ap1.storjshare.io',
  credentials: {
    accessKeyId:     process.env.STORJ_ACCESS_KEY,
    secretAccessKey: process.env.STORJ_SECRET_KEY,
  },
  forcePathStyle: true,
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Log incoming request (helps debugging)
  console.log('[preview-route] request body:', {
    fileKey: req.body?.fileKey,
    bucket:  req.body?.bucket,
    isPreview: req.body?.isPreview,
    category: req.body?.category,
  });

  try {
    const { fileKey, bucket, isPreview = false, category } = req.body;

    if (!fileKey || !bucket) {
      return res.status(400).json({ error: 'Missing fileKey or bucket' });
    }

    // Safety check – credentials must be present
    if (!process.env.STORJ_ACCESS_KEY || !process.env.STORJ_SECRET_KEY) {
      console.error('Storj credentials are missing from environment variables');
      return res.status(500).json({
        error: 'Server configuration error: Storj credentials not set'
      });
    }

    const expiresIn = isPreview ? 600 : 3600; // 10 min preview vs 1 hour download

    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: fileKey,
      // Helps browsers display PDF/video inline instead of forcing download
      ResponseContentDisposition: 'inline',
      // You can make it more specific if needed:
      // ResponseContentType: category?.includes('Video') ? 'video/mp4' : undefined,
    });

    const url = await getSignedUrl(s3Client, command, { expiresIn });

    console.log('[preview-route] signed URL generated successfully');
    res.status(200).json({ url });

  } catch (err) {
    console.error('[generate-storj-preview-url] ERROR:', {
      name:      err.name,
      code:      err.code,
      message:   err.message,
      stack:     err.stack?.substring(0, 400), // truncate to avoid huge logs
      fileKey:   req.body?.fileKey,
      bucket:    req.body?.bucket,
      requestId: err.$metadata?.requestId,
    });

    let status = 500;
    let message = 'Failed to generate preview URL';

    if (err.code === 'NoSuchKey' || err.name?.includes('NotFound')) {
      status = 404;
      message = 'File not found in storage';
    } else if (err.code === 'AccessDenied' || err.message?.includes('Access Denied')) {
      status = 403;
      message = 'Access denied – check Storj credentials permissions';
    } else if (err.code === 'InvalidAccessKeyId' || err.message?.includes('credentials')) {
      status = 401;
      message = 'Invalid Storj credentials';
    } else if (err.message?.includes('timeout') || err.message?.includes('ECONN')) {
      message = 'Storj gateway timeout – try again in a moment';
    }

    res.status(status).json({ error: message });
  }
}