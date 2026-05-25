const { S3Client } = require('@aws-sdk/client-s3');

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

module.exports = { s3Client, S3_BUCKET, S3_REGION, getS3Url };
