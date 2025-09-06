import { KEYWORDS, TOPIC_WHITELIST } from './topics.js';
import type { NewsItem } from './newsFetcher.js';
import logger from './logger.js';

export type ScoredItem = NewsItem & {
  score: number;
  matchedTopics: string[];
};

function countOccurrences(text: string, keyword: string): number {
  // Simple case-insensitive substring count. Word-boundary matching is optional.
  const t = text.toLowerCase();
  const k = keyword.toLowerCase();
  let idx = 0, count = 0;
  while ((idx = t.indexOf(k, idx)) !== -1) { count++; idx += k.length; }
  return count;
}

export function scoreItems(items: NewsItem[]): ScoredItem[] {
  const scored: ScoredItem[] = items.map((item) => {
    const text = `${item.title}\n${item.excerpt}`.toLowerCase();
    let total = 0;
    const matchedTopics: string[] = [];
    for (const topic of TOPIC_WHITELIST) {
      const kws = KEYWORDS[topic] || [];
      let topicScore = 0;
      for (const kw of kws) {
        const inTitle = countOccurrences(item.title, kw) * 2; // title boost
        const inExcerpt = countOccurrences(item.excerpt, kw);
        topicScore += inTitle + inExcerpt;
      }
      if (topicScore > 0) matchedTopics.push(topic);
      total += topicScore;
    }
    return { ...item, score: total, matchedTopics };
  });
  return scored;
}

export function chooseBest(scored: ScoredItem[], processedUrls: string[]): ScoredItem | null {
  const filtered = scored.filter((s) => !processedUrls.includes(s.url));
  const topical = filtered.filter((s) => s.score > 0);
  if (topical.length === 0) {
    logger.warn('No items matched the topic whitelist.');
    return filtered[0] || null; // fallback to most recent if nothing matched
  }
  topical.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return b.publishedAt.getTime() - a.publishedAt.getTime();
  });
  const top = topical[0];
  logger.info(`Selected article: ${top.title} [score=${top.score}]`);
  return top;
}

