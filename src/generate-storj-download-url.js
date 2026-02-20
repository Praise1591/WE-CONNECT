// Example using @aws-sdk/client-s3 (v3) — recommended for modern Node.js
import { S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { GetObjectCommand } from '@aws-sdk/client-s3';

const s3 = new S3Client({
  region: 'us-east-1',               // ← almost always this for Storj
  endpoint: 'https://gateway.storjshare.io',  // or your self-hosted gateway
  credentials: {
    accessKeyId: process.env.STORJ_ACCESS_KEY,     // double-check these values
    secretAccessKey: process.env.STORJ_SECRET_KEY,
  },
  forcePathStyle: true,  // important for Storj gateway
});

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  // Verify Firebase token here (you probably already do this)

  const { fileKey, bucket } = req.body;  // e.g. fileKey = "users/abc123/materials/xyz.pdf"

  try {
    const command = new GetObjectCommand({
      Bucket: bucket,          // 'weconnect'
      Key: fileKey,            // ← must match exactly what's in Storj (case-sensitive!)
    });

    const url = await getSignedUrl(s3, command, {
      expiresIn: 3600,         // 1 hour — adjust as needed
    });

    return res.status(200).json({ url });
  } catch (err) {
    console.error('Failed to generate signed URL:', err);
    // Log the real error — very important!
    return res.status(500).json({ error: err.message });
  }
}