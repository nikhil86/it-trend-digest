import OpenAI from 'openai';
import { config } from './config.js';
import logger from './logger.js';

export const SYSTEM_PROMPT = `
You are a senior enterprise technology analyst and writer.
- Rewrite without copying phrases; change structure and diction.
- Be specific, accurate, and conservative; NO hallucinated facts.
- Add an executive summary: 3–5 bullets focused on enterprise impact.
- Maintain the company's voice: {{COMPANY_VOICE}}.
- Output a LinkedIn-ready post using the provided template.
- Include an explicit source attribution with link.
`;

export const USER_PROMPT = `
Article:
- Source: {source}
- Title: {title}
- URL: {url}
- Excerpt: {excerpt}

Company Info:
- Brand Name: {brandName}
- Voice: {companyVoice}
- Target Audience: IT leaders, heads of engineering/data, CIO/CTO.

Task:
1) Rewrite the title in fresh words.
2) Summarize in 3–5 bullets: why this matters for enterprises.
3) Produce a LinkedIn-ready post:
   - Hook (1–2 lines)
   - Bulleted "What it means for enterprises" (3–5 bullets)
   - CTA (1–2 lines)
   - 3–6 concise hashtags (e.g., #EnterpriseAI, #DataEngineering, #MLOps)
4) Add a one-line disclaimer with the article source and link.
Return JSON with keys: rewrittenTitle, executiveSummary (bulleted), linkedinPost, hashtags[], disclaimer.
`;

export type LlmResult = {
  rewrittenTitle: string;
  executiveSummary: string;
  linkedinPost: string;
  hashtags: string[];
  disclaimer: string;
};

const client = new OpenAI({ apiKey: config.OPENAI_API_KEY });

function formatUserPrompt(params: {
  title: string;
  url: string;
  source: string;
  excerpt: string;
  brandName: string;
  companyVoice: string;
}) {
  return USER_PROMPT
    .replace('{source}', params.source)
    .replace('{title}', params.title)
    .replace('{url}', params.url)
    .replace('{excerpt}', params.excerpt)
    .replace('{brandName}', params.brandName)
    .replace('{companyVoice}', params.companyVoice);
}

export async function rewriteAndSummarize(input: {
  title: string;
  url: string;
  source: string;
  excerpt: string;
}): Promise<LlmResult> {
  const system = SYSTEM_PROMPT.replace('{{COMPANY_VOICE}}', config.COMPANY_VOICE);
  const user = formatUserPrompt({
    title: input.title,
    url: input.url,
    source: input.source,
    excerpt: input.excerpt,
    brandName: config.BRAND_NAME,
    companyVoice: config.COMPANY_VOICE,
  });

  logger.info('Calling OpenAI to rewrite and summarize...');
  const schema = {
    type: 'object',
    properties: {
      rewrittenTitle: { type: 'string' },
      executiveSummary: { type: 'string' },
      linkedinPost: { type: 'string' },
      hashtags: { type: 'array', items: { type: 'string' }, minItems: 3, maxItems: 6 },
      disclaimer: { type: 'string' },
    },
    required: ['rewrittenTitle', 'executiveSummary', 'linkedinPost', 'hashtags', 'disclaimer'],
    additionalProperties: false,
  } as const;

  const response = await client.responses.create({
    model: 'gpt-4o-mini',
    input: [
      { role: 'system', content: system },
      { role: 'user', content: user },
    ],
    text: {
      format: {
        type: 'json_schema',
        name: 'DigestOutput',
        schema,
        strict: true,
      },
    },
  });

  const text = response.output_text || '';
  let parsed: any;
  try {
    parsed = JSON.parse(text);
  } catch (err) {
    logger.error('Failed to parse LLM JSON output; falling back to best-effort parsing.');
    // Attempt to extract a JSON object from the text
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) throw new Error('OpenAI did not return JSON.');
    parsed = JSON.parse(match[0]);
  }

  const result: LlmResult = {
    rewrittenTitle: String(parsed.rewrittenTitle || input.title),
    executiveSummary: String(parsed.executiveSummary || ''),
    linkedinPost: String(parsed.linkedinPost || ''),
    hashtags: Array.isArray(parsed.hashtags) ? parsed.hashtags.map((h: any) => String(h).trim()).filter(Boolean).slice(0, 6) : [],
    disclaimer: String(parsed.disclaimer || `Source: ${input.source} — ${input.url}`),
  };
  return result;
}
