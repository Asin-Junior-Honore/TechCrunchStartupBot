import puppeteer, { Browser, Page } from 'puppeteer';
import { navigateToStartupsPage } from './navigation';
import { scrapeData } from './scraping';
import { checkNextPage } from './pagination';
import { generateMarkdownFile } from './markdown';

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
