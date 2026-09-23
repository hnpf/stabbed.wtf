import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';

function terminalCliPlugin(env: Record<string, string>) {
  return {
    name: 'terminal-cli-plugin',
    configureServer(server: any) {
      server.middlewares.use(async (req: any, res: any, next: any) => {
        const userAgent = (req.headers['user-agent'] || '').toLowerCase();
        const accept = (req.headers['accept'] || '').toLowerCase();
        const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);

        const isCli =
          url.searchParams.has('curl') ||
          url.searchParams.has('cli') ||
          url.searchParams.get('format') === 'text' ||
          url.searchParams.has('plain') ||
          /curl|wget|httpie|fetch|libcurl/i.test(userAgent) ||
          (accept.includes('text/plain') && !accept.includes('text/html'));

        if (!isCli || url.pathname.startsWith('/api/') || url.pathname.startsWith('/@') || url.pathname.startsWith('/src/')) {
          return next();
        }

        try {
          const terminal = await import('./functions/_terminal.js');
          const pathname = url.pathname.replace(/\/+$/, '') || '/';

          if (pathname === '/' || pathname === '') {
            res.setHeader('Content-Type', 'text/plain; charset=utf-8');
            return res.end(terminal.renderHome());
          }
          if (pathname === '/help') {
            res.setHeader('Content-Type', 'text/plain; charset=utf-8');
            return res.end(terminal.renderHelp());
          }
          if (pathname === '/about') {
            res.setHeader('Content-Type', 'text/plain; charset=utf-8');
            return res.end(terminal.renderAbout());
          }
          if (pathname === '/socials' || pathname === '/links') {
            res.setHeader('Content-Type', 'text/plain; charset=utf-8');
            return res.end(terminal.renderSocials());
          }
          if (pathname === '/blog') {
            res.setHeader('Content-Type', 'text/plain; charset=utf-8');
            return res.end(terminal.renderBlogList());
          }
          if (pathname.startsWith('/blog/')) {
            const slug = pathname.slice('/blog/'.length);
            res.setHeader('Content-Type', 'text/plain; charset=utf-8');
            return res.end(terminal.renderBlogPost(slug));
          }
          if (pathname === '/projects') {
            res.setHeader('Content-Type', 'text/plain; charset=utf-8');
            return res.end(terminal.renderProjects());
          }
          if (pathname === '/music' || pathname === '/albums') {
            res.setHeader('Content-Type', 'text/plain; charset=utf-8');
            return res.end(terminal.renderMusic());
          }
          if (pathname === '/now-playing' || pathname === '/nowplaying') {
            const text = await terminal.renderNowPlaying(env);
            res.setHeader('Content-Type', 'text/plain; charset=utf-8');
            return res.end(text);
          }
          if (pathname === '/ping') {
            res.setHeader('Content-Type', 'text/plain; charset=utf-8');
            return res.end('pong\n');
          }
          if (pathname === '/ip') {
            res.setHeader('Content-Type', 'text/plain; charset=utf-8');
            return res.end(`${req.socket?.remoteAddress || '127.0.0.1'}\n`);
          }
          if (pathname === '/fsh' || pathname === '/fish') {
            res.setHeader('Content-Type', 'text/plain; charset=utf-8');
            return res.end(terminal.renderFsh());
          }
          if (pathname === '/json') {
            res.setHeader('Content-Type', 'application/json; charset=utf-8');
            return res.end(terminal.renderJson());
          }

          res.statusCode = 404;
          res.setHeader('Content-Type', 'text/plain; charset=utf-8');
          return res.end(`\n  \x1b[38;5;212m404 Not Found: "${pathname}"\x1b[0m\n  \x1b[38;5;246mType\x1b[0m \x1b[38;5;120mcurl stabbed.wtf/help\x1b[0m \x1b[38;5;246mto see all available terminal endpoints.\x1b[0m\n\n`);
        } catch (err: any) {
          console.error('Terminal CLI middleware error:', err);
          return next();
        }
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    plugins: [react(), tailwindcss(), terminalCliPlugin(env)],
    envPrefix: ['VITE_', 'LASTFM_'],
    define: {
      'import.meta.env.VITE_LASTFM_API_KEY': JSON.stringify(env.VITE_LASTFM_API_KEY || env.LASTFM_API_KEY || ''),
      'import.meta.env.VITE_LASTFM_USERNAME': JSON.stringify(env.VITE_LASTFM_USERNAME || env.LASTFM_USERNAME || ''),
      'import.meta.env.LASTFM_API_KEY': JSON.stringify(env.LASTFM_API_KEY || env.VITE_LASTFM_API_KEY || ''),
      'import.meta.env.LASTFM_USERNAME': JSON.stringify(env.LASTFM_USERNAME || env.VITE_LASTFM_USERNAME || ''),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },

    build: {
      chunkSizeWarningLimit: 800,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              if (id.includes('react') || id.includes('react-dom')) {
                return 'vendor-react';
              }
              if (id.includes('motion') || id.includes('framer-motion')) {
                return 'vendor-motion';
              }
              if (id.includes('lucide-react')) {
                return 'vendor-icons';
              }
            }
          },
        },
      },
    },

    server: {
      port: 6767,
      host: '0.0.0.0',
      proxy: {
        '/api': {
          target: env.VITE_API_URL || 'http://localhost:3001',
          changeOrigin: true,
        },
      },
    },
  };
});