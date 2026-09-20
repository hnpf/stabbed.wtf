// @ts-nocheck
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useDragControls } from "motion/react";
import {
  Terminal,
  X,
  Palette,
  Zap,
  Trash2,
  Search,
  MousePointer,
  HelpCircle,
  Wifi,
  CornerDownRight,
} from "./MaterialIcon";
import { X as LucideX, Minus as LucideMinus } from "lucide-react";
import { useTheme } from "../ThemeContext";
import { cn } from "../constants";
import Switch from "./M3Switch";

const getElementClassName = (element: any): string => {
  if (!element) return "";
  const className = element.className;
  if (typeof className === "string") {
    return className;
  }
  if (className && typeof className === "object" && typeof className.baseVal === "string") {
    return className.baseVal;
  }
  return "";
};

const formatConsoleArg = (arg: any): string => {
  if (typeof arg !== "object" || arg === null) return String(arg);
  if (typeof Element !== "undefined" && arg instanceof Element) {
    return `<${arg.tagName.toLowerCase()}>`;
  }
  try {
    const serialized = JSON.stringify(arg);
    return serialized === undefined ? String(arg) : serialized;
  } catch {
    return `[${arg.constructor?.name || "Object"}]`;
  }
};

// global console logger store to persist logs across mounts and page navigations
interface LogMessage {
  id: string;
  timestamp: string;
  level: "info" | "warn" | "error";
  message: string;
}

let globalLogsHistory: LogMessage[] = [];
const globalLogListeners = new Set<(logs: LogMessage[]) => void>();

const addGlobalLog = (level: "info" | "warn" | "error", message: string) => {
  const time = new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  const newLog = {
    id: Math.random().toString(36).substr(2, 9),
    timestamp: time,
    level,
    message,
  };
  globalLogsHistory.push(newLog);
  if (globalLogsHistory.length > 200) {
    globalLogsHistory.shift();
  }
  globalLogListeners.forEach((listener) => listener([...globalLogsHistory]));
};

// get console logs
const initConsoleHijack = () => {
  if (typeof window !== "undefined" && !(window as any).__console_hijacked__) {
    (window as any).__console_hijacked__ = true;
    const originalLog = console.log;
    const originalWarn = console.warn;
    const originalError = console.error;

    console.log = (...args: any[]) => {
      originalLog.apply(console, args);
      const msg = args.map(formatConsoleArg).join(" ");
      addGlobalLog("info", msg);
    };

    console.warn = (...args: any[]) => {
      originalWarn.apply(console, args);
      const msg = args.map(formatConsoleArg).join(" ");
      addGlobalLog("warn", msg);
    };
    console.error = (...args: any[]) =>  {
      originalError.apply(console, args);
      const msg = args.map(formatConsoleArg).join(" ");
      addGlobalLog("error", msg);
    };

    window.addEventListener("error", (e) => {
      addGlobalLog("error", `uncaught error: ${e.message} at ${e.filename}:${e.lineno}`);
    });

    window.addEventListener("unhandledrejection", (e) => {
      addGlobalLog("error", `unhandled rejection: ${String(e.reason)}`);
    });
  }
};

export const DebugView = ({ page, blogPostId, viewport }: any) => {
  const { settings, updateSettings, actualTheme, cycleTheme } = useTheme();
  
  useEffect(() => {
    initConsoleHijack();
  }, []);

  const BUILD_VERSION = "v3.5.2-stable (2026.09.20)";
  const dragControls = useDragControls();

  // local debug console state
  const [isCollapsed, setIsCollapsed] = useState(() => {
    const saved = localStorage.getItem("virex-debug-collapsed");
    return saved ? JSON.parse(saved) : false;
  });
  const [activeTab, setActiveTab] = useState<"metrics" | "toggles" | "console" | "storage" | "inspector">("metrics");
  
  // toggles state
  const [showGrid, setShowGrid] = useState(() => {
    const saved = localStorage.getItem("virex-debug-grid");
    return saved ? JSON.parse(saved) : true;
  });
  const [showOutlines, setShowOutlines] = useState(false);
  const [slowAnimations, setSlowAnimations] = useState(false);
  const [vinylMode, setvinylMode] = useState(false);
  
  // inspector and eraser mode
  const [inspectorActive, setInspectorActive] = useState(false);
  const [eraserActive, setEraserActive] = useState(false);
  const [hoveredElement, setHoveredElement] = useState<any>(null);
  const [eraserHovered, setEraserHovered] = useState<any>(null);
  const [selectedElement, setSelectedElement] = useState<HTMLElement | null>(null);
  const [elementTextOverride, setElementTextOverride] = useState("");

  // fps meter state
  const [fps, setFps] = useState(60);
  
  // console logs state
  const [logs, setLogs] = useState<LogMessage[]>(globalLogsHistory);
  const [searchTerm, setSearchTerm] = useState("");
  const [logFilter, setLogFilter] = useState<"all" | "info" | "warn" | "error">("all");
  const consoleBottomRef = useRef<HTMLDivElement>(null);

  // storage explorer state
  const [storageItems, setStorageItems] = useState<{ key: string; value: string; type: "local" | "session" }[]>([]);

  // network connection metrics fallback
  const [networkInfo, setNetworkInfo] = useState({ effectiveType: "unknown", rtt: 0, downlink: 0, online: true });

  // sync states when settings.debugMode changes to false
  useEffect(() => {
    if (!settings.debugMode) {
      setShowGrid(false);
      setShowOutlines(false);
      setSlowAnimations(false);
      setvinylMode(false);
      setInspectorActive(false);
      setEraserActive(false);
      localStorage.setItem("virex-debug-grid", "false");
      document.documentElement.classList.remove("debug-grid-active");
      document.documentElement.classList.remove("debug-outlines-active");
      document.documentElement.classList.remove("debug-slow-animations-active");
      document.documentElement.classList.remove("debug-vinyl-mode-active");
    }
  }, [settings.debugMode]);

  // save collapse preference
  useEffect(() => {
    if (!settings.debugMode) return;
    localStorage.setItem("virex-debug-collapsed", JSON.stringify(isCollapsed));
  }, [isCollapsed, settings.debugMode]);

  // log page transitions
  useEffect(() => {
    if (!settings.debugMode) return;
    addGlobalLog("info", `[Router] routed to /${page}${blogPostId ? `:${blogPostId}` : ""}`);
  }, [page, blogPostId, settings.debugMode]);

  // sync class toggles on HTML element
  useEffect(() => {
    if (!settings.debugMode) {
      document.documentElement.classList.remove("debug-grid-active");
      return;
    }
    document.documentElement.classList.toggle("debug-grid-active", showGrid);
    localStorage.setItem("virex-debug-grid", JSON.stringify(showGrid));
    return () => document.documentElement.classList.remove("debug-grid-active");
  }, [showGrid, settings.debugMode]);

  useEffect(() => {
    if (!settings.debugMode) {
      document.documentElement.classList.remove("debug-outlines-active");
      return;
    }
    document.documentElement.classList.toggle("debug-outlines-active", showOutlines);
    return () => document.documentElement.classList.remove("debug-outlines-active");
  }, [showOutlines, settings.debugMode]);

  useEffect(() => {
    if (!settings.debugMode) {
      document.documentElement.classList.remove("debug-slow-animations-active");
      return;
    }
    document.documentElement.classList.toggle("debug-slow-animations-active", slowAnimations);
    return () => document.documentElement.classList.remove("debug-slow-animations-active");
  }, [slowAnimations, settings.debugMode]);

  useEffect(() => {
    if (!settings.debugMode) {
      document.documentElement.classList.remove("debug-vinyl-mode-active");
      return;
    }
    document.documentElement.classList.toggle("debug-vinyl-mode-active", vinylMode);
    return () => document.documentElement.classList.remove("debug-vinyl-mode-active");
  }, [vinylMode, settings.debugMode]);

  // network info updates
  useEffect(() => {
    if (!settings.debugMode) return;
    const updateConn = () => {
      const conn = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
      if (conn) {
        setNetworkInfo({
          effectiveType: conn.effectiveType || "unknown",
          rtt: conn.rtt || 0,
          downlink: conn.downlink || 0,
          online: navigator.onLine,
        });
      } else {
        setNetworkInfo((prev) => ({ ...prev, online: navigator.onLine }));
      }
    };
    
    updateConn();
    window.addEventListener("online", updateConn);
    window.addEventListener("offline", updateConn);
    const conn = (navigator as any).connection;
    if (conn) conn.addEventListener("change", updateConn);

    return () => {
      window.removeEventListener("online", updateConn);
      window.removeEventListener("offline", updateConn);
      if (conn) conn.removeEventListener("change", updateConn);
    };
  }, [settings.debugMode]);

  // realtime fps monitor loop
  useEffect(() => {
    if (!settings.debugMode) return;
    let frameCount = 0;
    let lastTime = performance.now();
    let animFrame: number;

    const tick = (time: number) => {
      frameCount++;
      if (time - lastTime >= 1000) {
        setFps(Math.round((frameCount * 1000) / (time - lastTime)));
        frameCount = 0;
        lastTime = time;
      }
      animFrame = requestAnimationFrame(tick);
    };

    animFrame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animFrame);
  }, [settings.debugMode]);

  // bind console listeners
  useEffect(() => {
    if (!settings.debugMode) return;
    setLogs([...globalLogsHistory]);
    const listener = (newLogs: LogMessage[]) => setLogs(newLogs);
    globalLogListeners.add(listener);
    return () => {
      globalLogListeners.delete(listener);
    };
  }, [settings.debugMode]);

  useEffect(() => {
    if (!settings.debugMode) return;
    if (activeTab === "console" && consoleBottomRef.current) {
      consoleBottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [logs, activeTab, settings.debugMode]);

  // load storage list
  const refreshStorage = () => {
    const items: { key: string; value: string; type: "local" | "session" }[] = [];
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) items.push({ key, value: localStorage.getItem(key) || "", type: "local" });
      }
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key) items.push({ key, value: sessionStorage.getItem(key) || "", type: "session" });
      }
    } catch (e) {
      console.error("Storage read failed", e);
    }
    setStorageItems(items);
  };

  useEffect(() => {
    if (!settings.debugMode) return;
    if (activeTab === "storage") {
      refreshStorage();
    }
  }, [activeTab, settings.debugMode]);

  // element inspector mouse / click hooks
  useEffect(() => {
    if (!settings.debugMode) return;
    if (!inspectorActive) {
      setHoveredElement(null);
      return;
    }
    setEraserActive(false);

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target || target.closest(".virex-debug-console")) {
        setHoveredElement(null);
        return;
      }
      setHoveredElement({
        rect: target.getBoundingClientRect(),
        tagName: target.tagName.toLowerCase(),
        id: target.id,
        className: getElementClassName(target),
        element: target,
      });
    };

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target || target.closest(".virex-debug-console")) return;
      e.preventDefault();
      e.stopPropagation();
      setSelectedElement(target);
      setElementTextOverride(target.innerText || "");
      setActiveTab("inspector");
      setInspectorActive(false);
      setHoveredElement(null);
    };

    document.addEventListener("mouseover", handleMouseOver);
    document.addEventListener("click", handleClick, true);

    return () => {
      document.removeEventListener("mouseover", handleMouseOver);
      document.removeEventListener("click", handleClick, true);
    };
  }, [inspectorActive, settings.debugMode]);

  // element eraser click / hover hooks
  useEffect(() => {
    if (!settings.debugMode) return;
    if (!eraserActive) {
      setEraserHovered(null);
      return;
    }
    setInspectorActive(false);

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target || target.closest(".virex-debug-console")) {
        setEraserHovered(null);
        return;
      }
      setEraserHovered({
        rect: target.getBoundingClientRect(),
        element: target,
      });
    };

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target || target.closest(".virex-debug-console")) return;
      e.preventDefault();
      e.stopPropagation();
      addGlobalLog("warn", `[Eraser] removed element: <${target.tagName.toLowerCase()}> with class "${getElementClassName(target)}"`);
      target.remove();
      setEraserHovered(null);
    };

    document.addEventListener("mouseover", handleMouseOver);
    document.addEventListener("click", handleClick, true);

    return () => {
      document.removeEventListener("mouseover", handleMouseOver);
      document.removeEventListener("click", handleClick, true);
    };
  }, [eraserActive, settings.debugMode]);

  const deleteStorageItem = (key: string, type: "local" | "session") => {
    if (type === "local") {
      localStorage.removeItem(key);
      addGlobalLog("info", `[Storage] deleted localStorage key: "${key}"`);
    } else {
      sessionStorage.removeItem(key);
      addGlobalLog("info", `[Storage] deleted sessionStorage key: "${key}"`);
    }
    refreshStorage();
  };

  const clearAllStorage = () => {
    localStorage.clear();
    sessionStorage.clear();
    addGlobalLog("warn", "[Storage] cleared all localStorage and sessionStorage");
    refreshStorage();
  };

  // modify text on inspected element
  const applyTextModification = () => {
    if (selectedElement) {
      selectedElement.innerText = elementTextOverride;
      addGlobalLog("info", `[Inspector] modified text of <${selectedElement.tagName.toLowerCase()}>`);
    }
  };

  // flash selected element to identify said element
  const flashSelectedElement = () => {
    if (!selectedElement) return;
    selectedElement.scrollIntoView({ behavior: "smooth", block: "center" });
    const originalTransition = selectedElement.style.transition;
    const originalOutline = selectedElement.style.outline;
    
    selectedElement.style.transition = "outline 0.15s ease-in-out";
    selectedElement.style.outline = "6px solid var(--primary)";
    
    setTimeout(() => {
      selectedElement.style.outline = "2px solid transparent";
      setTimeout(() => {
        selectedElement.style.outline = "6px solid var(--primary)";
        setTimeout(() => {
          selectedElement.style.outline = originalOutline;
          selectedElement.style.transition = originalTransition;
        }, 300);
      }, 150);
    }, 300);
  };

  // clean log arrays based on search & levels
  const filteredLogs = logs.filter((log) => {
    const matchesSearch = log.message.toLowerCase().includes(searchTerm.toLowerCase());
    if (logFilter === "all") return matchesSearch;
    return log.level === logFilter && matchesSearch;
  });

  if (!settings.debugMode) return null;

  return (
    <>
      {/* floating element inspector overlays */}
      <AnimatePresence>
        {hoveredElement && (
          <div
            className="fixed border-2 border-[var(--primary)] bg-[var(--primary)]/10 pointer-events-none z-[99999] transition-all duration-75 flex flex-col justify-start rounded-2xl"
            style={{
              top: hoveredElement.rect.top,
              left: hoveredElement.rect.left,
              width: hoveredElement.rect.width,
              height: hoveredElement.rect.height,
            }}
          >
            <span className="absolute bottom-full left-0 bg-[var(--primary)] text-[var(--on-primary)] text-[9px] px-2 py-0.5 rounded-t-xl font-black tracking-[0.03em] uppercase whitespace-nowrap shadow-md flex items-center gap-1 border-t-2 border-r-2 border-l-2 border-[var(--primary)]">
              <MousePointer size={13} />
              {hoveredElement.tagName}
              {hoveredElement.id && `#${hoveredElement.id}`}
              {hoveredElement.className && `.${hoveredElement.className.trim().split(/\s+/)[0]}`}
              {` (${Math.round(hoveredElement.rect.width)}x${Math.round(hoveredElement.rect.height)})`}
            </span>
          </div>
        )}
        {eraserHovered && (
          <div
            className="fixed border-2 border-red-500 bg-red-500/10 pointer-events-none z-[99999] transition-all duration-75 flex flex-col justify-start rounded-2xl"
            style={{
              top: eraserHovered.rect.top,
              left: eraserHovered.rect.left,
              width: eraserHovered.rect.width,
              height: eraserHovered.rect.height,
            }}
          >
            <span className="absolute bottom-full left-0 bg-red-600 text-white text-[9px] px-2 py-0.5 rounded-t-xl font-black tracking-[0.05em] uppercase whitespace-nowrap shadow-md flex items-center gap-1 border-t-2 border-r-2 border-l-2 border-red-600">
              <Trash2 size={12} />
              IMPORTANT: Click to erase
            </span>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isCollapsed ? (
          // minimized pill glowing thing / m3 tonal chip style
          // @ts-nocheck
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsCollapsed(false)}
            className="fixed bottom-4 right-4 z-[9999] bg-[var(--surface-variant)] text-[var(--on-surface-variant)] border-6 border-[var(--outline-variant)] hover:border-[var(--primary)] shadow-2xl flex items-center gap-3 px-5 py-3 rounded-full text-[12px] cursor-pointer font-black tracking-wider select-none transition-all duration-150 backdrop-blur-md pointer-events-auto"
          
          >  
            <div className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full rounded-full bg-[var(--primary)] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[var(--primary)]"></span>
            </div>
            <span>Debug view</span>
            <span className="opacity-30">|</span>
            <span className={cn(fps < 45 ? "text-amber-500" : fps < 25 ? "text-red-500" : "text-[var(--primary)]")}>
              {fps} FPS
            </span>
          </motion.div>
        ) : (
          // m3 card dialog
          <motion.div
            drag
            dragControls={dragControls}
            dragListener={false}
            dragMomentum={false}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            style={{ width: "min(88vw, 320px)", maxHeight: "min(84vh, 420px)" }}
            className="virex-debug-console fixed bottom-4 right-4 z-[9999] bg-[var(--surface)]/95 text-[var(--on-surface)] font-sans text-[10px] p-3 sm:p-4 md:p-6 rounded-[2rem] border-6 border-[var(--outline-variant)] ring-6 ring-[var(--outline-variant)]/20 backdrop-blur-2xl shadow-2xl flex flex-col gap-2.5 sm:gap-3 md:gap-4 w-[min(88vw,320px)] sm:w-[min(92vw,340px)] md:w-[420px] max-h-[min(84vh,420px)] pointer-events-auto select-none overflow-hidden touch-none animate-gpu"
          >
            {/* clean draggable header handle */}
            <div
              onPointerDown={(e) => dragControls.start(e)}
              className="flex items-center justify-between border-b-2 border-[var(--outline-variant)] pb-3 opacity-75 cursor-grab active:cursor-grabbing"
            >
              <div className="flex items-center gap-2">
                <Terminal size={14} className="text-[var(--primary)]" />
                <span className="font-black text-[13px] tracking-[0.04em] text-[var(--on-surface)]">
                  virex debug tools
                </span>
                <span className="text-[9px] bg-[var(--primary-container)] text-[var(--on-primary-container)] px-2 py-0.5 rounded-full font-black font-mono">
                  {BUILD_VERSION.split("-")[0]}
                </span>
              </div>
              <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={() => setIsCollapsed(true)}
                  title="Collapse to badge"
                  className="w-7 h-7 rounded-full flex items-center justify-center bg-[var(--surface-variant)]/60 hover:bg-[var(--surface-variant)] text-[var(--on-surface-variant)] border-3 border-[var(--outline-variant)]/40 transition-all cursor-pointer shrink-0"
                >
                  <LucideMinus size={13} className="shrink-0" />
                </button>
                <button
                  onClick={() => updateSettings({ debugMode: false })}
                  title="Close and disable debug mode"
                  className="w-7 h-7 rounded-full flex items-center justify-center bg-red-500/10 hover:bg-red-500/10 text-red-500 border-3 border-red-500/20 transition-all cursor-pointer shrink-0"
                >
                  <LucideX size={13} className="shrink-0" />
                </button>
              </div>
            </div>

            {/* quick realtime status chips */}
            <div className="grid grid-cols-3 gap-2.5 text-center text-[9px] font-black tracking-wide uppercase">
              <div className="bg-[var(--surface-variant)] border-2 border-[var(--outline-variant)] rounded-2xl p-2 flex flex-col items-center gap-0.5">
                <span className="opacity-50">FPS</span>
                <span className={cn("text-[10px] font-black", fps < 45 ? "text-amber-500" : fps < 25 ? "text-red-500" : "text-[var(--primary)]")}>
                  {fps}
                </span>
              </div>
              <div className="bg-[var(--surface-variant)] border-2 border-[var(--outline-variant)] rounded-2xl p-2 flex flex-col items-center gap-0.5">
                <span className="opacity-50">LATENCY</span>
                <span className="text-[10px] font-black text-sky-500 flex items-center gap-0.5">
                  <Wifi size={8} />
                  {networkInfo.online ? `${networkInfo.rtt}ms` : "OFFLINE"}
                </span>
              </div>
              <div className="bg-[var(--surface-variant)] border-2 border-[var(--outline-variant)] rounded-2xl p-2 flex flex-col items-center gap-0.5">
                <span className="opacity-50">VIEWPORT</span>
                <span className="text-[10px] font-black text-purple-500">
                  {viewport.w}x{viewport.h}
                </span>
              </div>
            </div>

            {/* tab nav */}
            <div className="bg-[var(--surface-variant)] p-1 rounded-2xl flex gap-1 border-2 border-[var(--outline-variant)] text-[9px]s font-black tracking-wider uppercase">
              <button
                onClick={() => setActiveTab("metrics")}
                className={cn(
                  "flex-1 py-1.5 rounded-xl text-center transition-all cursor-pointer",
                  activeTab === "metrics"
                    ? "bg-[var(--primary)] text-[var(--on-primary)] shadow-md"
                    : "text-[var(--on-surface-variant)] hover:bg-black/5 dark:hover:bg-white/5 opacity-70 hover:opacity-100"
                )}
              >
                Stats
              </button>
              <button
                onClick={() => setActiveTab("toggles")}
                className={cn(
                  "flex-1 py-1.5 rounded-xl text-center transition-all cursor-pointer",
                  activeTab === "toggles"
                    ? "bg-[var(--primary)] text-[var(--on-primary)] shadow-md"
                    : "text-[var(--on-surface-variant)] hover:bg-black/5 dark:hover:bg-white/5 opacity-70 hover:opacity-100"
                )}
              >
                Tools
              </button>
              <button
                onClick={() => setActiveTab("console")}
                className={cn(
                  "flex-1 py-1.5 rounded-xl text-center transition-all cursor-pointer relative",
                  activeTab === "console"
                    ? "bg-[var(--primary)] text-[var(--on-primary)] shadow-md"
                    : "text-[var(--on-surface-variant)] hover:bg-black/5 dark:hover:bg-white/5 opacity-70 hover:opacity-100"
                )}
              >
                Logs
                {logs.filter(l => l.level === "error").length > 0 && (
                  <span className="absolute top-1 right-2.5 w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                )}
              </button>
              <button
                onClick={() => setActiveTab("storage")}
                className={cn(
                  "flex-1 py-1.5 rounded-xl text-center transition-all cursor-pointer",
                  activeTab === "storage"
                    ? "bg-[var(--primary)] text-[var(--on-primary)] shadow-md"
                    : "text-[var(--on-surface-variant)] hover:bg-black/5 dark:hover:bg-white/5 opacity-70 hover:opacity-100"
                )}
              >
                Store
              </button>
              <button
                onClick={() => setActiveTab("inspector")}
                className={cn(
                  "flex-1 py-1.5 rounded-xl text-center transition-all cursor-pointer",
                  activeTab === "inspector"
                    ? "bg-[var(--primary)] text-[var(--on-primary)] shadow-md"
                    : "text-[var(--on-surface-variant)] hover:bg-black/5 dark:hover:bg-white/5 opacity-70 hover:opacity-100"
                )}
              >
                Inspect
              </button>
            </div>

            {/* contentes viewport */}
            <div className="flex-1 overflow-y-auto max-h-[260px] custom-scrollbar pr-3 space-y-3 font-sans">
              {activeTab === "metrics" && (
                <div className="space-y-1.5 text-[10px]">
                  <div className="flex justify-between border-b border-[var(--outline-variant)]/30 py-1.5">
                    <span className="opacity-60 font-semibold font-display">Route path</span>
                    <span className="text-[var(--primary)] font-mono font-bold">
                      /{page}
                      {blogPostId ? `:${blogPostId}` : ""}
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-[var(--outline-variant)]/30 py-1.5">
                    <span className="opacity-60 font-semibold font-display">Theme mode</span>
                    <span className="font-bold font-expressive text-[11px]">
                      {settings.mode} ({actualTheme})
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-[var(--outline-variant)]/30 py-1.5">
                    <span className="opacity-60 font-semibold font-display">Accent Hue</span>
                    <span className="font-bold flex items-center gap-1.5">
                      <span
                        className="w-2.5 h-2.5 rounded-full inline-block border border-[var(--outline-variant)]"
                        style={{ backgroundColor: `oklch(0.6 0.15 var(--primary-hue))` }}
                      />
                      <span className="font-bold font-expressive text-[11px]">{settings.accent}</span>
                      <span className="opacity-40 font-bold font-expressive text-[10px]">({settings.hue}°, {settings.saturation}%)</span>
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-[var(--outline-variant)]/30 py-1.5">
                    <span className="opacity-60 font-semibold font-display">Device pixel ratio</span>
                    <span className="font-mono font-bold">
                      @{window.devicePixelRatio.toFixed(1)}x
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-[var(--outline-variant)]/30 py-1.5">
                    <span className="opacity-60 font-semibold font-display">Connection</span>
                    <span className="font-bold font-expressive text-[11px]">
                      {networkInfo.effectiveType} ({networkInfo.downlink} Mbps)
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-[var(--outline-variant)]/30 py-1.5">
                    <span className="opacity-60 font-semibold font-display">Reduced Motion</span>
                    <span className="font-bold font-expressive text-[11px]">
                      {window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "ON" : "OFF"}
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-[var(--outline-variant)]/30 py-1.5">
                    <span className="opacity-60 font-semibold font-display">Animations System</span>
                    <span className="font-bold font-expressive text-[11px]">
                      {settings.disableAnimations ? "DISABLED" : "ENABLED"}
                    </span>
                  </div>

                  <div className="mt-3 text-[9px] opacity-40 text-center font-mono leading-relaxed select-text border-t border-[var(--outline-variant)]/20 pt-2 space-y-1">
                    <div>{BUILD_VERSION}</div>
                    <div>{navigator.userAgent}</div>
                  </div>
                </div>
              )}

              {/* control panel toggles */}
              {activeTab === "toggles" && (
                <div className="space-y-3 text-[10px]">
                  <div className="flex items-center justify-between bg-[var(--surface-variant)] border-2 border-[var(--outline-variant)] rounded-3xl p-3">
                    <div className="flex flex-col gap-0.5">
                      <span className="font-bold font-expressive text-[11px] tracking-wide text-[var(--on-surface-variant)]">Layout Grid</span>
                      <span className="text-[9px] opacity-60">Overlay a 20px dynamic grid</span>
                    </div>
                    <Switch checked={showGrid} onChange={setShowGrid} icons="none" />
                  </div>

                  <div className="flex items-center justify-between bg-[var(--surface-variant)] border-2 border-[var(--outline-variant)] rounded-3xl p-3">
                    <div className="flex flex-col gap-0.5">
                      <span className="font-bold font-expressive text-[11px] tracking-wide text-[var(--on-surface-variant)]">Element Outlines</span>
                      <span className="text-[9px] opacity-60">Draw layout borders around elements</span>
                    </div>
                    <Switch checked={showOutlines} onChange={setShowOutlines} icons="none" />
                  </div>

                  <div className="flex items-center justify-between bg-[var(--surface-variant)] border-2 border-[var(--outline-variant)] rounded-3xl p-3">
                    <div className="flex flex-col gap-0.5">
                      <span className="font-bold font-expressive text-[11px] tracking-wide text-[var(--on-surface-variant)]">Slow Animations</span>
                      <span className="text-[9px] opacity-60">Slow down transitions to 0.2x speed</span>
                    </div>
                    <Switch checked={slowAnimations} onChange={setSlowAnimations} icons="none" />
                  </div>

                  <div className="flex items-center justify-between bg-[var(--surface-variant)] border-2 border-[var(--outline-variant)] rounded-3xl p-3">
                    <div className="flex flex-col gap-0.5">
                      <span className="font-bold font-expressive text-[11px] tracking-wide text-[var(--on-surface-variant)]">Vinyl Mode</span>
                      <span className="text-[9px] opacity-60">Makes cards spin when hovered, where that gif came from</span>
                    </div>
                    <Switch checked={vinylMode} onChange={setvinylMode} icons="none" />
                  </div>

                  <div className="grid grid-cols-2 gap-2.5 pt-1">
                    <button
                      onClick={cycleTheme}
                      className="m3-button-tonal py-4 px-3 text-[12px] font-expressive tracking-widest !rounded-2xl cursor-pointer"
                    >
                      <Palette size={10} />
                      Cycle Theme
                    </button>

                    <button
                      onClick={() => {
                        updateSettings({ disableAnimations: !settings.disableAnimations });
                      }}
                      className="m3-button-tonal py-4 px-3 text-[12px] font-expressive tracking-widest !rounded-2xl cursor-pointer"
                    >
                      <Zap size={10} />
                      {settings.disableAnimations ? "Enable Anim" : "Disable Anim"}
                    </button>
                  </div>
                </div>
              )}

              {/* console logs */}
              {activeTab === "console" && (
                <div className="flex flex-col gap-2 h-full">
                  {/* header search and filters */}
                  <div className="flex items-center gap-1.5 bg-[var(--surface-variant)] border-2 border-[var(--outline-variant)] rounded-2xl px-3 py-1">
                    <Search size={10} className="opacity-40" />
                    <input
                      type="text"
                      placeholder="Search logs here..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="flex-1 bg-transparent border-none outline-none text-[11px] text-[var(--on-surface)] placeholder-[var(--on-surface-variant)]/40 font-black"
                    />
                    {searchTerm && (
                      <button onClick={() => setSearchTerm("")} className="cursor-pointer">
                        <X size={10} className="text-[var(--on-surface-variant)]/60 hover:text-[var(--on-surface)]" />
                      </button>
                    )}
                  </div>
                  <div className="flex items-center justify-between text-[10px] opacity-70 font-display font-black uppercase tracking-wider text-[var(--on-surface-variant)] px-1">
                    <div className="flex gap-2.5">
                      <button
                        onClick={() => setLogFilter("all")}
                        className={cn("cursor-pointer", logFilter === "all" && "text-[var(--primary)] font-black")}
                      >
                        All
                      </button>
                      <button
                        onClick={() => setLogFilter("info")}
                        className={cn("cursor-pointer", logFilter === "info" && "text-emerald-500 font-black")}
                      >
                        Logs
                      </button>
                      <button
                        onClick={() => setLogFilter("warn")}
                        className={cn("cursor-pointer", logFilter === "warn" && "text-amber-500 font-black")}
                      >
                        Warns
                      </button>
                      <button
                        onClick={() => setLogFilter("error")}
                        className={cn("cursor-pointer", logFilter === "error" && "text-red-500 font-black")}
                      >
                        Errors
                      </button>
                    </div>
                    <button
                      onClick={() => {
                        globalLogsHistory = [];
                        setLogs([]);
                      }}
                      className="hover:text-red-500 flex items-center gap-0.5 cursor-pointer font-black"
                    >
                      <Trash2 size={8} /> Clear
                    </button>
                  </div>

                  {/* log list box */}
                  <div className="bg-black/95 text-emerald-400 border-2 border-[var(--outline-variant)] rounded-3xl p-4.5 h-[150px] overflow-y-auto custom-scrollbar font-mono text-[11px] leading-relaxed space-y-2">
                    {filteredLogs.length === 0 ? (
                      <div className="text-zinc-500 text-center py-8 italic font-black font-sans">No console logs captured</div>
                    ) : (
                      filteredLogs.map((log) => (
                        <div
                          key={log.id}
                          className={cn(
                            "flex items-start gap-2 border-b border-white/5 pb-1",
                            log.level === "warn"
                              ? "text-amber-300"
                              : log.level === "error"
                              ? "text-red-400 font-semibold"
                              : "text-zinc-300"
                          )}
                        >
                          <span className="opacity-30 select-none font-black text-[10px]">{log.timestamp} </span>
                          <span
                            className={cn(
                              "text-[9px] px-1.5 py-1 mt-0.2 rounded font-display font-black uppercase text-black leading-none",
                              log.level === "warn"
                                ? "bg-amber-400"
                                : log.level === "error"
                                ? "bg-red-400"
                                : "bg-emerald-400 text-black font-black"
                            )}
                          >
                            {log.level === "info" ? "log" : log.level}
                          </span>
                          <span className="flex-1 break-all select-text font-mono">{log.message}</span>
                        </div>
                      ))
                    )}
                    <div ref={consoleBottomRef} />
                  </div>
                </div>
              )}

              {/* storage explorer */}
              {activeTab === "storage" && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[9px] border-b border-[var(--outline-variant)]/30 pb-1.5 px-0.5">
                    <span className="text-[var(--on-surface-variant)] tracking-[0.03em] text-[10px] font-black">Keys ({storageItems.length})</span>
                    <button
                      onClick={clearAllStorage}
                      className="text-red-500 hover:text-red-400 flex items-center gap-0.5 font-display tracking-[0.03em] font-black tracking-wider text-[10px] cursor-pointer"
                    >
                      <Trash2 size={10} /> Clear Storage
                    </button>
                  </div>
                  <div className="space-y-2.5 max-h-[220px] overflow-y-auto custom-scrollbar">
                    {storageItems.length === 0 ? (
                      <div className="text-zinc-500 text-center py-6 italic text-[12px] font-black">Storage is empty..</div>
                    ) : (
                      storageItems.map((item) => (
                        <div
                          key={`${item.type}-${item.key}`}
                          className="bg-[var(--surface-variant)] border-2 border-[var(--outline-variant)] rounded-3xl p-3.5 flex flex-col gap-1.5 hover:border-[var(--primary)] transition-all animate-gpu"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[var(--on-surface-variant)] font-display font-black text-[10px] truncate max-w-[200px]">
                              {item.key}
                            </span>
                            <div className="flex items-center gap-2">
                              <span
                                className={cn(
                                  "text-[9px] font-display font-black px-2 rounded-full border border-transparent",
                                  item.type === "local" ? "bg-blue-500/10 text-blue-500 border-blue-500/20" : "bg-purple-500/10 text-purple-500 border-purple-500/20"
                                )}
                              >
                                {item.type}
                              </span>
                              <button
                                onClick={() => deleteStorageItem(item.key, item.type)}
                                className="text-[var(--on-surface-variant)] hover:text-red-500 transition-colors cursor-pointer"
                              >
                                <Trash2 size={11} />
                              </button>
                            </div>
                          </div>
                          <span className="text-[9px] text-[var(--on-surface-variant)] break-all select-text font-mono bg-black/5 dark:bg-black/20 p-2 rounded-2xl max-h-[50px] overflow-y-auto border border-[var(--outline-variant)]/20">
                            {item.value}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* dom inspector */}
              {activeTab === "inspector" && (
                <div className="space-y-3">
                  <div className="flex flex-col gap-2.5 bg-[var(--surface-variant)] border-2 border-[var(--outline-variant)] rounded-3xl p-3.5">
                    <span className="font-black text-[11px] tracking-[0.03em] opacity-50">Active Dom Inspector Options</span>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => {
                          setInspectorActive(!inspectorActive);
                          setEraserActive(false);
                        }}
                        className={cn(
                          "py-2.5 px-3 rounded-2xl border-2 flex items-center justify-center gap-1.5 font-black transition-all text-[11px] tracking-[0.05em] opacity-80 cursor-pointer",
                          inspectorActive
                            ? "bg-[var(--primary)] text-[var(--on-primary)] border-[var(--primary)] shadow-md"
                            : "bg-[var(--surface)] border-[var(--outline-variant)] text-[var(--on-surface-variant)] hover:bg-white/5 dark:hover:bg-white/5"
                        )}
                      >
                        <MousePointer size={13} />
                        {inspectorActive ? "Hovering..." : "Inspector"}
                      </button>

                      <button
                        onClick={() => {
                          setEraserActive(!eraserActive);
                          setInspectorActive(false);
                        }}
                        className={cn(
                          "py-2.5 px-3 rounded-2xl border-2 flex items-center justify-center gap-1.5 font-black transition-all text-[11px] tracking-[0.03em] opacity-80 cursor-pointer",
                          eraserActive
                            ? "bg-red-600 text-white border-red-600 shadow-md animate-pulse"
                            : "bg-[var(--surface)] border-[var(--outline-variant)] text-[var(--on-surface-variant)] hover:bg-white/5 dark:hover:bg-white/5"
                        )}
                      >
                        <Trash2 size={13} />
                        {eraserActive ? "Eraser Active" : "Eraser"}
                      </button>
                    </div>
                  </div>

                  {/* selected element deets */}
                  {selectedElement ? (
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between border-b border-[var(--outline-variant)]/30 pb-1.5 px-0.5">
                        <span className="text-[var(--on-surface-variant)] font-display font-black uppercase opacity-80 text-[10px]">Selected Element</span>
                        <div className="flex gap-2">
                          <button
                            onClick={flashSelectedElement}
                            className="text-[var(--primary)] hover:underline text-[10px] font-black cursor-pointer"
                          >
                            Flash
                          </button>
                          <button
                            onClick={() => {
                              selectedElement.scrollIntoView({ behavior: "smooth", block: "center" });
                            }}
                            className="text-[var(--on-surface-variant)]/60 hover:text-[var(--on-surface)] hover:underline text-[10px] font-black cursor-pointer"
                          >
                            Scroll to
                          </button>
                        </div>
                      </div>

                      <div className="bg-[var(--surface-variant)] rounded-3xl p-3.5 space-y-2.5 border-2 border-[var(--outline-variant)]">
                        <div className="text-[11x] text-emerald-500 font-mono font-bold flex items-center gap-1.5">
                          <CornerDownRight size={13} />
                          &lt;{selectedElement.tagName.toLowerCase()}&gt;
                        </div>
                        {getElementClassName(selectedElement) && (
                          <div className="text-[10px] text-[var(--on-surface-variant)] leading-relaxed break-all bg-black/5 dark:bg-black/20 p-2.5 rounded-2xl border border-[var(--outline-variant)]/20 select-text font-expressive">
                            <span className="opacity-40 font-black block mb-0.5 text-[9px] tracking-wide">Classes:</span>
                            {getElementClassName(selectedElement)}
                          </div>
                        )}
                        <div className="text-[10px] text-[var(--on-surface-variant)] leading-relaxed break-all bg-black/5 dark:bg-black/20 p-2.5 rounded-2xl border border-[var(--outline-variant)]/20 select-text font-expressive">
                          <span className="opacity-40 font-black block mb-0.5 text-[9px] tracking-wide">Dimensions:</span>
                          Width: {selectedElement.offsetWidth}px | Height: {selectedElement.offsetHeight}px
                        </div>

                        {/* edit innerText of element */}
                        <div className="pt-2 border-t border-[var(--outline-variant)]/30 space-y-1.5">
                          <span className="opacity-40 font-black block text-[10px] tracking-wide">Modify Text content:</span>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={elementTextOverride}
                              onChange={(e) => setElementTextOverride(e.target.value)}
                              className="flex-1 bg-[var(--surface)] border-2 py-1 border-[var(--outline-variant)] rounded-xl px-2.5 py-1 text-[10px] text-[var(--on-surface-variant)] outline-none focus:border-[var(--primary)] font-expressive"
                            />
                            <button
                              onClick={applyTextModification}
                              className="m3-button-filled !py-1.5 !px-3 font-black text-[10px] tracking-widest !rounded-xl cursor-pointer"
                            >
                              Apply
                            </button>
                          </div>
                        </div>

                        <div className="pt-1.5">
                          <button
                            onClick={() => {
                              selectedElement.remove();
                              setSelectedElement(null);
                              addGlobalLog("warn", "[Inspector] Deleted selected element");
                            }}
                            className="w-full py-2 bg-red-900/10 border-2 border-red-500/20 hover:bg-red-900/30 text-red-500 font-black text-[10px] uppercase tracking-widest rounded-2xl transition-all flex items-center justify-center gap-2 cursor-pointer"
                          >
                            <Trash2 size={13} /> Delete from DOM
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-zinc-500 text-center py-8 italic flex flex-col items-center gap-2">
                      <HelpCircle size={20} className="opacity-55" />
                      <span className="text-[11px] uppercase tracking-wide font-black">Use Inspector to inspect elements</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
