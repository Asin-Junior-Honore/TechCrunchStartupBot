"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const puppeteer_1 = __importDefault(require("puppeteer"));
const fs_1 = __importDefault(require("fs"));
function navigateToStartupsPage(page) {
    return __awaiter(this, void 0, void 0, function* () {
        const startupsLinkSelector = 'a.wp-block-navigation-item__content[href="/category/startups/"]';
        yield page.waitForSelector(startupsLinkSelector);
        yield page.click(startupsLinkSelector);
        yield page.waitForNavigation({ waitUntil: 'networkidle2' });
        console.log('Navigated to the Startups page successfully.');
    });
}
function scrapeData(page) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield page.evaluate(() => {
            const items = document.querySelectorAll('.wp-block-tc23-post-picker');
            const results = [];
            items.forEach(item => {
                var _a, _b, _c;
                const titleElement = item.querySelector('h2');
                const linkElement = titleElement === null || titleElement === void 0 ? void 0 : titleElement.querySelector('a');
                const timeAgoElement = item.querySelector('.wp-block-tc23-post-time-ago');
                const title = (_a = titleElement === null || titleElement === void 0 ? void 0 : titleElement.innerText) !== null && _a !== void 0 ? _a : 'Title not found';
                const link = (_b = linkElement === null || linkElement === void 0 ? void 0 : linkElement.href) !== null && _b !== void 0 ? _b : '#';
                const timeAgo = (_c = timeAgoElement === null || timeAgoElement === void 0 ? void 0 : timeAgoElement.innerText) !== null && _c !== void 0 ? _c : 'Time not found';
                results.push({ title, link, timeAgo });
            });
            return results;
        });
    });
}
function checkNextPage(page) {
    return __awaiter(this, void 0, void 0, function* () {
        const nextButtonSelector = 'a.wp-block-query-pagination-next';
        const nextButton = yield page.$(nextButtonSelector);
        if (nextButton) {
            yield nextButton.click();
            yield page.waitForNavigation({ waitUntil: 'networkidle2' });
            console.log('Navigated to the next page successfully.');
            return true;
        }
        else {
            console.log('No "Next" button found. End of pagination.');
            return false;
        }
    });
}
function generateMarkdownFile(data) {
    return __awaiter(this, void 0, void 0, function* () {
        let markdownContent = `
# 📰 Latest Scraped Tech News

Here are the latest articles from TechCrunch Startups:

`;
        data.forEach(item => {
            markdownContent += `- [${item.title}](${item.link}) - ${item.timeAgo}\n`;
        });
        fs_1.default.writeFileSync('README.md', markdownContent);
        console.log('Markdown file created successfully.');
    });
}
function scrapeTechCrunchStartups() {
    return __awaiter(this, void 0, void 0, function* () {
        const browser = yield puppeteer_1.default.launch({
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
        const page = yield browser.newPage();
        try {
            yield page.goto('https://techcrunch.com', { waitUntil: 'networkidle2' });
            console.log('Navigated to TechCrunch successfully.');
            yield navigateToStartupsPage(page);
            let allData = [];
            // Scrape data from the first page
            const dataPage1 = yield scrapeData(page);
            allData = allData.concat(dataPage1);
            // Check and scrape data from the second page if it exists
            if (yield checkNextPage(page)) {
                const dataPage2 = yield scrapeData(page);
                allData = allData.concat(dataPage2);
            }
            yield generateMarkdownFile(allData);
        }
        catch (error) {
            console.error('Error:', error);
        }
        finally {
            yield browser.close();
        }
    });
}
scrapeTechCrunchStartups().catch(console.error);
