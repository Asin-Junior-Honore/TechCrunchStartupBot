import puppeteer, { Browser, Page } from 'puppeteer';
import fs from 'fs';

async function navigateToStartupsPage(page: Page) {
    const startupsLinkSelector = 'a.wp-block-navigation-item__content[href="/category/startups/"]';
    await page.waitForSelector(startupsLinkSelector);
    await page.click(startupsLinkSelector);
    await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 60000 });
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
        await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 60000 });
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
        headless: true,
        args: [
            "--no-sandbox",
            "--disable-setuid-sandbox",
            "--start-maximized",
            "--single-process",
            "--no-zygote",
            "--disable-dev-shm-usage",
            "--disable-web-security",
            "--disable-features=IsolateOrigins,site-per-process",
            "--disable-blink-features=AutomationControlled"
        ],
        defaultViewport: null,
    });

    const page: Page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
    await page.setJavaScriptEnabled(true);

    try {
        await page.goto('https://techcrunch.com', { waitUntil: 'networkidle2', timeout: 60000 });
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
        throw error; // Re-throw the error to be caught in the retry loop
    } finally {
        await browser.close();
    }
}

async function main() {
    const retries = 3;
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            await scrapeTechCrunchStartups();
            break; // If successful, exit the loop
        } catch (error) {
            console.error(`Attempt ${attempt} failed:`, error);
            if (attempt === retries) {
                console.error('All attempts failed.');
            }
        }
    }
}

main().catch(console.error);
