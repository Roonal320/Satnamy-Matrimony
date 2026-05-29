const { S3Client, DeleteObjectCommand } = require('@aws-sdk/client-s3');

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'ap-south-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const S3_BUCKET = process.env.AWS_S3_BUCKET_NAME || 'matrimony-s3-bucket';
const S3_REGION = process.env.AWS_REGION || 'ap-south-1';

/**
 * Returns the public S3 URL for a given object key.
 * e.g. https://matrimony-s3-bucket.s3.ap-south-1.amazonaws.com/profiles/userId/uuid.jpg
 */
function getS3Url(key) {
  return `https://${S3_BUCKET}.s3.${S3_REGION}.amazonaws.com/${key}`;
}

/**
 * Extracts S3 object key from a full public S3 URL.
 */
function getS3KeyFromUrl(url) {
  if (!url) return null;
  if (url.includes(S3_BUCKET) && url.includes('amazonaws.com')) {
    const parts = url.split('.amazonaws.com/');
    if (parts.length > 1) {
      return parts[1];
    }
  }
  return null;
}

/**
 * Deletes a file from the S3 bucket given its object key.
 */
async function deleteFromS3(key) {
  if (!key) return false;
  try {
    const command = new DeleteObjectCommand({
      Bucket: S3_BUCKET,
      Key: key,
    });
    await s3Client.send(command);
    console.log(`[S3 Delete Success] Key: ${key}`);
    return true;
  } catch (err) {
    console.error(`[S3 Delete Error] Key: ${key}`, err);
    return false;
  }
}

module.exports = { s3Client, S3_BUCKET, S3_REGION, getS3Url, getS3KeyFromUrl, deleteFromS3 };
