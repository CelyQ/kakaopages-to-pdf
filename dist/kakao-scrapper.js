import puppeteer from 'puppeteer';
export class KakaopageScrapper {
    constructor(browserOptions) {
        this._browser = puppeteer.launch(browserOptions);
    }
    get browser() {
        return this._browser;
    }
    async openPage() {
        return new KakaoPage(await this._browser);
    }
    async stop() {
        return (await this._browser).close();
    }
}
export class KakaoPage {
    constructor(browser) {
        this._page = browser.newPage();
    }
    get page() {
        return this._page;
    }
    async getPageTitle() {
        return new Promise(async (resolve) => {
            ;
            (await this._page).evaluate(() => resolve(document.body.querySelector('div.titleWrap p')?.innerHTML ||
                new Date().getMilliseconds().toString()));
        });
    }
    async getPageImagesURLs() {
        return new Promise(async (resolve) => {
            ;
            (await this._page).evaluate(() => {
                const imgNodes = document.body.querySelectorAll('div.disableImageSave img');
                const urls = [];
                for (const imgNode of imgNodes) {
                    const src = imgNode.getAttribute('src');
                    if (!src)
                        return;
                    urls.push(src);
                }
                resolve(urls);
            });
        });
    }
    async goto(url, options) {
        return (await this._page).goto(url, options);
    }
    async close() {
        return (await this._page).close();
    }
}
