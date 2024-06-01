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
const navigation_1 = require("./navigation");
const scraping_1 = require("./scraping");
const pagination_1 = require("./pagination");
const markdown_1 = require("./markdown");
function scrapeTechCrunchStartups() {
    return __awaiter(this, void 0, void 0, function* () {
        const browser = yield puppeteer_1.default.launch({
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
        const page = yield browser.newPage();
        yield page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
        yield page.setJavaScriptEnabled(true);
        try {
            yield page.goto('https://techcrunch.com', { waitUntil: 'networkidle2', timeout: 60000 });
            console.log('Navigated to TechCrunch successfully.');
            yield (0, navigation_1.navigateToStartupsPage)(page);
            let allData = [];
            // Scrape data from the first page
            const dataPage1 = yield (0, scraping_1.scrapeData)(page);
            allData = allData.concat(dataPage1);
            // Check and scrape data from the second page if it exists
            if (yield (0, pagination_1.checkNextPage)(page)) {
                const dataPage2 = yield (0, scraping_1.scrapeData)(page);
                allData = allData.concat(dataPage2);
            }
            yield (0, markdown_1.generateMarkdownFile)(allData);
        }
        catch (error) {
            console.error('Error:', error);
            throw error; // Re-throw the error to be caught in the retry loop
        }
        finally {
            yield browser.close();
        }
    });
}
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        const retries = 3;
        for (let attempt = 1; attempt <= retries; attempt++) {
            try {
                yield scrapeTechCrunchStartups();
                break; // If successful, exit the loop
            }
            catch (error) {
                console.error(`Attempt ${attempt} failed:`, error);
                if (attempt === retries) {
                    console.error('All attempts failed.');
                }
            }
        }
    });
}
main().catch(console.error);
