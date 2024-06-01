import puppeteer from 'puppeteer';
import fs from 'fs';

async function scrapeTechCrunchStartups() {
    const browser = await puppeteer.launch({
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
    const page = await browser.newPage();

    try {
        // Navigate to TechCrunch
        await page.goto('https://techcrunch.com', { waitUntil: 'networkidle2' });
        console.log('Navigated to TechCrunch successfully.');

        // Wait for the "Startups" link to be available and click it
        const startupsLinkSelector = 'a.wp-block-navigation-item__content[href="/category/startups/"]';
        await page.waitForSelector(startupsLinkSelector);
        await page.click(startupsLinkSelector);
        console.log('Clicked on the "Startups" link.');

        // Wait for the navigation to the startups page to complete
        await page.waitForNavigation({ waitUntil: 'networkidle2' });
        console.log('Navigated to the Startups page successfully.');

        // Function to scrape data from the current page
        const scrapeData = async () => {
            return await page.evaluate(() => {
                const items = document.querySelectorAll('.wp-block-tc23-post-picker');
                const results: any[] = [];

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
        };

        // Array to hold all the scraped data
        let allData: any[] = [];

        // Scrape data from the first page
        const dataPage1 = await scrapeData();
        allData = allData.concat(dataPage1);

        // Check if there is a "Next" button and click it
        const nextButtonSelector = 'a.wp-block-query-pagination-next';
        const nextButton = await page.$(nextButtonSelector);

        if (nextButton) {
            await nextButton.click();
            console.log('Clicked on the "Next" button.');

            // Wait for the navigation to the next page to complete
            await page.waitForNavigation({ waitUntil: 'networkidle2' });
            console.log('Navigated to the next page successfully.');

            // Scrape data from the second page
            const dataPage2 = await scrapeData();
            allData = allData.concat(dataPage2);
        } else {
            console.log('No "Next" button found. End of pagination.');
        }

        // Output the combined data
        console.log('Combined data from both pages:', allData);

        // Generate Markdown content
        let markdownContent = `
# Latest Scraped Tech News

Here are the latest articles from TechCrunch Startups:

`;

        allData.forEach(item => {
            markdownContent += `- [${item.title}](${item.link}) - ${item.timeAgo}\n`;
        });

        // Write the Markdown content to a file
        fs.writeFileSync('LATEST_TECH_NEWS.md', markdownContent);
        console.log('Markdown file created successfully.');
    } catch (error) {
        console.error('Error:', error);
    } finally {
        // Close the browser
        await browser.close();
    }
}

scrapeTechCrunchStartups().catch(console.error);
