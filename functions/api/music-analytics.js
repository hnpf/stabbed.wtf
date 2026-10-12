const ACTIONS = new Set(["listen", "skip", "like", "dislike"]);

async function ensureTable(DB) {
  await DB.prepare(`
    CREATE TABLE IF NOT EXISTS music_analytics (
      track_id TEXT PRIMARY KEY,
      listens INTEGER NOT NULL DEFAULT 0,
      skips INTEGER NOT NULL DEFAULT 0,
      likes INTEGER NOT NULL DEFAULT 0,
      dislikes INTEGER NOT NULL DEFAULT 0,
      reactions TEXT NOT NULL DEFAULT '{}'
    )
  `).run();
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}

function parseRow(row) {
  let reactions = {};
  try {
    reactions = JSON.parse(row.reactions || "{}");
  } catch {}
  return {
    listens: Number(row.listens) || 0,
    skips: Number(row.skips) || 0,
    likes: Number(row.likes) || 0,
    dislikes: Number(row.dislikes) || 0,
    reactions,
  };
}

export async function onRequestGet({ env }) {
  const DB = env.DB || env.virex_db;
  if (!DB) return json({ error: "Database binding missing" }, 500);

  try {
    await ensureTable(DB);
    const { results } = await DB.prepare("SELECT * FROM music_analytics").all();
    return json(Object.fromEntries((results || []).map((row) => [row.track_id, parseRow(row)])));
  } catch {
    return json({ error: "Could not load music analytics" }, 500);
  }
}

export async function onRequestPost({ request, env }) {
  const DB = env.DB || env.virex_db;
  if (!DB) return json({ error: "Database binding missing" }, 500);

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Invalid JSON" }, 400);
  }

  const { trackId, action, delta = 1, emoji } = body || {};
  if (typeof trackId !== "string" || !/^[a-z0-9-]{1,80}$/.test(trackId)) {
    return json({ error: "Invalid trackId" }, 400);
  }
  if (!ACTIONS.has(action) && action !== "reaction") {
    return json({ error: "Invalid action" }, 400);
  }
  if (![1, -1].includes(delta)) return json({ error: "Invalid delta" }, 400);
  if (action === "reaction" && (typeof emoji !== "string" || !emoji || emoji.length > 16)) {
    return json({ error: "Invalid reaction" }, 400);
  }

  try {
    await ensureTable(DB);
    const existing = await DB.prepare("SELECT * FROM music_analytics WHERE track_id = ?").bind(trackId).first();
    const current = existing ? parseRow(existing) : { listens: 0, skips: 0, likes: 0, dislikes: 0, reactions: {} };

    if (action === "reaction") {
      current.reactions[emoji] = Math.max(0, (Number(current.reactions[emoji]) || 0) + delta);
      if (current.reactions[emoji] === 0) delete current.reactions[emoji];
    } else {
      current[action === "listen" ? "listens" : action === "skip" ? "skips" : `${action}s`] = Math.max(
        0,
        current[action === "listen" ? "listens" : action === "skip" ? "skips" : `${action}s`] + delta,
      );
    }

    await DB.prepare(`
      INSERT INTO music_analytics (track_id, listens, skips, likes, dislikes, reactions)
      VALUES (?, ?, ?, ?, ?, ?)
      ON CONFLICT(track_id) DO UPDATE SET
        listens = excluded.listens,
        skips = excluded.skips,
        likes = excluded.likes,
        dislikes = excluded.dislikes,
        reactions = excluded.reactions
    `).bind(trackId, current.listens, current.skips, current.likes, current.dislikes, JSON.stringify(current.reactions)).run();

    return json({ trackId, ...current });
  } catch {
    return json({ error: "Could not update music analytics" }, 500);
  }
}