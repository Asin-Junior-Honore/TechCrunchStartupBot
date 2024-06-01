import puppeteer from 'puppeteer';

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

    // Navigate to TechCrunch
    await page.goto('https://techcrunch.com', { waitUntil: 'networkidle2' });

    // Wait for the "Startups" link to be available and click it
    const startupsLinkSelector = 'a.wp-block-navigation-item__content[href="/category/startups/"]';
    await page.waitForSelector(startupsLinkSelector);
    await page.click(startupsLinkSelector);

    // Wait for the navigation to the startups page to complete
    await page.waitForNavigation({ waitUntil: 'networkidle2' });

    // Function to scrape data from the current page
    const scrapeData = async () => {
        const data = await page.evaluate(() => {
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

        // Output the scraped data
        console.log(data);
        console.log('Number of items:', data.length); // Print the length of the scraped data
    };

    // Scrape data from the first page
    await scrapeData();

    // Check if there is a "Next" button and click it
    const nextButtonSelector = 'a.wp-block-query-pagination-next';
    const nextButton = await page.$(nextButtonSelector);

    if (nextButton) {
        await nextButton.click();
        // Wait for the navigation to the next page to complete
        await page.waitForNavigation({ waitUntil: 'networkidle2' });

        // Scrape data from the second page
        await scrapeData();
    }

    // Close the browser
    await browser.close();
}

scrapeTechCrunchStartups().catch(console.error);