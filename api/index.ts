import express from 'express';
import dotenv from 'dotenv';
import { vxaddguestbook, vxlistguestbook, validateGuestbookMessage } from './guestbook_db.js';

dotenv.config();

const app = express();
app.use(express.json({ limit: '10mb' }));

app.get('/api/guestbook', (req, res) => {
  try {
    res.json(vxlistguestbook());
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/guestbook', (req, res) => {
  try {
    let { name, message } = req.body;
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'message is required and must be a string!' });
    }
    const cleanName = typeof name === 'string' && name.trim() 
      ? name.trim().slice(0, 24) 
      : 'anonymous';
    const cleanMessage = message.trim().slice(0, 200);
    if (!validateGuestbookMessage(cleanMessage)) {
      return res.status(400).json({ error: 'your message contains flagged content. please keep it clean! :(' });
    }
    if (!validateGuestbookMessage(cleanName)) {
      return res.status(400).json({ error: 'your alias contains flagged content. please keep it clean! :(' });
    }
    const entry = vxaddguestbook(cleanName, cleanMessage);
    res.status(201).json(entry);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/lastfm/now-playing', async (req, res) => {
  const apiKey = process.env.LASTFM_API_KEY || process.env.VITE_LASTFM_API_KEY || '';
  const username = process.env.LASTFM_USERNAME || process.env.VITE_LASTFM_USERNAME || '';
  if (!apiKey || !username) {
    return res.status(404).json({ error: 'Last.fm is not configured on the server.' });
  }

  try {
    const url = new URL('https://ws.audioscrobbler.com/2.0/');
    url.searchParams.set('method', 'user.getrecenttracks');
    url.searchParams.set('user', username);
    url.searchParams.set('api_key', apiKey);
    url.searchParams.set('format', 'json');
    url.searchParams.set('limit', '2');

    const response = await fetch(url.toString());
    const body = await response.text();

    if (!response.ok) {
      return res.status(response.status).json({ error: 'Last.fm API error', details: body });
    }

    let json: any = null;
    try {
      json = body ? JSON.parse(body) : null;
    } catch {
      return res.status(502).json({ error: 'Invalid JSON response from Last.fm API.' });
    }

    const tracks = Array.isArray(json?.recenttracks?.track)
      ? json.recenttracks.track
      : json?.recenttracks?.track
      ? [json.recenttracks.track]
      : [];

    const track = tracks.find((item: any) => item?.['@attr']?.nowplaying === 'true') || tracks[0];

    if (!track) {
      return res.status(404).json({ error: 'No recent tracks found.' });
    }

    const previousTrack = tracks.find((item: any) => item !== track && item?.date?.uts);
    const prevScrobbleAt = previousTrack?.date?.uts ? Number(previousTrack.date.uts) * 1000 : null;

    const fetchedAt = Date.now();
    const nowPlaying = track?.['@attr']?.nowplaying === 'true';
    const artist = typeof track?.artist === 'object'
      ? track.artist?.['#text'] || 'Unknown Artist'
      : track?.artist || 'Unknown Artist';
    const name = typeof track?.name === 'string' ? track.name : 'Unknown Track';
    const album = typeof track?.album === 'object'
      ? track.album?.['#text'] || ''
      : track?.album || '';
    const trackUrl = typeof track?.url === 'string' ? track.url : '';
    
    let image: string | undefined = undefined;
    if (Array.isArray(track?.image)) {
      const reversed = track.image.slice().reverse();
      const validImg = reversed.find((item: any) => item?.['#text'] && item['#text'].trim().length > 0);
      if (validImg && !validImg['#text'].includes('2a96cbd8b46e442fc41c2b86b821562f')) {
        image = validImg['#text'];
      }
    }

    const timestamp = track?.date?.uts ? Number(track.date.uts) * 1000 : null;

    let durationMs: number | null = null;
    try {
      const infoUrl = new URL('https://ws.audioscrobbler.com/2.0/');
      infoUrl.searchParams.set('method', 'track.getInfo');
      infoUrl.searchParams.set('api_key', apiKey);
      infoUrl.searchParams.set('format', 'json');

      if (track?.mbid) {
        infoUrl.searchParams.set('mbid', track.mbid);
      } else {
        infoUrl.searchParams.set('artist', artist);
        infoUrl.searchParams.set('track', name);
        infoUrl.searchParams.set('autocorrect', '1');
      }

      const infoResponse = await fetch(infoUrl.toString());
      if (infoResponse.ok) {
        const infoBody = await infoResponse.text();
        let infoJson: any = null;
        try {
          infoJson = infoBody ? JSON.parse(infoBody) : null;
        } catch {}
        const rawDur = Number(infoJson?.track?.duration);
        if (!isNaN(rawDur) && rawDur > 0) {
          durationMs = rawDur;
        }
      }
    } catch (infoError) {
      console.warn('Last.fm track info lookup failed', infoError);
    }

    res.json({
      track: {
        artist,
        name,
        album,
        url: trackUrl,
        image,
        isNowPlaying: nowPlaying,
        timestamp,
        durationMs,
        fetchedAt,
        prevScrobbleAt,
      },
      username,
    });
  } catch (err: any) {
    console.error('Last.fm proxy failed', err);
    res.status(500).json({ error: 'Unable to fetch Last.fm now playing.' });
  }
});

app.post('/api/report-bug', async (req, res) => {
  try {
    const { title, description, screenshot, url, userAgent } = req.body;

    if (!title || !description) {
      return res.status(400).json({ error: 'Title and description are required!' });
    }

    const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
    if (!webhookUrl) {
      console.warn('DISCORD WEBHOOK URL is not set in the environment variables!!');
      return res.status(500).json({ error: 'Bug reporting is currently misconfigured. The Webhook URL is missing!!!' });
    }

    const formData = new FormData();
    const embed: any = {
      title: `Bug Report: ${title.slice(0, 256)}`,
      description: description.slice(0, 2048),
      color: 16729344, // #FF4500
      fields: [
        { name: 'URL', value: url ? url.slice(0, 1024) : 'Unknown', inline: true },
        { name: 'User Agent', value: userAgent ? userAgent.slice(0, 1024) : 'Unknown', inline: true }
      ],
      timestamp: new Date().toISOString()
    };

    if (screenshot && typeof screenshot === 'string' && screenshot.startsWith('data:')) {
      const matches = screenshot.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
      if (matches && matches.length === 3) {
        const contentType = matches[1];
        const base64Data = matches[2];
        const extension = contentType.split('/')[1] || 'png';
        const filename = `screenshot.${extension}`;
        
        const buffer = Buffer.from(base64Data, 'base64');
        const blob = new Blob([buffer], { type: contentType });
        formData.append('files[0]', blob, filename);
        
        embed.image = { url: `attachment://${filename}` };
      }
    }

    formData.append('payload_json', JSON.stringify({
      embeds: [embed]
    }));

    const response = await fetch(webhookUrl, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('Discord webhook error:', errText);
      return res.status(response.status).json({ error: `Discord API error: ${response.statusText}` });
    }

    res.status(200).json({ message: 'Bug successfully reported!' });
  } catch (err: any) {
    console.error('Report bug error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.get('*', async (req, res, next) => {
  const userAgent = (req.headers['user-agent'] || '').toLowerCase();
  const accept = (req.headers['accept'] || '').toLowerCase();
  const isCli =
    req.query.curl !== undefined ||
    req.query.cli !== undefined ||
    req.query.format === 'text' ||
    /curl|wget|httpie|fetch|libcurl/i.test(userAgent) ||
    (accept.includes('text/plain') && !accept.includes('text/html'));

  if (!isCli) {
    return next();
  }

  try {
    const terminal = await import('../functions/_terminal.js');
    const pathname = req.path.replace(/\/+$/, '') || '/';

    if (pathname === '/' || pathname === '') {
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      return res.send(terminal.renderHome());
    }
    if (pathname === '/help') {
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      return res.send(terminal.renderHelp());
    }
    if (pathname === '/about') {
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      return res.send(terminal.renderAbout());
    }
    if (pathname === '/socials' || pathname === '/links') {
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      return res.send(terminal.renderSocials());
    }
    if (pathname === '/blog') {
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      return res.send(terminal.renderBlogList());
    }
    if (pathname.startsWith('/blog/')) {
      const slug = pathname.slice('/blog/'.length);
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      return res.send(terminal.renderBlogPost(slug));
    }
    if (pathname === '/projects') {
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      return res.send(terminal.renderProjects());
    }
    if (pathname === '/music' || pathname === '/albums') {
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      return res.send(terminal.renderMusic());
    }
    if (pathname === '/now-playing' || pathname === '/nowplaying') {
      const text = await terminal.renderNowPlaying(process.env);
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      return res.send(text);
    }
    if (pathname === '/ping') {
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      return res.send('pong\n');
    }
    if (pathname === '/ip') {
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');c
      return res.send(`${req.ip || '127.0.0.1'}\n`);
    }
    if (pathname === '/fsh' || pathname === '/fish') {
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      return res.send(terminal.renderFsh());
    }
    if (pathname === '/json') {
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      return res.send(terminal.renderJson());
    }

    res.status(404);
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    return res.send(`\n  \x1b[38;5;212m404 Not Found: "${pathname}"\x1b[0m\n  \x1b[38;5;246mType\x1b[0m \x1b[38;5;120mcurl stabbed.wtf/help\x1b[0m \x1b[38;5;246mto see all available terminal endpoints.\x1b[0m\n\n`);
  } catch (err: any) {
    console.error('Terminal CLI API error:', err);
    return next();
  }
});

const PORT = process.env.PORT || 3001;

if (process.env.NODE_ENV !== 'production' || process.mainModule?.filename === import.meta.filename) {
  app.listen(PORT, () => {
    console.log(`api running on http://localhost:${PORT}`);
  });
}

export default app;
