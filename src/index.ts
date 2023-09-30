import { mkdir } from 'node:fs/promises';
import Bun from 'bun';
import { launch } from 'puppeteer';
import type { PuppeteerLaunchOptions } from 'puppeteer';
import { authenticate } from './auth';
import { getWebtoons } from './get-webtoons';
import { getEpisodes } from './get-episodes';
import { revealAllEpisodes } from './reveal-all-episodes';
import { TabQueue } from './tab-queue';

const launchOptions: PuppeteerLaunchOptions = {
  args: ['--no-sandbox', '--disable-dev-shm-usage', '--start-maximized'],
  ignoreDefaultArgs: ['--disable-extensions'],
  defaultViewport: null,
  headless: 'new',
  // headless: false,
};

const browser = await launch(launchOptions);

const entryPage = await browser.newPage();
await entryPage.setViewport({ width: 1920, height: 1080 });

await authenticate(entryPage);

const webtoons = await getWebtoons(entryPage);
await entryPage.close();

const imageTabQueue = new TabQueue(10);
const episodesTabQueue = new TabQueue(1);

const collectEpisodesAndEnqueuePromises = webtoons.map(async (webtoon) => {
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });
  await page.goto(webtoon.link, {
    waitUntil: 'networkidle2',
  });

  await revealAllEpisodes(page);

  const episodes = await getEpisodes(page);
  const availableEpisodes = episodes.filter((e) => e.type === '무료');

  await page.close();

  for (const episode of availableEpisodes) {
    episodesTabQueue.enqueue(async () => {
      const pg = await browser.newPage();
      await pg.goto(episode.link, {
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
            const outputDir = `.temp/${webtoon.title}/${episode.title}`;
            const outputDirExists = await Bun.file(outputDir).exists();

            if (!outputDirExists) {
              await mkdir(outputDir, { recursive: true });
            }

            await Bun.write(`${outputDir}/${j}.png`, await response.buffer());
          }

          await imgPage.close();
        });
      });
      await pg.close();
    });
  }
});

await Promise.all(collectEpisodesAndEnqueuePromises);

/* eslint-disable no-await-in-loop --
 *
 *
 */
while (episodesTabQueue.length > 0) {
  await episodesTabQueue.run(async () => {
    while (imageTabQueue.length > 0) {
      await imageTabQueue.run();
    }
  });
}

await browser.close();
