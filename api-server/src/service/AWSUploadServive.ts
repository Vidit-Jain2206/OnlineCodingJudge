import { PutBucketAclCommand, S3Client } from "@aws-sdk/client-s3";

export class AWSUploadService {
  private client: S3Client;
  private bucketName: string;

  constructor(
    AWS_ACCESS_KEY_ID: string,
    AWS_SECRET_ACCESS_KEY: string,
    AWS_REGION: string,
    AWS_BUCKET_NAME: string
  ) {
    this.client = new S3Client({
      credentials: {
        accessKeyId: AWS_ACCESS_KEY_ID,
        secretAccessKey: AWS_SECRET_ACCESS_KEY,
      },
      region: AWS_REGION,
    });
    this.bucketName = AWS_BUCKET_NAME;
  }

  async uploadFile(file: string, key: string) {
    try {
      const params = {
        Bucket: this.bucketName,
        Key: key,
        Body: file,
        ContentType: "text/plain",
      };
      const command = new PutBucketAclCommand(params);
      await this.client.send(command);
    } catch (error) {
      throw new Error((error as Error).message);
    }
  }
}
