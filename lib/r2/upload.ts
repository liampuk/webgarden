import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getR2Client } from "./client";
import sharp from "sharp";

export async function uploadImageToR2(
    imageUrl: string,
    key: string
): Promise<string> {
    // Download image from Notion
    const response = await fetch(imageUrl);
    if (!response.ok) {
        throw new Error(`Failed to download image: ${response.statusText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const inputBuffer = Buffer.from(arrayBuffer);

    // Optimize image with sharp
    // Resize to max 1600px width (maintains aspect ratio)
    // Convert to WebP for better compression
    // Quality 85 is a good balance between size and quality
    const optimizedBuffer = await sharp(inputBuffer)
        .resize(1600, null, {
            withoutEnlargement: true, // Don't upscale smaller images
            fit: 'inside',
        })
        .webp({
            quality: 85,
            effort: 6, // Higher effort = better compression (0-6)
        })
        .toBuffer();

    // Update key to use .webp extension
    const webpKey = key.replace(/\.(jpg|jpeg|png|gif)$/i, '.webp');

    // Upload to R2
    const s3Client = getR2Client();
    const command = new PutObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME!,
        Key: webpKey,
        Body: optimizedBuffer,
        ContentType: 'image/webp',
        CacheControl: 'public, max-age=31536000, immutable',
    });

    await s3Client.send(command);

    // Return public URL
    return generateR2PublicUrl(webpKey);
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