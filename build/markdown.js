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
exports.generateMarkdownFile = void 0;
const fs_1 = __importDefault(require("fs"));
function generateMarkdownFile(data) {
    return __awaiter(this, void 0, void 0, function* () {
        let markdownContent = `
# 📰 Latest Scraped Tech News

Here are the latest articles from TechCrunch Startups:

**Note:** This data will refresh in Four hours interval. Stay tuned for the latest updates! 🔄`;
        data.forEach(item => {
            markdownContent += `\n- [${item.title}](${item.link}) - ${item.timeAgo}`;
        });
        fs_1.default.writeFileSync('README.md', markdownContent);
        console.log('Markdown file created successfully.');
    });
}
exports.generateMarkdownFile = generateMarkdownFile;
