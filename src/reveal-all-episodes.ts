/* eslint-disable no-await-in-loop -- s */
import type {
  ElementHandle,
  // ElementHandle,
  Page,
} from 'puppeteer';

export async function revealAllEpisodes(page: Page): Promise<void> {
  // recursively click the arrows until they disappear

  const headerCandidates = await page.$$('div > span');
  const headerCandidatesMap = await Promise.all(
    headerCandidates.map(async (elementHandler) => {
      const text = await elementHandler.evaluate((node) => node.textContent);
      return {
        elementHandler,
        text: text?.normalize(),
      };
    }),
  );

  const header = headerCandidatesMap.find((s) => s.text?.match(/전체 \d+$/))
    ?.elementHandler;

  const container = (await header?.evaluateHandle(
    (node) => node.parentElement?.parentElement?.parentElement,
  )) as ElementHandle<HTMLDivElement> | undefined;

  if (!container) return;

  const clickControlsUntilDisappear = async (): Promise<void> => {
    const arrowsUp = await container.$$('img[alt="위 화살표"]');
    const arrowsDown = await container.$$('img[alt="아래 화살표"]');
    const controls = [...arrowsUp, ...arrowsDown];

    while (controls.length > 0) {
      for (const control of controls) {
        await control
          .click({
            delay: 300,
          })
          .catch(() => {
            // do nothing
          });

        controls.shift();
      }

      await clickControlsUntilDisappear();
    }
  };

  await clickControlsUntilDisappear();
}
