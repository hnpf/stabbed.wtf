import { join } from 'path';
import { tmpdir } from 'os';
import fs from 'fs';

export interface MusicAnalytics {
  listens: number;
  skips: number;
  likes: number;
  dislikes: number;
  reactions: Record<string, number>;
}

type MusicAnalyticsStore = Record<string, MusicAnalytics>;
type MusicAction = 'listen' | 'skip' | 'like' | 'dislike' | 'reaction';

const DB_PATH = process.env.MUSIC_ANALYTICS_PATH || join(tmpdir(), 'stabbed-music-analytics.json');

function read_db(): MusicAnalyticsStore {
  try {
    if (!fs.existsSync(DB_PATH)) return {};
    return JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
  } catch {
    return {};
  }
}

function write_db(data: MusicAnalyticsStore) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

export function vxgetallmusicanalytics(): MusicAnalyticsStore {
  return read_db();
}

export function vxupdatemusicanalytics(
  trackId: string,
  action: MusicAction,
  delta: 1 | -1,
  emoji?: string,
): MusicAnalytics {
  const store = read_db();
  const analytics = store[trackId] || { listens: 0, skips: 0, likes: 0, dislikes: 0, reactions: {} };

  if (action === 'reaction') {
    const current = Number(analytics.reactions[emoji!]) || 0;
    const next = Math.max(0, current + delta);
    if (next) analytics.reactions[emoji!] = next;
    else delete analytics.reactions[emoji!];
  } else {
    analytics[action === 'listen' ? 'listens' : action === 'skip' ? 'skips' : `${action}s`] = Math.max(
      0,
      analytics[action === 'listen' ? 'listens' : action === 'skip' ? 'skips' : `${action}s`] + delta,
    );
  }

  store[trackId] = analytics;
  write_db(store);
  return analytics;
}