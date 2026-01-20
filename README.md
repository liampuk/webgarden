# Website Garden

This is a next.js project, built for ISR (Incremental static regeneration)

<img width="1507" height="821" alt="image" src="https://github.com/user-attachments/assets/2712b770-1299-4d7a-a83a-3486b5af4f5c" />

## Running the app

You will need a few environment variables to build the app

| Variable | Required | Description |
|----------|----------|-------------|
| `NOTION_SECRET` | Yes | Notion API secret token for authenticating requests to the Notion API |
| `R2_ENDPOINT` | Yes | Cloudflare R2 endpoint URL (e.g., `https://<account-id>.r2.cloudflarestorage.com`) |
| `R2_ACCESS_KEY_ID` | Yes | Cloudflare R2 access key ID for S3-compatible API authentication |
| `R2_SECRET_ACCESS_KEY` | Yes | Cloudflare R2 secret access key for S3-compatible API authentication |
| `R2_BUCKET_NAME` | Yes | Name of the Cloudflare R2 bucket where optimized images are stored |
| `R2_CUSTOM_URL` | Yes | Custom public URL for accessing R2 bucket contents (e.g., `https://webgarden.liamp.uk`) |
| `USE_MOCK_DATA` | No | Set to `true` to use mock data from `data/notion-blocks.json` instead of fetching from Notion API |
| `SKIP_R2_CHECKS` | No | Set to `true` in development to skip R2 existence checks and speed up local development |


```
npm i
npm run generate-mock
npm run dev
```
