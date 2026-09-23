import { BLOG_POSTS, PROJECTS, MUSIC_RELEASES, PROFILE, LASTFM_CONFIG } from './_generated/terminal-data.js';

export const C = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  italic: '\x1b[3m',
  underline: '\x1b[4m',

  // colors
  purple: '\x1b[38;5;141m',
  lavender: '\x1b[38;5;177m',
  pink: '\x1b[38;5;212m',
  peach: '\x1b[38;5;219m',
  cyan: '\x1b[38;5;87m',
  green: '\x1b[38;5;120m',
  cream: '\x1b[38;5;223m',
  yellow: '\x1b[38;5;229m',
  border: '\x1b[38;5;241m',
  gray: '\x1b[38;5;246m',
  darkGray: '\x1b[38;5;238m',
  white: '\x1b[38;5;255m',
};

export function stripAnsi(str) {
  return (str || '').replace(/\x1b\[[0-9;]*m/g, '');
}

export function padRight(str, len) {
  const visibleLen = stripAnsi(str).length;
  return str + ' '.repeat(Math.max(0, len - visibleLen));
}

export function padLeft(str, len) {
  const visibleLen = stripAnsi(str).length;
  return ' '.repeat(Math.max(0, len - visibleLen)) + str;
}

export function wrapText(text, width) {
  const words = (text || '').split(/\s+/);
  const lines = [];
  let current = '';

  for (const word of words) {
    if (!word) continue;
    if ((current + ' ' + word).trim().length <= width) {
      current = (current + ' ' + word).trim();
    } else {
      if (current) lines.push(current);
      current = word;
    }
  }
  if (current) lines.push(current);
  return lines;
}

export function renderBanner() {
  const bannerLines = [
    `${C.purple}  ██╗   ██╗██╗██████╗ ███████╗██╗  ██╗${C.reset}`,
    `${C.purple}  ██║   ██║██║██╔══██╗██╔════╝╚██╗██╔╝${C.reset}`,
    `${C.lavender}  ██║   ██║██║██████╔╝█████╗   ╚███╔╝ ${C.reset}`,
    `${C.pink}  ╚██╗ ██╔╝██║██╔══██╗██╔══╝   ██╔██╗ ${C.reset}`,
    `${C.peach}   ╚████╔╝ ██║██║  ██║███████╗██╔╝ ██╗${C.reset}`,
    `${C.peach}    ╚═══╝  ╚═╝╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝${C.reset}`,
  ];

  const sideInfo = [
    `     ${C.bold}${C.cream}stabbed.wtf${C.reset}`,
    `     ${C.gray}"code can be used as a form of protest :)"${C.reset}`,
    `     ${C.cyan}https://stabbed.wtf${C.reset}`,
    `     ${C.border}src: ${C.cyan}https://github.com/hnpf/stabbed.wtf${C.reset}`,
    ``,
    ``,
  ];

  return bannerLines.map((line, idx) => `${line}${sideInfo[idx] || ''}`).join('\n');
}

export function renderHome() {
  const latestPost = BLOG_POSTS[0] || {
    title: 'hello, from stabbed.wtf!',
    date: '2026',
    snippet: 'thoughts on code, recent events, etc..',
    link: 'welcome',
  };

  const banner = renderBanner();

  const latestPostSection = [
    `  ${C.cream}Latest blog post${C.reset}`,
    ` ${C.border}─────────────────────────────────────────────────────────────────────────────${C.reset}`,
    `   ${C.purple}${latestPost.date}${C.reset}  ${C.bold}${C.yellow}${latestPost.title}${C.reset}`,
    `   ${C.gray}"${latestPost.snippet.slice(0, 72)}..."${C.reset}`,
    `   ${C.cyan}https://stabbed.wtf/blog/${latestPost.link || latestPost.id}${C.reset}`,
  ].join('\n');

  // about (left)
  const aboutLines = [
    'developer, linux user,',
    'music producer, and open',
    'source tech. working on',
    'fast, opinionated projects.',
    '',
  ];

  // socials box
  const socials = [
    { label: 'GitHub', val: 'https://github.com/hnpf' },
    { label: 'Discord', val: 'https://discord.gg/TSZNYbjzF7' },
    { label: 'Site', val: 'https://stabbed.wtf' },
    { label: 'Bandcamp', val: 'https://rxvirex.bandcamp.com' },
    { label: 'RSS feed', val: 'https://stabbed.wtf/rss.xml' },
    { label: 'Guestbook', val: 'https://stabbed.wtf/guestbook' },
  ];

  const leftWidth = 28;
  const rightLabelWidth = 11;
  const rightValWidth = 32;

  // box drawing top
  const topRow = `${C.border}┌─${C.cream}About${C.border}${'─'.repeat(leftWidth - 4)}┐ ┌─${C.cream}Socials${C.border}${'─'.repeat(rightLabelWidth - 6)}┬${'─'.repeat(rightValWidth + 2)}┐${C.reset}`;

  const numRows = Math.max(aboutLines.length, socials.length);
  const middleRows = [];

  for (let i = 0; i < numRows; i++) {
    const leftText = aboutLines[i] || '';
    const leftPadded = padRight(leftText, leftWidth);

    const social = socials[i] || { label: '', val: '' };
    const rightLabelPadded = padRight(social.label, rightLabelWidth);
    const rightValFormatted = social.val ? `${C.cyan}${padRight(social.val, rightValWidth)}${C.reset}` : ' '.repeat(rightValWidth);

    const row = `${C.border}│${C.reset} ${leftPadded} ${C.border}│ │${C.reset} ${C.pink}${rightLabelPadded}${C.reset} ${C.border}│${C.reset} ${rightValFormatted} ${C.border}│${C.reset}`;
    middleRows.push(row);
  }

  // box drawing bottom
  const bottomRow = `${C.border}└${'─'.repeat(leftWidth + 2)}┘ └${'─'.repeat(rightLabelWidth + 2)}┴${'─'.repeat(rightValWidth + 2)}┘${C.reset}`;

  const legend = [
    `  ${C.cream}Legend${C.reset}`,
    `  ${C.green}$ curl${C.reset} ${C.cream}stabbed.wtf${C.reset}             ${C.gray}# get this card${C.reset}`,
    `  ${C.green}$ curl${C.reset} ${C.cream}stabbed.wtf/help${C.reset}        ${C.gray}# list all available endpoints${C.reset}`,
    `  ${C.green}$ curl${C.reset} ${C.cream}stabbed.wtf/blog${C.reset}        ${C.gray}# read recent blog posts${C.reset}`,
    `  ${C.green}$ curl${C.reset} ${C.cream}stabbed.wtf/projects${C.reset}    ${C.gray}# check out my open source projects${C.reset}`,
    `  ${C.green}$ curl${C.reset} ${C.cream}stabbed.wtf/music${C.reset}       ${C.gray}# music releases & discography${C.reset}`,
    `  ${C.green}$ curl${C.reset} ${C.cream}stabbed.wtf/now-playing${C.reset} ${C.gray}# live last.fm track scrobble${C.reset}`,
  ].join('\n');

  return [
    '',
    banner,
    '',
    latestPostSection,
    '',
    topRow,
    ...middleRows,
    bottomRow,
    '',
    legend,
    '',
  ].join('\n');
}

export function renderHelp() {
  const banner = renderBanner();

  return [
    '',
    banner,
    '',
    `  ${C.bold}${C.cream}legend & navigation${C.reset}`,
    `  ${C.green}$ curl${C.reset} ${C.cream}stabbed.wtf${C.reset}                 ${C.gray}# main overview card${C.reset}`,
    `  ${C.green}$ curl${C.reset} ${C.cream}stabbed.wtf/help${C.reset}            ${C.gray}# full list of available endpoints (this menu)${C.reset}`,
    `  ${C.green}$ curl${C.reset} ${C.cream}stabbed.wtf/about${C.reset}           ${C.gray}# bio & philosophy${C.reset}`,
    `  ${C.green}$ curl${C.reset} ${C.cream}stabbed.wtf/socials${C.reset}         ${C.gray}# direct links to all socials & channels${C.reset}`,
    '',
    `  ${C.bold}${C.cream}Content & Posts${C.reset}`,
    `  ${C.green}$ curl${C.reset} ${C.cream}stabbed.wtf/blog${C.reset}            ${C.gray}# list all published blog articles${C.reset}`,
    `  ${C.green}$ curl${C.reset} ${C.cream}stabbed.wtf/blog/<slug>${C.reset}     ${C.gray}# read full article in terminal markdown${C.reset}`,
    `  ${C.green}$ curl${C.reset} ${C.cream}stabbed.wtf/projects${C.reset}        ${C.gray}# browse open source software & repositories${C.reset}`,
    `  ${C.green}$ curl${C.reset} ${C.cream}stabbed.wtf/music${C.reset}           ${C.gray}# discography (HATEWARE, FIRST ATTEMPT)${C.reset}`,
    `  ${C.green}$ curl${C.reset} ${C.cream}stabbed.wtf/now-playing${C.reset}     ${C.gray}# live Last.fm scrobble & track status${C.reset}`,
    '',
    `  ${C.bold}${C.cream}Interactive & Guestbook${C.reset}`,
    `  ${C.green}$ curl${C.reset} ${C.cream}stabbed.wtf/guestbook${C.reset}       ${C.gray}# read recent guestbook entries${C.reset}`,
    `  ${C.green}$ curl${C.reset} ${C.cream}-X POST stabbed.wtf/api/guestbook \\${C.reset}`,
    `       ${C.green}-H "Content-Type: application/json" \\${C.reset}`,
    `       ${C.green}-d '{"name":"you","message":"hello!"}'${C.reset}  ${C.gray}# sign the guestbook from terminal!!${C.reset}`,
    '',
    `  ${C.bold}${C.cream}Utilities & Extras${C.reset}`,
    `  ${C.green}$ curl${C.reset} ${C.cream}stabbed.wtf/ping${C.reset}            ${C.gray}# health check (returns pong)${C.reset}`,
    `  ${C.green}$ curl${C.reset} ${C.cream}[-46] stabbed.wtf/ip${C.reset}        ${C.gray}# get public IP address${C.reset}`,
    `  ${C.green}$ curl${C.reset} ${C.cream}stabbed.wtf/json${C.reset}            ${C.gray}# profile, posts, & projects JSON${C.reset}`,
    `  ${C.green}$ curl${C.reset} ${C.cream}stabbed.wtf/fsh${C.reset}             ${C.gray}# fih (dont find out for the love of god)${C.reset}`,
    '',
  ].join('\n');
}

export function renderBlogList() {
  const header = [
    '',
    `  ${C.bold}${C.purple}VIREX BLOG POSTS${C.reset}  ${C.gray}(${BLOG_POSTS.length} posts published)${C.reset}`,
    ` ${C.border}─────────────────────────────────────────────────────────────────────────────${C.reset}`,
    `  ${C.gray}Read any post with:${C.reset} ${C.green}curl stabbed.wtf/blog/<slug>${C.reset}`,
    '',
  ];

  const items = BLOG_POSTS.map((post) => {
    const slug = post.link || post.id;
    const cat = post.category ? `[${post.category}]` : '';
    const read = post.readTime ? `(${post.readTime})` : '';
    return [
      `  ${C.purple}${post.date}${C.reset}  ${C.bold}${C.yellow}${post.title}${C.reset}  ${C.pink}${cat}${C.reset} ${C.gray}${read}${C.reset}`,
      `  ${C.border}↳${C.reset} ${C.cyan}curl stabbed.wtf/blog/${slug}${C.reset}`,
      `    ${C.gray}"${post.snippet}"${C.reset}`,
      '',
    ].join('\n');
  });

  return [...header, ...items].join('\n');
}

export function formatMarkdownForTerminal(md) {
  if (!md) return '';

  let lines = md.split('\n');
  let output = [];
  let inCodeBlock = false;

  for (let rawLine of lines) {
    let line = rawLine;

    // filter out custom HTML spacer tags
    if (line.includes('<spacer') || line.includes('</spacer>')) {
      continue;
    }

    // code blocks
    if (line.startsWith('```')) {
      inCodeBlock = !inCodeBlock;
      output.push(`${C.border} ${'─'.repeat(60)}${C.reset}`);
      continue;
    }

    if (inCodeBlock) {
      output.push(`  ${C.green}${line}${C.reset}`);
      continue;
    }

    // headers
    if (line.startsWith('# ')) {
      output.push('');
      output.push(`  ${C.bold}${C.purple}# ${line.replace(/^#\s+/, '')}${C.reset}`);
      output.push(` ${C.border}─────────────────────────────────────────────────────────────────────────────${C.reset}`);
      continue;
    }
    if (line.startsWith('## ')) {
      output.push('');
      output.push(`  ${C.bold}${C.pink}## ${line.replace(/^##\s+/, '')}${C.reset}`);
      continue;
    }
    if (line.startsWith('### ')) {
      output.push('');
      output.push(`  ${C.bold}${C.yellow}### ${line.replace(/^###\s+/, '')}${C.reset}`);
      continue;
    }

    // blockquotes
    if (line.startsWith('> ')) {
      output.push(`  ${C.border}│${C.reset} ${C.italic}${C.cyan}${line.replace(/^>\s+/, '')}${C.reset}`);
      continue;
    }

    // lists
    if (/^\s*[\*\-]\s+/.test(line)) {
      const formattedList = line.replace(/^(\s*)[\*\-]\s+(.*)$/, (_, indent, text) => {
        return `${indent}  ${C.peach}•${C.reset} ${text}`;
      });
      output.push(highlightInlineStyles(formattedList));
      continue;
    }

    // ordered lists
    if (/^\s*\d+\.\s+/.test(line)) {
      const formattedNum = line.replace(/^(\s*)(\d+\.)\s+(.*)$/, (_, indent, num, text) => {
        return `${indent}  ${C.purple}${num}${C.reset} ${text}`;
      });
      output.push(highlightInlineStyles(formattedNum));
      continue;
    }

    output.push(highlightInlineStyles(line));
  }

  return output.join('\n');
}

function highlightInlineStyles(str) {
  if (!str) return '';

  return str
    // bold markdown **text**
    .replace(/\*\*(.*?)\*\*/g, `${C.bold}${C.white}$1${C.reset}`)
    // italic *text*
    .replace(/\*([^\*]+)\*/g, `${C.italic}$1${C.reset}`)
    // inline code `code`
    .replace(/`([^`]+)`/g, `${C.cyan}$1${C.reset}`)
    // markdown links [label](url)
    .replace(/\[([^\]]+)\]\((https?:\/\/[^\)]+)\)/g, `${C.underline}${C.cyan}$1${C.reset} ${C.gray}($2)${C.reset}`);
}

export function renderBlogPost(slug) {
  const post = BLOG_POSTS.find((p) => p.id === slug || p.link === slug);
  if (!post) {
    return [
      '',
      `  ${C.pink}Error: Post "${slug}" not found!${C.reset}`,
      `  ${C.gray}Type${C.reset} ${C.green}curl stabbed.wtf/blog${C.reset} ${C.gray}to see all available posts.${C.reset}`,
      '',
    ].join('\n');
  }

  const header = [
    '',
    `  ${C.bold}${C.yellow}${post.title}${C.reset}`,
    `  ${C.purple}${post.date}${C.reset}  ${C.pink}[${post.category || 'general'}]${C.reset}  ${C.gray}${post.readTime || ''}${C.reset}`,
    `  ${C.cyan}https://stabbed.wtf/blog/${post.link || post.id}${C.reset}`,
    ` ${C.border}═════════════════════════════════════════════════════════════════════════════${C.reset}`,
    '',
  ].join('\n');

  const content = formatMarkdownForTerminal(post.content || post.snippet);
  const footer = [
    '',
    ` ${C.border}─────────────────────────────────────────────────────────────────────────────${C.reset}`,
    `  ${C.gray}Back to post list:${C.reset} ${C.green}curl stabbed.wtf/blog${C.reset}  ${C.border}•${C.reset}  ${C.gray}Home:${C.reset} ${C.green}curl stabbed.wtf${C.reset}`,
    '',
  ].join('\n');

  return header + content + footer;
}

export function renderProjects() {
  const header = [
    '',
    `  ${C.bold}${C.purple}OPEN SOURCE & PROJECTS${C.reset}  ${C.gray}(${PROJECTS.length} featured)${C.reset}`,
    ` ${C.border}─────────────────────────────────────────────────────────────────────────────${C.reset}`,
    `  ${C.gray}Explore full GitHub and project history at:${C.reset} ${C.cyan}https://github.com/hnpf${C.reset}`,
    '',
  ];

  const items = PROJECTS.map((proj) => {
    const tags = proj.tags ? proj.tags.map((t) => `[${t}]`).join(' ') : '';
    return [
      `  ${C.bold}${C.yellow}${proj.title}${C.reset}  ${C.pink}${tags}${C.reset}`,
      `  ${C.border}↳${C.reset} ${C.cyan}${proj.link}${C.reset}`,
      `    ${C.gray}${proj.description}${C.reset}`,
      '',
    ].join('\n');
  });

  return [...header, ...items].join('\n');
}

export function renderMusic() {
  const header = [
    '',
    `  ${C.bold}${C.purple}DISCOGRAPHY / MUSIC RELEASES${C.reset}`,
    ` ${C.border}─────────────────────────────────────────────────────────────────────────────${C.reset}`,
    `  ${C.gray}Artist: rxvirex (virex)  •  Bandcamp: https://rxvirex.bandcamp.com${C.reset}`,
    '',
  ];

  const items = MUSIC_RELEASES.map((m) => {
    const links = [];
    if (m.links?.spotify) links.push(`Spotify: ${m.links.spotify}`);
    if (m.links?.bandcamp) links.push(`Bandcamp: ${m.links.bandcamp}`);
    if (m.links?.youtubeMusic) links.push(`YT Music: ${m.links.youtubeMusic}`);

    return [
      `  ${C.bold}${C.yellow}${m.title}${C.reset}  ${C.pink}[${m.type} • ${m.releaseDate}]${C.reset}  ${C.gray}(${m.duration || ''} - ${m.genre || ''})${C.reset}`,
      `  ${C.gray}"${m.description}"${C.reset}`,
      ...links.map((l) => `  ${C.border}↳${C.reset} ${C.cyan}${l}${C.reset}`),
      '',
    ].join('\n');
  });

  return [...header, ...items].join('\n');
}

export async function renderNowPlaying(env) {
  try {
    const apiKey =
      env?.LASTFM_API_KEY ||
      env?.VITE_LASTFM_API_KEY ||
      LASTFM_CONFIG?.apiKey ||
      (typeof process !== 'undefined' ? process.env?.LASTFM_API_KEY || process.env?.VITE_LASTFM_API_KEY : '') ||
      '';
    const username =
      env?.LASTFM_USERNAME ||
      env?.VITE_LASTFM_USERNAME ||
      LASTFM_CONFIG?.username ||
      (typeof process !== 'undefined' ? process.env?.LASTFM_USERNAME || process.env?.VITE_LASTFM_USERNAME : '') ||
      '';

    if (!apiKey || !username) {
      return [
        '',
        `  ${C.peach}♫ Last.fm Now Playing${C.reset}`,
        `  ${C.gray}Status: last.fm API keys not configured.${C.reset}`,
        '',
      ].join('\n');
    }

    const url = new URL('https://ws.audioscrobbler.com/2.0/');
    url.searchParams.set('method', 'user.getrecenttracks');
    url.searchParams.set('user', username);
    url.searchParams.set('api_key', apiKey);
    url.searchParams.set('format', 'json');
    url.searchParams.set('limit', '2');

    const res = await fetch(url.toString());
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();

    const tracks = Array.isArray(json?.recenttracks?.track)
      ? json.recenttracks.track
      : json?.recenttracks?.track
      ? [json.recenttracks.track]
      : [];

    const track = tracks.find((item) => item?.['@attr']?.nowplaying === 'true') || tracks[0];

    if (!track) {
      return `\n  ${C.gray}No recent tracks found for ${username}.${C.reset}\n`;
    }

    const isNowPlaying = track?.['@attr']?.nowplaying === 'true';
    const artist = typeof track.artist === 'object' ? track.artist['#text'] : track.artist || 'Unknown';
    const name = track.name || 'Unknown';
    const album = typeof track.album === 'object' ? track.album['#text'] : track.album || '';
    const trackUrl = track.url || '';

    const icon = isNowPlaying ? `${C.green}▶ NOW PLAYING${C.reset}` : `${C.gray}⏹ LAST SCROBBLED${C.reset}`;

    return [
      '',
      `  ${icon}  ${C.gray}(Last.fm: @${username})${C.reset}`,
      ` ${C.border}─────────────────────────────────────────────────────────────────────────────${C.reset}`,
      `  ${C.bold}${C.yellow}${name}${C.reset}  ${C.cream}by${C.reset}  ${C.bold}${C.pink}${artist}${C.reset}`,
      album ? `  ${C.gray}Album: ${album}${C.reset}` : '',
      trackUrl ? `  ${C.border}↳${C.reset} ${C.cyan}${trackUrl}${C.reset}` : '',
      '',
    ].filter(Boolean).join('\n');
  } catch (err) {
    return [
      '',
      `  ${C.peach}♫ Last.fm Now Playing${C.reset}`,
      `  ${C.gray}cannot query last.fm at this moment: ${err.message} :(${C.reset}`,
      '',
    ].join('\n');
  }
}

export function renderAbout() {
  return [
    '',
    renderBanner(),
    '',
    `  ${C.bold}${C.cream}About stabbed.wtf${C.reset}`,
    ` ${C.border}─────────────────────────────────────────────────────────────────────────────${C.reset}`,
    `  ${C.white}${PROFILE.bio}${C.reset}`,
    '',
    `  ${C.peach}Philosophy:${C.reset}`,
    `  ${C.italic}${C.gray}"code can be used as a form of protest :)"${C.reset}`,
    '',
    `  ${C.peach}Interests & Grind:${C.reset}`,
    `  ${C.cream}• Linux flavors and system prefs:${C.reset} ${C.gray}Debian, Arch Linux, GNOME, LibAdwaita, Wayland, TUI utilities.${C.reset}`,
    `  ${C.cream}• Web & performance:${C.reset} ${C.gray}React 19, Vite, Cloudflare Pages edge isolates, Tailwind 4.${C.reset}`,
    `  ${C.cream}• Music prod and my flavors:${C.reset} ${C.gray}Rage, Trap, Noise, DSBM${C.reset}`,
    `  ${C.cream}• Cybersec:${C.reset} ${C.gray}Honeypots, malware inspection, reverse engineering, data sovereignty & offline preservation, if that even counts.${C.reset}`,
    '',
    `  ${C.peach}Socials:${C.reset} ${C.cyan}curl stabbed.wtf/socials${C.reset}  ${C.border}•${C.reset}  ${C.peach}Help:${C.reset} ${C.cyan}curl stabbed.wtf/help${C.reset}`,
    '',
  ].join('\n');
}

export function renderSocials() {
  return [
    '',
    `  ${C.bold}${C.cream}Socials & links${C.reset}`,
    ` ${C.border}─────────────────────────────────────────────────────────────────────────────${C.reset}`,
    `  ${C.pink}GitHub:${C.reset}     ${C.cyan}${PROFILE.github}${C.reset}`,
    `  ${C.pink}Discord:${C.reset}    ${C.cyan}${PROFILE.discord}${C.reset}`,
    `  ${C.pink}Website:${C.reset}    ${C.cyan}${PROFILE.site}${C.reset}`,
    `  ${C.pink}Bandcamp:${C.reset}   ${C.cyan}${PROFILE.bandcamp}${C.reset}`,
    `  ${C.pink}RSS Feed:${C.reset}   ${C.cyan}${PROFILE.rss}${C.reset}`,
    `  ${C.pink}Source:${C.reset}     ${C.cyan}${PROFILE.source}${C.reset}`,
    '',
  ].join('\n');
}

export function renderFsh() {
  return [
    '',
    `${C.cyan}       .       ${C.reset}`,
    `${C.cyan}      \":\"      ${C.reset}`,
    `${C.cyan}    ___:____     |\"\\/\"|${C.reset}`,
    `${C.cyan}  ,'        \`.    \\  /${C.reset}    ${C.yellow}   fih says hi! :D${C.reset}`,
    `${C.cyan}  |  O        \\___/  /${C.reset}     ${C.gray}fih originates somewhere on an ascii copy paste site${C.reset}`,
    `${C.cyan}~^~^~^~^~^~^~^~^~^~^~^~^~^~^~^~^~^~^~^~^~^~^~^~^~^~^~${C.reset}`,
    '',
  ].join('\n');
}

export function renderJson() {
  return JSON.stringify(
    {
      profile: PROFILE,
      blogPosts: BLOG_POSTS,
      projects: PROJECTS,
      music: MUSIC_RELEASES,
    },
    null,
    2
  );
}
