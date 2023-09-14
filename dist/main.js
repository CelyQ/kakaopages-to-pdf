import path from 'path';
import puppeteer from 'puppeteer';
import { existsSync, mkdirSync } from 'fs';
import { writeFile, readdir } from 'fs/promises';
import imagesToPdf from 'images-to-pdf';
import 'dotenv/config';
import { authenticate } from './auth.js';
const args = process.argv.slice(2);
const link = args[0];
let chapterName;
(async () => {
    const browser = await puppeteer.launch({
        headless: false,
        args: ['--no-sandbox', '--disable-dev-shm-usage'],
        ignoreDefaultArgs: ['--disable-extensions'],
    });
    const page = await browser.newPage();
    page.setDefaultNavigationTimeout(0);
    await authenticate(page);
    await page.goto(link, {
        waitUntil: 'networkidle2',
    });
    const title = await page.evaluate(() => {
        return document.head
            .querySelector('meta[property="og:title"]')
            ?.getAttribute('content');
    });
    chapterName = title || new Date().getMilliseconds().toString();
    const imageUrls = await page.$$eval('div[data-index] > div > div > img', imgs => {
        return imgs
            .map(img => img.getAttribute('src') || '')
            .filter(src => src !== '');
    });
    if (!imageUrls) {
        browser.close();
        return;
    }
    const outputDir = `output/${chapterName}`;
    if (!existsSync(outputDir)) {
        mkdirSync(outputDir, { recursive: true });
    }
    const outputImagesDir = path.join(outputDir, 'images');
    if (!existsSync(outputImagesDir)) {
        mkdirSync(outputImagesDir, { recursive: true });
    }
    const outputPdfDir = path.join(outputDir, 'pdf');
    if (!existsSync(outputPdfDir)) {
        mkdirSync(outputPdfDir, { recursive: true });
    }
    const promises = imageUrls.map(async (url, index) => {
        const newPage = await browser.newPage();
        const viewSource = await newPage.goto(url);
        await writeFile(`output/${chapterName}/images/${index + 1}.png`, await viewSource.buffer());
        await newPage.close();
    });
    await Promise.all(promises);
    await browser.close();
    const files = (await readdir(`output/${chapterName}/images`)).sort(new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' })
        .compare);
    const filePaths = files.map(f => path.join(`output/${chapterName}/images`, f));
    try {
        await imagesToPdf(filePaths, `output/${chapterName}/pdf/${chapterName}.pdf`);
    }
    catch { }
})();
