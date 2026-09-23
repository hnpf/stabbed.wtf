import fs from "fs";
import path from "path";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeStringify from "rehype-stringify";
import { BLOG_POSTS } from "../src/constants.ts";

const SITE_URL = "https://stabbed.wtf";
const outputPath = path.join(process.cwd(), "public", "rss.xml");

function formatRfc2822(date: Date) {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${days[date.getUTCDay()]}, ${String(date.getUTCDate()).padStart(2, "0")} ${months[date.getUTCMonth()]} ${date.getUTCFullYear()} ${String(date.getUTCHours()).padStart(2, "0")}:${String(date.getUTCMinutes()).padStart(2, "0")}:${String(date.getUTCSeconds()).padStart(2, "0")} GMT`;
}

const markdownSerializer = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkRehype)
  .use(rehypeStringify);

function markdownToHtml(value: string) {
  return String(markdownSerializer.processSync(value));
}

function wrapCdata(value: string) {
  return `<![CDATA[${value.replace(/]]>/g, "]]]]><![CDATA[>")}]]>`;
}

function normalizeText(value: string) {
  return value
    .trim()
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\r?\n/g, " ")
    .replace(/\s+/g, " ");
}

const posts = BLOG_POSTS
  .map((post) => ({
    ...post,
    url: new URL(`/blog/${post.link}`, SITE_URL).toString(),
    dateObject: new Date(post.date),
  }))
  .filter((post) => {
    if (!post.title || !post.link) return false;
    if (Number.isNaN(post.dateObject.getTime())) {
      console.warn(`Skipping RSS post with invalid date: ${post.title} (${post.link})`);
      return false;
    }
    return true;
  })
  .sort((a, b) => b.dateObject.getTime() - a.dateObject.getTime());

const channelItems = posts.map((post) => {
  const title = normalizeText(post.title);
  const description = normalizeText(post.snippet || "");
  const htmlContent = markdownToHtml(post.content || "");
  const content = wrapCdata(htmlContent);
  const pubDate = formatRfc2822(post.dateObject);

  return `  <item>
    <title>${title}</title>
    <link>${post.url}</link>
    <description>${wrapCdata(description || title)}</description>
    <content:encoded>${content}</content:encoded>
    <pubDate>${pubDate}</pubDate>
  </item>`;
});

const rss = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/">
<channel>
  <title>Virex Log</title>
  <link>${SITE_URL}/blog</link>
  <description>Research, development, and systems exploration by Virex.</description>
  <language>en-us</language>
  <lastBuildDate>${formatRfc2822(new Date())}</lastBuildDate>
  ${channelItems.join("\n\n")}
</channel>
</rss>
`;

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, rss, "utf-8");
console.log(`Generated RSS feed with ${posts.length} item(s) at ${outputPath}`);
