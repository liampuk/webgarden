import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        // hostname: 'prod-files-secure.s3.us-west-2.amazonaws.com',
        // hostname: process.env.R2_PUBLIC_URL?.replace('https://', '') || `${process.env.R2_BUCKET_NAME}.r2.dev`,
        hostname: 'webgarden.liamp.uk'
      },
    ],
  }
};

export default nextConfig;