import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

class S3StorageService {
  private client: S3Client;
  private bucketName: string;

  constructor() {
    this.client = new S3Client({
      region: process.env.AWS_REGION || 'us-east-1',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
      },
    });
    this.bucketName = process.env.AWS_S3_BUCKET_NAME || 'arsenal-fan-platform';
  }

  /**
   * Upload file to S3
   */
  async uploadFile(
    file: Buffer,
    key: string,
    contentType: string
  ): Promise<string> {
    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      Body: file,
      ContentType: contentType,
    });

    await this.client.send(command);

    return `https://${this.bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
  }

  /**
   * Delete file from S3
   */
  async deleteFile(key: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    });

    await this.client.send(command);
  }

  /**
   * Generate presigned URL for direct upload from browser
   */
  async getPresignedUploadUrl(
    key: string,
    contentType: string,
    expiresIn: number = 3600
  ): Promise<string> {
    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      ContentType: contentType,
    });

    return await getSignedUrl(this.client, command, { expiresIn });
  }

  /**
   * Generate file key for user profile photo
   */
  generateProfilePhotoKey(userId: string, extension: string): string {
    return `profiles/${userId}/avatar.${extension}`;
  }

  /**
   * Generate file key for check-in photo
   */
  generateCheckInPhotoKey(userId: string, matchId: string, extension: string): string {
    const timestamp = Date.now();
    return `check-ins/${userId}/${matchId}/${timestamp}.${extension}`;
  }

  /**
   * Generate file key for badge
   */
  generateBadgeKey(userId: string, matchId: string): string {
    return `badges/${userId}/${matchId}.png`;
  }
}

export const s3StorageService = new S3StorageService();
export default s3StorageService;
