import { Page } from 'puppeteer';

export async function checkNextPage(page: Page) {
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
