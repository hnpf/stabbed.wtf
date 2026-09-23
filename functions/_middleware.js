import {
  renderHome,
  renderHelp,
  renderBlogList,
  renderBlogPost,
  renderProjects,
  renderMusic,
  renderNowPlaying,
  renderAbout,
  renderSocials,
  renderFsh,
  renderJson,
  C
} from './_terminal.js';

function isCliRequest(request, url) {
  if (
    url.searchParams.has('curl') ||
    url.searchParams.has('cli') ||
    url.searchParams.get('format') === 'text' ||
    url.searchParams.has('plain')
  ) {
    return true;
  }

  const userAgent = (request.headers.get('user-agent') || '').toLowerCase();
  const accept = (request.headers.get('accept') || '').toLowerCase();

  const isCliAgent = /curl|wget|httpie|fetch|libcurl|powershell|postmanruntime/i.test(userAgent);
  const isStrictText = accept.includes('text/plain') && !accept.includes('text/html');

  return isCliAgent || isStrictText;
}

export async function onRequest(context) {
  const { request, env, next } = context;

  try {
    const url = new URL(request.url);

    // If not a CLI request, pass through to Vite SPA / HTMLRewriter
    if (!isCliRequest(request, url)) {
      return next();
    }

    // Let API endpoints function normally (e.g. POST /api/guestbook)
    if (url.pathname.startsWith('/api/')) {
      return next();
    }

    const pathname = url.pathname.replace(/\/+$/, '') || '/';

    if (pathname === '/' || pathname === '') {
      return new Response(renderHome(), {
        headers: { 'Content-Type': 'text/plain; charset=utf-8' },
      });
    }

    if (pathname === '/help') {
      return new Response(renderHelp(), {
        headers: { 'Content-Type': 'text/plain; charset=utf-8' },
      });
    }

    if (pathname === '/about') {
      return new Response(renderAbout(), {
        headers: { 'Content-Type': 'text/plain; charset=utf-8' },
      });
    }

    if (pathname === '/socials' || pathname === '/links') {
      return new Response(renderSocials(), {
        headers: { 'Content-Type': 'text/plain; charset=utf-8' },
      });
    }

    if (pathname === '/blog') {
      return new Response(renderBlogList(), {
        headers: { 'Content-Type': 'text/plain; charset=utf-8' },
      });
    }

    if (pathname.startsWith('/blog/')) {
      const slug = pathname.slice('/blog/'.length);
      return new Response(renderBlogPost(slug), {
        headers: { 'Content-Type': 'text/plain; charset=utf-8' },
      });
    }

    if (pathname === '/projects') {
      return new Response(renderProjects(), {
        headers: { 'Content-Type': 'text/plain; charset=utf-8' },
      });
    }

    if (pathname === '/music' || pathname === '/albums') {
      return new Response(renderMusic(), {
        headers: { 'Content-Type': 'text/plain; charset=utf-8' },
      });
    }

    if (pathname === '/now-playing' || pathname === '/nowplaying') {
      const nowPlayingText = await renderNowPlaying(env);
      return new Response(nowPlayingText, {
        headers: { 'Content-Type': 'text/plain; charset=utf-8' },
      });
    }

    if (pathname === '/ping') {
      return new Response('pong\n', {
        headers: { 'Content-Type': 'text/plain; charset=utf-8' },
      });
    }

    if (pathname === '/ip') {
      const ip = request.headers.get('cf-connecting-ip') || request.headers.get('x-forwarded-for') || '127.0.0.1';
      return new Response(`${ip}\n`, {
        headers: { 'Content-Type': 'text/plain; charset=utf-8' },
      });
    }

    if (pathname === '/fsh' || pathname === '/fish') {
      return new Response(renderFsh(), {
        headers: { 'Content-Type': 'text/plain; charset=utf-8' },
      });
    }

    if (pathname === '/json') {
      return new Response(renderJson(), {
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
      });
    }

    const notFoundText = [
      '',
      `  ${C.pink}404 Not Found: "${pathname}"${C.reset}`,
      `  ${C.gray}Type${C.reset} ${C.green}curl stabbed.wtf/help${C.reset} ${C.gray}to see all available terminal endpoints.${C.reset}`,
      '',
    ].join('\n');

    return new Response(notFoundText, {
      status: 404,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  } catch (err) {
    return new Response(`\n  ${C.pink}Error: ${err.message}${C.reset}\n`, {
      status: 500,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  }
}
