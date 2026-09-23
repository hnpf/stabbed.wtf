import { useEffect, useState } from 'react';
import { BLOG_POSTS, MUSIC_RELEASES } from '../constants';

/** reads current ?release= query param from URL */
function getMusicReleaseId(page: string): string | null {
  if (page !== 'music') return null;
  return new URLSearchParams(window.location.search).get('release');
}

export const useMetadata = (page: string, blogPostId: string | null, isApr: boolean) => {
  // track music release id separately so we can react to URL changes within /music
  const [musicReleaseId, setMusicReleaseId] = useState<string | null>(() =>
    getMusicReleaseId(page)
  );

  // keep musicReleaseId in sync when page changes or browser navigates
  useEffect(() => {
    const id = getMusicReleaseId(page);
    setMusicReleaseId(id);

    const onNav = () => setMusicReleaseId(getMusicReleaseId(page));
    window.addEventListener('popstate', onNav);
    return () => window.removeEventListener('popstate', onNav);
  }, [page]);

  useEffect(() => {
    if (isApr) return;

    const name =
      page === "readme" ? "Info" : page.charAt(0).toUpperCase() + page.slice(1);
    const title =
      page === "blog" && blogPostId
        ? `Virex | ${BLOG_POSTS.find((p) => p.id === blogPostId || p.link === blogPostId)?.title || "Post"}`
        : page === "music" && musicReleaseId
          ? `rxvirex | ${MUSIC_RELEASES.find((r) => r.id.toLowerCase() === musicReleaseId.toLowerCase())?.title || musicReleaseId}`
          : page === "home"
            ? "Stabbed.wtf | Portfolio"
            : `Stabbed.wtf | ${name}`;
    document.title = title;

    let desc =
      page === "home"
        ? "virex portfolio: an independent software developer and systems researcher showcasing projects, UI/UX, security research, and photography."
        : "virex software researcher and problem solver, who explores systems and programming, UI/UX, and security research.";
    let og_title = title;
    let og_img = "https://stabbed.wtf/photography/pfp/main.png";
    const pageUrl =
      page === "home"
        ? "https://stabbed.wtf"
        : page === "blog" && blogPostId
        ? `https://stabbed.wtf/blog/${blogPostId}`
        : page === "music" && musicReleaseId
        ? `https://stabbed.wtf/music?release=${encodeURIComponent(musicReleaseId)}`
        : `https://stabbed.wtf/${page}`;
    const og_type = page === "blog" && blogPostId ? "article" : "website";

    if (page === "blog" && blogPostId) {
      const p = BLOG_POSTS.find(
        (p) => p.id === blogPostId || p.link === blogPostId,
      );
      if (p) {
        desc = p.snippet;
        og_title = `Virex Blog | ${p.title}`;
      }
    } else if (page === "music" && musicReleaseId) {
      const r = MUSIC_RELEASES.find(
        (r) => r.id.toLowerCase() === musicReleaseId.toLowerCase(),
      );
      if (r) {
        desc = r.description;
        og_title = `Virex Music | ${r.title}`;
        // prefer explicit coverUrl, then check common extensions. .webp first for perf
        og_img = r.coverUrl
          ? `https://stabbed.wtf${r.coverUrl.startsWith('/') ? '' : '/'}${r.coverUrl}`
          : `https://stabbed.wtf/albums/${r.id}.png`;
      }
    } else if (page === "readme") {
      desc =
        "README: my personal biography, a quick summary about my mission, and identity.";
    } else if (page === "lens") {
      desc = "lens: my photography collection, all done with a literal phone.";
    } else if (page === "music") {
      desc =
        "music by virex (rxvirex) - producer, software dev, linux enthusiast. releases, beats, and sound design.";
      og_title = "rxvirex";
    }

    const set_meta = (key: string, val: string, is_prop = false) => {
      let el = document.querySelector(
        is_prop ? `meta[property="${key}"]` : `meta[name="${key}"]`,
      );
      if (!el) {
        el = document.createElement("meta");
        if (is_prop) el.setAttribute("property", key);
        else el.setAttribute("name", key);
        document.head.appendChild(el);
      }
      el.setAttribute("content", val);
    };

    const set_link = (rel: string, href: string) => {
      let el = document.querySelector(`link[rel="${rel}"]`);
      if (!el) {
        el = document.createElement("link");
        el.setAttribute("rel", rel);
        document.head.appendChild(el);
      }
      el.setAttribute("href", href);
    };

    set_meta("description", desc);
    set_meta("og:title", og_title, true);
    set_meta("og:description", desc, true);
    set_meta("og:image", og_img, true);
    set_meta("og:url", pageUrl, true);
    set_meta("og:type", og_type, true);
    set_meta("twitter:card", "summary_large_image");
    set_meta("twitter:title", og_title);
    set_meta("twitter:description", desc);
    set_meta("twitter:image", og_img);
    set_link("canonical", pageUrl);

    const old_ld = document.getElementById("json-ld-structured-data");
    if (old_ld) old_ld.remove();

    const ld: any = {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "Virex",
      url: "https://stabbed.wtf",
      author: {
        "@type": "Person",
        name: "virex",
      },
    };

    if (page === "blog" && blogPostId) {
      const p = BLOG_POSTS.find(
        (p) => p.id === blogPostId || p.link === blogPostId,
      );
      if (p) {
        ld["@type"] = "BlogPosting";
        ld["headline"] = p.title;
        ld["description"] = p.snippet;
        ld["datePublished"] = new Date(p.date).toISOString();
        ld["mainEntityOfPage"] = {
          "@type": "WebPage",
          "@id": pageUrl,
        };
        ld["image"] = og_img;
        ld["author"] = { "@type": "Person", name: "Virex" };
      }
    } else if (page === "music" && musicReleaseId) {
      const r = MUSIC_RELEASES.find(
        (r) => r.id.toLowerCase() === musicReleaseId.toLowerCase(),
      );
      if (r) {
        ld["@type"] = "MusicAlbum";
        ld["name"] = r.title;
        ld["description"] = r.description;
        ld["genre"] = r.genre;
        ld["byArtist"] = { "@type": "MusicGroup", name: "virex" };
        ld["url"] = pageUrl;
        ld["image"] = og_img;
      }
    } else {
      ld["mainEntityOfPage"] = {
        "@type": "WebPage",
        "@id": pageUrl,
      };
      ld["image"] = og_img;
    }

    const script = document.createElement("script");
    script.id = "json-ld-structured-data";
    script.type = "application/ld+json";
    script.text = JSON.stringify(ld);
    document.head.appendChild(script);
  }, [page, blogPostId, musicReleaseId, isApr]);
};
