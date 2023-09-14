import type { Page } from 'puppeteer';

interface Episode {
  title: string;
  date: string;
  type: string;
  link: string;
}

export async function getEpisodes(page: Page): Promise<Episode[]> {
  return page.$$eval(
    'ul > li.list-child-item > div > div[data-t-obj] > a',
    (nodes) =>
      nodes.map((node) => {
        const [title, date, type] = node.innerText
          .split('\n')
          .map((s) => s.trim());
        return {
          title,
          date,
          type,
          link: `https://page.kakao.com${node.getAttribute('href') ?? ''}`,
        };
      }),
  );
}
