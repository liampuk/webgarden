import { Client } from "@notionhq/client";

export function getNotionClient() {
    const notionSecret = process.env.NOTION_SECRET;

    if (!notionSecret) {
        throw new Error('NOTION_SECRET is not set in environment variables');
    }

    return new Client({
        auth: notionSecret,
    });
}