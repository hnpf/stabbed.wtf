async function ensureTable(DB) {
  try {
    await DB.prepare(`
      CREATE TABLE IF NOT EXISTS blog_reactions (
        slug TEXT PRIMARY KEY,
        reactions TEXT NOT NULL DEFAULT '{}'
      )
    `).run();
  } catch {}
}

export async function onRequestGet(context) {
  const { request, env } = context;
  const DB = env.DB || env.virex_db;
  if (!DB) {
    return new Response(JSON.stringify({ error: 'Database binding missing' }), { status: 500 });
  }

  await ensureTable(DB);

  const url = new URL(request.url);
  const slug = url.searchParams.get('slug');

  try {
    if (slug) {
      const row = await DB.prepare('SELECT reactions FROM blog_reactions WHERE slug = ?').bind(slug).first();
      let reactions = {};
      if (row?.reactions) {
        try { reactions = JSON.parse(row.reactions); } catch {}
      }
      return new Response(JSON.stringify({ slug, reactions }), {
        headers: { 'Content-Type': 'application/json' }
      });
    } else {
      const { results } = await DB.prepare('SELECT slug, reactions FROM blog_reactions').all();
      const all = {};
      for (const row of (results || [])) {
        try { all[row.slug] = JSON.parse(row.reactions); } catch { all[row.slug] = {}; }
      }
      return new Response(JSON.stringify(all), {
        headers: { 'Content-Type': 'application/json' }
      });
    }
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

  await ensureTable(DB);

  try {
    const { slug, emoji, delta } = await request.json();

    if (!slug || typeof slug !== 'string' || !emoji || typeof emoji !== 'string') {
      return new Response(JSON.stringify({ error: 'slug and emoji are required' }), { status: 400 });
    }

    const cleanEmoji = emoji.slice(0, 16);
    const reactDelta = typeof delta === 'number' ? delta : 1;

    const existing = await DB.prepare('SELECT reactions FROM blog_reactions WHERE slug = ?').bind(slug).first();
    let reactions = {};
    if (existing?.reactions) {
      try { reactions = JSON.parse(existing.reactions); } catch {}
    }

    const current = Number(reactions[cleanEmoji]) || 0;
    const next = Math.max(0, current + reactDelta);
    if (next === 0) {
      delete reactions[cleanEmoji];
    } else {
      reactions[cleanEmoji] = next;
    }

    const reactionsJson = JSON.stringify(reactions);

    if (existing) {
      await DB.prepare('UPDATE blog_reactions SET reactions = ? WHERE slug = ?').bind(reactionsJson, slug).run();
    } else {
      await DB.prepare('INSERT INTO blog_reactions (slug, reactions) VALUES (?, ?)').bind(slug, reactionsJson).run();
    }

    return new Response(JSON.stringify({ slug, reactions }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
