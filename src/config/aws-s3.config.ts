import { env } from "@/env";
import { S3Client } from "@aws-sdk/client-s3";

import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export async function getS3FileUrls(
  keys: string[],
  expiresIn: number = 24 * 60 * 60,
) {
  return Promise.all(
    keys.map(async (key) => {
      const getCommand = new GetObjectCommand({
        Bucket: env.AWS_S3_BUCKET,
        Key: key,
      });
      const fileUrl = await getSignedUrl(s3, getCommand, { expiresIn });
      return fileUrl;
    }),
  );
}

const s3 = new S3Client({
  region: env.AWS_REGION,
  credentials: {
    accessKeyId: env.AWS_ACCESS_KEY_ID,
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
  },
});

export default s3;
