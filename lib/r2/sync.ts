import { HeadObjectCommand, NotFound, S3ServiceException } from "@aws-sdk/client-s3";
import { getR2Client } from "./client";
import { uploadImageToR2, generateImageKey, generateR2PublicUrl } from "./upload";

export async function getOrUploadImage(notionImageUrl: string): Promise<string> {
    const key = generateImageKey(notionImageUrl);
    const s3Client = getR2Client();

    if (process.env.NODE_ENV === 'development' && process.env.SKIP_R2_CHECKS === 'true') {
        return generateR2PublicUrl(key.replace(/\.(jpg|jpeg|png|gif)$/i, '.webp'));
    }

    // Check if image already exists in R2
    try {
        const headCommand = new HeadObjectCommand({
            Bucket: process.env.R2_BUCKET_NAME!,
            Key: key,
        });
        await s3Client.send(headCommand);

        // Image exists, return public URL
        return generateR2PublicUrl(key);
    } catch (error) {
        // Image doesn't exist (404), upload it
        if (
            error instanceof NotFound ||
            (error instanceof S3ServiceException && error.$metadata?.httpStatusCode === 404)
        ) {
            return await uploadImageToR2(notionImageUrl, key);
        }
        throw error;
    }
}