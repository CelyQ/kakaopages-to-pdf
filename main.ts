import path from 'path'
import puppeteer from 'puppeteer'
import { existsSync, mkdirSync } from 'fs'
import { writeFile, readdir } from 'fs/promises'
//@ts-ignore
import imagesToPdf from 'images-to-pdf'

const args = process.argv.slice(2)
const link = args[0]

let chapterName: string
;(async () => {
    const browser = await puppeteer.launch({
        executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
        headless: true,
        userDataDir: 'C:/Users/paulo/AppData/Local/Google/Chrome/User Data',
        product: 'chrome',
    })
    const page = await browser.newPage()

    page.setDefaultNavigationTimeout(0)

    await page.goto(link, {
        waitUntil: 'networkidle2',
    })

    await page.click(
        '.ReactModal__Overlay.ReactModal__Overlay--after-open.PageModalOverlay',
    )

    const title = await page.evaluate(() => {
        return document.body.querySelector('div.titleWrap p')?.innerHTML
    })

    chapterName = title || new Date().getMilliseconds().toString()

    const imgUrls = await page.evaluate(() => {
        const imgNodes = document.body.querySelectorAll(
            'div.disableImageSave img',
        )

        const urls: string[] = []

        for (const imgNode of imgNodes) {
            const src = imgNode.getAttribute('src')
            if (!src) return
            urls.push(src)
        }

        return urls
    })

    if (!imgUrls) {
        browser.close()
        return
    }

    const outputDir = `output/${chapterName}`
    if (!existsSync(outputDir)) {
        mkdirSync(outputDir, { recursive: true })
    }
    const outputImagesDir = path.join(outputDir, 'images')
    if (!existsSync(outputImagesDir)) {
        mkdirSync(outputImagesDir, { recursive: true })
    }
    const outputPdfDir = path.join(outputDir, 'pdf')
    if (!existsSync(outputPdfDir)) {
        mkdirSync(outputPdfDir, { recursive: true })
    }

    const promises = imgUrls.map(async (url, index) => {
        const newPage = await browser.newPage()
        const viewSource = await newPage.goto(`https:${url}`)
        await writeFile(
            `output/${chapterName}/images/${index + 1}.png`,
            await viewSource.buffer(),
        )
        await newPage.close()
    })

    await Promise.all(promises)

    await browser.close()

    const files = (await readdir(`output/${chapterName}/images`)).sort(
        new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' })
            .compare,
    )

    const filePaths = files.map(f =>
        path.join(`output/${chapterName}/images`, f),
    )

    try {
        await imagesToPdf(
            filePaths,
            `output/${chapterName}/pdf/${chapterName}.pdf`,
        )
    } catch {}
})()
