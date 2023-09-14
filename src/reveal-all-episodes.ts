import type { ElementHandle, Page } from 'puppeteer';

export async function revealAllEpisodes(page: Page): Promise<void> {
  // recursively click the arrows until they disappear
  const clickControlsUntilDisappear = async (): Promise<void> => {
    const arrows = await page.$$('div.flex.cursor-pointer[data-t-obj] > img');
    const controls = await Promise.all(
      arrows.map(async (c) => {
        const parent = await c.getProperty('parentElement');
        return parent.asElement() as ElementHandle<HTMLDivElement>;
      }),
    );

    if (controls.length !== 0) {
      await Promise.all(
        controls.map(async (c) => {
          await c.click().catch(() => {
            // ignore
          });
          await page.waitForNetworkIdle({
            timeout: 0,
          });
        }),
      );

      await clickControlsUntilDisappear();
    }
  };

  await clickControlsUntilDisappear();
}
