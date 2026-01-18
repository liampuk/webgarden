import { getNotionClient } from "./client";
import type { ListBlockChildrenResponse } from "@notionhq/client/build/src/api-endpoints";
import { readFile } from "fs/promises";
import { join } from "path";

const MOCK_DATA_PATH = join(process.cwd(), 'data', 'notion-blocks.json');

async function loadMockNotionBlocks(): Promise<ListBlockChildrenResponse | null> {
    try {
        const fileContent = await readFile(MOCK_DATA_PATH, 'utf-8');
        const { data } = JSON.parse(fileContent) as {
            pageId: string;
            fetchedAt: string;
            data: ListBlockChildrenResponse;
        };
        console.log('[Mock Data] Loaded Notion blocks from file');
        return data;
    } catch (error) {
        if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
            console.log('[Mock Data] No mock data file found');
        } else {
            console.error('[Mock Data] Failed to load mock data:', error);
        }
        return null;
    }
}

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
    // Check for mock data first (in dev mode or when USE_MOCK_DATA is set)
    if (process.env.NODE_ENV === 'development' || process.env.USE_MOCK_DATA === 'true') {
        const mockData = await loadMockNotionBlocks();
        if (mockData) {
            console.log('[Mock Data] Using mock data from file');
            return mockData;
        }
        if (process.env.USE_MOCK_DATA === 'true') {
            console.warn('[Mock Data] USE_MOCK_DATA is true but no mock file found, falling back to Notion...');
        }
    }

    return await _fetchNotionBlocksInternal(pageId);
}