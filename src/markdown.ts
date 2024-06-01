import fs from 'fs';

export async function generateMarkdownFile(data: { title: string, link: string, timeAgo: string }[]) {
    let markdownContent = `
# 📰 Latest Scraped Tech News

Here are the latest articles from TechCrunch Startups:

**Note:** This data will refresh in Four hours interval. Stay tuned for the latest updates! 🔄`;

    data.forEach(item => {
        markdownContent += `\n- [${item.title}](${item.link}) - ${item.timeAgo}`;
    });

    fs.writeFileSync('README.md', markdownContent);
    console.log('Markdown file created successfully.');
}
