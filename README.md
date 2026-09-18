<div align="center">

<img src="public/favicon.svg" width="72" height="72" alt="virex logo" />

### virex.lol

<img src="https://img.shields.io/badge/virex.lol-live-6750A4?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZmlsbD0id2hpdGUiIGQ9Ik0xMiAyQzYuNDggMiAyIDYuNDggMiAxMnM0LjQ4IDEwIDEwIDEwIDEwLTQuNDggMTAtMTBTMTcuNTIgMiAxMiAyem0tMSAxNy45M1Y0LjA3YzMuOTQuNDkgNyAzLjg1IDcgNy45M3MtMy4wNiA3LjQ0LTcgNy45M3oiLz48L3N2Zz4=&labelColor=1C1B1F" alt="live site" />
<img src="https://img.shields.io/badge/react_19-61DAFB?style=for-the-badge&logo=react&logoColor=black&labelColor=1C1B1F" />
<img src="https://img.shields.io/badge/vite_6-646CFF?style=for-the-badge&logo=vite&logoColor=white&labelColor=1C1B1F" />
<img src="https://img.shields.io/badge/tailwind_4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white&labelColor=1C1B1F" />
<img src="https://img.shields.io/badge/sqlite-003B57?style=for-the-badge&logo=sqlite&logoColor=white&labelColor=1C1B1F" />
<img src="https://img.shields.io/badge/vercel-000?style=for-the-badge&logo=vercel&logoColor=white&labelColor=1C1B1F" />
<img src="https://img.shields.io/badge/gpl--3.0-EF5350?style=for-the-badge&logo=gnu&logoColor=white&labelColor=1C1B1F" />

My personal website. Uses a Material 3 Expressive styled shell, photo gallery, blog, and features tons of customization options. Built on React 19. Research, photography, blog posts.

</div>


## What's new?

**New changes!**

- [Aug 9, 2026]  command palette feature

> last updated: Aug 9, 2026 — [full commit history](https://github.com/hnpf/virex.lol/commits/main)

---

## Site Screenshots

**Desktop**
<table>
  <tr>
    <td><img src="github/demo/virex.png" width="220"/></td>
    <td><img src="github/demo/blog.png" width="220"/></td>
    <td><img src="github/demo/settings.png" width="220"/></td>
    <td><img src="github/demo/info.png" width="220"/></td>
  </tr>
  <tr>
    <td align="center"><sub>home</sub></td>
    <td align="center"><sub>blog</sub></td>
    <td align="center"><sub>settings</sub></td>
    <td align="center"><sub>info</sub></td>
  </tr>
</table>

**Mobile**
<table>
  <tr>
    <td><img src="github/demo/mobilevirex.png" width="160"/></td>
    <td><img src="github/demo/mobileblog.png" width="160"/></td>
    <td><img src="github/demo/mobilesettings.png" width="160"/></td>
    <td><img src="github/demo/mobileinfo.png" width="160"/></td>
  </tr>
  <tr>
    <td align="center"><sub>home</sub></td>
    <td align="center"><sub>blog</sub></td>
    <td align="center"><sub>settings</sub></td>
    <td align="center"><sub>info</sub></td>
  </tr>
</table>

---

## Stack

| Layer | Tech |
|---|---|
| Frontend | React 19 + Vite 6, Tailwind 4, Motion (physics, advanced animation), Custom MaterialSymbolsRounded icons |
| Backend | Cloudflare, SQLite via `better-sqlite3` |
| Assets | webp via `sharp`, noise engine |

---

## Site Features

> **lens** — Bento-grid photo gallery. Swipe/drag, keyboard nav, and mobile friendly.

> **blog** — Updates, Devlogs, Cybersec, and more. Read-tracking + RSS at `/rss.xml` (not always updated!)

> **readme** — Clean bio and lore with animations with dedicated settings options.

> **now** — What I'm actively building, reading, and learning right now.

> **settings** — Accent hue, light/dark/system, highHz mode, brutalist mode (0px radii), zen mode, Jetbrains Mono override, and more.

---

## Getting Started

```bash
# clone + install
git clone https://github.com/hnpf/virex.lol
cd virex.lol
npm install        # or pnpm install

# dev
npm run dev        # vite + local api server

# prod
npm run build      # output to dist/
```

> You will need node 18+ and a sqlite-compatible env for the API routes. Your deployment method sometimes handles this automatically.

---

## Site Layout Snippet (updated ~v2.9.8-stable)

```
api/
  index.ts              server handlers (rss, express server, etc.)
  db.ts                 sqlite read/write logic
  guestbook_db.ts       guestbook backend, features banned_roots and leet map

public/
  fonts/                all locally stored and self-hosted material 3 symbols
  photography/          webp archive (compressed via sharp)
  _routes.json
  favicon.svg                 site favicon
  llms-full.txt
  llms.txt
  manifest.json
  robots.txt
  rss.xml
  sitemap.xml

src/
  components/           site components such as cards, copylinkcapsule, wavyprogress, etc.
  hooks/                site hooks such as useAprilFools, useViewport, and useSettingsSync.
  navigation/           nav components such as NavigationRail (and NavigationRailItem), and FAB
  pages/                site pages like blog, changelog, dash, home, lens, 404, /now, and readme.
  wavy.ts               wavy progress logic helper
  app.ts                core/root application class
  constants.ts          static info such as bug reports, projects, blog posts, and changelogs.
  haptics.ts            haptics for mobile; self explanatory
  index.css             also quite self-explanatory, holds some core styling logic and font data.
  main.tsx              main site entrypoint
  ThemeContext.tsx


```

---

<div align="center">

[virex.lol](https://virex.lol) · [github.com/hnpf](https://github.com/hnpf) · GPL-3.0

</div>
