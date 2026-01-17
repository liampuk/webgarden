import { getNotionClient } from "./client";
import type { ListBlockChildrenResponse } from "@notionhq/client/build/src/api-endpoints";

export async function fetchNotionPage(pageId: string) {
    const notion = getNotionClient();
    return await notion.pages.retrieve({ page_id: pageId });
}

export async function fetchNotionBlocks(pageId: string): Promise<ListBlockChildrenResponse | null> {
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