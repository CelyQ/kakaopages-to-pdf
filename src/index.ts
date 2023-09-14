import { exists, mkdir } from 'node:fs/promises';
import Bun from 'bun';
import { launch } from 'puppeteer';
import type { PuppeteerLaunchOptions } from 'puppeteer';
import { authenticate } from './auth';
import { getWebtoons } from './get-webtoons';
import { getEpisodes } from './get-episodes';
import { revealAllEpisodes } from './reveal-all-episodes';
import { TabQueue } from './tab-queue';

const launchOptions: PuppeteerLaunchOptions = {
  args: ['--no-sandbox', '--disable-dev-shm-usage'],
  ignoreDefaultArgs: ['--disable-extensions'],
  headless: 'new',
  // headless: false,
};

const browser = await launch(launchOptions);

const entryPage = await browser.newPage();
await entryPage.setViewport({ width: 1920, height: 1080 });

await authenticate(entryPage);

const webtoons = await getWebtoons(entryPage);
await entryPage.close();

const episodesTabQueue = new TabQueue(5);
const imageTabQueue = new TabQueue(10);

const webtoonPages = await Promise.all(
  webtoons.map(async (webtoon) => {
    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });
    await page.goto(webtoon.link, {
      waitUntil: 'networkidle2',
    });

    await revealAllEpisodes(page);

    const episodes = await getEpisodes(page);
    const availableEpisodes = episodes.filter((e) => e.type === '무료');

    // eslint-disable-next-line @typescript-eslint/no-misused-promises -- This is intentional.
    availableEpisodes.forEach(async (e) => {
      episodesTabQueue.enqueue(async () => {
        const pg = await browser.newPage();
        await pg.goto(e.link, {
          waitUntil: 'networkidle2',
          timeout: 0,
        });

        const imageUrls = await pg.$$eval(
          'div[data-index] > div > div > img',
          (imgs) => {
            return imgs
              .map((img) => img.getAttribute('src') || '')
              .filter((src) => src !== '');
          },
        );

        imageUrls.forEach((url, j) => {
          imageTabQueue.enqueue(async () => {
            const imgPage = await browser.newPage();
            const response = await imgPage.goto(url, {
              waitUntil: 'networkidle2',
              timeout: 0,
            });

            if (response) {
              const outputDir = `.temp/${webtoon.title}/${e.title}`;
              if (!(await exists(outputDir))) {
                await mkdir(outputDir, { recursive: true });
              }

              await Bun.write(`${outputDir}/${j}.png`, await response.buffer());
            }

            await imgPage.close();
          });
        });
      });

      await episodesTabQueue.run();
      while (imageTabQueue.length > 0) {
        // eslint-disable-next-line no-await-in-loop -- This is intentional.
        await imageTabQueue.run();
      }
    });

    return page;
  }),
);

await Promise.all(webtoonPages.map((p) => p.close()));
await browser.close();
