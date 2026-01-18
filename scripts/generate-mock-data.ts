import 'dotenv/config';
import { ListBlockChildrenResponse } from '@notionhq/client';
import { fetchNotionBlocks } from '../lib/notion/fetch';
import { join } from 'path';
import { writeFile } from 'fs/promises';

const PAGE_ID = '2d11a1dec7c842cdac59e076aefccc59';
const MOCK_DATA_PATH = join(process.cwd(), 'data', 'notion-blocks.json');


export async function saveNotionBlocksToFile(
    pageId: string,
    data: ListBlockChildrenResponse | null
): Promise<void> {
    if (!data) {
        console.warn('No data to save');
        return;
    }

    try {
        const fs = await import('fs');
        const dataDir = join(process.cwd(), 'data');
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
        }

        const fileData = {
            pageId,
            fetchedAt: new Date().toISOString(),
            data,
        };

        await writeFile(MOCK_DATA_PATH, JSON.stringify(fileData, null, 2), 'utf-8');
        console.log(`[Mock Data] Saved Notion blocks to ${MOCK_DATA_PATH}`);
    } catch (error) {
        console.error('[Mock Data] Failed to save blocks to file:', error);
    }
}

async function generateMockData() {
    console.log('Generating mock data...');
    const blocks = await fetchNotionBlocks(PAGE_ID);

    if (blocks) {
        await saveNotionBlocksToFile(PAGE_ID, blocks);
        console.log('Mock data generated successfully!');
    } else {
        console.error('Failed to fetch blocks');
        process.exit(1);
    }
}

generateMockData();