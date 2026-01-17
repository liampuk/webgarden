import type { BlockObjectResponse, PartialBlockObjectResponse } from "@notionhq/client/build/src/api-endpoints";
import { getOrUploadImage } from "../r2/sync";

type ParsedBlock = {
    id: string;
    type: 'paragraph' | 'image' | 'newline';
    content: string;
    createdTime: string;
}

type WebsiteBlockGroup = {
    id: string;
    imageUrl: string;
    websiteUrl: string;
    createdTime: string;
}

export function parseParagraph(block: Extract<BlockObjectResponse, { type: 'paragraph' }>): ParsedBlock {
    // string query params from urls
    const content = block.paragraph.rich_text.map(rt => rt.plain_text).join('');
    if (content.length > 0) {
        const url = new URL(content);
        const queryParams = url.searchParams;
        const queryParamsString = queryParams.toString();
        const contentWithoutQueryParams = content.replace(`?${queryParamsString}`, '');
        return {
            id: block.id,
            createdTime: block.created_time,
            type: content.length > 0 ? 'paragraph' : 'newline',
            content: contentWithoutQueryParams,
        }
    } else {
        return {
            id: block.id,
            createdTime: block.created_time,
            type: 'newline',
            content: '',
        }
    }

}

export function parseImage(block: Extract<BlockObjectResponse, { type: 'image' }>): ParsedBlock {
    // console.log(block)
    return { id: block.id, createdTime: block.created_time, type: 'image', content: block.image.type === 'file' ? block.image.file.url : block.image.external.url }
}

export function parseBlock(block: BlockObjectResponse | PartialBlockObjectResponse) {
    if (!('type' in block)) {
        return null;
    }
    switch (block.type) {
        case 'paragraph':
            return parseParagraph(block);
        case 'image':
            return parseImage(block);
        default:
            return null;
    }
}

export async function parseBlocks(blocks: (PartialBlockObjectResponse | BlockObjectResponse)[]): Promise<WebsiteBlockGroup[]> {
    const allBlocks = blocks.map(parseBlock).filter((block): block is ParsedBlock => block !== null);

    const websiteBlockGroups: WebsiteBlockGroup[] = [];
    console.log(allBlocks)

    // blocks are in the format [image, paragraph url, newline, image, paragraph url, newline, ...]
    for (let i = 0; i < allBlocks.length; i += 3) {
        const block = allBlocks[i];
        if (block.type === 'image') {
            console.log(i, block.content)
            const r2ImageUrl = await getOrUploadImage(block.content);
            websiteBlockGroups.push({
                id: block.id,
                createdTime: block.createdTime,
                imageUrl: r2ImageUrl,
                websiteUrl: allBlocks[i + 1].content
            });
        } else {
            throw new Error('Expected image block at index ' + i);
        }
    }
    return websiteBlockGroups;
}