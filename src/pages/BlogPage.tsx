// @ts-nocheck
import React, { useState, useEffect, memo, createContext, useContext } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronLeft, ChevronRight, Calendar, CheckCircle2, ArrowUpRight, Filter } from "../components/MaterialIcon";
import ReactMarkdown from "react-markdown";
import { createPortal } from "react-dom";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import { cn, BLOG_POSTS } from "../constants";
import CopyLinkCapsule from "../components/CopyLinkCapsule";
import { Card } from "../components/Card";
import { Code } from "../components/Code";
import { SplitButton } from "../components/SplitButton";
import WavyProgress from "../components/WavyProgress";
import { haptic } from "../haptics";

// context to pass nesting depth into list items
const ListDepthContext = createContext(0);

export const BlogPage = memo(({ targetId, navigateTo }: any) => {
  const [active_cat, setActiveCat] = useState<string | null>(null);
  const [readingProgress, setReadingProgress] = useState(0);
  const [showReadingProgress, setShowReadingProgress] = useState(false);
  const [contentBounds, setContentBounds] = useState(() => ({
    left: 0,
    width: typeof window === "undefined" ? 0 : window.innerWidth,
  }));
  const [read, setRead] = useState<string[]>(() => {
    const saved = localStorage.getItem("virex-read-posts");
    return saved ? JSON.parse(saved) : [];
  });
  const post = BLOG_POSTS.find((p) => p.id === targetId || p.link === targetId);

  useEffect(() => {
    if (!targetId || !post) {
      return;
    }

    const on_scroll = () => {
      const scrolled = window.scrollY;
      const height =
        document.documentElement.scrollHeight -
        document.documentElement.clientHeight;
      const pct = height > 0 ? Math.min(100, Math.max(0, (scrolled / height) * 100)) : 0;
      setReadingProgress(pct);
      setShowReadingProgress(scrolled > 96);
      if (pct > 95 && !read.includes(post.id)) {
        setRead((prev) => {
          const next = [...prev, post.id];
          localStorage.setItem("virex-read-posts", JSON.stringify(next));
          return next;
        });
      }
    };
    on_scroll();
    window.addEventListener("scroll", on_scroll);
    return () => window.removeEventListener("scroll", on_scroll);
  }, [targetId, read, post]);

  useEffect(() => {
    if (!post) return;

    const sync_content_bounds = () => {
      const main = document.querySelector("main.page-container");
      if (!main) return;
      const bounds = main.getBoundingClientRect();
      setContentBounds({ left: bounds.left, width: bounds.width });
    };

    sync_content_bounds();
    const resize_observer = new ResizeObserver(sync_content_bounds);
    const main = document.querySelector("main.page-container");
    if (main) resize_observer.observe(main);
    window.addEventListener("resize", sync_content_bounds);
    return () => {
      resize_observer.disconnect();
      window.removeEventListener("resize", sync_content_bounds);
    };
  }, [post]);

  if (post) {
    return (
      <>
        {createPortal(
          <AnimatePresence>
            {showReadingProgress && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed z-[30] pointer-events-none"
                style={{
                  left: contentBounds.left + contentBounds.width / 2,
                  width: `min(720px, ${Math.max(0, contentBounds.width - 48)}px)`,
                  transform: "translateX(-50%)",
                  top: window.innerWidth < 768 ? "0.75rem" : "auto",
                  bottom: window.innerWidth < 768 ? "auto" : "1.25rem",
                }}
                role="progressbar"
                aria-label={`Reading progress: ${Math.round(readingProgress)} percent`}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={Math.round(readingProgress)}
              >
                <motion.div
                  initial={{
                    opacity: 0,
                    y: window.innerWidth < 768 ? -14 : 14,
                    scale: 0.92,
                  }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{
                    opacity: 0,
                    y: window.innerWidth < 768 ? -14 : 14,
                    scale: 0.92,
                  }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  className="w-full"
                >
                  <div className="h-8 px-2.5 py-1.5 flex items-center rounded-full overflow-hidden bg-[var(--surface)]/90 border border-[var(--outline-variant)]/70 shadow-[0_4px_14px_rgba(0,0,0,0.18)] backdrop-blur-xl">
                    <div className="w-full h-full px-2 rounded-full overflow-visible flex items-center">
                      <WavyProgress
                        percent={readingProgress}
                        height={12}
                        thickness={4}
                        className="text-[var(--primary)] block self-center"
                      />
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}
        <motion.div
          initial={{
            opacity: 0,
            y: 15,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          className="max-w-4xl mx-auto space-y-12 px-4 md:px-0 motion-gpu relative"
        >
          <div className="flex justify-between items-center sticky top-0 py-4 bg-[var(--surface)]/80 backdrop-blur-md z-40">
          <motion.button
            onClick={() => {
              haptic.light();
              navigateTo("blog");
            }}
            className="m3-button-tonal border-3 border-[var(--outline-variant)]/70 w-fit group"
            initial="rest"
            whileHover="hover"
            whileTap="tap"
            variants={{
              rest: { scale: 1, x: 0 },
              hover: { scale: 1.06, x: -4 },
              tap:  { scale: 0.92, x: -2 },
            }}
            transition={{ type: "spring", stiffness: 500, damping: 22, mass: 0.6 }}
          >
            <motion.span
              variants={{
                rest: { x: 0 },
                hover: { x: -5 },
                tap:  { x: -2 },
              }}
              transition={{ type: "spring", stiffness: 700, damping: 18, mass: 0.5 }}
            >
              <ChevronLeft size={20} className="py-4" />
            </motion.span>
            <span>Back to feed</span>
          </motion.button>
          <div className="flex items-center gap-3 opacity-50 text-[13px] font-black uppercase tracking-[0.2em]">
            <span className="hidden sm:inline opacity-50">{post.readTime}</span>
          </div>
          </div>
        <header className="mb-16 space-y-8 pt-8">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <span className="px-5 py-2 bg-[var(--primary-container)] border-3 border-[var(--primary)]/10 text-[var(--on-primary-container)] rounded-3xl capitalize text-md font-black tracking-widest shadow-sm">
                {post.category}
              </span>
              <div className="flex gap-2 opacity-50 text-sm font-bold">
                <Calendar size={14} />
                <span>{post.date}</span>
              </div>
              {read.includes(post.id) && (
                <div className="flex items-center gap-2 text-green-500 text-xs font-black uppercase tracking-widest bg-green-500/10 px-3 py-1 rounded-full border-3 border-green-500/20">
                  <CheckCircle2 size={12} /> Read
                </div>
              )}
            </div>
            <h1 className="page-title !text-6xl !md:text-8xl leading-[0.9] text-balance font-expressive italic">
              {post.title}
            </h1>
          </div>
          <div className="p-8 bg-[var(--surface-variant)] rounded-[2.5rem] border border-[var(--outline-variant)]/30 italic opacity-80 text-xl leading-relaxed">
            {post.snippet}
          </div>
        </header>
        <div className="markdown-body py-12">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeHighlight]}
            components={{
              // --- code blocks ---
              pre: ({ node, ...props }: any) => <Code {...props} />,
              code: ({ node, inline, className, children, ...props }: any) => {
                if (inline) {
                  return (
                    <code className="bg-[var(--primary-container)]/30 text-[var(--primary)] px-1.5 py-0.5 rounded-md font-mono text-[0.85em] font-bold">
                      {children}
                    </code>
                  );
                }
                return <code className={className} {...props}>{children}</code>;
              },

              // --- headings ---
              h1: ({ children }: any) => (
                <h1 className="text-4xl md:text-5xl font-expressive font-display font-black tracking-[0.03em] mt-14 mb-6 text-[var(--primary)] leading-tight">
                  {children}
                </h1>
              ),
              h2: ({ children }: any) => (
                <h2 className="text-2xl md:text-3xl font-display font-black tracking-tight mt-12 mb-5 border-b border-[var(--outline-variant)]/40 pb-3">
                  {children}
                </h2>
              ),
              h3: ({ children }: any) => (
                <h3 className="text-lg md:text-xl font-black tracking-[0.05em] mt-8 mb-3 opacity-70">
                  {children}
                </h3>
              ),
              h4: ({ children }: any) => (
                <h4 className="text-base font-black uppercase tracking-[0.15em] mt-6 mb-2 opacity-40">
                  {children}
                </h4>
              ),

              // --- paragraphs (with spacer support) ---
              p: ({ children }: any) => {
                const text = Array.isArray(children) ? children[0] : children;
                if (typeof text === "string" && text.startsWith("SPACER_H_")) {
                  const height = text.replace("SPACER_H_", "");
                  return <div style={{ height: height || "2rem" }} aria-hidden="true" />;
                }
                const hasFigure = React.Children.toArray(children).some(
                  (child: any) => React.isValidElement(child) && child.type === "figure",
                );
                if (hasFigure) {
                  return <div className="my-8">{children}</div>;
                }
                return (
                  <p className="text-lg md:text-xl leading-[1.9] opacity-80 mb-5 text-pretty">
                    {children}
                  </p>
                );
              },

              // --- unordered lists (depth-aware) ---
              ul: ({ children, depth }: any) => {
                const parentDepth = useContext(ListDepthContext);
                const currentDepth = parentDepth;
                return (
                  <ListDepthContext.Provider value={currentDepth + 1}>
                    <ul className={cn(
                      "mb-6 list-none",
                      currentDepth === 0 ? "space-y-3" : "mt-2 space-y-2 ml-6 border-l-2 border-[var(--outline-variant)]/30 pl-4"
                    )}>
                      {children}
                    </ul>
                  </ListDepthContext.Provider>
                );
              },

              // --- ordered lists (depth-aware) ---
              ol: ({ children }: any) => {
                const parentDepth = useContext(ListDepthContext);
                return (
                  <ListDepthContext.Provider value={parentDepth + 1}>
                    <ol className={cn(
                      "mb-6 list-none counter-reset-custom",
                      parentDepth === 0 ? "space-y-3" : "mt-2 space-y-2 ml-6 border-l-2 border-[var(--outline-variant)]/30 pl-4"
                    )}>
                      {children}
                    </ol>
                  </ListDepthContext.Provider>
                );
              },

              // --- list items ---
              li: ({ children, ordered, index }: any) => {
                const depth = useContext(ListDepthContext);
                const isTop = depth <= 1;
                return (
                  <li className="flex gap-3 text-lg md:text-xl opacity-80 leading-relaxed">
                    <span className={cn(
                      "select-none shrink-0 font-black mt-0.5",
                      isTop
                        ? "text-[var(--primary)] text-lg"
                        : "text-[var(--primary)]/50 text-base"
                    )}>
                      {ordered
                        ? `${(index ?? 0) + 1}.`
                        : isTop ? "//" : ">"}
                    </span>
                    <span className="flex-1 min-w-0">{children}</span>
                  </li>
                );
              },

              // --- blockquote ---
              blockquote: ({ children }: any) => (
                <blockquote className="my-10 pl-8 pr-8 py-8 border-l-6 border-[var(--primary)] bg-[var(--primary-container)]/15 rounded-r-[3rem] italic flex flex-col justify-center min-h-[120px] [&>p]:m-0">
                  <div className="text-xl md:text-2xl opacity-90 leading-relaxed">
                    {children}
                  </div>
                </blockquote>
              ),

              // --- horizontal rule ---
              hr: () => (
                <div className="my-10 flex items-center gap-4 opacity-30">
                  <div className="flex-1 h-px bg-[var(--outline-variant)]" />
                  <span className="text-[var(--primary)] font-black text-xs tracking-widest">+</span>
                  <div className="flex-1 h-px bg-[var(--outline-variant)]" />
                </div>
              ),

              // --- images (like github readmes) ---
              img: ({ src, alt }: any) => (
                <figure className="my-8">
                  <img
                    src={src}
                    alt={alt}
                    className="w-full rounded-2xl object-cover"
                    loading="lazy"
                  />
                  {alt && (
                    <figcaption className="text-center text-sm opacity-50 italic">
                      {alt}
                    </figcaption>
                  )}
                </figure>
              ),

              // --- links ---
              a: ({ href, children }: any) => (
                <a
                  href={href}
                  target={href?.startsWith("http") ? "_blank" : undefined}
                  rel={href?.startsWith("http") ? "noopener noreferrer" : undefined}
                  className="text-[var(--primary)] font-bold underline underline-offset-3 decoration-[var(--primary)]/60 hover:decoration-[var(--primary)] transition-all"
                >
                  {children}
                </a>
              ),

              // --- strong ---
              strong: ({ children }: any) => (
                <strong className="font-black text-[var(--on-surface)]">{children}</strong>
              ),
            } as any}
          >
            {post.content.replace(
              /<spacer\s+height="([^"]+)"\s*\/>/g,
              "SPACER_H_$1",
            )}
          </ReactMarkdown>
        </div>

        <footer className="relative pt-16 pb-24 flex flex-col items-center gap-8 before:absolute before:top-0 before:left-0 before:w-full before:h-[6px] before:bg-[var(--outline-variant)] before:rounded-full">
          <div className="text-center space-y-2">
            <h4 className="text-3xl font-display font-black">
              Enjoyed this blog post?
            </h4>
            <p className="opacity-60 font-medium">
              Feel free to share this post!
            </p>
          </div>
          <CopyLinkCapsule />
        </footer>
        </motion.div>
      </>
    );
  }

  const featured = BLOG_POSTS[0];
  const categories = Array.from(new Set(BLOG_POSTS.map((p) => p.category)));
  const filtered_posts = BLOG_POSTS.filter(
    (p) => !active_cat || p.category === active_cat,
  );

  const show_featured = !active_cat || featured.category === active_cat;
  const filtered_rest = filtered_posts.filter((p) => p.id !== featured.id);

  return (
    <div className="max-w-6xl mx-auto space-y-10 px-4 md:px-0 pb-32">
      <header className="page-header space-y-12">
        <h2 className="page-title !text-6xl md:!text-[110px] font-expressive-bold italic">Virex blog</h2>
          <p className="text-xl md:text-2xl font-display font-medium text-[var(--on-surface-variant)] opacity-60 max-w-2xl leading-tight">
            A page for my unsolicited thoughts, updates, and opinions.
          </p>
      </header>

      <div className="flex flex-wrap items-center gap-4 mb-12">
        <motion.button
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            haptic.light();
            setActiveCat(null);
          }}
          className={cn(
            "h-11 px-8 text-[13px] font-expressive font-black tracking-[0.3em] border-4 shadow-sm transition-none duration-200 block pt-0.5",
            !active_cat
              ? "bg-[var(--primary)]  italic text-[var(--on-primary)] border-[var(--primary)]/30 rounded-full shadow-lg"
              : "bg-[var(--surface-variant)] italic text-[var(--on-surface-variant)] border-[var(--outline-variant)]/40 rounded-[1.5rem] opacity-60 hover:opacity-100",
          )}
        >
          All
        </motion.button>

        <SplitButton
          variant={active_cat ? "filled" : "tonal"}
          icon={<Filter size={16} className="pt-3"  />}
          label={<span className="block pt-0.5">{active_cat ? `Topic: ${active_cat}` : "Topics"}</span>}
          menu={categories.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                haptic.light();
                setActiveCat(cat);
              }}
              className={cn(
                "w-full min-h-12 text-left px-5 py-3 text-[13px] font-black tracking-[0.03em] rounded-xl transition-all duration-200",
                active_cat === cat
                  ? "bg-[var(--primary)] text-[var(--on-primary)] shadow-md"
                  : "hover:bg-[var(--primary-container)] text-[var(--on-surface-variant)]"
              )}
            >
              {cat}
            </button>
          ))}
        />
      </div>

      <AnimatePresence mode="wait">
        {show_featured && (
          <motion.section
            key="featured"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <motion.div
              initial={{
                opacity: 0,
                scale: 0.98,
              }}
              animate={{
                opacity: 1,
                scale: 1,
              }}
              className="relative rounded-[3.5rem] overflow-hidden bg-[var(--primary-container)] text-[var(--on-primary-container)] border-6 border-[var(--outline-variant)] shadow-2xl group cursor-pointer hover:border-[var(--primary)] transition-colors"
              data-ripple
              onClick={() => {
                haptic.medium();
                navigateTo("blog", featured.link);
              }}
            >
              <div className="p-8 md:p-16 space-y-8 relative z-10">
                <div className="flex items-center gap-4 flex-nowrap">
                  <span className="shrink-0 px-4 py-1.5 bg-[var(--primary)] text-[var(--on-primary)] rounded-[3.5rem] text-[12px] font-black tracking-widest shadow-lg">
                    Featured post!
                  </span>
                  <span className="min-w-0 text-sm font-bold opacity-60 flex gap-2">
                    <Calendar size={14} /> <span className="truncate">{featured.date}</span>
                  </span>
                  {read.includes(featured.id) && (
                    <CheckCircle2
                      size={20}
                      className="text-green-500 shadow-xl shrink-0"
                    />
                  )}
                </div>
                <div className="space-y-4 max-w-4xl">
                  <h3 className="text-4xl md:text-7xl font-expressive font-black tracking-tighter leading-[0.95] group-hover:translate-x-2 transition-transform duration-500 italic">
                    {featured.title}
                  </h3>
                  <p className="text-lg md:text-2xl opacity-50 leading-relaxed font-medium text-pretty">
                    {featured.snippet}
                  </p>
                </div>
                <div className="flex w-full items-center justify-between gap-6 pt-4">
                  <motion.div
                    whileHover={{
                      scale: 1.02,
                      x: 4,
                      backgroundColor: "var(--primary)",
                      color: "var(--on-primary)",
                      borderRadius: "40px",
                      boxShadow: "0 20px  -10px var(--primary)",
                    }}
                    whileTap={{
                      scale: 0.98,
                    }}
                    transition={{
                      type: "spring",
                      stiffness: 800,
                      damping: 20,
                      mass: 0.5,
                    }}
                    className="m3-button-filled ring-6 ring-[var(--on-primary-container)] !transition-none bg-white font-expressive-bold tracking-[0.05em] text-black text-md italic md:text-2xl h-14 md:h-18 px-8 md:px-14 rounded-[3.5rem] flex items-center gap-3 group/btn whitespace-nowrap"
                  >
                    Read entry
                    <motion.span
                      variants={{
                        hover: { x: 5 },
                      }}
                      transition={{
                        type: "spring",
                        stiffness: 1000,
                        damping: 15,
                      }}
                    >
                      <ArrowUpRight
                        size={28}
                        className="w-6 h-6 md:w-8 md:h-8 py-7 group-hover/btn:translate-x-1 transition-transform"
                      />
                    </motion.span>
                  </motion.div>
                  <span className="text-xs md:text-[16px] font-expressive-bold uppercase tracking-widest opacity-40 italic">
                    {featured.readTime}
                  </span>
                </div>
              </div>
            </motion.div>
          </motion.section>
        )}
      </AnimatePresence>

      <motion.div
        layout
        className="grid grid-cols-1 lg:grid-cols-2 gap-8"
      >
        <AnimatePresence>
          {filtered_rest.map((p, i) => (
            <motion.div
              key={p.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
            >
              <Card
                delay={i * 0.05}
                className="h-full"
                innerClassName="cursor-pointer group h-full relative overflow-hidden bg-[var(--surface-variant)]/30 hover:bg-[var(--primary-container)]/20 border-6 border-[var(--outline-variant)]/50 hover:border-[var(--primary)] transition-colors p-10"
                onClick={() => {
                  haptic.medium();
                  navigateTo("blog", p.link);
                }}
              >
                <div className="space-y-6 h-full flex flex-col justify-between">
                  <div className="space-y-6">
                    <div className="flex justify-between items-start gap-3">
                      <div className="flex items-center pt-1.5 gap-2 min-w-0 flex-1">
                        <span className="text-[10px] pl-2.5 font-black uppercase tracking-widest text-[var(--primary)] px-2 py-1 bg-[var(--primary-container)]/30 rounded-[2rem] border-3 border-[var(--primary)]/20 whitespace-nowrap shrink-0">
                          {p.category}
                        </span>
                        <span className="ml-2 text-[12px] font-bold opacity-40 tracking-widest whitespace-nowrap">
                          {p.date}
                        </span>
                        {read.includes(p.id) && (
                          <CheckCircle2 size={16} className="text-green-500 shrink-0" />
                        )}
                      </div>
                      <div className="w-11 h-11 rounded-[2rem] bg-[var(--surface)] border-3 border-[var(--outline-variant)] flex items-center justify-center group-hover:bg-[var(--primary)] group-hover:text-[var(--on-primary)] transition-all duration-500 shrink-0">
                        <ChevronRight size={20} />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h4 className="text-2xl md:text-3xl font-expressive font-black leading-tight group-hover:translate-x-1 transition-transform italic">
                        {p.title}
                      </h4>
                      <p className="text-lg opacity-50 leading-relaxed line-clamp-2 text-pretty">
                        {p.snippet}
                      </p>
                    </div>
                  </div>
                  <div className="pt-4 flex items-center justify-between border-t-3 border-[var(--outline-variant)] opacity-40 text-[12px] font-black tracking-widest">
                    <span>
                      Post No. {BLOG_POSTS.length - BLOG_POSTS.indexOf(p)}
                    </span>
                    <span>{p.readTime}</span>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </div>
  );
});
