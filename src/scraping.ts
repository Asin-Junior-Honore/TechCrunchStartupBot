import { Page } from 'puppeteer';

export async function scrapeData(page: Page) {
    return await page.evaluate(() => {
        const items = document.querySelectorAll('li.wp-block-post');
        const results: { title: string, link: string, timeAgo: string }[] = [];

        // Iterate through each item
        items.forEach(item => {

            const titleElement = item.querySelector('.loop-card__title-link') as HTMLAnchorElement;
            const timeAgoElement = item.querySelector('.loop-card__meta .wp-block-tc23-post-time-ago') as HTMLElement;


            const title = titleElement?.innerText ?? 'Title not found';
            const link = titleElement?.href ?? '#';
            const timeAgo = timeAgoElement?.innerText ?? 'Time not found';


            // Push results
            results.push({ title, link, timeAgo });
        });

        return results;
    });
}