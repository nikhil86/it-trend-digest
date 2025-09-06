import fs from 'fs';
import path from 'path';

export const DATA_DIR = path.resolve(process.cwd(), 'data');
export const PROCESSED_PATH = path.join(DATA_DIR, 'processed.json');

export function ensureProcessedStore() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(PROCESSED_PATH)) {
    fs.writeFileSync(PROCESSED_PATH, JSON.stringify({ urls: [] }, null, 2));
  }
}

export function readProcessedUrls(): string[] {
  ensureProcessedStore();
  try {
    const raw = fs.readFileSync(PROCESSED_PATH, 'utf8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed.urls) ? parsed.urls : [];
  } catch {
    return [];
  }
}

export function appendProcessedUrl(url: string) {
  ensureProcessedStore();
  const urls = readProcessedUrls();
  if (!urls.includes(url)) urls.unshift(url);
  const limited = urls.slice(0, 500);
  fs.writeFileSync(PROCESSED_PATH, JSON.stringify({ urls: limited }, null, 2));
}

export function stripHtml(input: string): string {
  return input
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();
}

export function truncate(input: string, max = 500): string {
  if (input.length <= max) return input;
  return input.slice(0, max - 1) + '…';
}

export function parseDate(input?: string): Date | null {
  if (!input) return null;
  const d = new Date(input);
  return isNaN(d.getTime()) ? null : d;
}

export function formatDate(d: Date): string {
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
}

export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

