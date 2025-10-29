import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { env } from "@/env";
import s3 from "@/config/aws-s3.config";
import { randomUUID } from "crypto";

export const AWSs3Router = createTRPCRouter({
  getSignedUrl: protectedProcedure
    .input(
      z.object({
        files: z.array(
          z.object({
            filename: z.string(),
            folderName: z.string(),
            contentType: z.string(),
          }),
        ),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.session.user.id;
      const results = await Promise.all(
        input.files.map(async (file) => {
          const s3Key = `${userId}/${file.folderName}/${randomUUID()}-${file.filename}`;
          const putCommand = new PutObjectCommand({
            Bucket: env.AWS_S3_BUCKET,
            Key: s3Key,
            ContentType: file.contentType,
          });
          const uploadUrl = await getSignedUrl(s3, putCommand, {
            expiresIn: 600,
          });
          return { uploadUrl, s3Key };
        }),
      );
      return results;
    }),
});

// retrieval of progress images for gallery page
