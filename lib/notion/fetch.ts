import { getNotionClient } from "./client";
import type { ListBlockChildrenResponse } from "@notionhq/client/build/src/api-endpoints";

// Module-level cache that persists across requests in development
const devCache = new Map<string, { data: ListBlockChildrenResponse | null; timestamp: number }>();
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes in milliseconds

export async function fetchNotionPage(pageId: string) {
    const notion = getNotionClient();
    return await notion.pages.retrieve({ page_id: pageId });
}

async function _fetchNotionBlocksInternal(pageId: string): Promise<ListBlockChildrenResponse | null> {
    const notion = getNotionClient();

    try {
        const allBlocks: ListBlockChildrenResponse['results'] = [];
        let hasMore = true;
        let nextCursor: string | undefined = undefined;

        // Fetch all pages of blocks
        while (hasMore) {
            const response = await notion.blocks.children.list({
                block_id: pageId,
                ...(nextCursor && { start_cursor: nextCursor }),
            });

            allBlocks.push(...response.results);
            hasMore = response.has_more;
            nextCursor = response.next_cursor ?? undefined;
        }

        // Return a response-like object with all accumulated blocks
        return {
            object: 'list',
            results: allBlocks,
            next_cursor: null,
            has_more: false,
            type: 'block',
            block: {},
        } as ListBlockChildrenResponse;
    } catch (error) {
        console.error('Error fetching blocks from Notion:', error);
        return null;
    }
}

export async function fetchNotionBlocks(pageId: string): Promise<ListBlockChildrenResponse | null> {
    // Use in-memory cache in development mode
    if (process.env.NODE_ENV === 'development') {
        const cached = devCache.get(pageId);
        const now = Date.now();

        if (cached && (now - cached.timestamp) < CACHE_TTL) {
            console.log('[Cache HIT] Using cached Notion blocks (age:', Math.round((now - cached.timestamp) / 1000), 's)');
            return cached.data;
        }

        console.log('[Cache MISS] Fetching from Notion...');
    }

    const result = await _fetchNotionBlocksInternal(pageId);

    // Store in cache for development
    if (process.env.NODE_ENV === 'development' && result) {
        devCache.set(pageId, { data: result, timestamp: Date.now() });
        console.log('[Cache] Stored in cache');
    }

    return result;
}