import { escapeHtml, formatDate } from './util.js';
import { config } from './config.js';

export function renderLinkedInPost(data: { linkedinPost: string; hashtags?: string[] }): { html: string; text: string } {
  const { linkedinPost, hashtags = [] } = data;
  const postWithTags = hashtags.length ? `${linkedinPost}\n\n${hashtags.map(h => h.startsWith('#') ? h : '#' + h).join(' ')}` : linkedinPost;
  const lines = postWithTags.split(/\r?\n/);
  const html = lines.map(l => `<p>${escapeHtml(l)}</p>`).join('\n');
  return { html, text: postWithTags };
}

export function renderEmail(args: {
  postHtml: string;
  postText: string;
  meta: { title: string; url: string; source: string; disclaimer: string };
}): { subject: string; html: string; text: string } {
  const today = formatDate(new Date());
  const subject = `[${config.BRAND_NAME}] IT Trend Digest — ${args.meta.title}`;
  const html = `<!doctype html>
  <html>
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif; background: #f6f8fb; color: #111; margin: 0; }
        .wrap { max-width: 720px; margin: 0 auto; padding: 24px; }
        .card { background: #fff; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.08); padding: 24px; }
        .brand { font-weight: 700; font-size: 18px; color: #2b6cb0; }
        .date { color: #718096; font-size: 12px; }
        .post { margin-top: 12px; line-height: 1.5; }
        .source { margin-top: 20px; padding: 12px; background: #f1f5f9; border-radius: 8px; color: #334155; font-size: 14px; }
        a { color: #2b6cb0; text-decoration: none; }
      </style>
    </head>
    <body>
      <div class="wrap">
        <div class="card">
          <div class="brand">${escapeHtml(config.BRAND_NAME)} — IT Trend Digest</div>
          <div class="date">${escapeHtml(today)}</div>
          <h2 style="margin-top:16px;">${escapeHtml(args.meta.title)}</h2>
          <div class="post">${args.postHtml}</div>
          <div class="source">
            <div><strong>Source:</strong> <a href="${args.meta.url}">${escapeHtml(args.meta.source)}</a></div>
            <div style="margin-top:4px; font-size:12px;">${escapeHtml(args.meta.disclaimer)}</div>
          </div>
        </div>
      </div>
    </body>
  </html>`;
  const text = `${config.BRAND_NAME} — IT Trend Digest\n${today}\n\n${args.meta.title}\n\n${args.postText}\n\nSource: ${args.meta.source} — ${args.meta.url}\n${args.meta.disclaimer}\n`;
  return { subject, html, text };
}

