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
Object.defineProperty(exports, "__esModule", { value: true });
exports.navigateToStartupsPage = void 0;
function navigateToStartupsPage(page) {
    return __awaiter(this, void 0, void 0, function* () {
        const startupsLinkSelector = 'a.wp-block-navigation-item__content[href="/category/startups/"]';
        yield page.waitForSelector(startupsLinkSelector);
        yield page.click(startupsLinkSelector);
        yield page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 60000 });
        console.log('Navigated to the Startups page successfully.');
    });
}
exports.navigateToStartupsPage = navigateToStartupsPage;
