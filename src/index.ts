import cron from 'node-cron';
import { config } from './config.js';
import logger from './logger.js';
import { ensureProcessedStore, readProcessedUrls, appendProcessedUrl } from './util.js';
import { fetchNews } from './newsFetcher.js';
import { scoreItems, chooseBest } from './selector.js';
import { rewriteAndSummarize } from './llm.js';
import { renderEmail, renderLinkedInPost } from './templates.js';
import { argv } from 'node:process';

async function runPipelineOnce() {
  try {
    ensureProcessedStore();
    const items = await fetchNews();
    if (items.length === 0) {
      logger.warn('No articles fetched. Aborting run.');
      return;
    }
    const processed = readProcessedUrls();
    const scored = scoreItems(items);
    const chosen = chooseBest(scored, processed);
    if (!chosen) {
      logger.warn('No suitable article found after filtering.');
      return;
    }

    const llm = await rewriteAndSummarize({
      title: chosen.title,
      url: chosen.url,
      source: chosen.source,
      excerpt: chosen.excerpt,
    });

    const { html: postHtml, text: postText } = renderLinkedInPost({ linkedinPost: llm.linkedinPost, hashtags: llm.hashtags });
    const email = renderEmail({
      postHtml,
      postText,
      meta: {
        title: llm.rewrittenTitle,
        url: chosen.url,
        source: chosen.source,
        disclaimer: llm.disclaimer,
      },
    });

    try {
      await (await import('./emailer.js')).sendEmail(email);
    } catch (e: any) {
      // On email failure, save artifacts for inspection.
      const fs = await import('node:fs');
      const path = await import('node:path');
      const outDir = path.resolve(process.cwd(), 'data');
      try {
        if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
        fs.writeFileSync(path.join(outDir, 'latest-email.html'), email.html);
        fs.writeFileSync(path.join(outDir, 'latest-email.txt'), email.text);
        logger.error('Email send failed. Wrote data/latest-email.{html,txt} for review.');
      } catch {}
      throw e;
    }
    appendProcessedUrl(chosen.url);
    logger.info('Run completed successfully.');
  } catch (err: any) {
    logger.error(`Pipeline failed: ${err.message || err}`);
    throw err;
  }
}

function startScheduler() {
  logger.info(`Scheduling job: ${config.CRON_SCHEDULE} (${config.TIMEZONE})`);
  cron.schedule(config.CRON_SCHEDULE, async () => {
    logger.info('Scheduled run started.');
    try {
      await runPipelineOnce();
    } catch (err) {
      // In scheduled mode, log and continue
      logger.error('Scheduled run failed, will retry next cycle.');
    }
  }, { timezone: config.TIMEZONE });
}

async function main() {
  const isOnce = argv.includes('--once');
  if (isOnce) {
    logger.info('Running once (no scheduler).');
    try {
      await runPipelineOnce();
      process.exit(0);
    } catch {
      process.exit(1);
    }
    return;
  }
  startScheduler();
}

// Start
main();
