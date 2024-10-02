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
exports.scrapeData = void 0;
function scrapeData(page) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield page.evaluate(() => {
            const items = document.querySelectorAll('li.wp-block-post');
            const results = [];
            // Iterate through each item
            items.forEach(item => {
                var _a, _b, _c;
                const titleElement = item.querySelector('.loop-card__title-link');
                const timeAgoElement = item.querySelector('.loop-card__meta .wp-block-tc23-post-time-ago');
                const title = (_a = titleElement === null || titleElement === void 0 ? void 0 : titleElement.innerText) !== null && _a !== void 0 ? _a : 'Title not found';
                const link = (_b = titleElement === null || titleElement === void 0 ? void 0 : titleElement.href) !== null && _b !== void 0 ? _b : '#';
                const timeAgo = (_c = timeAgoElement === null || timeAgoElement === void 0 ? void 0 : timeAgoElement.innerText) !== null && _c !== void 0 ? _c : 'Time not found';
                // Push results
                results.push({ title, link, timeAgo });
            });
            return results;
        });
    });
}
exports.scrapeData = scrapeData;
