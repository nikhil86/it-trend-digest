# IT Trend Digest

Scheduled service that fetches recent IT/AI/Data Engineering articles, filters by enterprise-relevant topics, rewrites with an OpenAI-powered summary and LinkedIn-ready post, and emails the result to your recipients every 3 days.

## What It Does

- Fetches curated RSS feeds from leading sources (MIT Tech Review, IEEE Spectrum, Ars Technica, AWS/GCP/Azure, OpenAI, NVIDIA, Databricks, Confluent, Snowflake).
- Filters by a topic whitelist using simple keyword scoring.
- De-duplicates previously used URLs via `data/processed.json`.
- Uses OpenAI to rewrite the headline, add an executive summary, and produce a LinkedIn-ready post with hashtags and a short attribution.
- Emails the final content (subject + HTML body + plaintext) using SMTP.
- Runs on a cron schedule: 09:00 every 3 days in your configured timezone.

## Configure .env

Copy `.env.example` to `.env` and set values:

```
OPENAI_API_KEY=...
SMTP_HOST=...
SMTP_PORT=587
SMTP_USER=...
SMTP_PASS=...
FROM_EMAIL="SlampTech Digest <no-reply@yourdomain.com>"
TO_EMAILS="you@yourcompany.com, partner@yourcompany.com"

TIMEZONE="America/Chicago"
CRON_SCHEDULE="0 9 */3 * *" # 09:00 every 3 days, TZ aware
BRAND_NAME="SlampTech"
COMPANY_VOICE="Practical, senior-consultant tone, concise, enterprise-focused."
MINIMUM_FRESHNESS_DAYS=7

# Optional
LOG_LEVEL=info
REQUEST_TIMEOUT_MS=15000
```

Notes:
- `TO_EMAILS` is comma-separated.
- `FROM_EMAIL` is what recipients will see as the sender.

## Install & Run

```
npm i

# One-off dry run (no scheduler):
npm run dev -- --once

# Build and start the scheduled service:
npm run build && npm start
```

The `start` script uses Node’s `--env-file` so your `.env` is loaded in production. The `dev`/`run-once` scripts use `tsx` and `dotenv` to load `.env` automatically.

## Editing Sources and Topics

- Update curated RSS feeds in `src/sources.ts`.
- Tweak topic whitelist and keyword scoring in `src/topics.ts`.
- Processed URLs are tracked in `data/processed.json` (capped at ~500).

## How It Works

1. `newsFetcher.ts` concurrently fetches RSS feeds, normalizes items to `{ source, title, url, publishedAt, excerpt }`, and prefers fresh items (last N days) while allowing older items if results are sparse.
2. `selector.ts` computes a relevance score from topic keywords (title has extra weight), drops already-processed URLs, and selects the top-scoring, most recent item.
3. `llm.ts` calls the OpenAI Responses API with prompts designed to avoid plagiarism, include attribution, and produce a LinkedIn-ready post in your brand voice.
4. `templates.ts` renders the LinkedIn post and a branded HTML email with a plaintext fallback.
5. `emailer.ts` sends via Nodemailer/SMTP.
6. `index.ts` schedules every 3 days using `node-cron` or runs once in `--once` mode, logging key steps and handling errors.

## Deployment Tips

- Any Node-capable host works (Render/Heroku/Fly/VM/Kubernetes).
- Make sure `.env` (or equivalent secrets) is configured with your keys.
- Keep the `CRON_SCHEDULE` and `TIMEZONE` values aligned with your needs.
- Ensure the process runs continuously to respect the schedule (PM2, systemd, or a platform scheduler).

## Legal & Content Notes

- The service summarizes and attributes the source. It does not copy verbatim text.
- Always include attribution and a link to the original article.
- Review outputs before posting to social media for accuracy and compliance.

## Repository Layout

```
it-trend-digest/
  README.md
  package.json
  tsconfig.json
  .gitignore
  .env.example
  src/
    index.ts
    config.ts
    logger.ts
    topics.ts
    sources.ts
    newsFetcher.ts
    selector.ts
    llm.ts
    emailer.ts
    templates.ts
    util.ts
  data/
    processed.json
```

