import Parser from 'rss-parser';
import { SOURCES, type Source } from './sources.js';
import { stripHtml, truncate, parseDate } from './util.js';
import { config } from './config.js';
import logger from './logger.js';

export type NewsItem = {
  source: string;
  title: string;
  url: string;
  publishedAt: Date;
  excerpt: string;
};

const parser = new Parser({
  headers: {
    'User-Agent': 'it-trend-digest/1.0 (+https://example.com)'
  }
});

async function parseUrlWithTimeout(src: Source): Promise<Parser.Output<any>> {
  const timeout = config.REQUEST_TIMEOUT_MS;
  return await Promise.race([
    parser.parseURL(src.url),
    new Promise<never>((_, reject) => setTimeout(() => reject(new Error(`timeout after ${timeout}ms`)), timeout))
  ]);
}

export async function fetchNews(): Promise<NewsItem[]> {
  logger.info(`Fetching news from ${SOURCES.length} sources...`);
  const results = await Promise.allSettled(
    SOURCES.map(async (s) => {
      try {
        const feed = await parseUrlWithTimeout(s);
        const items: NewsItem[] = (feed.items || []).map((item: any) => {
          const title = (item.title || '').toString().trim();
          const url: string | undefined = (item.link || (typeof item.guid === 'string' && item.guid.startsWith('http') ? item.guid : undefined));
          const dateStr: string | undefined = (item.isoDate || item.pubDate || item.published || item.updated);
          const publishedAt = parseDate(dateStr);
          const rawExcerpt = item.contentSnippet || item.content || item.summary || item['content:encodedSnippet'] || '';
          const excerpt = truncate(stripHtml(String(rawExcerpt)));
          if (!title || !url || !publishedAt) return null;
          return { source: s.name, title, url, publishedAt, excerpt } as NewsItem;
        }).filter(Boolean) as NewsItem[];
        logger.debug(`Fetched ${items.length} items from ${s.name}`);
        return items;
      } catch (err: any) {
        logger.warn(`Failed to fetch ${s.name}: ${err.message || err}`);
        return [] as NewsItem[];
      }
    })
  );

  const combined: NewsItem[] = [];
  for (const r of results) {
    if (r.status === 'fulfilled') combined.push(...r.value);
  }

  // Sort by recency
  combined.sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime());

  // Freshness preference
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - config.MINIMUM_FRESHNESS_DAYS);
  const fresh = combined.filter(i => i.publishedAt >= cutoff);
  const finalItems = fresh.length >= 10 ? fresh : combined.slice(0, 60);
  logger.info(`Total normalized items: ${finalItems.length} (fresh ${fresh.length})`);
  return finalItems;
}

