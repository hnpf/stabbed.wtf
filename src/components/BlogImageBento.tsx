// @ts-nocheck
import React, { useState, useEffect, useCallback, memo } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import { ChevronLeft, ChevronRight, X, OpenInFull, ExternalLink } from "./MaterialIcon";
import { cn } from "../constants";
import { useTheme } from "../ThemeContext";
import { getImageThemeSeed } from "../utils/imageTheme";
import { haptic } from "../haptics";

export interface BlogImageItem {
  src: string;
  alt?: string;
  href?: string;
}

export function parseCaption(rawAlt?: string): { source: string | null; title: string } {
  if (!rawAlt) return { source: null, title: "" };
  let str = rawAlt.trim();
  let source: string | null = null;
  const sourceMatch = str.match(/\*\*(?:IMAGE\s+)?SOURCE:\s*([^*]+)\*\*/i);
  if (sourceMatch) {
    source = sourceMatch[1].trim();
    str = str.replace(sourceMatch[0], "").trim();
  }
  str = str.replace(/^["'“”](.*)["'“”]$/, "$1").trim();
  str = str.replace(/\*\*([^*]+)\*\*/g, "$1");

  return { source, title: str };
}

export function resolveSourceUrl(image: BlogImageItem, source: string | null): { url: string; label: string } {
  if (image.href) {
    return { url: image.href, label: "Open Source Link" };
  }

  if (source) {
    const s = source.toLowerCase();
    if (s.includes("boredpanda")) {
      return { url: "https://www.boredpanda.com/cute-spiders/", label: "Open Bored Panda Article" };
    }
    if (s.includes("unsplash")) {
      const match = image.src.match(/photo-([a-zA-Z0-9_-]+)/);
      if (match) {
        return { url: `https://unsplash.com/photos/${match[1]}`, label: "Open Unsplash Photo" };
      }
      return { url: "https://unsplash.com", label: "Open Unsplash" };
    }
    if (s.includes(".") && !s.includes(" ")) {
      return { url: `https://${source}`, label: `Visit ${source}` };
    }
  }

  return { url: image.src, label: "Open Raw Image" };
}

export const BlogLightbox = memo(({
  images,
  initialIndex,
  onClose,
}: {
  images: BlogImageItem[];
  initialIndex: number;
  onClose: () => void;
}) => {
  const [idx, setIdx] = useState(initialIndex);
  const [isExpandedLoaded, setIsExpandedLoaded] = useState(false);
  const [viewportWidth, setViewportWidth] = useState(() =>
    typeof window === "undefined" ? 1024 : window.innerWidth
  );
  const { settings, setDynamicTheme } = useTheme();

  const current = images[idx] || images[0];
  const { source, title } = parseCaption(current?.alt);
  const { url: sourceUrl, label: sourceLabel } = resolveSourceUrl(current, source);

  useEffect(() => {
    const onResize = () => setViewportWidth(window.innerWidth);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    if (!settings.lensDynamicTheming || idx === null || !current?.src) {
      setDynamicTheme(null);
      return;
    }

    let cancelled = false;
    getImageThemeSeed(current.src).then((seed) => {
      if (!cancelled) setDynamicTheme(seed);
    });
    return () => {
      cancelled = true;
    };
  }, [idx, current?.src, settings.lensDynamicTheming, setDynamicTheme]);

  useEffect(() => () => setDynamicTheme(null), [setDynamicTheme]);

  const next = useCallback((e?: any) => {
    e?.stopPropagation();
    haptic.light();
    setIdx((prevIdx) => (prevIdx + 1) % images.length);
    setIsExpandedLoaded(false);
  }, [images.length]);

  const prev = useCallback((e?: any) => {
    e?.stopPropagation();
    haptic.light();
    setIdx((prevIdx) => (prevIdx - 1 + images.length) % images.length);
    setIsExpandedLoaded(false);
  }, [images.length]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" && images.length > 1) {
        next();
      } else if (e.key === "ArrowLeft" && images.length > 1) {
        prev();
      } else if (e.key === "Escape") {
        haptic.light();
        onClose();
      }
    };

    let lastScroll = 0;
    const onWheel = (e: WheelEvent) => {
      if (images.length <= 1) return;
      if (Math.abs(e.deltaX) < 15) return;

      const now = Date.now();
      if (now - lastScroll < 350) return;
      lastScroll = now;

      if (e.deltaX > 0) next();
      else prev();
    };

    window.addEventListener("keydown", onKey);
    window.addEventListener("wheel", onWheel, { passive: true });

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    let timeout: any;
    if (images.length > 1) {
      timeout = setTimeout(() => {
        const nextIdx = (idx + 1) % images.length;
        const prevIdx = (idx - 1 + images.length) % images.length;
        [nextIdx, prevIdx].forEach((i) => {
          if (images[i]?.src) {
            const img = new window.Image();
            img.src = images[i].src;
          }
        });
      }, 300);
    }

    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("wheel", onWheel);
      document.body.style.overflow = originalOverflow;
      if (timeout) clearTimeout(timeout);
    };
  }, [idx, images, next, prev, onClose]);

  return createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex flex-col bg-[var(--surface)]/95 backdrop-blur-md overflow-hidden select-none"
      onClick={onClose}
    >
      <div className="z-[230] p-6 md:p-8 flex justify-center items-center gap-3 md:gap-4 pointer-events-none">
        <div className="bg-[var(--surface-variant)]/60 backdrop-blur-md px-6 py-3 md:px-8 md:py-4 rounded-[2.5rem] border-6 border-[var(--outline-variant)]/40 flex flex-col shadow-2xl pointer-events-auto min-w-0 max-w-[260px] sm:max-w-md md:max-w-lg">
          <div className="text-[11px] md:text-[18px] font-black tracking-[0.14em] text-[var(--primary)] mb-0.5 md:mb-1 truncate">
            {source ? `Source · ${source}` : "Article Image"}
          </div>
          <div className="text-[var(--on-surface)] font-display font-black text-[14px] first-letter:uppercase md:text-2xl tracking-tight leading-tight truncate">
            {title || "Untitled Image"}
          </div>
          {source && (
            <div className="text-[var(--on-surface)]/60 font-medium text-xs md:text-sm mt-0.5 md:mt-1 truncate">
              via {source}
            </div>
          )}
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.9, rotate: -8 }}
          transition={{
            type: "spring",
            stiffness: 800,
            damping: 15,
            mass: 0.5,
          }}
          onClick={() => {
            haptic.light();
            onClose();
          }}
          className="w-14 h-14 md:w-18 md:h-18 bg-[var(--primary)] text-[var(--on-primary)] rounded-full flex items-center justify-center border-6 border-[var(--outline-variant)]/40 shadow-2xl pointer-events-auto cursor-pointer"
          aria-label="Close expanded view"
        >
          <X size={viewportWidth < 768 ? 28 : 36} />
        </motion.button>
      </div>

      <div className="flex-1 relative w-full flex items-center justify-center px-4 md:px-32 lg:px-48 min-h-0 overflow-hidden">
        {images.length > 1 && (
          <div className="hidden md:flex absolute left-8 inset-y-0 items-center z-[220] pointer-events-none">
            <button
              onClick={prev}
              className="w-20 h-20 bg-[var(--surface-variant)]/40 hover:bg-[var(--primary)] hover:text-[var(--on-primary)] text-[var(--on-surface)] rounded-full flex items-center justify-center transition-all border-6 border-[var(--outline-variant)]/40 backdrop-blur-md pointer-events-auto active:scale-90 shadow-2xl cursor-pointer"
              aria-label="Previous image"
            >
              <ChevronLeft size={44} />
            </button>
          </div>
        )}

        <motion.div
          key={idx}
          initial={{
            opacity: 0,
            scale: 0.8,
            x: 40,
            scaleY: 1.1,
            scaleX: 0.9,
          }}
          animate={{
            opacity: 1,
            scale: 1,
            x: 0,
            scaleY: 1,
            scaleX: 1,
          }}
          exit={{
            opacity: 0,
            scale: 0.8,
            x: -40,
            scaleY: 1.1,
            scaleX: 0.9,
          }}
          transition={{
            type: "spring",
            damping: 20,
            stiffness: 150,
            mass: 1,
          }}
          drag={images.length > 1 ? "x" : undefined}
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.4}
          onDragEnd={(_, info) => {
            if (images.length > 1) {
              if (info.offset.x > 50) prev();
              else if (info.offset.x < -50) next();
              haptic.light();
            }
          }}
          className="relative w-full h-full flex items-center justify-center cursor-grab active:cursor-grabbing z-[205]"
          onClick={(e) => e.stopPropagation()}
        >
          <img
            src={current.src}
            onLoad={() => setIsExpandedLoaded(true)}
            className={cn(
              "max-w-full max-h-full object-contain rounded-[40px] md:rounded-[60px] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.2)] dark:shadow-[0_48px_96px_-24px_rgba(0,0,0,0.6)] border-[12px] border-[var(--outline-variant)]/20 dark:border-white/10 pointer-events-none select-none transition-opacity duration-300",
              isExpandedLoaded ? "opacity-100" : "opacity-0"
            )}
            referrerPolicy="no-referrer"
            loading="eager"
            decoding="async"
            alt={title || "Expanded blog image"}
          />
        </motion.div>

        {images.length > 1 && (
          <div className="hidden md:flex absolute right-8 inset-y-0 items-center z-[220] pointer-events-none">
            <button
              onClick={next}
              className="w-20 h-20 bg-[var(--surface-variant)]/40 hover:bg-[var(--primary)] hover:text-[var(--on-primary)] text-[var(--on-surface)] rounded-full flex items-center justify-center transition-all border-6 border-[var(--outline-variant)]/40 backdrop-blur-md pointer-events-auto active:scale-90 shadow-2xl cursor-pointer"
              aria-label="Next image"
            >
              <ChevronRight size={44} />
            </button>
          </div>
        )}
      </div>

      <div className="z-[230] p-6 md:p-12 flex flex-col items-center gap-6">
        <div
          className="flex items-center gap-1 md:mb-0 mb-4 md:gap-2 bg-[var(--surface-variant)]/60 backdrop-blur-md p-2 md:p-3 rounded-full border-6 border-[var(--outline-variant)]/40 shadow-2xl pointer-events-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {images.length > 1 && (
            <div className="flex md:hidden items-center gap-1 pr-2 border-r-2 border-[var(--outline-variant)]/20">
              <button
                className="w-11 h-11 bg-transparent hover:bg-[var(--primary)] hover:text-[var(--on-primary)] text-[var(--on-surface)] rounded-full flex items-center justify-center transition-all active:scale-90 cursor-pointer"
                onClick={prev}
                aria-label="Previous image"
              >
                <ChevronLeft size={22} />
              </button>
              <button
                className="w-11 h-11 bg-transparent hover:bg-[var(--primary)] hover:text-[var(--on-primary)] text-[var(--on-surface)] rounded-full flex items-center justify-center transition-all active:scale-90 cursor-pointer"
                onClick={next}
                aria-label="Next image"
              >
                <ChevronRight size={22} />
              </button>
            </div>
          )}

          <div className="px-4 md:px-8 py-1 md:py-2 flex flex-col items-center">
            <span className="text-[11px] md:text-[16px] capitalize font-black text-[var(--on-surface-variant)] opacity-60">
              image position:
            </span>
            <div className="flex items-center gap-1 md:gap-2 text-[var(--on-surface)] font-mono font-bold text-xs md:text-base">
              <span className="text-[var(--primary)]">
                {String(idx + 1).padStart(2, "0")}
              </span>
              <span className="opacity-20">/</span>
              <span className="opacity-60">
                {String(images.length).padStart(2, "0")}
              </span>
            </div>
          </div>

          <div className="w-[2px] h-8 md:h-10 bg-[var(--outline-variant)]/30 rounded-full mx-1 md:mx-2" />
          <button
            onClick={() => {
              haptic.light();
              window.open(sourceUrl, "_blank", "noopener,noreferrer");
            }}
            className="w-11 h-11 md:w-14 md:h-14 bg-[var(--primary-container)] hover:bg-[var(--primary)] hover:text-[var(--on-primary)] text-[var(--on-primary-container)] rounded-full flex items-center justify-center transition-all border-4 md:border-6 border-[var(--outline-variant)]/20 active:scale-90 group relative cursor-pointer"
            aria-label={sourceLabel}
          >
            <ExternalLink size={viewportWidth < 768 ? 20 : 28} />
            <span className="absolute -top-14 left-1/2 -translate-x-1/2 bg-[var(--surface-variant)] text-[var(--on-surface)] text-[10px] font-black px-4 py-2 rounded-xl border-4 border-[var(--outline-variant)] opacity-0 group-hover:opacity-100 transition-all scale-90 group-hover:scale-100 whitespace-nowrap pointer-events-none shadow-xl">
              {sourceLabel}
            </span>
          </button>
        </div>
      </div>
    </motion.div>,
    document.body
  );
});

export const BlogSingleImage = memo(({
  image,
  inline = false,
}: {
  image: BlogImageItem;
  inline?: boolean;
}) => {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const { source, title } = parseCaption(image.alt);

  return (
    <>
      <figure className={inline ? "my-6" : "my-10 flex flex-col items-center"}>
        <div
          onClick={() => {
            haptic.light();
            setLightboxOpen(true);
          }}
          className="group relative w-full max-w-xl overflow-hidden rounded-[2rem] sm:rounded-[2.5rem] border-2 border-[var(--outline-variant)]/40 bg-[var(--surface-variant)]/20 shadow-md cursor-pointer transition-all duration-300 hover:border-[var(--primary)]/60 hover:shadow-xl"
        >
          <img
            src={image.src}
            alt={title || image.alt || "Blog image"}
            loading="lazy"
            decoding="async"
            className="w-full max-h-[420px] object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />

          <div className="absolute top-3.5 right-3.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-[var(--surface-variant)] rounded-full w-8 h-8 flex items-center justify-center text-white pointer-events-none shadow-md">
            <OpenInFull size={16} />
          </div>

          {title && (
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none flex flex-col justify-end">
              <span className="text-xs text-white font-medium italic line-clamp-2 drop-shadow">
                {title}
              </span>
            </div>
          )}
        </div>

        {(title || source) && (
          <figcaption className="mt-3 flex flex-wrap items-center justify-center gap-2 text-xs md:text-sm text-center opacity-70 max-w-xl px-2">
            {source && (
              <span className="font-mono uppercase font-black tracking-wider text-[10px] px-2.5 py-0.5 rounded-full bg-[var(--surface-variant)] border border-[var(--outline-variant)]/40 text-[var(--primary)]">
                {source}
              </span>
            )}
            {title && <span className="italic font-medium">{title}</span>}
          </figcaption>
        )}
      </figure>

      <AnimatePresence>
        {lightboxOpen && (
          <BlogLightbox
            images={[image]}
            initialIndex={0}
            onClose={() => setLightboxOpen(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
});

export const BlogBentoGrid = memo(({ images }: { images: BlogImageItem[] }) => {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  if (!images || images.length === 0) return null;
  if (images.length === 1) {
    return <BlogSingleImage image={images[0]} />;
  }

  const count = images.length;

  const renderBentoTile = (img: BlogImageItem, idx: number, tileClass: string) => {
    const { source, title } = parseCaption(img.alt);

    return (
      <div
        key={idx}
        onClick={() => {
          haptic.light();
          setLightboxIndex(idx);
        }}
        className={`group relative overflow-hidden rounded-[2rem] sm:rounded-[3rem] border-8 border-[var(--outline-variant)]/40 bg-[var(--surface-variant)]/20 shadow-sm cursor-pointer transition-all duration-300 hover:border-[var(--primary)]/70 hover:shadow-xl ${tileClass}`}
      >
        <img
          src={img.src}
          alt={title || img.alt || "Bento image"}
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        <div className="absolute top-3.5 right-3.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-[var(--surface-variant)]/60 rounded-full w-8 h-8 flex items-center justify-center text-white pointer-events-none shadow-md">
            <OpenInFull size={16} />
          </div>

        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent p-4 md:p-5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none flex flex-col justify-end">
          {source && (
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[var(--primary)] mb-1 drop-shadow">
              {source}
            </span>
          )}
          {title && (
            <span className="text-xs md:text-sm font-semibold text-white italic drop-shadow line-clamp-2">
              "{title}"
            </span>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="my-10" data-ripple-skip>
        {count === 2 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {images.map((img, idx) =>
              renderBentoTile(img, idx, "h-64 sm:h-72 md:h-80")
            )}
          </div>
        )}

        {count === 3 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:auto-rows-[195px] md:auto-rows-[205px]">
            {renderBentoTile(
              images[0],
              0,
              "sm:col-span-2 sm:row-span-2 min-h-[280px] sm:min-h-0"
            )}
            {renderBentoTile(
              images[1],
              1,
              "sm:col-span-1 min-h-[180px] sm:min-h-0"
            )}
            {renderBentoTile(
              images[2],
              2,
              "sm:col-span-1 min-h-[180px] sm:min-h-0"
            )}
          </div>
        )}

        {count === 4 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {renderBentoTile(images[0], 0, "sm:col-span-2 h-64 sm:h-72 md:h-80")}
            {renderBentoTile(images[1], 1, "sm:col-span-1 h-64 sm:h-72 md:h-80")}
            {renderBentoTile(images[2], 2, "sm:col-span-1 h-64 sm:h-72 md:h-80")}
            {renderBentoTile(images[3], 3, "sm:col-span-2 h-64 sm:h-72 md:h-80")}
          </div>
        )}

        {count >= 5 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {images.map((img, idx) => {
              const span =
                idx % 4 === 0 || idx % 4 === 3
                  ? "sm:col-span-2 h-64 sm:h-72 md:h-80"
                  : "sm:col-span-1 h-64 sm:h-72 md:h-80";
              return renderBentoTile(img, idx, span);
            })}
          </div>
        )}
      </div>

      <AnimatePresence>
        {lightboxIndex !== null && (
          <BlogLightbox
            images={images}
            initialIndex={lightboxIndex}
            onClose={() => setLightboxIndex(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
});

export function rehypeBentoImages() {
  function isWhitespaceOrComment(node: any): boolean {
    if (!node) return false;
    if (node.type === "text" && (!node.value || node.value.trim() === "")) return true;
    if (node.type === "comment") return true;
    if (node.type === "raw" && typeof node.value === "string" && node.value.trim().startsWith("<!--")) {
      return true;
    }
    return false;
  }

  function extractImagesFromNode(node: any): BlogImageItem[] | null {
    if (!node || node.type !== "element" || node.tagName !== "p") return null;
    const imgs: BlogImageItem[] = [];

    for (const child of node.children || []) {
      if (isWhitespaceOrComment(child)) continue;

      if (child.type === "element" && child.tagName === "img") {
        imgs.push({
          src: child.properties?.src,
          alt: child.properties?.alt || "",
        });
      } else if (
        child.type === "element" &&
        child.tagName === "a" &&
        Array.isArray(child.children) &&
        child.children.some((c: any) => c.type === "element" && c.tagName === "img")
      ) {
        const imgChild = child.children.find((c: any) => c.type === "element" && c.tagName === "img");
        if (imgChild) {
          imgs.push({
            src: imgChild.properties?.src,
            alt: imgChild.properties?.alt || "",
            href: child.properties?.href,
          });
        }
      } else {
        return null;
      }
    }

    return imgs.length > 0 ? imgs : null;
  }

  return (tree: any) => {
    if (!tree || !Array.isArray(tree.children)) return;

    const newChildren: any[] = [];
    let i = 0;

    while (i < tree.children.length) {
      const node = tree.children[i];
      const imgs = extractImagesFromNode(node);

      if (imgs) {
        const collected: BlogImageItem[] = [...imgs];
        let j = i + 1;

        while (j < tree.children.length) {
          const next = tree.children[j];
          if (isWhitespaceOrComment(next)) {
            j++;
            continue;
          }
          const nextImgs = extractImagesFromNode(next);
          if (nextImgs) {
            collected.push(...nextImgs);
            j++;
          } else {
            break;
          }
        }

        if (collected.length >= 2) {
          newChildren.push({
            type: "element",
            tagName: "div",
            properties: {
              className: "blog-image-bento-root",
              "data-bento-images": JSON.stringify(collected),
            },
            children: [],
          });
          i = j;
          continue;
        } else {
          newChildren.push({
            type: "element",
            tagName: "div",
            properties: {
              className: "blog-image-single-root",
              "data-single-image": JSON.stringify(collected[0]),
            },
            children: [],
          });
          i = j;
          continue;
        }
      }

      newChildren.push(node);
      i++;
    }

    tree.children = newChildren;
  };
}
