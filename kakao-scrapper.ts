import puppeteer from 'puppeteer'

export type BrowserOptions = puppeteer.LaunchOptions &
    puppeteer.BrowserLaunchArgumentOptions &
    puppeteer.BrowserConnectOptions

export class KakaopageScrapper {
    private _browser: Promise<puppeteer.Browser>

    constructor(browserOptions: BrowserOptions) {
        this._browser = puppeteer.launch(browserOptions)
    }

    get browser(): Promise<puppeteer.Browser> {
        return this._browser
    }

    public async openPage(): Promise<KakaoPage> {
        return new KakaoPage(await this._browser)
    }

    public async stop(): Promise<void> {
        return (await this._browser).close()
    }
}

export class KakaoPage {
    private _page: Promise<puppeteer.Page>

    constructor(browser: puppeteer.Browser) {
        this._page = browser.newPage()
    }

    get page(): Promise<puppeteer.Page> {
        return this._page
    }

    public async getPageTitle(): Promise<string> {
        return new Promise(async resolve => {
            ;(await this._page).evaluate(() =>
                resolve(
                    document.body.querySelector('div.titleWrap p')?.innerHTML ||
                        new Date().getMilliseconds().toString(),
                ),
            )
        })
    }
    public async getPageImagesURLs(): Promise<string[]> {
        return new Promise(async resolve => {
            ;(await this._page).evaluate(() => {
                const imgNodes = document.body.querySelectorAll(
                    'div.disableImageSave img',
                )

                const urls: string[] = []

                for (const imgNode of imgNodes) {
                    const src = imgNode.getAttribute('src')
                    if (!src) return
                    urls.push(src)
                }

                resolve(urls)
            })
        })
    }

    public async goto(url: string, options?: puppeteer.WaitForOptions) {
        return (await this._page).goto(url, options)
    }

    public async close() {
        return (await this._page).close()
    }
}
