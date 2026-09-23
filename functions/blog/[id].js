
import { BLOG_POSTS } from "../_generated/og-data.js";

const DEFAULT_TITLE = "Virex | Blog";
const DEFAULT_DESC =
  "thoughts on code, systems, music production, and whatever else is on my mind.";
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
      "og:type": "article",
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

export async function onRequest({ request, params, next }) {
  const postId = params.id;
  const userAgent = request.headers.get("User-Agent") || "";

  const response = await next();

  if (!isBot(userAgent)) return response;

  let title = DEFAULT_TITLE;
  let desc = DEFAULT_DESC;
  const image = DEFAULT_IMAGE;
  let pageUrl = `https://stabbed.wtf/blog`;

  if (postId) {
    const post = BLOG_POSTS.find((p) => p.id === postId || p.link === postId);
    if (post) {
      title = `Virex Blog | ${post.title}`;
      desc = post.snippet;
      pageUrl = `https://stabbed.wtf/blog/${postId}`;
    }
  }

  const meta = { title, desc, image, url: pageUrl };

  return new HTMLRewriter()
    .on("title", new TitleRewriter(title))
    .on("meta[property]", new MetaRewriter(meta))
    .on("meta[name]", new MetaRewriter(meta))
    .transform(response);
}
