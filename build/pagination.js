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
exports.checkNextPage = void 0;
function checkNextPage(page) {
    return __awaiter(this, void 0, void 0, function* () {
        const nextButtonSelector = 'a.wp-block-query-pagination-next';
        const nextButton = yield page.$(nextButtonSelector);
        if (nextButton) {
            yield nextButton.click();
            yield page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 60000 });
            console.log('Navigated to the next page successfully.');
            return true;
        }
        else {
            console.log('No "Next" button found. End of pagination.');
            return false;
        }
    });
}
exports.checkNextPage = checkNextPage;
