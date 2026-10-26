import { LASTFM_CONFIG } from '../../_generated/terminal-data.js';

export async function onRequestGet(context) {
  const { env } = context;
  const apiKey = env.LASTFM_API_KEY || env.VITE_LASTFM_API_KEY || LASTFM_CONFIG?.apiKey || '';
  const username = env.LASTFM_USERNAME || env.VITE_LASTFM_USERNAME || LASTFM_CONFIG?.username || '';

  if (!apiKey || !username) {
    return new Response(
      JSON.stringify({ error: 'Last.fm is not configured on the server.' }),
      { status: 404, headers: { 'Content-Type': 'application/json' } }
    );
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
      return new Response(
        JSON.stringify({ error: 'Last.fm API error', details: body }),
        { status: response.status, headers: { 'Content-Type': 'application/json' } }
      );
    }

    let json = null;
    try {
      json = body ? JSON.parse(body) : null;
    } catch {
      return new Response(
        JSON.stringify({ error: 'Invalid JSON response from Last.fm API.' }),
        { status: 502, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const tracks = Array.isArray(json?.recenttracks?.track)
      ? json.recenttracks.track
      : json?.recenttracks?.track
      ? [json.recenttracks.track]
      : [];

    const track = tracks.find((item) => item?.['@attr']?.nowplaying === 'true') || tracks[0];

    if (!track) {
      return new Response(
        JSON.stringify({ error: 'No recent tracks found.' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const previousTrack = tracks.find((item) => item !== track && item?.date?.uts);
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
    
    // Pick the largest available image that is not an empty string or placeholder
    let image = undefined;
    if (Array.isArray(track?.image)) {
      const reversed = track.image.slice().reverse();
      const validImg = reversed.find((item) => item?.['#text'] && item['#text'].trim().length > 0);
      if (validImg && !validImg['#text'].includes('2a96cbd8b46e442fc41c2b86b821562f')) {
        image = validImg['#text'];
      }
    }

    const timestamp = track?.date?.uts ? Number(track.date.uts) * 1000 : null;

    let durationMs = null;
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
        let infoJson = null;
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

    if (!durationMs) {
      try {
        const itunesUrl = new URL('https://itunes.apple.com/search');
        itunesUrl.searchParams.set('term', `${artist} ${name}`);
        itunesUrl.searchParams.set('entity', 'song');
        itunesUrl.searchParams.set('limit', '1');
        const itunesRes = await fetch(itunesUrl.toString());
        if (itunesRes.ok) {
          const itunesJson = await itunesRes.json();
          const dur = Number(itunesJson?.results?.[0]?.trackTimeMillis);
          if (!isNaN(dur) && dur > 0) {
            durationMs = dur;
          }
        }
      } catch {}
    }

    return new Response(
      JSON.stringify({
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
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=3, s-maxage=3',
        },
      }
    );
  } catch (err) {
    console.error('Last.fm proxy failed', err);
    return new Response(
      JSON.stringify({ error: 'Unable to fetch Last.fm now playing.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
