import { Page } from 'puppeteer';

export async function scrapeData(page: Page) {
    return await page.evaluate(() => {
        const items = document.querySelectorAll('.wp-block-tc23-post-picker');
        const results: { title: string, link: string, timeAgo: string }[] = [];

        items.forEach(item => {
            const titleElement = item.querySelector('h2') as HTMLElement;
            const linkElement = titleElement?.querySelector('a') as HTMLAnchorElement;
            const timeAgoElement = item.querySelector('.wp-block-tc23-post-time-ago') as HTMLElement;
            const title = titleElement?.innerText ?? 'Title not found';
            const link = linkElement?.href ?? '#';
            const timeAgo = timeAgoElement?.innerText ?? 'Time not found';
            results.push({ title, link, timeAgo });
        });

        return results;
    });
}
