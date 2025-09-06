import 'dotenv/config';
import { z } from 'zod';

const EnvSchema = z.object({
  OPENAI_API_KEY: z.string().min(1, 'OPENAI_API_KEY is required'),
  SMTP_HOST: z.string().min(1, 'SMTP_HOST is required'),
  SMTP_PORT: z.coerce.number().int().default(587),
  SMTP_USER: z.string().min(1, 'SMTP_USER is required'),
  SMTP_PASS: z.string().min(1, 'SMTP_PASS is required'),
  FROM_EMAIL: z.string().default('SlampTech Digest <no-reply@yourdomain.com>'),
  TO_EMAILS: z.string().min(1, 'TO_EMAILS is required (comma-separated)'),
  TIMEZONE: z.string().default('America/Chicago'),
  CRON_SCHEDULE: z.string().default('0 9 */3 * *'),
  BRAND_NAME: z.string().default('SlampTech'),
  COMPANY_VOICE: z.string().default('Practical, senior-consultant tone, concise, enterprise-focused.'),
  MINIMUM_FRESHNESS_DAYS: z.coerce.number().int().min(1).default(7),
  LOG_LEVEL: z.enum(['error','warn','info','http','verbose','debug','silly']).default('info'),
  REQUEST_TIMEOUT_MS: z.coerce.number().int().min(1000).default(15000),
});

export type AppConfig = z.infer<typeof EnvSchema> & {
  toEmails: string[];
};

export function loadConfig(): AppConfig {
  const parsed = EnvSchema.safeParse(process.env);
  if (!parsed.success) {
    const formatted = parsed.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join('; ');
    throw new Error(`Invalid environment configuration: ${formatted}`);
  }
  const base = parsed.data;
  const toEmails = base.TO_EMAILS.split(',').map(s => s.trim()).filter(Boolean);
  return { ...base, toEmails };
}

export const config = loadConfig();

