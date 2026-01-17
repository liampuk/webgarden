import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getR2Client } from "./client";

export async function uploadImageToR2(
    imageUrl: string,
    key: string
): Promise<string> {
    // Download image from Notion
    const response = await fetch(imageUrl);
    if (!response.ok) {
        throw new Error(`Failed to download image: ${response.statusText}`);
    }

    const buffer = Buffer.from(await response.arrayBuffer());
    const contentType = response.headers.get("content-type") || "image/png";

    // Upload to R2
    const s3Client = getR2Client();
    const command = new PutObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME!,
        Key: key,
        Body: buffer,
        ContentType: contentType,
        CacheControl: 'public, max-age=31536000, immutable',
    });

    await s3Client.send(command);

    // Return public URL (adjust based on your R2 public URL setup)
    return generateR2PublicUrl(key);
}

// Generate a unique key based on the Notion URL (extract file ID/hash)
export function generateImageKey(notionUrl: string): string {
    // Extract a unique identifier from the Notion URL
    // You might want to use a hash of the URL or extract the file ID
    const url = new URL(notionUrl);
    const pathParts = url.pathname.split('/');
    const fileId = pathParts[2] || 'unknown';
    const extension = url.pathname.match(/\.(jpg|jpeg|png|gif|webp)$/i)?.[1] || 'png';
    return `notion-images/${fileId}.${extension}`;
}

export function generateR2PublicUrl(key: string) {
    return `${process.env.R2_CUSTOM_URL}/${process.env.R2_BUCKET_NAME}/${key}`;
}