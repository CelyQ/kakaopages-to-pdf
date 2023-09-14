import type { Page } from 'puppeteer';

export interface Webtoon {
  title: string;
  info: string;
  date: string;
  link: string;
  extras?: string[];
}

export async function getWebtoons(page: Page): Promise<Webtoon[]> {
  return page.$$eval('div.grid > div[style] > div', (elements) =>
    elements.map((el) => {
      const [title, info, date] = el.innerText.split('\n');
      return {
        title,
        info,
        date,
        link: `https://page.kakao.com${
          el.querySelector('a')?.getAttribute('href') ?? ''
        }`,
        extras: el.innerText.split('\n').splice(3),
      };
    }),
  );
}
