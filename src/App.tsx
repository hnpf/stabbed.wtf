// @ts-nocheck
import React, { useState, useEffect, useRef, memo, lazy, Suspense } from "react";
import { motion, AnimatePresence, MotionConfig } from "motion/react";
import {
  Home,
  BookText,
  Camera,
  Activity,
  Fingerprint,
  Settings as SettingsIcon,
  Cpu,
  Github,
  Mail,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  X,
  Terminal,
  ArrowUpRight,
  Link as LinkIcon,
  Layers,
  EyeOff,
  Check,
  Palette,
} from "lucide-react";

import { useTheme } from "./ThemeContext";
import { ScrollToTopButton } from "./components/ScrollToTopButton";
import { cn } from "./constants";
import { useAprilFools } from "./hooks/useAprilFools";
import { useSettingsSync } from "./hooks/useSettingsSync";
import { useMetadata } from "./hooks/useMetadata";
import { useViewport } from "./hooks/useViewport";
import { useTextSearch } from "./hooks/useTextSearch";

// pages: keep route-level code splitting only for heavy/media-rich pages
import { HomePage } from "./pages/HomePage";
import { ChangelogPage } from "./pages/ChangelogPage";
import { ReadmePage } from "./pages/ReadmePage";
import { NowPage } from "./pages/NowPage";
import { MusicPage } from "./pages/MusicPage";
import NotFound from "./pages/NotFound";
import { LensPage } from "./pages/LensPage";
const BlogPage = lazy(() => import("./pages/BlogPage").then(m => ({ default: m.BlogPage })));

// interactive dialogs/components: eagerly loaded for 0ms interaction response
import { SettingsDialog } from "./components/SettingsDialog";
import { GuestbookDialog } from "./components/GuestbookDialog";
import { BugReportDialog } from "./components/BugReportDialog";
import { KnownIssuesDialog } from "./components/KnownIssuesDialog";
import { DebugView } from "./components/DebugView";
import { CommandPalette } from "./components/CommandPalette";

// lighter components: kept eager (small, used immediately)
import { SideItem } from "./components/Navigation";
import { MobileFloatingNav } from "./components/MobileFloatingNav";
import { TextSearchBar } from "./components/TextSearchBar";
import { DebugConfirmDialog } from "./components/DebugConfirmDialog";
import { CapsuleConfirmDialog } from "./components/CapsuleConfirmDialog";
import { RefreshConfirmDialog } from "./components/RefreshConfirmDialog";
import { FoolsPopup } from "./components/FoolsPopup";
import { BounceButton } from "./components/TechStack";
import { M3WindowScrollBar, M3ScrollBar } from "./components/M3ScrollBar";
import { materialIcon } from "./components/MaterialIcon";
import { BLOG_POSTS } from "./constants";

import "./navigation/navigation-rail.css";

const M3Home = materialIcon("home");
const M3Info = materialIcon("fingerprint");
const M3Blog = materialIcon("menu_book");
const M3Lens = materialIcon("photo_camera");
const M3Now = materialIcon("monitor_heart");
const M3Music = materialIcon("headphones");
const M3Settings = materialIcon("settings");
const M3ChevronLeft = materialIcon("chevron_left");
const M3ChevronRight = materialIcon("chevron_right");
const M3FocusOff = materialIcon("visibility_off");
const M3Chat = materialIcon("forum");

export default function App() {
  const { settings, updateSettings, actualTheme, cycleTheme } = useTheme();
  const { popup, setPopup, IS_APR } = useAprilFools();
  const viewport = useViewport();
  const textSearch = useTextSearch();
  
  const [toast, setToast] = useState<string | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [bugReportOpen, setBugReportOpen] = useState(false);
  const [KnownIssuessOpen, setKnownIssuessOpen] = useState(false);

  const normalizeRoute = (pathname: string) => pathname.replace(/^\/+/, "").replace(/\/+$/, "").toLowerCase();

  const [guestbookOpen, setGuestbookOpen] = useState(() => {
    return normalizeRoute(window.location.pathname) === "guestbook";
  });
  const [showDebugConfirm, setShowDebugConfirm] = useState(false);
  const [showRefreshConfirm, setShowRefreshConfirm] = useState(false);
  const [pendingCapsule, setPendingCapsule] = useState<any>(null);
  const [do_wiggle, setDoWiggle] = useState(false);
  const [show_top, setShowTop] = useState(false);
  const [scrollDirection, setScrollDirection] = useState<"up" | "down">("up");
  const [commandOpen, setCommandOpen] = useState(false);
  const lastScrollY = useRef(0);
  const [scrolled, set_scrolled] = useState(false);
  const [navHoverSide, setNavHoverSide] = useState<"top" | "bottom" | null>(null);
  const [canScrollUp, setCanScrollUp] = useState(false);
  const [canScrollDown, setCanScrollDown] = useState(false);
  const navRef = useRef<HTMLElement | null>(null);
  const sidebarScrollEnabled = false;

  // modular logic hooks
  useSettingsSync(setPendingCapsule);

  const getPageFromPath = (pathname: string) => {
    const loc = pathname;
    const path = normalizeRoute(loc);

    if (path === "guestbook") return "home";
    if (loc === "/" || loc === "") return "home";
    if (loc.startsWith("/blog/")) return "blog";

    const ALLOWED = ["home", "blog", "lens", "now", "readme", "changelog", "music"];
    return ALLOWED.includes(path) ? path : "404";
  };

  const [page, setPage] = useState(() => getPageFromPath(window.location.pathname));

  const [blogPostId, setBlogPostId] = useState<string | null>(() => {
    const loc = window.location.pathname;
    return loc.startsWith("/blog/") ? loc.split("/")[2] : null;
  });

  useMetadata(page, blogPostId, IS_APR);

  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(t);
    }
  }, [toast]);

  useEffect(() => {
    const timer = setTimeout(() => setDoWiggle(true), 1200);
    const stop = setTimeout(() => setDoWiggle(false), 2200);
    return () => { clearTimeout(timer); clearTimeout(stop); };
  }, []);

  useEffect(() => {
    const on_key = (e: KeyboardEvent) => {
      if (e.key === "Escape" && settings.focusMode) {
        updateSettings({ focusMode: false });
      }

      const pressed = e.key.toLowerCase();
      const openHotkey = settings.paletteHotkey;
      const isPaletteHotkey =
        openHotkey === "ctrl-k" && e.ctrlKey && !e.metaKey && pressed === "k"
        || openHotkey === "cmd-k" && e.metaKey && !e.ctrlKey && pressed === "k"
        || openHotkey === "ctrl-shift-p" && e.ctrlKey && e.shiftKey && !e.metaKey && pressed === "p";
      // settings hotkey = ctrl + ,
      const isSettingsHotkey = e.ctrlKey && !e.metaKey && !e.shiftKey && pressed === ",";

      if (isPaletteHotkey) {
        e.preventDefault();
        setCommandOpen((open) => !open);
      }
      // settings hotkey right next to palette, reusing the same logic
      if (isSettingsHotkey) {
        e.preventDefault();
        setSettingsOpen((open) => !open);
      }
      if (e.key === "Escape" && commandOpen) {
        setCommandOpen(false);
      }
    };
    window.addEventListener("keydown", on_key);
    return () => window.removeEventListener("keydown", on_key);
  }, [settings.focusMode, settings.paletteHotkey, updateSettings, commandOpen]);

  useEffect(() => {
    const nav = document.getElementById("sidebar-nav");
    if (!nav) return;
    navRef.current = nav;
    const check = () => {
      setCanScrollUp(nav.scrollTop > 1);
      setCanScrollDown(nav.scrollHeight - nav.scrollTop - nav.clientHeight > 1);
    };
    check();

    const timeout = setTimeout(check, 100);
    nav.addEventListener("scroll", check);
    window.addEventListener("resize", check);

    let resizeObserver: ResizeObserver | null = null;
    let mutationObserver: MutationObserver | null = null;

    if (typeof ResizeObserver !== "undefined") {
      resizeObserver = new ResizeObserver(check);
      resizeObserver.observe(nav);
    }

    if (typeof MutationObserver !== "undefined") {
      mutationObserver = new MutationObserver(check);
      mutationObserver.observe(nav, { subtree: true, childList: true, characterData: true });
    }

    return () => {
      clearTimeout(timeout);
      nav.removeEventListener("scroll", check);
      window.removeEventListener("resize", check);
      if (resizeObserver) resizeObserver.disconnect();
      if (mutationObserver) mutationObserver.disconnect();
    };
  }, [viewport.h, page, settings.sidebarCollapsed]);

  useEffect(() => {
    document.body.style.overflow = (settingsOpen || bugReportOpen || KnownIssuessOpen || guestbookOpen || showDebugConfirm || pendingCapsule) ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [settingsOpen, bugReportOpen, KnownIssuessOpen, showDebugConfirm, pendingCapsule]);

  useEffect(() => {
    const sync_url = (e: PopStateEvent) => {
      if (!e.state?.modal) {
        setSettingsOpen(false);
        setBugReportOpen(false);
        setKnownIssuessOpen(false);
      }
      
      const loc = window.location.pathname;
      const path = normalizeRoute(loc);
      if (path === "guestbook") {
        setPage("home");
        setBlogPostId(null);
        setGuestbookOpen(true);
      } else {
        setGuestbookOpen(false);
        if (loc === "/" || loc === "") {
          setPage("home"); setBlogPostId(null);
        } else if (loc.startsWith("/blog/")) {
          setPage("blog"); setBlogPostId(loc.split("/")[2]);
        } else {
          const ALLOWED = ["home", "blog", "lens", "now", "readme", "changelog", "music"];
          setPage(ALLOWED.includes(path) ? path : "404");
          setBlogPostId(null);
        }
      }
    };
    window.addEventListener("popstate", sync_url);
    return () => window.removeEventListener("popstate", sync_url);
  }, []);

  useEffect(() => {
    const isModalOpen = settingsOpen || bugReportOpen || KnownIssuessOpen;
    if (isModalOpen && !window.history.state?.modal) {
      window.history.pushState({ modal: true }, "");
    } else if (!isModalOpen && window.history.state?.modal) {
      window.history.back();
    }
  }, [settingsOpen, bugReportOpen, KnownIssuessOpen]);

  useEffect(() => {
    const on_scroll = () => {
      const currentScrollY = window.scrollY;
      setShowTop(currentScrollY > 400);
      set_scrolled(currentScrollY > 0);

      if (currentScrollY <= 400) {
        setScrollDirection("up");
      } else {
        const diff = currentScrollY - lastScrollY.current;
        if (diff > 10) {
          setScrollDirection("down");
        } else if (diff < -10) {
          setScrollDirection("up");
        }
      }
      lastScrollY.current = currentScrollY;
    };
    window.addEventListener("scroll", on_scroll);
    return () => window.removeEventListener("scroll", on_scroll);
  }, []);



  const handleOpenGuestbook = React.useCallback(() => {
    setGuestbookOpen(true);
    window.history.pushState({}, "", "/guestbook");
  }, []);

  const handleCloseGuestbook = React.useCallback(() => {
    setGuestbookOpen(false);
    if (normalizeRoute(window.location.pathname) === "guestbook") {
      window.history.pushState({}, "", "/");
    }
  }, []);

  const goto = React.useCallback((newPage: string, postId: string | null = null) => {
    setSettingsOpen(false);
    setGuestbookOpen(false);
    const url = newPage === "home" ? "/" : postId ? `/blog/${postId}` : `/${newPage}`;
    window.history.pushState({}, "", url);
    React.startTransition(() => {
      setPage(newPage);
      setBlogPostId(postId);
    });
    window.scrollTo(0, 0);
  }, []);

  const is_short = viewport.h < 720;
  const is_tiny = viewport.h < 550;
  const is_mobile = viewport.w < 768 && !settings.forceDesktop;
  const is_tablet = viewport.w >= 768 && viewport.w < 1024 && !settings.forceDesktop;
  const showBottomNav = !settings.focusMode && (page !== "readme" || !settings.infoFullscreen) && is_mobile;
  const isExpanded = is_mobile && scrollDirection === "up" && !settings.focusMode;
  const show_pfp_container = settings.profileContainer && viewport.h > 720;

  const paletteHotkeyLabel = settings.paletteHotkey === "cmd-k"
    ? "⌘K"
    : settings.paletteHotkey === "ctrl-shift-p"
      ? "Ctrl+Shift+P"
      : "Ctrl+K";

  const springConfig = {
    type: "spring" as const,
    stiffness: settings.highHz ? 600 : 500,
    damping: settings.highHz ? 30 : 28,
    mass: 0.8,
  };

  const squishySpring = {
    type: "spring" as const,
    stiffness: settings.highHz ? 400 : 350,
    damping: settings.highHz ? 28 : 25,
    mass: 0.8,
  };

  return (
    <div
      className={cn(
        "min-h-screen flex font-sans relative",
        (settings.forceDesktop || !is_mobile) ? "flex-row" : "flex-col",
        settings.sidebarFlipped && (settings.forceDesktop || !is_mobile ? "flex-row-reverse" : "flex-col"),
        settings.debugMode && "debug-mode",
      )}
    >
      <a href="#primary-content" className="skip-link">Skip to main content</a>
      <MotionConfig reducedMotion={settings.disableAnimations ? "always" : "user"} transition={settings.disableAnimations ? { duration: 0 } : undefined}>
        {IS_APR && <div className="fsh-tiled-bg" />}

        {/* m3 expressive window-level scrollbar. desktop only. */}
        {!is_mobile && !settings.focusMode && (
          <M3WindowScrollBar
            colorful
            right={settings.sidebarFlipped ? 4 : 4}
          />
        )}
        {popup && (
          <FoolsPopup content={popup} onResolve={() => setPopup(null)} />
        )}

      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9, x: "-50%" }}
            animate={{ opacity: 1, y: 0, scale: 1, x: "-50%" }}
            exit={{ opacity: 0, y: 20, scale: 0.9, x: "-50%" }}
            transition={{ type: "spring", stiffness: 500, damping: 25 }}
            className="fixed bottom-6 left-1/2 z-[10000] bg-[var(--primary-container)] text-[var(--on-primary-container)] px-6 py-3 rounded-full font-black text-sm tracking-wider shadow-2xl border border-[var(--primary)]/20 flex items-center gap-3 backdrop-blur-md"
          >
            <span>{toast}</span>
          </motion.div>
        )}
      </AnimatePresence>


      <ScrollToTopButton
        showTop={show_top}
        isMobile={is_mobile}
        showBottomNav={showBottomNav}
        scrollDirection={scrollDirection}
        settings={settings}
        updateSettings={updateSettings}
      />

      <AnimatePresence>
        {settings.focusMode && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed top-0 left-0 right-0 h-32 z-[100] pointer-events-none backdrop-blur-md" style={{ maskImage: "linear-gradient(to bottom, black, transparent)", WebkitMaskImage: "linear-gradient(to bottom, black, transparent)" }} />
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed bottom-0 left-0 right-0 h-32 z-[100] pointer-events-none backdrop-blur-md" style={{ maskImage: "linear-gradient(to top, black, transparent)", WebkitMaskImage: "linear-gradient(to top, black, transparent)" }} />
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {!settings.focusMode && (page !== "readme" || !settings.infoFullscreen) && !is_mobile && (
          <motion.aside
            initial={{ x: settings.sidebarFlipped ? 60 : -60, opacity: 0 }}
            animate={{ x: 0, opacity: 1, width: settings.sidebarCollapsed ? (settings.floatingSidebar ? 144 : 96) : (settings.floatingSidebar ? (is_tablet ? 280 : 350) : (is_tablet ? 260 : 320)), paddingTop: settings.floatingSidebar ? "1.5rem" : "12px", paddingBottom: settings.floatingSidebar ? "1.5rem" : "12px", paddingLeft: settings.sidebarFlipped ? (settings.floatingSidebar ? "1.5rem" : "12px") : (settings.floatingSidebar ? "1.5rem" : "0px"), paddingRight: settings.sidebarFlipped ? (settings.floatingSidebar ? "1.5rem" : "0px") : (settings.floatingSidebar ? "1.5rem" : "12px"), borderTopLeftRadius: settings.floatingSidebar || settings.sidebarFlipped ? "3rem" : "0rem", borderBottomLeftRadius: settings.floatingSidebar || settings.sidebarFlipped ? "3rem" : "0rem", borderTopRightRadius: settings.floatingSidebar || !settings.sidebarFlipped ? "3rem" : "0rem", borderBottomRightRadius: settings.floatingSidebar || !settings.sidebarFlipped ? "3rem" : "0rem" }}
            style={{ backgroundColor: settings.floatingSidebar ? "transparent" : "var(--outline-variant)" }}
            exit={{ x: settings.sidebarFlipped ? 400 : -400, opacity: 0, transition: { type: "spring", stiffness: 300, damping: 30 } }}
            transition={springConfig}
            layout
            className="flex-col sticky top-0 h-screen z-40 motion-gpu transition-colors duration-300"
          >
            <motion.div
              layout
              animate={{ padding: settings.sidebarCollapsed ? "0px" : (settings.floatingSidebar ? "20px" : "24px"), borderRadius: settings.floatingSidebar ? "2.5rem 2.5rem 2.5rem 2.5rem" : (settings.sidebarFlipped ? "2.375rem 0 0 2.375rem" : "0 2.375rem 2.375rem 0"), backdropFilter: scrolled || settings.floatingSidebar ? "blur(24px)" : "blur(0px)", borderWidth: settings.floatingSidebar ? "6px" : "0px", borderRightWidth: !settings.floatingSidebar && !settings.sidebarFlipped ? "1px" : (settings.floatingSidebar ? "6px" : "0px"), borderLeftWidth: !settings.floatingSidebar && settings.sidebarFlipped ? "1px" : (settings.floatingSidebar ? "6px" : "0px"), borderBottomWidth: scrolled && !settings.floatingSidebar ? "1px" : (settings.floatingSidebar ? "6px" : "0px"), boxShadow: settings.floatingSidebar ? "0 25px 50px -12px rgba(0, 0, 0, 0.25)" : "0 0px 0px 0px rgba(0, 0, 0, 0)" }}
              style={{ backgroundColor: "var(--surface)" }}
              transition={{ ...springConfig, stiffness: settings.highHz ? 500 : 400, damping: settings.highHz ? 28 : 25 }}
              className={cn("flex flex-col h-full w-full motion-gpu border-[var(--outline-variant)] transition-colors duration-300", scrolled && !settings.floatingSidebar && "border-b-[var(--outline-variant)]/30")}
            >
              <div className={cn("flex items-center isolate", settings.sidebarCollapsed ? cn("justify-center px-0", is_short ? "mb-4 py-4" : "mb-10 py-10") : show_pfp_container ? cn("bg-[var(--surface-variant)]/20 ring-6 ring-[var(--outline-variant)]/30 rounded-[2.5rem] px-4 mx-2 gap-4", is_short ? "mb-4 py-3" : "mb-10 py-6") : cn("px-4 mx-2 gap-4", is_short ? "mb-4 py-1" : "mb-8 py-2"))}>
                <motion.div
                  whileHover={{ scale: 1.1, rotate: -2, y: -2 }}
                  whileTap={{ scale: 0.92, rotate: 5 }}
                  animate={{ rotate: do_wiggle ? [0, -10, 10, -10, 10, 0] : 0 }}
                  transition={{ type: "spring", stiffness: 400, damping: 22, mass: 0.6 }}
                  onClick={() => goto("readme")}
                  tabIndex={0}
                  role="button"
                  aria-label="Go to info"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      goto("readme");
                    }
                  }}
                  className={cn("flex items-center justify-center shrink-0 relative group/pfp cursor-pointer isolate", show_pfp_container ? "w-24 h-24 rounded-[40px] shadow-xl" : cn("w-24 h-24 rounded-[40px] shadow-none", !settings.sidebarCollapsed && "-ml-5"), settings.sidebarCollapsed && "w-16 h-16 rounded-[24px]")}
                >
                  <div className="absolute inset-0 rounded-[inherit] overflow-hidden">
                    <div className={cn("absolute inset-0 z-20 rounded-[inherit] ring-inset overflow-hidden transition-colors duration-250 pointer-events-none", show_pfp_container ? "ring-6 ring-[var(--outline-variant)] group-hover/pfp:ring-[var(--primary)]" : "ring-6 ring-[var(--outline-variant)] group-hover/pfp:ring-[var(--primary)]", settings.sidebarCollapsed && "ring-6")} />
                    <div className="absolute inset-0 bg-[var(--surface-variant)]/50 -z-10" />
                    <img src="/photography/pfp/main.webp" alt="virex" className="w-full h-full object-cover rounded-[inherit] group-hover/pfp:scale-105 backface-hidden transform-3d transition-transform duration-250 group-hover/pfp:scale-105" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; const svg = document.createElement("img"); svg.src = "/favicon.svg"; svg.className = "w-10 h-10 p-1 transition-transform group-hover/pfp:scale-110"; svg.style.color = "var(--on-primary)"; (e.target as HTMLImageElement).parentElement!.appendChild(svg); }} referrerPolicy="no-referrer" />
                  </div>
                </motion.div>
                {!settings.sidebarCollapsed && (
                  <div className="overflow-hidden whitespace-nowrap">
                    <div className="font-black font-expressive text-2xl tracking-tight italic uppercase leading-none">virex.</div>
                    <div className="text-[12px] capitalize tracking-[0.03em] opacity-60 font-black mt-1">independent dev</div>
                  </div>
                )}
              </div>
              {!settings.sidebarCollapsed && !is_tiny && !is_short && (
                <div className="flex flex-col mb-6 px-4 gap-3">
                  <div className="flex flex-col gap-2">
                    <h3 className="text-2xl font-expressive italic font-black mb-2 tracking-[0.03em] text-[var(--on-surface-variant)] uppercase leading-none">Navigation</h3>
                    <div className="text-[11px] ml-3 font-bold tracking-[0.15em] text-[var(--on-surface-variant)] opacity-70">
                      <span className="font-black">{paletteHotkeyLabel}</span> to search
                    </div>
                  </div>
                </div>
              )}
              <div className="flex-1 flex flex-col min-h-0 relative group/nav" onMouseMove={(e) => { const rect = e.currentTarget.getBoundingClientRect(); const y = e.clientY - rect.top; setNavHoverSide(y < rect.height / 2 ? "top" : "bottom"); }} onMouseLeave={() => setNavHoverSide(null)}>
                <nav id="sidebar-nav" className={cn("flex-1 flex flex-col overflow-y-auto min-h-0 py-2 scrollbar-hide", canScrollUp && canScrollDown ? "mask-both" : (canScrollUp ? "mask-top" : (canScrollDown ? "mask-bottom" : "")), "gap-1.5", settings.sidebarCollapsed ? "items-center px-2" : "items-stretch px-2")} data-rail-state={settings.sidebarCollapsed ? "default" : "open"}>
                  <M3ScrollBar className="ml-3" scrollEl={navRef} colorful thinOnly />
                  <SideItem highHz={settings.highHz} isFirst glyph={M3Home} text="Home" isSelected={page === "home"} onSelect={() => goto("home")} isMini={settings.sidebarCollapsed} isFloating={settings.floatingSidebar} isShort={is_short} />
                  <SideItem highHz={settings.highHz} glyph={M3Info} text="Info" isSelected={page === "readme"} onSelect={() => goto("readme")} isMini={settings.sidebarCollapsed} isFloating={settings.floatingSidebar} isShort={is_short} />
                  <SideItem highHz={settings.highHz} glyph={M3Blog} text="Blog" isSelected={page === "blog"} onSelect={() => goto("blog")} isMini={settings.sidebarCollapsed} isFloating={settings.floatingSidebar} isShort={is_short} />
                  <SideItem highHz={settings.highHz} glyph={M3Music} text="Music" isSelected={page === "music"} onSelect={() => goto("music")} isMini={settings.sidebarCollapsed} isFloating={settings.floatingSidebar} isShort={is_short} />
                  <SideItem highHz={settings.highHz} glyph={M3Lens} text="Lens" isSelected={page === "lens"} onSelect={() => goto("lens")} isMini={settings.sidebarCollapsed} isFloating={settings.floatingSidebar} isShort={is_short} />
                  <SideItem highHz={settings.highHz} glyph={M3Now} text="Now" isSelected={page === "now"} onSelect={() => goto("now")} isMini={settings.sidebarCollapsed} isFloating={settings.floatingSidebar} isShort={is_short} isLast />
                </nav>
                <AnimatePresence>
                  {canScrollUp && navHoverSide === "top" && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={squishySpring} className="absolute top-2 left-0 right-0 pointer-events-none flex flex-col items-center z-[50]">
                      <button onClick={() => document.getElementById("sidebar-nav")?.scrollBy({ top: -150, behavior: "smooth" })} className="w-10 h-10 bg-[var(--primary)] text-[var(--on-primary)] rounded-full flex items-center justify-center shadow-lg pointer-events-auto border-2 border-white/10 transition-transform active:scale-90"><M3ChevronLeft size={20} className="rotate-90" fill /></button>
                    </motion.div>
                  )}
                </AnimatePresence>
                <AnimatePresence>
                  {canScrollDown && navHoverSide === "bottom" && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} transition={squishySpring} className="absolute bottom-2 left-0 right-0 pointer-events-none flex flex-col items-center z-[50]">
                      <button onClick={() => document.getElementById("sidebar-nav")?.scrollBy({ top: 150, behavior: "smooth" })} className="w-10 h-10 bg-[var(--primary)] text-[var(--on-primary)] rounded-full flex items-center justify-center shadow-lg pointer-events-auto border-2 border-white/10 transition-transform active:scale-90"><M3ChevronLeft size={20} className="-rotate-90" fill /></button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <div className={cn("mt-auto flex flex-col pt-3", settings.sidebarCollapsed ? cn("items-center gap-4", is_short ? "pb-3" : "pb-6") : cn("px-2 gap-3", is_short ? "pb-2" : "pb-4"))} data-rail-state={settings.sidebarCollapsed ? "default" : "open"}>
                {!settings.sidebarCollapsed && (
                  <div className="mx-2 mb-2 h-px bg-[var(--outline-variant)]/30 rounded-full" />
                )}
                
                <div className={cn("flex flex-col", settings.sidebarCollapsed ? "w-full items-center gap-4" : "gap-2.5")}>
                  
                  <SideItem highHz={settings.highHz} glyph={M3Settings} text="Settings" onSelect={() => setSettingsOpen(true)} isMini={settings.sidebarCollapsed} isShort={is_short} isFirst isLast isFloating={settings.floatingSidebar} layoutId="settings-expansion" />
                  {!settings.sidebarCollapsed && (
                    <div className="grid grid-cols-2 gap-2 w-full">
                      <BounceButton icon={Github} label="GitHub" url="https://github.com/hnpf" className="flex items-center justify-center gap-2.5 h-14 rounded-[24px] bg-[var(--surface-variant)]/50 hover:bg-[var(--primary-container)] hover:text-[var(--on-primary-container)] text-[var(--on-surface)] transition-all duration-200 text-sm font-expressive tracking-wide font-black shadow-none" />
                      <BounceButton icon={M3Chat} label="Discord" url="https://discord.gg/TSZNYbjzF7" className="flex items-center justify-center gap-2.5 h-14 rounded-[24px] bg-[var(--surface-variant)]/50 hover:bg-[var(--primary-container)] hover:text-[var(--on-primary-container)] text-[var(--on-surface)] transition-all duration-200 text-sm font-expressive tracking-wide font-black shadow-none" />
                    </div>
                  )}
                  <div className={cn("w-full flex justify-center", settings.sidebarCollapsed && "px-0")}>
                    <motion.button 
                      layout 
                      whileHover={{ scale: 1.03, y: -1 }}
                      whileTap={{ scale: 0.96 }}
                      transition={{
                        type: "spring",
                        stiffness: 500,
                        damping: 25,
                      }}
                      onClick={() => updateSettings({ sidebarCollapsed: !settings.sidebarCollapsed })} 
                      className={cn(
                        "flex items-center justify-center outline-none cursor-pointer transition-all duration-200",
                        settings.sidebarCollapsed
                          ? "w-14 h-14 rounded-full bg-[var(--surface-variant)] text-[var(--on-surface)] hover:bg-[var(--primary-container)] hover:text-[var(--on-primary-container)]"
                          : "w-full h-14 rounded-[24px] bg-[var(--surface-variant)]/50 hover:bg-[var(--primary-container)] hover:text-[var(--on-primary-container)] text-[var(--on-surface)] gap-3 font-expressive text-[15px] tracking-widest font-black"
                      )}
                      aria-label={settings.sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                    >
                      {settings.sidebarCollapsed ? (
                        <M3ChevronRight size={24} fill />
                      ) : (
                        <>
                          <M3ChevronLeft size={22} fill />
                          <span>Collapse</span>
                        </>
                      )}
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.aside>
        )}
      </AnimatePresence>

      <motion.main
        id="primary-content"
        className={cn("flex-1 overflow-x-hidden page-container", (page === "readme" && settings.infoFullscreen) ? "p-0" : "p-6 md:p-12 lg:p-16", settings.forceDesktop || viewport.w >= 768 ? "pb-16" : "pb-40")}
        style={
          !settings.forceDesktop && viewport.w < 768
            ? { paddingBottom: `calc(env(safe-area-inset-bottom, 12px) + 10rem)` }
            : undefined
        }
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.div key={page + (blogPostId || "")} initial={settings.disableAnimations ? false : { opacity: 0, y: 15, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -15, scale: 0.98 }} transition={{ duration: settings.disableAnimations ? 0 : (settings.highHz ? 0.25 : 0.4), ease: [0.22, 1, 0.36, 1], scale: { type: "spring", stiffness: settings.highHz ? 600 : 300, damping: settings.highHz ? 35 : 25 } }}>
            {page === "home" && <HomePage setPage={goto} settings={settings} onOpenGuestbook={handleOpenGuestbook} />}
            {page === "blog" && <BlogPage targetId={blogPostId} navigateTo={goto} />}
            {page === "lens" && <LensPage viewport={viewport} />}
            {page === "now" && <NowPage />}
            {page === "music" && <MusicPage setPage={goto} />}
            {page === "readme" && <ReadmePage setPage={goto} is_mobile={is_mobile} />}
            {page === "changelog" && <ChangelogPage />}
            {![ "home", "blog", "lens", "now", "music", "readme", "changelog" ].includes(page) && <NotFound go={goto} />}
          </motion.div>
        </AnimatePresence>
        <AnimatePresence>
          {settings.focusMode && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 20 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => updateSettings({ focusMode: false })}
              className="fixed bottom-15 left-1/2 -translate-x-1/2 z-50 px-6 py-3 bg-[var(--primary)] text-[var(--on-primary)] rounded-full font-bold shadow-2xl flex items-center gap-3 border-2 border-white/20 backdrop-blur-md whitespace-nowrap"
            >
              <M3FocusOff size={21} fill />
              {is_mobile ? (
                <span className="font-expressive text-md tracking-widest pt-0.5">Exit Focus</span>
              ) : (
                <>
                  <span>Exit focus:</span>
                  <span className="text-md opacity-60 bg-black/20 px-2 py-0.5 rounded tracking-wider">Esc</span>
                  <span>or click me!</span>
                </>
              )}
            </motion.button>
          )}
        </AnimatePresence>
      </motion.main>

      <AnimatePresence>
        {!settings.focusMode && (page !== "readme" || !settings.infoFullscreen) && is_mobile && (
          <MobileFloatingNav
            items={[
              { key: "home",     glyph: M3Home, label: "Home" },
              { key: "readme",   glyph: M3Info, label: "Info" },
              { key: "blog",     glyph: M3Blog, label: "Blog" },
              { key: "music",    glyph: M3Music, label: "Music" },
              { key: "lens",     glyph: M3Lens, label: "Lens" },
              { key: "now",      glyph: M3Now,  label: "Now" }
            ]}
            activePage={page}
            onSelect={goto}
            onSettings={() => setSettingsOpen(true)}
            settingsGlyph={M3Settings}
            settingsLayoutId="settings-expansion"
          />
        )}
      </AnimatePresence>

      <SettingsDialog 
        settingsOpen={settingsOpen} 
        setSettingsOpen={setSettingsOpen} 
        settings={settings} 
        updateSettings={updateSettings} 
        setShowDebugConfirm={setShowDebugConfirm} 
        setShowRefreshConfirm={setShowRefreshConfirm}
        setToast={setToast} 
        goto={goto} 
        is_mobile={is_mobile}
        viewport={viewport}
        onReportBug={() => setBugReportOpen(true)}
        onOpenKnownIssuess={() => setKnownIssuessOpen(true)}
      />
      <BugReportDialog
        isOpen={bugReportOpen}
        onClose={() => setBugReportOpen(false)}
        setToast={setToast}
        isMobile={is_mobile}
        viewport={viewport}
      />
      <GuestbookDialog
        isOpen={guestbookOpen}
        onClose={handleCloseGuestbook}
        setToast={setToast}
        isMobile={is_mobile}
        viewport={viewport}
      />
      <KnownIssuesDialog
        isOpen={KnownIssuessOpen}
        onClose={() => setKnownIssuessOpen(false)}
        isMobile={is_mobile}
        viewport={viewport}
      />
      {settings.debugMode && (
        <DebugView page={page} blogPostId={blogPostId} viewport={viewport} />
      )}
      <CommandPalette
        open={commandOpen}
        onClose={() => setCommandOpen(false)}
        goto={goto}
        settings={settings}
        cycleTheme={cycleTheme}
        updateSettings={updateSettings}
        onOpenSettings={() => setSettingsOpen(true)}
        onOpenGuestbook={handleOpenGuestbook}
        blogPosts={BLOG_POSTS}
      />
      <TextSearchBar
        isOpen={textSearch.isOpen}
        query={textSearch.query}
        onQueryChange={textSearch.updateQuery}
        onClose={textSearch.closeSearch}
        onNextMatch={textSearch.nextMatch}
        onPrevMatch={textSearch.prevMatch}
        matchCount={textSearch.matchCount}
        currentMatch={textSearch.currentMatch}
      />
      <DebugConfirmDialog showDebugConfirm={showDebugConfirm} setShowDebugConfirm={setShowDebugConfirm} updateSettings={updateSettings} />
      <CapsuleConfirmDialog pendingCapsule={pendingCapsule} setPendingCapsule={setPendingCapsule} updateSettings={updateSettings} setToast={setToast} />
      <RefreshConfirmDialog showRefreshConfirm={showRefreshConfirm} setShowRefreshConfirm={setShowRefreshConfirm} />
      </MotionConfig>
    </div>
  );
}
