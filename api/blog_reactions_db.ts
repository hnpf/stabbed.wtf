import { join } from 'path';
import fs from 'fs';

const DB_PATH = process.env.VERCEL
  ? '/tmp/blog_reactions.json'
  : join(process.cwd(), 'blog_reactions.json');

function read_db(): Record<string, Record<string, number>> {
  try {
    if (!fs.existsSync(DB_PATH)) return {};
    const data = fs.readFileSync(DB_PATH, 'utf8');
    return JSON.parse(data);
  } catch {
    return {};
  }
}

function write_db(data: Record<string, Record<string, number>>) {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('blog_reactions write fail:', err);
  }
}

export function vxgetblogreactions(slug: string): Record<string, number> {
  const db = read_db();
  return db[slug] || {};
}

export function vxgetallblogreactions(): Record<string, Record<string, number>> {
  return read_db();
}

export function vxreactblogpost(
  slug: string,
  emoji: string,
  delta: number = 1
): Record<string, number> {
  const db = read_db();
  if (!db[slug]) db[slug] = {};

  const cleanEmoji = emoji.slice(0, 16);
  const current = Number(db[slug][cleanEmoji]) || 0;
  const next = Math.max(0, current + delta);

  if (next === 0) {
    delete db[slug][cleanEmoji];
  } else {
    db[slug][cleanEmoji] = next;
  }

  write_db(db);
  return db[slug];
}
