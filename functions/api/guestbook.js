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
  "chink",
  "faggot",
  "retard"
];

const LEET_MAP = {
  '4': 'a', '@': 'a',
  '3': 'e',
  '1': 'i', '!': 'i', '|': 'i',
  '0': 'o',
  '5': 's', '$': 's',
  '7': 't', '+': 't',
  'v': 'u', 'μ': 'u'
};

function normalizeText(text) {
  let cleaned = text.toLowerCase();
  cleaned = cleaned.replace(/[\s\-_.,\/#!$%\^&\*;:{}=\-_`~()[\]'"]/g, "");
  cleaned = cleaned.replace(/[\u200B-\u200D\uFEFF]/g, "");
  
  let normalized = "";
  for (const char of cleaned) {
    normalized += LEET_MAP[char] || char;
  }
  
  return normalized;
}

export function validateGuestbookMessage(message) {
  if (!message || typeof message !== "string") return false;
  
  const lowerMsg = message.toLowerCase();
  const normalizedMsg = normalizeText(message);
  
  for (const word of BANNED_ROOTS) {
    if (lowerMsg.includes(word)) return false;
    if (normalizedMsg.includes(word)) return false;
  }
  
  return true;
}

async function ensureColumns(DB) {
  try {
    await DB.prepare('ALTER TABLE guestbook ADD COLUMN sticker TEXT').run();
  } catch {}
  try {
    await DB.prepare('ALTER TABLE guestbook ADD COLUMN reactions TEXT').run();
  } catch {}
}

export async function onRequestGet(context) {
  const { env } = context;
  const DB = env.DB || env.virex_db;
  if (!DB) {
    return new Response(JSON.stringify({ error: 'Database binding missing' }), { status: 500 });
  }

  await ensureColumns(DB);

  try {
    let rawResults = [];
    try {
      const { results } = await DB.prepare(
        'SELECT id, name, message, created_at, sticker, reactions FROM guestbook ORDER BY created_at DESC LIMIT 50'
      ).all();
      rawResults = results;
    } catch {
      const { results } = await DB.prepare(
        'SELECT id, name, message, created_at FROM guestbook ORDER BY created_at DESC LIMIT 50'
      ).all();
      rawResults = results;
    }

    const processed = (rawResults || []).map((entry) => {
      let parsedReactions = {};
      if (entry.reactions) {
        if (typeof entry.reactions === 'string') {
          try {
            parsedReactions = JSON.parse(entry.reactions);
          } catch {}
        } else if (typeof entry.reactions === 'object') {
          parsedReactions = entry.reactions;
        }
      }
      return {
        ...entry,
        reactions: parsedReactions || {}
      };
    });

    return new Response(JSON.stringify(processed), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}

export async function onRequestPost(context) {
  const { request, env } = context;
  const DB = env.DB || env.virex_db;
  if (!DB) {
    return new Response(JSON.stringify({ error: 'Database binding missing' }), { status: 500 });
  }

  await ensureColumns(DB);

  try {
    const body = await request.json();
    const { action, id, emoji, delta, name, message, sticker } = body;
    if (action === 'react') {
      if (!id || !emoji || typeof emoji !== 'string') {
        return new Response(JSON.stringify({ error: 'id and emoji are required for reaction' }), { status: 400 });
      }

      const cleanEmoji = emoji.slice(0, 24);
      const reactDelta = typeof delta === 'number' ? delta : 1;

      try {
        const numericId = Number(id);
        if (isNaN(numericId)) {
          return new Response(JSON.stringify({ error: 'Invalid id' }), { status: 400 });
        }

        const entry = await DB.prepare('SELECT id, reactions FROM guestbook WHERE id = ?').bind(numericId).first();

        if (!entry) {
          return new Response(JSON.stringify({ error: 'Entry not found' }), { status: 404 });
        }

        let reactions = {};
        if (entry.reactions) {
          try {
            reactions = typeof entry.reactions === 'string' ? JSON.parse(entry.reactions) : entry.reactions;
          } catch {}
        }

        const current = Number(reactions[cleanEmoji]) || 0;
        const next = Math.max(0, current + reactDelta);
        if (next === 0) {
          delete reactions[cleanEmoji];
        } else {
          reactions[cleanEmoji] = next;
        }

        const reactionsJson = JSON.stringify(reactions);

        await DB.prepare('UPDATE guestbook SET reactions = ? WHERE id = ?').bind(reactionsJson, entry.id).run();

        return new Response(JSON.stringify({ id: entry.id, reactions }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500 });
      }
    }

    if (!message || typeof message !== 'string') {
      return new Response(JSON.stringify({ error: 'Message is required!' }), { status: 400 });
    }

    if (!validateGuestbookMessage(message)) {
      return new Response(JSON.stringify({ error: 'Your message contains flagged content. Keep it clean!' }), { status: 400 });
    }

    if (name && typeof name === 'string' && name.toLowerCase() !== 'anonymous' && !validateGuestbookMessage(name)) {
      return new Response(JSON.stringify({ error: 'Your name contains flagged content. Keep it clean!' }), { status: 400 });
    }

    const finalName = (name && typeof name === 'string') ? name.trim().slice(0, 30) : 'anonymous';
    const finalMessage = message.trim().slice(0, 200);
    const finalSticker = (sticker && typeof sticker === 'string' && sticker.trim().length > 0) ? sticker.trim().slice(0, 30) : null;
    const nowIso = new Date().toISOString();

    let result;
    try {
      result = await DB.prepare(
        'INSERT INTO guestbook (name, message, sticker, reactions, created_at) VALUES (?, ?, ?, ?, ?)'
      ).bind(finalName, finalMessage, finalSticker, JSON.stringify({}), nowIso).run();
    } catch {
      result = await DB.prepare(
        'INSERT INTO guestbook (name, message, created_at) VALUES (?, ?, ?)'
      ).bind(finalName, finalMessage, nowIso).run();
    }

    return new Response(JSON.stringify({
      id: result?.meta?.last_row_id || Date.now(),
      name: finalName,
      message: finalMessage,
      sticker: finalSticker,
      reactions: {},
      created_at: nowIso
    }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
