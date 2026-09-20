// @ts-nocheck
import React, { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "../constants";
import { Headphones } from "lucide-react";
import { 
  Search, 
  Home, 
  Info, 
  ImageIcon, 
  Monitor, 
  Settings as SettingsIcon, 
  Layers, 
  Palette, 
  Moon, 
  Sun, 
  ArrowRight, 
  ArrowUp, 
  ArrowDown, 
  MessageSquare, 
  X, 
  ViewModule, 
  ViewList,
  ChevronRight,
  CornerDownLeft,
} from "./MaterialIcon";
import { M3ScrollBar } from "./M3ScrollBar";
import M3Switch from "./M3Switch";
import { haptic } from "../haptics";
import { 
  getAllSearchItems, 
  groupByCategory, 
  type SearchItem 
} from "../utils/searchUtils";

const normalize = (value: string) => value.trim().toLowerCase();

export function CommandPalette({
  open,
  onClose,
  goto,
  settings,
  cycleTheme,
  updateSettings,
  onOpenSettings,
  onOpenGuestbook,
  blogPosts,
}: any) {
  const [query, setQuery] = useState("");
  const [cursor, setCursor] = useState(0);
  const [viewMode, setViewMode] = useState<"lists" | "cards">("lists");
  const [searchFocus, setSearchFocus] = useState(false);
  const [ignoreMouseHover, setIgnoreMouseHover] = useState(false);
  const [recentIds, setRecentIds] = useState<string[]>([]);
  const [wobbleKey, setWobbleKey] = useState(0);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const items = useMemo(() => {
    // static navigation and action items
    const pageActions = [
      {
        id: "go-home",
        label: "Go home",
        description: "Jump to the homepage",
        category: "Navigation",
        icon: Home,
        action: () => goto("home"),
        tags: ["home", "start", "landing"],
      },
      {
        id: "go-info",
        label: "Open info page",
        description: "Visit the about / info page",
        category: "Navigation",
        icon: Info,
        action: () => goto("readme"),
        tags: ["info", "about", "readme"],
      },
      {
        id: "go-blog",
        label: "Open blog",
        description: "Browse the blog feed",
        category: "Navigation",
        icon: Layers,
        action: () => goto("blog"),
        tags: ["blog", "posts", "articles"],
      },
      {
        id: "go-music",
        label: "Open music page",
        description: "Explore electronic music, releases & streaming links",
        category: "Navigation",
        icon: Headphones,
        action: () => goto("music"),
        tags: ["music", "audio", "spotify", "bandcamp", "producer", "beats", "releases"],
      },
      {
        id: "go-lens",
        label: "Open lens",
        description: "Explore the Lens photo page",
        category: "Navigation",
        icon: ImageIcon,
        action: () => goto("lens"),
        tags: ["lens", "photo", "camera"],
      },
      {
        id: "go-now",
        label: "Open now",
        description: "See what I'm doing now",
        category: "Navigation",
        icon: Monitor,
        action: () => goto("now"),
        tags: ["now", "status", "live"],
      },
      {
        id: "go-changelog",
        label: "Open changelog",
        description: "View recent site updates",
        category: "Navigation",
        icon: ArrowRight,
        action: () => goto("changelog"),
        tags: ["changelog", "updates", "release"],
      },
      {
        id: "open-settings",
        label: "Open settings",
        description: "Adjust theme, nav, and site options",
        category: "Tools",
        icon: SettingsIcon,
        action: () => onOpenSettings(),
        tags: ["settings", "options", "prefs"],
      },
      {
        id: "open-guestbook",
        label: "Open guestbook",
        description: "Read and sign the guestbook",
        category: "Tools",
        icon: MessageSquare,
        action: () => onOpenGuestbook(),
        tags: ["guestbook", "guest", "book"],
      },
      {
        id: "theme-cycle",
        label: `Toggle theme (${settings.mode})`,
        description: "Flip between light and dark mode",
        category: "Appearance",
        icon: Palette,
        action: () => cycleTheme(),
        tags: ["theme", "dark", "light", "mode"],
      },
      {
        id: "theme-light",
        label: "Set light theme",
        description: "Switch the site to light mode",
        category: "Appearance",
        icon: Sun,
        action: () => updateSettings({ mode: "light" }),
        tags: ["light", "theme", "mode"],
      },
      {
        id: "theme-dark",
        label: "Set dark theme",
        description: "Switch the site to dark mode",
        category: "Appearance",
        icon: Moon,
        action: () => updateSettings({ mode: "dark" }),
        tags: ["dark", "theme", "mode"],
      },
      {
        id: "theme-system",
        label: "Set system theme",
        description: "Follow the OS theme setting",
        category: "Appearance",
        icon: Palette,
        action: () => updateSettings({ mode: "system" }),
        tags: ["system", "theme", "mode"],
      },
    ];

    // dynamically get all searchable items (settings, blog, projects, links)
    const searchableItems = getAllSearchItems(
      settings,
      updateSettings,
      onOpenSettings,
      goto,
      () => goto("home")
    );

    return [...pageActions, ...searchableItems];
  }, [goto, settings, cycleTheme, updateSettings, onOpenSettings, onOpenGuestbook]);

  useEffect(() => {
    const stored = window.localStorage.getItem("virex-command-palette-recent");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setRecentIds(parsed.filter((id) => typeof id === "string"));
        }
      } catch (error) {
        console.warn("Failed to parse recent command palette items", error);
      }
    }
  }, []);

  const filteredItems = useMemo(() => {
    const queryText = normalize(query);
    
    // filter by search scope
    let scopedItems = items;
    const scope = settings.paletteSearchScope;
    
    if (scope === "pages") {
      scopedItems = items.filter((item) => item.category === "Navigation");
    } else if (scope === "commands") {
      scopedItems = items.filter((item) => 
        item.category !== "Blog" && 
        item.category !== "Projects" && 
        item.category !== "Links"
      );
    } else if (scope === "blog") {
      scopedItems = items.filter((item) => item.category === "Blog");
    } else if (scope === "settings") {
      scopedItems = items.filter((item) => item.category === "Settings");
    }

    // apply recent items sorting if no query
    const sortedItems = !queryText && settings.paletteShowRecentActions && recentIds.length
      ? [
          ...recentIds
            .map((id) => scopedItems.find((item) => item.id === id))
            .filter(Boolean),
          ...scopedItems.filter((item) => !recentIds.includes(item.id)),
        ]
      : scopedItems;

    if (!queryText) {
      return sortedItems.slice(0, settings.paletteResultsLimit);
    }

    // full text search across all fields
    return sortedItems
      .filter((item) => {
        const haystack = [
          item.label, 
          item.description, 
          ...(item.tags || []),
          item.excerpt || ""
        ].join(" ").toLowerCase();
        return haystack.includes(queryText);
      })
      .slice(0, settings.paletteResultsLimit);
  }, [items, query, recentIds, settings.paletteSearchScope, settings.paletteResultsLimit, settings.paletteShowRecentActions]);

  const groupedItems = useMemo(() => {
    const groups = groupByCategory(filteredItems);
    const order = ["Navigation", "Settings", "Blog", "Lens", "Projects", "Links", "Appearance", "Tools"];
    return order
      .filter((category) => groups[category])
      .map((category) => ({ category, items: groups[category] }));
  }, [filteredItems]);

  const flatItems = useMemo(
    () => groupedItems.flatMap((group) => group.items),
    [groupedItems]
  );

  const itemIndexMap = useMemo(
    () => new Map(flatItems.map((item, index) => [item.id, index])),
    [flatItems]
  );

  const isRecentItem = (itemId: string) => !normalize(query) && settings.paletteShowRecentActions && recentIds.includes(itemId);

  useEffect(() => {
    setCursor(0);
  }, [query]);

  useEffect(() => {
    if (!open) return;
    if (settings.paletteDefaultView === "cards") {
      setViewMode("cards");
    } else {
      setViewMode("lists");
    }
  }, [open, settings.paletteDefaultView]);

  useEffect(() => {
    if (!open) return;
    setCursor((current) => Math.min(current, Math.max(flatItems.length - 1, 0)));
  }, [flatItems.length, open]);

  useEffect(() => {
    if (!open || !ignoreMouseHover) return;
    const onPointerMove = () => setIgnoreMouseHover(false);
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    return () => window.removeEventListener("pointermove", onPointerMove);
  }, [open, ignoreMouseHover]);

  const shouldSuppressHover = settings.paletteSuppressHover;
  const shouldWrapNav = settings.paletteKeyboardNavBehavior === "wrap";
  const isGridNav = settings.paletteKeyboardNavBehavior === "grid";

  useEffect(() => {
    if (!open) return;

    const clampIndex = (next: number) => {
      if (flatItems.length === 0) return 0;
      if (shouldWrapNav) {
        return (next + flatItems.length) % flatItems.length;
      }
      return Math.max(0, Math.min(next, flatItems.length - 1));
    };

    const moveAmount = viewMode === "cards" && isGridNav ? 2 : 1;

    const onKeyDown = (event: KeyboardEvent) => {
      const suppress = shouldSuppressHover;

      if (event.key === "ArrowDown") {
        event.preventDefault();
        if (suppress) setIgnoreMouseHover(true);
        setCursor((current) => clampIndex(current + moveAmount));
      }

      if (event.key === "ArrowUp") {
        event.preventDefault();
        if (suppress) setIgnoreMouseHover(true);
        setCursor((current) => clampIndex(current - moveAmount));
      }

      if (viewMode === "cards" && event.key === "ArrowRight") {
        event.preventDefault();
        if (suppress) setIgnoreMouseHover(true);
        setCursor((current) => {
          const next = current + 1;
          return shouldWrapNav ? clampIndex(next) : (next < flatItems.length ? next : current);
        });
      }

      if (viewMode === "cards" && event.key === "ArrowLeft") {
        event.preventDefault();
        if (suppress) setIgnoreMouseHover(true);
        setCursor((current) => {
          const next = current - 1;
          return shouldWrapNav ? clampIndex(next) : (next >= 0 ? next : current);
        });
      }

      if (event.key === "Enter") {
        event.preventDefault();
        const item = flatItems[cursor] || flatItems[0];
        if (item) {
          const updated = [item.id, ...recentIds.filter((id) => id !== item.id)].slice(0, 6);
          setRecentIds(updated);
          window.localStorage.setItem("virex-command-palette-recent", JSON.stringify(updated));
          item.action();
          onClose();
        }
      }

      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, flatItems, cursor, viewMode, onClose, recentIds, shouldWrapNav, shouldSuppressHover, isGridNav]);

  useEffect(() => {
    if (!open) return;
    const active = scrollRef.current?.querySelector<HTMLButtonElement>("[data-command-active='true']");
    active?.scrollIntoView({ block: "nearest", inline: "nearest" });
  }, [cursor, filteredItems, open]);

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[10000] bg-black/60 backdrop-blur-md motion-gpu"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 15 }}
        transition={{ type: "spring", stiffness: 420, damping: 32, mass: 0.75 }}
        className="fixed left-1/2 top-1/2 z-[10010] w-[min(92vw,740px)] max-h-[86vh] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-[2.5rem] bg-[var(--surface)] border-3 sm:border-4 border-[var(--outline-variant)]/40 shadow-2xl flex flex-col motion-gpu"
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
      >
        <div className="flex flex-col h-full overflow-hidden">
          {/* header */}
          <div className="p-6 md:p-7 border-b-3 sm:border-b-4 border-[var(--outline-variant)]/30 bg-[var(--surface-variant)]/80 flex flex-col gap-5 sticky top-0 z-10 shrink-0">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="text-[12px] font-black uppercase tracking-[0.24em] font-expressive italic text-[var(--primary)] opacity-90">
                  Command palette
                </div>
                <h2 className="mt-2 text-2xl sm:text-3xl md:text-4xl font-expressive tracking-[-0.03em] leading-tight text-[var(--on-surface)]">
                  Quick jump across pages, settings, and posts.
                </h2>
                <p className="mt-1.5 max-w-2xl text-xs sm:text-sm leading-relaxed opacity-60 text-[var(--on-surface-variant)] font-medium">
                  Search everything from one place, then select with keyboard or mouse.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  haptic.medium();
                  onClose();
                }}
                className="group w-10 h-10 rounded-full bg-[var(--surface)]/80 hover:bg-[var(--surface)] border-2 border-[var(--outline-variant)]/40 flex items-center justify-center transition-all cursor-pointer text-[var(--on-surface)] active:scale-95 shrink-0 shadow-xs"
                aria-label="Close command palette"
              >
                <X size={20} className="transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:rotate-180 group-hover:scale-110" />
              </button>
            </div>

            {/* search input row */}
            <motion.div
              className="flex items-center gap-3.5"
              animate={searchFocus ? { y: -2, scale: 1.008 } : { y: 0, scale: 1 }}
              whileHover={{ y: -1, scale: 1.004 }}
              transition={{ type: "spring", stiffness: 400, damping: 24, mass: 0.8 }}
            >
              <motion.button
                key={wobbleKey}
                type="button"
                className="relative flex shrink-0 cursor-pointer items-center justify-center select-none"
                style={{ width: 54, height: 54 }}
                initial={wobbleKey === 0 ? false : { rotate: -90 }}
                animate={{ rotate: 0 }}
                transition={{ type: "spring", stiffness: 420, damping: 14, mass: 0.65 }}
                whileHover={query ? { scale: 1.1, rotate: 20 } : { scale: 1.06 }}
                whileTap={{ scale: 0.88 }}
                onClick={() => { 
                  if (query) { 
                    setQuery(""); 
                    setWobbleKey(0); 
                    haptic.light();
                  } 
                }}
                aria-label={query ? "Clear search" : "Search"}
              >
                <svg className="absolute inset-0 h-full w-full" viewBox="0 0 54 54" fill="none">
                  <circle cx="27" cy="15" r="14" fill="var(--primary)" />
                  <circle cx="27" cy="39" r="14" fill="var(--primary)" />
                  <circle cx="15" cy="27" r="14" fill="var(--primary)" />
                  <circle cx="39" cy="27" r="14" fill="var(--primary)" />
                  <rect x="13" y="13" width="28" height="28" fill="var(--primary)" />
                </svg>
                <motion.div
                  className="relative z-10 text-[var(--on-primary)] flex items-center justify-center"
                  transition={{ type: "spring", stiffness: 400, damping: 18 }}
                >
                  {query ? <X size={18} /> : <Search size={18} />}
                </motion.div>
              </motion.button>

              <div
                className={cn(
                  "flex h-15 flex-1 items-center rounded-full bg-[var(--surface)] pl-5 pr-1.5 transition-all duration-200 border-3",
                  searchFocus
                    ? "border-[var(--outline-variant)]/80 shadow-sm"
                    : "border-[var(--outline-variant)]/40 hover:border-[var(--outline-variant)]/70"
                )}
              >
                <input
                  autoFocus
                  value={query}
                  onChange={(e) => { 
                    setQuery(e.target.value); 
                    setWobbleKey((k) => k + 1); 
                  }}
                  onFocus={() => setSearchFocus(true)}
                  onBlur={() => setSearchFocus(false)}
                  placeholder="Search commands, pages, blog posts, settings..."
                  className="min-w-0 flex-1 bg-transparent text-[15px] font-bold text-[var(--on-surface)] outline-none placeholder:text-[var(--on-surface-variant)] placeholder:opacity-50 pr-2"
                  aria-label="Search command palette"
                />
                <motion.button
                  type="button"
                  onClick={() => {
                    const item = flatItems[cursor] || flatItems[0];
                    if (item) {
                      const updated = [item.id, ...recentIds.filter((id) => id !== item.id)].slice(0, 6);
                      setRecentIds(updated);
                      window.localStorage.setItem("virex-command-palette-recent", JSON.stringify(updated));
                      item.action();
                      onClose();
                    }
                  }}
                  aria-label="Run selected command"
                  className="flex shrink-0 cursor-pointer items-center justify-center rounded-full bg-[var(--primary)] text-[var(--on-primary)] shadow-sm"
                  style={{ width: 40, height: 40 }}
                  whileHover={{ rotate: 15, scale: 1.08 }}
                  whileTap={{ scale: 0.88 }}
                  transition={{ type: "spring", stiffness: 480, damping: 22, mass: 0.6 }}
                >
                  <ArrowRight size={18} />
                </motion.button>
              </div>
            </motion.div>
          </div>

          {/* results area + scrollbar gutter */}
          <div className="relative min-h-0 flex-1 overflow-hidden p-4 sm:p-6 pb-2">
            {filteredItems.length === 0 ? (
              <div className="rounded-2xl bg-[var(--surface-variant)]/40 p-8 text-center text-sm font-medium opacity-70 border-2 border-[var(--outline-variant)]/30 text-[var(--on-surface)]">
                No matches found! Try using another word or query.
              </div>
            ) : (
              <div className="relative h-full">
                <div
                  ref={scrollRef}
                  className="scrollbar-hide max-h-[calc(74vh-16rem)] overflow-y-auto overflow-x-hidden pr-6 sm:pr-8 pl-1 pt-1 pb-4 space-y-6"
                >
                  {groupedItems.map((group) => (
                    <div key={group.category} className="space-y-3">
                      {/* cooked with this category separator */}
                      <div className="text-center py-2 rounded-t-[1.5rem] mx-1 rounded-b-[0.5rem] bg-[var(--surface-variant)] text-[12px] uppercase tracking-[0.2em] font-black opacity-80 text-[var(--primary)] font-expressive select-none border-2 border-[var(--outline-variant)]/20">
                        {group.category}
                      </div>

                      {/* list view m,ode */}
                      {viewMode === "lists" ? (
                        <div className="flex flex-col gap-1.5 px-0.5">
                          {group.items.map((item, index, arr) => {
                            const globalIndex = itemIndexMap.get(item.id) ?? 0;
                            const Icon = item.icon;
                            const isActive = globalIndex === cursor;
                            const isRecent = isRecentItem(item.id);
                            const isFirst = index === 0;
                            const isLast = index === arr.length - 1;
                            const isSingle = arr.length === 1;
                            const roundedClass = isSingle
                              ? "rounded-[22px]"
                              : isFirst
                                ? "rounded-t-[22px] rounded-b-[8px]"
                                : isLast
                                  ? "rounded-b-[22px] rounded-t-[8px]"
                                  : "rounded-[8px]";

                            return (
                              <motion.button
                                key={item.id}
                                type="button"
                                onClick={() => {
                                  const updated = [item.id, ...recentIds.filter((id) => id !== item.id)].slice(0, 6);
                                  setRecentIds(updated);
                                  window.localStorage.setItem("virex-command-palette-recent", JSON.stringify(updated));
                                  item.action();
                                  onClose();
                                }}
                                onMouseEnter={() => {
                                  if (!ignoreMouseHover) setCursor(globalIndex);
                                }}
                                data-command-active={isActive}
                                whileHover={{ scale: 1.01, x: 2 }}
                                whileTap={{ scale: 0.98 }}
                                transition={{ type: "spring", stiffness: 450, damping: 26, mass: 0.6 }}
                                className={cn(
                                  "w-full flex items-center justify-between p-3.5 sm:p-4 text-left group cursor-pointer select-none transition-colors duration-200 outline-none",
                                  roundedClass,
                                  isActive
                                    ? "bg-[var(--primary-container)] border-3 border-[var(--primary)] text-[var(--on-primary-container)] shadow-sm"
                                    : "bg-[var(--surface-variant)]/60 hover:bg-[var(--surface-variant)] border-2 border-[var(--outline-variant)]/30 text-[var(--on-surface)]"
                                )}
                              >
                                <div className="flex items-center gap-3.5 min-w-0 flex-1">
                                  {/* icon container */}
                                  <div
                                    className={cn(
                                      "w-11 h-11 flex items-center justify-center rounded-full shrink-0 transition-colors duration-200 overflow-hidden border-2",
                                      isActive
                                        ? "bg-[var(--primary)] border-[var(--primary)] text-[var(--on-primary)] shadow-sm"
                                        : "bg-[var(--surface)] border-[var(--outline-variant)]/30 text-[var(--primary)]"
                                    )}
                                  >
                                    <div className="flex items-center justify-center transition-transform duration-200 ease-out group-hover:scale-105">
                                      {item.previewUrl ? (
                                        <img
                                          src={item.previewUrl}
                                          alt={item.previewAlt || item.label}
                                          className="h-full w-full object-cover object-center"
                                          loading="lazy"
                                        />
                                      ) : (
                                        <Icon size={20} />
                                      )}
                                    </div>
                                  </div>

                                  {/* text content */}
                                  <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-2">
                                      <span className={cn(
                                        "text-[15px] tracking-tight truncate",
                                        isActive ? "font-black text-[var(--on-primary-container)]" : "font-bold text-[var(--on-surface)]"
                                      )}>
                                        {item.label}
                                      </span>
                                      {isRecent && (
                                        <span className="rounded-full bg-[var(--primary)] text-[var(--on-primary)] px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider shrink-0 shadow-xs">
                                          Recent
                                        </span>
                                      )}
                                    </div>
                                    {item.description && (
                                      <p className="text-xs opacity-65 font-medium truncate mt-0.5 text-[var(--on-surface-variant)]">
                                        {item.description}
                                      </p>
                                    )}
                                  </div>
                                </div>

                                {/* right action indicator */}
                                <div className="shrink-0 flex items-center justify-center pl-3">
                                  {isActive ? (
                                    <span className="inline-flex items-center justify-center h-7 px-2.5 rounded-xl bg-[var(--primary)] text-[var(--on-primary)] text-[11px] font-mono font-bold shadow-xs select-none gap-1.5 leading-none">
                                      <CornerDownLeft size={13} strokeWidth={2.5} />
                                      <span>Enter</span>
                                    </span>
                                  ) : (
                                    <ChevronRight
                                      size={18}
                                      className="text-[var(--on-surface-variant)] opacity-35 group-hover:opacity-80 group-hover:translate-x-0.5 transition-all duration-200"
                                    />
                                  )}
                                </div>
                              </motion.button>
                            );
                          })}
                        </div>
                      ) : (
                        /* highly contrast card view */
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 px-0.5">
                          {group.items.map((item, index, arr) => {
                            const globalIndex = itemIndexMap.get(item.id) ?? 0;
                            const Icon = item.icon;
                            const isActive = globalIndex === cursor;
                            const isRecent = isRecentItem(item.id);
                            const isLastOdd = arr.length % 2 === 1 && index === arr.length - 1;

                            return (
                              <motion.button
                                key={item.id}
                                type="button"
                                onClick={() => {
                                  const updated = [item.id, ...recentIds.filter((id) => id !== item.id)].slice(0, 6);
                                  setRecentIds(updated);
                                  window.localStorage.setItem("virex-command-palette-recent", JSON.stringify(updated));
                                  item.action();
                                  onClose();
                                }}
                                onMouseEnter={() => {
                                  if (!ignoreMouseHover) setCursor(globalIndex);
                                }}
                                data-command-active={isActive}
                                whileHover={{ scale: 1.015, y: -2 }}
                                whileTap={{ scale: 0.98 }}
                                transition={{ type: "spring", stiffness: 450, damping: 26, mass: 0.6 }}
                                className={cn(
                                  "relative flex flex-col justify-between p-4.5 rounded-[22px] text-left group cursor-pointer select-none transition-colors duration-150 outline-none min-h-[115px] gap-3 border",
                                  isLastOdd && "sm:col-span-2 min-h-[84px] justify-center p-4 sm:px-5",
                                  isActive
                                    ? "bg-[var(--primary-container)] border-3 border-[var(--primary)] text-[var(--on-primary-container)] shadow-md"
                                    : "bg-[var(--surface-variant)]/60 hover:bg-[var(--surface-variant)] border-3 border-[var(--outline-variant)]/30 hover:border-[var(--outline-variant)]/60 text-[var(--on-surface)] shadow-xs"
                                )}
                              >
                                {isLastOdd ? (
                                  <div className="relative flex flex-col items-center justify-center w-full py-0.5 text-center">
                                    {/* icon container on left */}
                                    <div className="absolute left-0 top-1/2 -translate-y-1/2">
                                      <div
                                        className={cn(
                                          "w-11 h-11 flex items-center justify-center rounded-2xl shrink-0 transition-colors duration-150 overflow-hidden border-2",
                                          isActive
                                            ? "bg-[var(--primary)] border-[var(--primary)] text-[var(--on-primary)] shadow-sm"
                                            : "bg-[var(--surface)] border-[var(--outline-variant)]/30 text-[var(--primary)]"
                                        )}
                                      >
                                        <div className="flex items-center justify-center transition-transform duration-200 ease-out group-hover:scale-105">
                                          {item.previewUrl ? (
                                            <img
                                              src={item.previewUrl}
                                              alt={item.previewAlt || item.label}
                                              className="h-full w-full object-cover object-center"
                                              loading="lazy"
                                            />
                                          ) : (
                                            <Icon size={20} />
                                          )}
                                        </div>
                                      </div>
                                    </div>

                                    {/* text content dead-centered on X axis */}
                                    <div className="w-full flex flex-col items-center justify-center text-center px-12 sm:px-14">
                                      <div className="flex items-center justify-center gap-2 max-w-full">
                                        <span className={cn(
                                          "text-[15px] sm:text-[16px] tracking-tight leading-snug truncate font-expressive",
                                          isActive ? "font-black text-[var(--on-primary-container)]" : "font-bold text-[var(--on-surface)]"
                                        )}>
                                          {item.label}
                                        </span>
                                        {isRecent && (
                                          <span className="rounded-full bg-[var(--primary)] text-[var(--on-primary)] px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider shrink-0 shadow-xs">
                                            Recent
                                          </span>
                                        )}
                                      </div>
                                      {item.description && (
                                        <p className="text-xs sm:text-[13.5px] opacity-75 font-medium line-clamp-2 mt-0.5 leading-relaxed text-[var(--on-surface-variant)] text-center w-full">
                                          {item.description}
                                        </p>
                                      )}
                                    </div>

                                    {/* right action indicator */}
                                    <div className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center shrink-0">
                                      {isActive && (
                                        <span className="inline-flex items-center justify-center h-6 min-w-[26px] px-1.5 rounded-lg bg-[var(--primary)] text-[var(--on-primary)] shadow-xs leading-none select-none">
                                          <CornerDownLeft size={13} strokeWidth={2.5} />
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                ) : (
                                  <>
                                    <div className="flex items-center justify-between w-full gap-2">
                                      {/* icon container */}
                                      <div
                                        className={cn(
                                          "w-11 h-11 flex items-center justify-center rounded-2xl shrink-0 transition-colors duration-150 overflow-hidden border-2",
                                          isActive
                                            ? "bg-[var(--primary)] border-[var(--primary)] text-[var(--on-primary)] shadow-sm"
                                            : "bg-[var(--surface)] border-[var(--outline-variant)]/30 text-[var(--primary)]"
                                        )}
                                      >
                                        <div className="flex items-center justify-center transition-transform duration-200 ease-out group-hover:scale-105">
                                          {item.previewUrl ? (
                                            <img
                                              src={item.previewUrl}
                                              alt={item.previewAlt || item.label}
                                              className="h-full w-full object-cover object-center"
                                              loading="lazy"
                                            />
                                          ) : (
                                            <Icon size={20} />
                                          )}
                                        </div>
                                      </div>

                                      <div className="flex items-center gap-1.5">
                                        {isRecent && (
                                          <span className="rounded-full bg-[var(--primary)] text-[var(--on-primary)] px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider shadow-xs">
                                            Recent
                                          </span>
                                        )}
                                        {isActive && (
                                          <span className="inline-flex items-center justify-center h-6 min-w-[26px] px-1.5 rounded-lg bg-[var(--primary)] text-[var(--on-primary)] shadow-xs leading-none select-none">
                                            <CornerDownLeft size={13} strokeWidth={2.5} />
                                          </span>
                                        )}
                                      </div>
                                    </div>

                                    <div className="min-w-0">
                                      <div className={cn(
                                        "text-[15px] tracking-tight leading-snug line-clamp-1",
                                        isActive ? "font-black text-[var(--on-primary-container)]" : "font-bold text-[var(--on-surface)]"
                                      )}>
                                        {item.label}
                                      </div>
                                      {item.description && (
                                        <p className="text-xs opacity-70 font-medium line-clamp-2 mt-1 leading-relaxed text-[var(--on-surface-variant)]">
                                          {item.description}
                                        </p>
                                      )}
                                    </div>
                                  </>
                                )}
                              </motion.button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <M3ScrollBar scrollEl={scrollRef} thinOnly colorful className="absolute top-0 right-0 h-full" />
              </div>
            )}
          </div>

          {/* footer */}
          <div className="border-t-3 sm:border-t-4 border-[var(--outline-variant)]/30 bg-[var(--surface)] px-6 py-4 text-xs text-[var(--on-surface-variant)] shrink-0">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2 opacity-80 font-medium">
                <span>Tip:</span>
                <kbd className="px-2 py-1 rounded-lg bg-[var(--surface-variant)] font-mono text-[11px] font-bold text-[var(--on-surface)] border-2 border-[var(--outline-variant)]/30">↑</kbd>
                <kbd className="px-2 py-1 rounded-lg bg-[var(--surface-variant)] font-mono text-[11px] font-bold text-[var(--on-surface)] border-2 border-[var(--outline-variant)]/30">↓</kbd>
                <kbd className="inline-flex items-center justify-center gap-1 px-2 py-1 rounded-lg bg-[var(--surface-variant)] font-mono text-[11px] font-bold text-[var(--on-surface)] border-2 border-[var(--outline-variant)]/30">
                  <CornerDownLeft size={12} strokeWidth={2.5} />
                  <span>Enter</span>
                </kbd>
                <span>to select.</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-bold uppercase tracking-wider text-[11px] opacity-75 font-display">View</span>
                <M3Switch
                  checked={viewMode === "lists"}
                  onChange={(checked) => {
                    haptic.light();
                    setViewMode(checked ? "lists" : "cards");
                  }}
                  icons="both"
                  checkedIcon={<ViewList size={14} />}
                  uncheckedIcon={<ViewModule size={14} />}
                />
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
