import puppeteer, { Browser, Page } from 'puppeteer';
import fs from 'fs';

async function navigateToStartupsPage(page: Page) {
    const startupsLinkSelector = 'a.wp-block-navigation-item__content[href="/category/startups/"]';
    await page.waitForSelector(startupsLinkSelector);
    await page.click(startupsLinkSelector);
    await page.waitForNavigation({ waitUntil: 'networkidle2' });
    console.log('Navigated to the Startups page successfully.');
}

async function scrapeData(page: Page) {
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

async function checkNextPage(page: Page) {
    const nextButtonSelector = 'a.wp-block-query-pagination-next';
    const nextButton = await page.$(nextButtonSelector);

    if (nextButton) {
        await nextButton.click();
        await page.waitForNavigation({ waitUntil: 'networkidle2' });
        console.log('Navigated to the next page successfully.');
        return true;
    } else {
        console.log('No "Next" button found. End of pagination.');
        return false;
    }
}

async function generateMarkdownFile(data: { title: string, link: string, timeAgo: string }[]) {
    let markdownContent = `
# 📰 Latest Scraped Tech News

Here are the latest articles from TechCrunch Startups:

**Note:** This data will refresh in three hours. Stay tuned for the latest updates! 🔄`;

    data.forEach(item => {
        markdownContent += `\n- [${item.title}](${item.link}) - ${item.timeAgo}`;
    });

    fs.writeFileSync('README.md', markdownContent);
    console.log('Markdown file created successfully.');
}


async function scrapeTechCrunchStartups() {
    const browser: Browser = await puppeteer.launch({
        headless: false,
        args: [
            "--no-sandbox",
            "--disable-setuid-sandbox",
            "--start-maximized",
            "--single-process",
            "--no-zygote",
        ],
        defaultViewport: null,
    });

    const page: Page = await browser.newPage();

    try {
        await page.goto('https://techcrunch.com', { waitUntil: 'networkidle2' });
        console.log('Navigated to TechCrunch successfully.');

        await navigateToStartupsPage(page);

        let allData: { title: string, link: string, timeAgo: string }[] = [];

        // Scrape data from the first page
        const dataPage1 = await scrapeData(page);
        allData = allData.concat(dataPage1);

        // Check and scrape data from the second page if it exists
        if (await checkNextPage(page)) {
            const dataPage2 = await scrapeData(page);
            allData = allData.concat(dataPage2);
        }

        await generateMarkdownFile(allData);

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await browser.close();
    }
}

scrapeTechCrunchStartups().catch(console.error);
