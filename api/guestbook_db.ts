import { join } from 'path';
import fs from 'fs';

export interface GuestbookEntry {
  id: number;
  name: string;
  message: string;
  created_at: string;
  sticker?: string;
  reactions?: Record<string, number>;
}

const DB_PATH = process.env.VERCEL ? '/tmp/guestbook_db.json' : join(process.cwd(), 'guestbook_db.json');

const BANNED_ROOTS = [
  "fuck",
  "shit",
  "asshole",
  "bitch",
  "bastard",
  "cunt",
  "dick",
  "pussy",
  "nigger",
  "nigga,",
  "nigg",
  "nig",
  "nigglet",
  "chink",
  "faggot",
  "retard",
  "fag",
];

const LEET_MAP: Record<string, string> = {
  '4': 'a', '@': 'a',
  '3': 'e',
  '1': 'i', '!': 'i', '|': 'i',
  '0': 'o',
  '5': 's', '$': 's',
  '7': 't', '+': 't',
  'v': 'u', 'μ': 'u'
};

function normalizeText(text: string): string {
  let cleaned = text.toLowerCase();
  
  // remove common bypass punctuation/zero-width charz/spaces
  cleaned = cleaned.replace(/[\s\-_.,\/#!$%\^&\*;:{}=\-_`~()[\]'"]/g, "");
  cleaned = cleaned.replace(/[\u200B-\u200D\uFEFF]/g, "");
  
  // convert leet speak to normal letters
  let normalized = "";
  for (const char of cleaned) {
    normalized += LEET_MAP[char] || char;
  }
  
  return normalized;
}

export function validateGuestbookMessage(message: string): boolean {
  if (!message || typeof message !== "string") return false;
  
  // standard lower case check FIRST
  const lowerMsg = message.toLowerCase();
  
  // normalize check for vaster bypasses (e.g. "f.u.c.k" or "sh1t")
  const normalizedMsg = normalizeText(message);
  
  for (const word of BANNED_ROOTS) {
    // check normal text
    if (lowerMsg.includes(word)) return false;
    // check normalized text
    if (normalizedMsg.includes(word)) return false;
  }
  
  return true;
}

function read_db(): GuestbookEntry[] {
  try {
    if (!fs.existsSync(DB_PATH)) return [];
    const data = fs.readFileSync(DB_PATH, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error('guestbook read fail:', err);
    return [];
  }
}

function write_db(data: GuestbookEntry[]) {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('guestbook write fail:', err);
  }
}

export function vxaddguestbook(name: string, message: string, sticker?: string) {
  if (!validateGuestbookMessage(message)) {
    throw new Error('Your message contains flagged content. Keep it clean!');
  }
  if (name && name.toLowerCase() !== 'anonymous' && !validateGuestbookMessage(name)) {
    throw new Error('Your name contains flagged content. Keep it clean!');
  }

  const db = read_db();

  const entry: GuestbookEntry = {
    id: Date.now(),
    name: name.trim().slice(0, 30) || 'anonymous',
    message: message.trim().slice(0, 200), // max 200 chars
    created_at: new Date().toISOString(),
    ...(sticker && typeof sticker === 'string' ? { sticker: sticker.trim().slice(0, 30) } : {}),
    reactions: {}
  };
  
  db.push(entry);
  write_db(db);
  return entry;
}

export function vxreactguestbook(id: number | string, emoji: string, delta = 1) {
  const db = read_db();
  const entryId = Number(id);
  const entry = db.find(e => Number(e.id) === entryId);
  if (!entry) return null;

  if (!entry.reactions || typeof entry.reactions !== 'object') {
    entry.reactions = {};
  }

  const cleanEmoji = emoji.slice(0, 16);
  const current = Number(entry.reactions[cleanEmoji]) || 0;
  const next = Math.max(0, current + delta);

  if (next === 0) {
    delete entry.reactions[cleanEmoji];
  } else {
    entry.reactions[cleanEmoji] = next;
  }

  write_db(db);
  return entry;
}

export function vxlistguestbook() {
  const db = read_db();
  return [...db].sort((a, b) => b.id - a.id).slice(0, 50);
}

