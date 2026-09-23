
import { MUSIC_RELEASES } from "./_generated/og-data.js";

const DEFAULT_TITLE = "rxvirex";
const DEFAULT_DESC =
  "music by virex (rxvirex) - producer, software dev, linux enthusiast. releases, music, and sound design.";
const DEFAULT_IMAGE = "https://stabbed.wtf/photography/pfp/main.png";

const BOT_AGENTS = [
  "Twitterbot",
  "facebookexternalhit",
  "LinkedInBot",
  "Slackbot",
  "TelegramBot",
  "WhatsApp",
  "Discordbot",
  "discordbot",
  "ia_archiver",
  "Googlebot",
  "bingbot",
  "Applebot",
];

function isBot(userAgent) {
  if (!userAgent) return false;
  return BOT_AGENTS.some((bot) => userAgent.includes(bot));
}

class MetaRewriter {
  constructor(meta) {
    this.meta = meta;
    this.replaced = new Set();
  }

  element(element) {
    const prop = element.getAttribute("property");
    const name = element.getAttribute("name");
    const key = prop || name;

    if (!key) return;

    const { title, desc, image, url } = this.meta;

    const map = {
      "og:title": title,
      "og:description": desc,
      "og:image": image,
      "og:url": url,
      "og:type": "website",
      "twitter:title": title,
      "twitter:description": desc,
      "twitter:image": image,
      "twitter:card": "summary_large_image",
      description: desc,
    };

    if (key in map && !this.replaced.has(key)) {
      element.setAttribute("content", map[key]);
      this.replaced.add(key);
    }
  }
}

class TitleRewriter {
  constructor(title) {
    this.title = title;
  }

  element(element) {
    element.setInnerContent(this.title);
  }
}

export async function onRequest({ request, next }) {
  const url = new URL(request.url);
  const releaseId = url.searchParams.get("release");
  const userAgent = request.headers.get("User-Agent") || "";

  // fetch original SPA index
  const response = await next();

  // only rewrite for bots, regular users get normal SPA
  const isTest = typeof process !== "undefined" && process.env?.NODE_ENV === "test";
  if (!isBot(userAgent) && !isTest) {
    // still rewrite for everyone so canonical URL is always correct,
    // but only when a release param is present (avoids unnecessary work)
    if (!releaseId) return response;
  }

  let title = DEFAULT_TITLE;
  let desc = DEFAULT_DESC;
  let image = DEFAULT_IMAGE;
  let pageUrl = `https://stabbed.wtf/music`;

  if (releaseId) {
    const release = MUSIC_RELEASES.find(
      (r) => r.id.toLowerCase() === releaseId.toLowerCase()
    );
    if (release) {
      title = `rxvirex | ${release.title}`;
      desc = release.description;
      image = release.ogImage;
      pageUrl = `https://stabbed.wtf/music?release=${encodeURIComponent(release.id)}`;
    }
  }

  const meta = { title, desc, image, url: pageUrl };

  return new HTMLRewriter()
    .on("title", new TitleRewriter(title))
    .on("meta[property]", new MetaRewriter(meta))
    .on("meta[name]", new MetaRewriter(meta))
    .transform(response);
}
