//use this if only you want pupetter to do navigation it self alll the way from homepage to the startup page
import { Page } from 'puppeteer';
export async function navigateToStartupsPage(page: Page) {
    const startupsLinkSelector = 'a.wp-block-navigation-item__content[href="/category/startups/"]';
    await page.waitForSelector(startupsLinkSelector);
    await page.click(startupsLinkSelector);
    await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 60000 });
    console.log('Navigated to the Startups page successfully.');
}
