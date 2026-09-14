// @ts-ignore
// @ts-nocheck
import React, { memo } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from "motion/react";
import {
  Settings as SettingsIcon,
  X,
  Palette,
  Sun,
  Moon,
  Monitor,
  Pipette,
  Check,
  Layers,
  Cpu,
  Fingerprint,
  ExternalLink,
  Download,
  Terminal,
  ChevronRight,
  ChevronLeft,
  Bug,
  Activity,
  Link as LinkIcon,
  Compass,
} from "./MaterialIcon";
import { cn } from "../constants";
import Switch from "./M3Switch";
import Slider from "./M3Slider";
import { haptic } from "../haptics";

const FOCUSABLE_SELECTORS = [
  'a[href]',
  'area[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  'iframe',
  'object',
  'embed',
  '[contenteditable]',
  '[tabindex]:not([tabindex="-1"])',
].join(", ");

const getFocusableElements = (container: HTMLElement | null): HTMLElement[] => {
  if (!container) {
    return [];
  }

  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTORS)).filter(
    (element) => {
      return (
        element.tabIndex !== -1 &&
        !element.hasAttribute("disabled") &&
        element.getAttribute("aria-hidden") !== "true" &&
        element.offsetParent !== null
      );
    }
  );
};

export const SettingsDialog = memo(({ 
  settingsOpen, 
  setSettingsOpen, 
  settings, 
  updateSettings, 
  setShowDebugConfirm, 
  setShowRefreshConfirm,
  setToast, 
  goto,
  is_mobile,
  viewport,
  onReportBug,
  onOpenKnownIssuess,
}: any) => {
  const settingsSpring = {
    type: "spring" as const,
    stiffness: 400,
    damping: 30,
    mass: 0.8
  };

  // 5% from top
  const defaultY = is_mobile && viewport ? viewport.h * 0.05 : 0;
  const y = useMotionValue(is_mobile && viewport ? viewport.h : 0);
  const modalHeight = useTransform(y, (latestY) => (viewport ? viewport.h : window.innerHeight) - latestY);
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const modalRef = React.useRef<HTMLDivElement>(null);
  const previouslyFocusedElementRef = React.useRef<HTMLElement | null>(null);
  const dragStartY = React.useRef(0);
  const dragStartModalY = React.useRef(0);
  const isDraggingSheet = React.useRef(false);
  const touchTimes = React.useRef<{ y: number; t: number }[]>([]);
  const prevSettingsOpen = React.useRef(settingsOpen);
  if (settingsOpen && !prevSettingsOpen.current) {
    if (is_mobile && viewport) {
      y.set(viewport.h);
    }
    prevSettingsOpen.current = true;
  } else if (!settingsOpen && prevSettingsOpen.current) {
    prevSettingsOpen.current = false;
  }

  const handleClose = React.useCallback(() => {
    setSettingsOpen(false);
  }, [setSettingsOpen]);

  const handleDialogKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.key === "Escape") {
        event.preventDefault();
        handleClose();
        return;
      }

      if (event.key !== "Tab") {
        return;
      }

      const modal = modalRef.current;
      if (!modal) {
        return;
      }

      const focusable = getFocusableElements(modal);
      if (focusable.length === 0) {
        event.preventDefault();
        return;
      }

      const firstElement = focusable[0];
      const lastElement = focusable[focusable.length - 1];
      const activeElement = document.activeElement as HTMLElement | null;

      if (event.shiftKey) {
        if (!activeElement || activeElement === firstElement || activeElement === modal) {
          event.preventDefault();
          lastElement.focus();
        }
      } else {
        if (!activeElement || activeElement === lastElement || activeElement === modal) {
          event.preventDefault();
          firstElement.focus();
        }
      }
    },
    [handleClose]
  );

  React.useEffect(() => {
    if (settingsOpen) {
      previouslyFocusedElementRef.current =
        document.activeElement instanceof HTMLElement ? document.activeElement : null;

      window.requestAnimationFrame(() => {
        const focusable = getFocusableElements(modalRef.current);
        if (focusable.length) {
          focusable[0].focus();
        } else {
          modalRef.current?.focus();
        }
      });
    } else {
      previouslyFocusedElementRef.current?.focus?.();
    }
  }, [settingsOpen]);

  const [activePage, setActivePage] = React.useState<string>(() => 
    is_mobile ? "menu" : "appearance"
  );

  // track prev page for direction
  const prevPageRef = React.useRef(activePage);
  const [direction, setDirection] = React.useState(0);

  const navigateTo = React.useCallback((pageId: string) => {
    const pages = ["menu", "appearance", "customization", "layout", "commandPalette", "backup", "debug", "about"];
    const from = pages.indexOf(prevPageRef.current);
    const to = pages.indexOf(pageId);
    setDirection(to > from ? 1 : -1);
    prevPageRef.current = pageId;
    setActivePage(pageId);
  }, []);

  React.useEffect(() => {
    if (!is_mobile && activePage === "menu") {
      navigateTo("appearance");
    }
  }, [is_mobile, activePage, navigateTo]);

  React.useEffect(() => {
    if (settingsOpen) {
      const target = is_mobile ? "menu" : "appearance";
      prevPageRef.current = target;
      setActivePage(target);
      setDirection(0);
    }
  }, [settingsOpen, is_mobile]);

  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [activePage]);

  const MAIN_PAGES = [
    { id: "appearance", title: "Appearance", desc: "Theme mode, softer dark colors, palettes", icon: Palette },
    { id: "customization", title: "Customization", desc: "Interface toggles, animations, brutalist", icon: SettingsIcon },
    { id: "layout", title: "Nav & Layout", desc: "Sidebar flipped, float profile, navigation", icon: Layers },
    { id: "commandPalette", title: "Command Palette", desc: "Palette activation, search scope, and results", icon: Monitor },
    { id: "backup", title: "Backup & Share", desc: "Export, import, share configs", icon: Fingerprint },
  ] as const;

  const visibleMainPages = is_mobile
    ? MAIN_PAGES.filter((page) => page.id !== "commandPalette")
    : MAIN_PAGES;

  const BOTTOM_PAGES = [
    { id: "debug", title: "Info & Debug", desc: "DOM tools, inspection, console tools, etc", icon: Cpu },
    { id: "about", title: "Bugs & Issues", desc: "Changelog, report bugs, known issues", icon: Terminal },
  ] as const;

  const PAGES = [...MAIN_PAGES, ...BOTTOM_PAGES] as const;

  const currentPageTitle = PAGES.find(p => p.id === activePage)?.title || "Settings";

  const pageVariants = {
    initial: (dir: number) => ({
      x: dir > 0 ? 32 : -32,
      opacity: 0,
    }),
    animate: {
      x: 0,
      opacity: 1,
      transition: { type: "spring" as const, stiffness: 380, damping: 32, mass: 0.7 },
    },
    exit: (dir: number) => ({
      x: dir > 0 ? -24 : 24,
      opacity: 0,
      transition: { duration: 0.15, ease: "easeIn" },
    }),
  };

  const renderPageContent = () => {
    switch (activePage) {
      case "appearance":
        return (
          <section className="space-y-6">
            <div className="flex items-center gap-3 mb-7">
              <Palette size={20} className="text-[var(--primary)]" />
              <h3 className="text-[17px] font-black tracking-[0.1em] text-[var(--on-surface-variant)]">
                Theme settings
              </h3>
            </div>
            <div className="grid grid-cols-3 gap-2 w-full">
              {(["light", "dark", "system"] as const).map((m) => {
                const isActive = settings.mode === m;
                let roundedClass = "";
                if (m === "light") {
                  roundedClass = "rounded-l-[2rem] rounded-r-[1rem]";
                } else if (m === "dark") {
                  roundedClass = "rounded-[1rem]";
                } else {
                  roundedClass = "rounded-r-[2rem] rounded-l-[1rem]";
                }
                
                return (
                  <motion.button
                    key={m}
                    onClick={() => {
                      haptic.light();
                      updateSettings({ mode: m });
                    }}
                    whileTap={{ scale: 0.94 }}
                    animate={{
                      scale: isActive ? 1.04 : 1,
                      color: isActive ? "var(--on-primary)" : "var(--on-surface-variant)"
                    }}
                    transition={{
                      type: "spring",
                      stiffness: 300,
                      damping: 20
                    }}
                    className={cn(
                      "relative overflow-hidden flex items-center justify-center gap-2.5 py-4 transition-colors capitalize text-sm font-black tracking-wide cursor-pointer select-none",
                      roundedClass,
                      !isActive && "bg-[var(--surface-variant)] hover:bg-[var(--on-primary-container)]/20"
                    )}
                    style={{
                      willChange: "transform, border-color"
                    }}
                  >
                    <motion.div
                      initial={false}
                      animate={{
                        opacity: isActive ? 1 : 0,
                        scale: isActive ? 1 : 0.85
                      }}
                      transition={{
                        type: "spring",
                        stiffness: 350,
                        damping: 22
                      }}
                      className={cn(
                        "absolute -inset-[3px] bg-[var(--primary)] -z-10",
                        roundedClass
                      )}
                    />
                    <div className="relative z-10 flex items-center justify-center gap-2">
                      {m === "light" && <Sun size={18} />}
                      {m === "dark" && <Moon size={18} />}
                      {m === "system" && <Monitor size={18} />}
                      <span className="font-bold">{m}</span>
                    </div>
                  </motion.button>
                );
              })}
            </div>                
            <motion.div
              initial={false}
              animate={{
                opacity: (settings.mode === "dark" || settings.mode === "system") ? 1 : 0,
                height: (settings.mode === "dark" || settings.mode === "system") ? "auto" : 0,
                marginBottom: (settings.mode === "dark" || settings.mode === "system") ? 20 : 0,
              }}
              transition={settingsSpring}
              className="overflow-hidden"
            >
              <label
                className={cn(
                  "flex items-center justify-between p-4.5 rounded-2xl transition-all text-left cursor-pointer border-0",
                  settings.amoledMode
                    ? "bg-[var(--primary-container)] text-[var(--on-primary-container)]"
                    : "bg-[var(--surface-variant)] hover:bg-[var(--on-primary-container)]/10 text-[var(--on-surface)]",
                )}
              >
                <div>
                  <div className="font-bold text-[15px]">AMOLED Mode</div>
                  <div className="text-xs opacity-60 font-medium">
                    Total black backgrounds for OLED screens
                  </div>
                </div>
                <Switch
                  checked={settings.amoledMode}
                  onChange={(checked) =>
                    updateSettings({ amoledMode: checked })
                  }
                />
              </label>
            </motion.div>
            
            <div className="space-y-4">
              <div className="text-sm font-bold opacity-70 text-[var(--on-surface)]">
                Theme Presets
              </div>
              <div className="flex flex-wrap gap-3">
                {(
                  [
                    "orange",
                    "blue",
                    "green",
                    "red",
                    "purple",
                    "custom",
                  ] as const
                ).map((c) => (
                  <button
                    key={c}
                    onClick={() => {
                      haptic.light();
                      updateSettings({ accent: c });
                    }}
                    className={cn(
                      "group relative w-12 h-12 rounded-2xl overflow-hidden transition-all duration-200 border-0 shadow-none cursor-pointer",
                      settings.accent === c
                        ? "ring-2 ring-[var(--primary)] ring-offset-2 ring-offset-[var(--surface)] scale-105"
                        : "hover:scale-105 opacity-90 hover:opacity-100",
                    )}
                  >
                    {c === "custom" ? (
                      <div className="absolute inset-0 bg-[var(--surface-variant)] flex items-center justify-center">
                        <Pipette
                          size={20}
                          className="text-[var(--on-surface-variant)]"
                        />
                      </div>
                    ) : (
                      <div className="absolute inset-0 flex">
                        <div
                          className={cn(
                            "w-1/2 h-full",
                            c === "orange" && "bg-orange-500",
                            c === "blue" && "bg-blue-500",
                            c === "green" && "bg-emerald-500",
                            c === "red" && "bg-rose-500",
                            c === "purple" && "bg-purple-500",
                          )}
                        />
                        <div className="w-1/2 h-full flex flex-col">
                          <div
                            className={cn(
                              "h-1/2 w-full",
                              c === "orange" && "bg-orange-300",
                              c === "blue" && "bg-blue-300",
                              c === "green" && "bg-emerald-300",
                              c === "red" && "bg-rose-300",
                              c === "purple" && "bg-purple-300",
                            )}
                          />
                          <div
                            className={cn(
                              "h-1/2 w-full",
                              c === "orange" && "bg-orange-700",
                              c === "blue" && "bg-blue-700",
                              c === "green" && "bg-emerald-700",
                              c === "red" && "bg-rose-700",
                              c === "purple" && "bg-purple-700",
                            )}
                          />
                        </div>
                      </div>
                    )}
                    {settings.accent === c && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/15">
                        <div className="bg-white rounded-full p-0.5 shadow-sm w-5 h-5 flex items-center justify-center leading-none">
                          <Check
                            size={13}
                            className="text-black"
                            strokeWidth={3}
                          />
                        </div>
                      </div>
                    )}
                  </button>
                ))}
              </div>
              <div className="pt-3 space-y-3">
                <div className="flex items-baseline justify-between gap-3">
                  <div className="text-sm font-bold opacity-70 text-[var(--on-surface)] mb-1">
                    Color palette
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    ["tonal-spot", "Tonal spot", "linear-gradient(135deg, #7759d9 0 40%, #d8d1f4 40% 65%, #e7e0ed 65%)"],
                    ["fidelity", "Fidelity", "linear-gradient(135deg, #d03c74 0 38%, #ed9567 38% 65%, #552544 65%)"],
                    ["content", "Content", "linear-gradient(135deg, #076f9d 0 38%, #2e9b83 38% 65%, #193b52 65%)"],
                    ["neutral", "Neutral", "linear-gradient(135deg, #777476 0 42%, #b0aaad 42% 67%, #e6e0e2 67%)"],
                    ["expressive", "Expressive", "linear-gradient(135deg, #7651d4 0 35%, #d4519a 35% 64%, #ec8f57 64%)"],
                    ["fruit-salad", "Fruit salad", "linear-gradient(135deg, #47a16a 0 34%, #57a7c6 34% 63%, #b868bd 63%)"],
                  ].map(([id, label, preview]) => {
                    const selected = settings.palette === id;
                    return (
                      <button
                        key={id}
                        onClick={() => {
                          haptic.light();
                          updateSettings({ palette: id });
                        }}
                        className={cn(
                          "relative min-h-16 overflow-hidden rounded-2xl border-0 px-4 py-3 text-left transition-all cursor-pointer",
                          selected
                            ? "ring-2 ring-[var(--primary)] ring-offset-1 ring-offset-[var(--surface)] scale-[1.02] shadow-sm"
                            : "opacity-90 hover:opacity-100 hover:scale-[1.01]",
                        )}
                        style={{ background: preview }}
                        aria-pressed={selected}
                      >
                        <span className="absolute inset-0 bg-black/25" />
                        <span className="relative flex items-center justify-between gap-2 text-sm font-black text-white drop-shadow-sm">
                          {label}
                          {selected && <Check size={16} strokeWidth={3} />}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
              {settings.accent === "custom" && (
                <motion.div
                  initial={false}
                  animate={{
                    opacity: 1,
                    height: "auto",
                  }}
                  exit={{
                    opacity: 0,
                    height: 0,
                  }}
                  className="pt-2 space-y-3"
                >
                  <div className="flex justify-between items-center text-[12px] font-black tracking-[0.1em] opacity-50 px-1">
                    <span>Hue slider</span>
                  </div>
                  <Slider
                    value={settings.hue}
                    onChange={(v: number) => updateSettings({ hue: v })}
                    min={0}
                    max={360}
                    step={1}
                    size="s"
                    leadingIcon={<Pipette size={16} />}
                    format={(v: number) => `${v.toFixed(0)}°`}
                  />

                  <div className="flex justify-between items-center text-[12px] font-black tracking-[0.1em] opacity-50 px-1 pt-2">
                    <span>Saturation slider</span>
                  </div>
                  <Slider
                    value={settings.saturation}
                    onChange={(v: number) => updateSettings({ saturation: v })}
                    min={0}
                    max={100}
                    step={1}
                    size="s"
                    leadingIcon={<Layers size={16} />}
                    format={(v: number) => `${v.toFixed(0)}%`}
                  />
                </motion.div>
              )}
            </div>
          </section>
        );

      case "customization":
        return (
          <section className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <SettingsIcon size={20} className="text-[var(--primary)]" />
              <h3 className="text-[17px] font-black tracking-[0.1em] text-[var(--on-surface-variant)]">
                Customization settings
              </h3>
            </div>
            <div className="flex flex-col gap-2">
              {[
                {
                  key: "metricUnits",
                  label: "Metric Units",
                  desc: "Use metric units (°C, km/h) for weather (off switches to imperial)",
                },
                {
                  key: "dynamicWeatherLocation",
                  label: "Local Weather Detection",
                  desc: "Autodetect your city for weather widget (off shows virex's weather)",
                },
                {
                  key: "helloAnimation",
                  label: "Hello Animation",
                  desc: "Fluent language cycling home hero",
                },
                {
                  key: "brutalistMode",
                  label: "Brutalist Mode",
                  desc: "Sharp edges and raw styling",
                },
                {
                  key: "developerFont",
                  label: "Developer Font",
                  desc: "Use JetBrains Mono as the primary UI typeface",
                },
                {
                  key: "focusMode",
                  label: "Focus Mode",
                  desc: "A minimal zen layout",
                },
                {
                  key: "highHz",
                  label: "High-Refresh Springs",
                  desc: "Tighter physics tuned for 120Hz/144Hz displays",
                },
                {
                  key: "disableAnimations",
                  label: "Disable Animations",
                  desc: "Turn off motion & transition effects (requires refresh)",
                },
                { // desktop-only option
                  key: "bentoTilt",
                  label: "3D Bento Tilt",
                  desc: "Cursor tracking parallax tilt effect on cards",
                },
                {
                  key: "lensDynamicTheming",
                  label: "Lens Dynamic Theming",
                  desc: "Match the theme to an expanded Lens photo",
                },
              ]
                .filter((tweak) => !(is_mobile && tweak.key === "bentoTilt"))
                .map((tweak) => (
                <label
                  key={tweak.key}
                  className={cn(
                    "flex items-center justify-between p-4.5 rounded-2xl transition-all text-left cursor-pointer border-0",
                    settings[tweak.key as keyof typeof settings]
                      ? "bg-[var(--primary-container)] text-[var(--on-primary-container)]"
                      : "bg-[var(--surface-variant)] hover:bg-[var(--on-primary-container)]/10 text-[var(--on-surface)]",
                  )}
                >
                  <div>
                    <div className="font-bold text-[15px]">{tweak.label}</div>
                    <div className="text-xs opacity-60 font-medium">
                      {tweak.desc}
                    </div>
                  </div>
                  <Switch
                    checked={
                      settings[
                        tweak.key as keyof typeof settings
                      ] as boolean
                    }
                    onChange={(checked) => {
                      if (tweak.key === "disableAnimations") {
                        updateSettings({ disableAnimations: checked });
                        setShowRefreshConfirm(true);
                      } else {
                        updateSettings({ [tweak.key]: checked });
                      }
                    }}
                  />
                </label>
              ))}
              {is_mobile && (
                <div className="mt-3 px-4 py-3 rounded-2xl bg-[var(--surface-variant)]/60 text-[12px] leading-5 opacity-80 border-0">
                  Some desktop-only customization options are hidden on mobile.
                </div>
              )}
            </div>
          </section>
        );

      case "layout":
        return (
          <div className="space-y-8">
            <section className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <Layers size={20} className="text-[var(--primary)]" />
                <h3 className="text-[17px] font-black tracking-[0.1em] text-[var(--on-surface-variant)]">
                  Navigation & Layout Options
                </h3>
              </div>
              <div className="flex flex-col gap-2">
                {[ // desktop-only option
                  {
                    key: "sidebarFlipped",
                    label: "Flip Sidebar",
                    desc: "Changes desktop sidebar orientation to the right",
                  },
                  { // desktop-only option
                    key: "floatingSidebar",
                    label: "Floating Sidebar",
                    desc: "Undock the sidebar with rounded corners",
                  },
                  { // desktop-only option
                    key: "profileContainer",
                    label: "Profile Container",
                    desc: "Shows a clean background around the profile header",
                  },
                  {
                    key: "forceDesktop",
                    label: "Force Desktop",
                    desc: "Prevents switching to mobile layout on small screens",
                  },
                  {
                    key: "infoFullscreen",
                    label: "Info Page Fullscreen",
                    desc: "Hides navbars when on the /info page",
                  },
                ]
                  .filter((tweak) => !(is_mobile && ["sidebarFlipped", "floatingSidebar", "profileContainer"].includes(tweak.key)))
                  .map((tweak) => (
                  <label
                    key={tweak.key}
                    className={cn(
                      "flex items-center justify-between p-4.5 rounded-2xl transition-all text-left cursor-pointer border-0",
                      settings[tweak.key as keyof typeof settings]
                        ? "bg-[var(--primary-container)] text-[var(--on-primary-container)]"
                        : "bg-[var(--surface-variant)] hover:bg-[var(--on-primary-container)]/10 text-[var(--on-surface)]",
                    )}
                  >
                    <div>
                      <div className="font-bold text-[15px]">{tweak.label}</div>
                      <div className="text-xs opacity-60 font-medium">
                        {tweak.desc}
                      </div>
                    </div>
                    <Switch
                      checked={
                        settings[
                          tweak.key as keyof typeof settings
                        ] as boolean
                      }
                      onChange={(checked) => {
                        updateSettings({ [tweak.key]: checked });
                      }}
                    />
                  </label>
                ))}
              </div>
              {is_mobile && (
                <div className="mt-3 px-4 py-3 rounded-2xl bg-[var(--surface-variant)]/60 text-[12px] leading-5 opacity-80 border-0">
                  Some desktop-only layout options are hidden on mobile.
                </div>
              )}
            </section>
          </div>
        );

      case "commandPalette":
        return (
          <section className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <Monitor size={20} className="text-[var(--primary)]" />
              <h3 className="text-[17px] font-black tracking-[0.1em] text-[var(--on-surface-variant)]">
                Command palette
              </h3>
            </div>

            <div className="space-y-4">
              <div className="bg-[var(--surface-variant)]/40 rounded-2xl p-5 border-0">
                <div className="font-bold text-[15px]">Activation hotkey</div>
                <div className="text-xs opacity-60 font-medium mt-0.5 mb-3">
                  Choose the shortcut that opens the command palette.
                </div>
                <div className="space-y-1.5">
                  {[
                    { value: "ctrl-k", label: "Ctrl+K", desc: "Standard keyboard shortcut for palette." },
                    { value: "cmd-k", label: "⌘K", desc: "Mac-style palette shortcut." },
                    { value: "ctrl-shift-p", label: "Ctrl+Shift+P", desc: "Alternative command palette shortcut." },
                  ].map((option, index, array) => {
                    const active = settings.paletteHotkey === option.value;
                    const isFirst = index === 0;
                    const isLast = index === array.length - 1;
                    const roundClass = array.length === 1
                      ? "rounded-2xl"
                      : isFirst
                        ? "rounded-t-2xl rounded-b-[6px]"
                        : isLast
                          ? "rounded-b-2xl rounded-t-[6px]"
                          : "rounded-[6px]";
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => updateSettings({ paletteHotkey: option.value as any })}
                        className={cn(
                          "flex flex-col gap-1 w-full px-4 py-3 text-left transition-all border-0 cursor-pointer",
                          roundClass,
                          active
                            ? "bg-[var(--primary-container)] text-[var(--on-primary-container)]"
                            : "bg-[var(--surface)] hover:bg-[var(--surface-variant)]/60 text-[var(--on-surface)]"
                        )}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-sm font-bold">{option.label}</span>
                          {active && <Check size={16} />}
                        </div>
                        <span className="text-xs opacity-70">{option.desc}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="bg-[var(--surface-variant)]/40 rounded-2xl p-5 border-0">
                <div className="font-bold text-[15px]">Default view</div>
                <div className="text-xs opacity-60 font-medium mt-0.5 mb-3">
                  Pick the starting layout when opening the palette.
                </div>
                <div className="space-y-1.5">
                  {[
                    { value: "lists", label: "Lists", desc: "Classic stacked command lists." },
                    { value: "cards", label: "Cards", desc: "Cards layout with left/right navigation." },
                  ].map((option, index, array) => {
                    const active = settings.paletteDefaultView === option.value;
                    const isFirst = index === 0;
                    const isLast = index === array.length - 1;
                    const roundClass = array.length === 1
                      ? "rounded-2xl"
                      : isFirst
                        ? "rounded-t-2xl rounded-b-[6px]"
                        : isLast
                          ? "rounded-b-2xl rounded-t-[6px]"
                          : "rounded-[6px]";
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => updateSettings({ paletteDefaultView: option.value as any })}
                        className={cn(
                          "flex flex-col gap-1 w-full px-4 py-3 text-left transition-all border-0 cursor-pointer",
                          roundClass,
                          active
                            ? "bg-[var(--primary-container)] text-[var(--on-primary-container)]"
                            : "bg-[var(--surface)] hover:bg-[var(--surface-variant)]/60 text-[var(--on-surface)]"
                        )}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-sm font-bold">{option.label}</span>
                          {active && <Check size={16} />}
                        </div>
                        <span className="text-xs opacity-70">{option.desc}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="bg-[var(--surface-variant)]/40 rounded-2xl p-5 border-0">
                <div className="font-bold text-[15px]">Search scope</div>
                <div className="text-xs opacity-60 font-medium mt-0.5 mb-3">
                  Limit what the palette searches by default.
                </div>
                <div className="space-y-1.5">
                  {[
                    { value: "everything", label: "Everything", desc: "Search pages, settings, commands, and blog posts." },
                    { value: "pages", label: "Pages", desc: "Search only site pages and navigation." },
                    { value: "commands", label: "Commands", desc: "Search only palette actions and tools." },
                    { value: "blog", label: "Blog posts", desc: "Search only blog posts." },
                  ].map((option, index, array) => {
                    const active = settings.paletteSearchScope === option.value;
                    const isFirst = index === 0;
                    const isLast = index === array.length - 1;
                    const roundClass = array.length === 1
                      ? "rounded-2xl"
                      : isFirst
                        ? "rounded-t-2xl rounded-b-[6px]"
                        : isLast
                          ? "rounded-b-2xl rounded-t-[6px]"
                          : "rounded-[6px]";
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => updateSettings({ paletteSearchScope: option.value as any })}
                        className={cn(
                          "flex flex-col gap-1 w-full px-4 py-3 text-left transition-all border-0 cursor-pointer",
                          roundClass,
                          active
                            ? "bg-[var(--primary-container)] text-[var(--on-primary-container)]"
                            : "bg-[var(--surface)] hover:bg-[var(--surface-variant)]/60 text-[var(--on-surface)]"
                        )}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-sm font-bold">{option.label}</span>
                          {active && <Check size={16} />}
                        </div>
                        <span className="text-xs opacity-70">{option.desc}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="bg-[var(--surface-variant)]/40 rounded-2xl p-5 border-0">
                <div className="font-bold text-[15px]">Results limit</div>
                <div className="text-xs opacity-60 font-medium mt-0.5 mb-3">
                  Control how many items appear before scrolling.
                </div>
                <div className="grid gap-2 sm:grid-cols-4">
                  {[8, 12, 16, 24].map((limit) => {
                    const active = settings.paletteResultsLimit === limit;
                    return (
                      <button
                        key={limit}
                        type="button"
                        onClick={() => updateSettings({ paletteResultsLimit: limit })}
                        className={cn(
                          "flex items-center justify-between gap-3 w-full rounded-xl px-4 py-3 text-left transition-all border-0 cursor-pointer",
                          active
                            ? "bg-[var(--primary-container)] text-[var(--on-primary-container)]"
                            : "bg-[var(--surface)] hover:bg-[var(--surface-variant)]/60 text-[var(--on-surface)]"
                        )}
                      >
                        <span className="text-sm font-bold">{limit}</span>
                        {active && <Check size={16} />}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="bg-[var(--surface-variant)]/40 rounded-2xl p-5 border-0">
                <label className="flex items-center justify-between gap-4 cursor-pointer">
                  <div>
                    <div className="font-bold text-[15px]">Recent actions</div>
                    <div className="text-xs opacity-60 mt-0.5">Toggle recent command suggestions when palette is empty.</div>
                  </div>
                  <Switch
                    checked={settings.paletteShowRecentActions}
                    onChange={(checked) => updateSettings({ paletteShowRecentActions: checked })}
                  />
                </label>
              </div>

              <div className="bg-[var(--surface-variant)]/40 rounded-2xl p-5 border-0">
                <div className="font-bold text-[15px]">Keyboard navigation</div>
                <div className="text-xs opacity-60 font-medium mt-0.5 mb-3">
                  Choose how arrow keys move through palette results. Bento view enables left/right navigation.
                </div>
                <div className="space-y-1.5">
                  {[
                    { value: "standard", label: "Standard", desc: "Arrow keys move up/down through the list." },
                    { value: "wrap", label: "Wrap", desc: "Continue from bottom to top and vice versa." },
                    { value: "grid", label: "2D grid", desc: "In Bento view, left/right move across columns." },
                  ].map((option, index, array) => {
                    const active = settings.paletteKeyboardNavBehavior === option.value;
                    const isFirst = index === 0;
                    const isLast = index === array.length - 1;
                    const roundClass = array.length === 1
                      ? "rounded-2xl"
                      : isFirst
                        ? "rounded-t-2xl rounded-b-[6px]"
                        : isLast
                          ? "rounded-b-2xl rounded-t-[6px]"
                          : "rounded-[6px]";
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => updateSettings({ paletteKeyboardNavBehavior: option.value as any })}
                        className={cn(
                          "flex flex-col gap-1 w-full px-4 py-3 text-left transition-all border-0 cursor-pointer",
                          roundClass,
                          active
                            ? "bg-[var(--primary-container)] text-[var(--on-primary-container)]"
                            : "bg-[var(--surface)] hover:bg-[var(--surface-variant)]/60 text-[var(--on-surface)]"
                        )}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-sm font-bold">{option.label}</span>
                          {active && <Check size={16} />}
                        </div>
                        <span className="text-xs opacity-70">{option.desc}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="bg-[var(--surface-variant)]/40 rounded-2xl p-5 border-0">
                <label className="flex items-center justify-between gap-4 cursor-pointer">
                  <div>
                    <div className="font-bold text-[15px]">Suppress hover</div>
                    <div className="text-xs opacity-60 mt-0.5">Allow keyboard selection to ignore pointer movement.</div>
                  </div>
                  <Switch
                    checked={settings.paletteSuppressHover}
                    onChange={(checked) => updateSettings({ paletteSuppressHover: checked })}
                  />
                </label>
              </div>
            </div>
          </section>
        );

      case "backup":
        return (
          <section className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <Fingerprint size={20} className="text-[var(--primary)]" />
              <h3 className="text-[17px] font-black tracking-[0.1em] text-[var(--on-surface-variant)]">
                Share & Backup
              </h3>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={() => {
                  try {
                    const str = btoa(JSON.stringify(settings));
                    const shareUrl = `${window.location.origin}/?theme=${str}`;
                    navigator.clipboard.writeText(shareUrl);
                    setToast("Sharing link copied to clipboard!");
                  } catch (e) {
                    setToast("Failed to generate sharing link! :(");
                  }
                  haptic.light();
                }}
                className="flex items-center justify-between p-5 bg-[var(--surface-variant)] hover:bg-[var(--primary-container)] hover:text-[var(--on-primary-container)] transition-all text-left rounded-2xl group cursor-pointer border-0"
              >
                <div>
                  <div className="font-bold text-[15px]">Copy config link</div>
                  <div className="text-xs opacity-60 font-medium">
                    Get config as link
                  </div>
                </div>
                <ExternalLink
                  size={20}
                  className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform opacity-60 group-hover:opacity-100"
                />
              </button>

              <button
                onClick={() => {
                  try {
                    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(settings, null, 2));
                    const downloadAnchor = document.createElement('a');
                    downloadAnchor.setAttribute("href", dataStr);
                    downloadAnchor.setAttribute("download", "virex-settings.json");
                    document.body.appendChild(downloadAnchor);
                    downloadAnchor.click();
                    downloadAnchor.remove();
                    setToast("backup downloaded!");
                  } catch (e) {
                    setToast("failed to download backup :(");
                  }
                  haptic.light();
                }}
                className="flex items-center justify-between p-5 bg-[var(--surface-variant)] hover:bg-[var(--primary-container)] hover:text-[var(--on-primary-container)] transition-all text-left rounded-2xl group cursor-pointer border-0"
              >
                <div>
                  <div className="font-bold text-[15px]">Export config file</div>
                  <div className="text-xs opacity-60 font-medium">
                    Get config as JSON
                  </div>
                </div>
                <Download
                  size={20}
                  className="group-hover:translate-y-0.5 transition-transform opacity-60 group-hover:opacity-100"
                />
              </button>
            </div>

            <div className="bg-[var(--surface-variant)]/40 p-5 rounded-2xl space-y-3 border-0">
              <div className="font-bold text-[15px]">Importing Your Config</div>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Paste sharing link/code here..."
                  className="flex-1 min-w-0 truncate bg-[var(--surface)] text-[var(--on-surface)] rounded-xl px-4 py-2.5 text-[13px] font-bold border-0 ring-1 ring-[var(--outline-variant)]/30 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      const val = e.currentTarget.value.trim();
                      if (!val) return;
                      try {
                        let capsule = val;
                        if (val.includes("theme=")) {
                          const urlParams = new URLSearchParams(val.substring(val.indexOf("?")));
                          capsule = urlParams.get("theme") || val;
                        }
                        const decoded = JSON.parse(atob(capsule));
                        const validatedSettings: Partial<typeof settings> = {};
                        const keys: (keyof typeof settings)[] = [
                          "mode", "accent", "hue", "saturation", "sidebarFlipped",
                          "sidebarCollapsed", "profileContainer", "brutalistMode",
                          "developerFont", "focusMode", "floatingSidebar", "infoFullscreen", "debugMode",
                          "helloAnimation", "disableAnimations", "highHz", "amoledMode",
                          "bentoTilt", "lensDynamicTheming", "metricUnits", "dynamicWeatherLocation"
                        ];
                        for (const k of keys) {
                          if (decoded[k] !== undefined) {
                            (validatedSettings as any)[k] = decoded[k];
                          }
                        }
                        updateSettings(validatedSettings);
                        setToast("config has been loaded!");
                        e.currentTarget.value = "";
                      } catch (err) {
                        setToast("non valid capsule code or link :(");
                      }
                    }
                  }}
                />
                <motion.label
                  whileTap={{ scale: 0.96 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  onClick={() => {
                    haptic.light();
                  }}
                  className="shrink-0 whitespace-nowrap bg-[var(--primary)] text-[var(--on-primary)] hover:bg-[var(--primary-container)] hover:text-[var(--on-primary-container)] px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center cursor-pointer select-none border-0"
                >
                  Upload File
                  <input
                    type="file"
                    accept=".json"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.onload = (event) => {
                        try {
                          const decoded = JSON.parse(event.target?.result as string);
                          const validatedSettings: Partial<typeof settings> = {};
                          const keys: (keyof typeof settings)[] = [
                            "mode", "accent", "hue", "saturation", "sidebarFlipped",
                            "sidebarCollapsed", "profileContainer", "brutalistMode",
                            "developerFont", "focusMode", "floatingSidebar", "infoFullscreen", "debugMode",
                            "helloAnimation", "disableAnimations", "highHz", "amoledMode",
                            "bentoTilt", "lensDynamicTheming", "metricUnits", "dynamicWeatherLocation"
                          ];
                          for (const k of keys) {
                            if (decoded[k] !== undefined) {
                              (validatedSettings as any)[k] = decoded[k];
                            }
                          }
                          updateSettings(validatedSettings);
                          setToast("settings have been restored from backup!");
                        } catch (err) {
                          setToast("non valid backup JSON file :(");
                        }
                      };
                      reader.readAsText(file);
                    }}
                  />
                </motion.label>
              </div>
              <div className="text-[12px] opacity-50 font-medium">
                Press Enter to apply pasted sharing link. Pressing `ENTER` will update your theme immediately.
              </div>
            </div>
          </section>
        );

      case "debug":
        return (
          <div className="space-y-8">
            <section className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <Cpu size={20} className="text-[var(--primary)]" />
                <h3 className="text-[17px] font-black tracking-[0.1em] text-[var(--on-surface-variant)]">
                  Information & Debug settings
                </h3>
              </div>
              <div className="flex flex-col gap-2">
                <label
                  className={cn(
                    "flex items-center justify-between p-4.5 rounded-2xl transition-all text-left cursor-pointer border-0",
                    settings.debugMode
                      ? "bg-[var(--primary-container)] text-[var(--on-primary-container)]"
                      : "bg-[var(--surface-variant)] hover:bg-[var(--on-primary-container)]/20 text-[var(--on-surface)]",
                  )}
                >
                  <div>
                    <div className="font-bold text-[15px]">Debug Mode</div>
                    <div className="text-xs opacity-60 font-medium">
                      Show layout grid and build info
                    </div>
                  </div>
                  <Switch
                    checked={settings.debugMode}
                    onChange={(checked) => {
                      if (checked) {
                        setShowDebugConfirm(true);
                      } else {
                        updateSettings({ debugMode: false });
                      }
                    }}
                  />
                </label>
              </div>
            </section>
            <section className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <Terminal size={20} className="text-[var(--primary)]" />
                <h3 className="text-[17px] font-black tracking-[0.1em] text-[var(--on-surface-variant)]">
                  Other Info
                </h3>
              </div>
              <button
                onClick={() => {
                  handleClose();
                  goto("changelog");
                }}
                className="w-full flex items-center justify-between p-4.5 bg-[var(--surface-variant)] hover:bg-[var(--primary-container)] hover:text-[var(--on-primary-container)] transition-all text-left rounded-2xl group cursor-pointer border-0"
              >
                <div>
                  <div className="font-bold text-[15px]">View changelog</div>
                  <div className="text-xs opacity-60 font-medium">
                    See what's new in 2026.09.14-stable
                  </div>
                </div>
                <ChevronRight
                  size={20}
                  className="group-hover:translate-x-1 transition-transform opacity-60 group-hover:opacity-100"
                />
              </button>
            </section>
          </div>
        );

      case "about":
        return (
          <div className="space-y-8">
            <section className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <Bug size={20} className="text-[var(--primary)]" />
                <h3 className="text-[17px] font-black tracking-[0.1em] text-[var(--on-surface-variant)]">
                  Feedback
                </h3>
              </div>
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => {
                    handleClose();
                    onReportBug();
                    haptic.light();
                  }}
                  className="w-full flex items-center justify-between p-4.5 bg-[var(--surface-variant)] hover:bg-[var(--on-primary-container)]/20 hover:text-[var(--on-primary-container)] transition-all text-left rounded-2xl group cursor-pointer border-0"
                >
                  <div>
                    <div className="font-bold text-[15px]">Report a bug</div>
                    <div className="text-xs opacity-60 font-medium">
                      Help us make virex.lol better by reporting issues
                    </div>
                  </div>
                  <ChevronRight
                    size={20}
                    className="group-hover:translate-x-1 transition-transform opacity-60 group-hover:opacity-100"
                  />
                </button>
                <button
                  onClick={() => {
                    handleClose();
                    onOpenKnownIssuess();
                    haptic.light();
                  }}
                  className="w-full flex items-center justify-between p-4.5 bg-[var(--surface-variant)] hover:bg-[var(--on-primary-container)]/20 hover:text-[var(--on-primary-container)] transition-all text-left rounded-2xl group cursor-pointer border-0"
                >
                  <div>
                    <div className="font-bold text-[15px]">Known issues</div>
                    <div className="text-xs opacity-60 font-medium">
                      View bugs that have already been reported
                    </div>
                  </div>
                  <ChevronRight
                    size={20}
                    className="group-hover:translate-x-1 transition-transform opacity-60 group-hover:opacity-100"
                  />
                </button>
              </div>
            </section>
          </div>
        );
      default:
        return null;
    }
  };

  React.useEffect(() => {
    const modalEl = modalRef.current;
    if (!modalEl || !is_mobile) return;

    const handleTouchStartRaw = (e: TouchEvent) => {
      const touch = e.touches[0];
      dragStartY.current = touch.clientY;
      dragStartModalY.current = y.get();
      
      const isInsideScroll = scrollRef.current && scrollRef.current.contains(e.target as Node);
      const scrollTop = scrollRef.current ? scrollRef.current.scrollTop : 0;
      
      if (!isInsideScroll) {
        isDraggingSheet.current = true;
      } else if (dragStartModalY.current > 0) {
        isDraggingSheet.current = true;
      } else if (scrollTop <= 0) {
        isDraggingSheet.current = false;
      } else {
        isDraggingSheet.current = false;
      }
      
      touchTimes.current = [{ y: touch.clientY, t: Date.now() }];
    };

    const handleTouchMoveRaw = (e: TouchEvent) => {
      const touch = e.touches[0];
      const clientY = touch.clientY;
      const deltaY = clientY - dragStartY.current;
      const scrollTop = scrollRef.current ? scrollRef.current.scrollTop : 0;
      
      touchTimes.current.push({ y: clientY, t: Date.now() });
      if (touchTimes.current.length > 5) {
        touchTimes.current.shift();
      }

      if (dragStartModalY.current === 0 && scrollTop <= 0 && !isDraggingSheet.current) {
        if (deltaY > 0) {
          isDraggingSheet.current = true;
          dragStartY.current = clientY;
          dragStartModalY.current = 0;
        }
      }

      if (!isDraggingSheet.current && scrollTop <= 0 && deltaY > 0) {
        isDraggingSheet.current = true;
        dragStartY.current = clientY;
        dragStartModalY.current = 0;
      }

      if (isDraggingSheet.current) {
        if (e.cancelable) {
          e.preventDefault();
        }
        
        let newY = dragStartModalY.current + deltaY;
        if (newY < 0) {
          newY = newY * 0.2; // pull resistance
        }
        y.set(newY);
      }
    };

    const handleTouchEndRaw = (e: TouchEvent) => {
      if (!isDraggingSheet.current) return;
      isDraggingSheet.current = false;

      const currentY = y.get();
      let velocityY = 0;
      if (touchTimes.current.length >= 2) {
        const first = touchTimes.current[0];
        const last = touchTimes.current[touchTimes.current.length - 1];
        const dt = last.t - first.t;
        if (dt > 0) {
          velocityY = ((last.y - first.y) / dt) * 1000;
        }
      }

      if (velocityY > 600 || currentY > defaultY + 150) {
        handleClose();
      } else if (velocityY < -400) {
        animate(y, 0, {
          type: "spring",
          damping: 30,
          stiffness: 300,
          mass: 0.8
        });
      } else {
        // snap to either fully open (0) or quarter-open (defaultY)
        const midpoint = defaultY * 0.5;
        const targetY = currentY < midpoint ? 0 : defaultY;
        animate(y, targetY, {
          type: "spring",
          damping: 30,
          stiffness: 300,
          mass: 0.8
        });
      }
    };

    modalEl.addEventListener("touchstart", handleTouchStartRaw, { passive: false });
    modalEl.addEventListener("touchmove", handleTouchMoveRaw, { passive: false });
    modalEl.addEventListener("touchend", handleTouchEndRaw, { passive: false });

    return () => {
      modalEl.removeEventListener("touchstart", handleTouchStartRaw);
      modalEl.removeEventListener("touchmove", handleTouchMoveRaw);
      modalEl.removeEventListener("touchend", handleTouchEndRaw);
    };
  }, [is_mobile, y, defaultY, handleClose, settingsOpen]);

  return (
    <AnimatePresence>
      {settingsOpen && (
        <div className={cn(
          "fixed inset-0 z-[100] flex justify-center overflow-hidden",
          is_mobile ? "items-start p-0 bg-black/20" : "items-center p-4"
        )}>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-md motion-gpu"
            style={{ willChange: "opacity" }}
          />
          <motion.div
            ref={modalRef}
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-labelledby="settings-dialog-title"
            onKeyDown={handleDialogKeyDown}
            initial={is_mobile && viewport ? { y: viewport.h } : { opacity: 0, scale: 0.9, y: 20 }}
            animate={is_mobile ? { y: defaultY } : { opacity: 1, scale: 1, y: 0 }}
            exit={is_mobile && viewport ? { 
              y: viewport.h,
              transition: { type: "spring", damping: 30, stiffness: 300, mass: 0.8 }
            } : {
              opacity: 0,
              scale: 0.9,
              y: 20,
              transition: {
                duration: 0.2
              }
            }}
            transition={is_mobile ? { type: "spring", damping: 30, stiffness: 350, mass: 0.8 } : settingsSpring}
            onClick={(e) => e.stopPropagation()}
            className={cn(
              "relative bg-[var(--surface)] shadow-2xl overflow-hidden flex flex-col motion-gpu settings-modal-content",
              is_mobile 
                ? "w-full h-[100dvh] max-w-none max-h-none rounded-t-[2.2rem] border-none" 
                : "w-full md:max-w-[720px] md:h-[780px] max-h-[90vh] rounded-[2.5rem] border border-[var(--outline-variant)]/30"
            )}
            style={is_mobile ? { 
              y,
              height: modalHeight,
              willChange: "transform, height",
              touchAction: "pan-y"
            } : { 
              willChange: "transform, opacity"
            }}
          >
            <div className="flex flex-col h-full overflow-hidden">
              {/* drag handle for mobile */}
              {is_mobile && (
                <div 
                  className="w-full flex justify-center pt-3 pb-1 shrink-0 bg-[var(--surface)]"
                >
                  <div className="w-12 h-1.5 bg-[var(--outline-variant)] rounded-full opacity-40" />
                </div>
              )}

              <div 
                className={cn(
                  "flex justify-between items-center border-b border-[var(--outline-variant)]/30 bg-[var(--surface)] sticky top-0 z-10 shrink-0",
                  is_mobile ? "p-4" : "p-6 md:p-7"
                )}
              >
                <div className="flex items-center gap-3">
                  {is_mobile && activePage !== "menu" && (
                    <button
                      onClick={() => navigateTo("menu")}
                      aria-label="Back to settings menu"
                      className="group w-10 h-10 rounded-full bg-[var(--surface-variant)]/60 hover:bg-[var(--surface-variant)] border-0 flex items-center justify-center transition-all cursor-pointer text-[var(--on-surface)] active:scale-95 shrink-0 shadow-none"
                    >
                      <ChevronLeft size={20} className="transition-transform duration-300 ease-out group-hover:-translate-x-0.5 group-hover:scale-110" />
                    </button>
                  )}
                  <div className="w-10 h-10 rounded-full bg-[var(--primary-container)] border-0 flex items-center justify-center shrink-0 text-[var(--primary)] shadow-none">
                    <SettingsIcon size={20} />
                  </div>
                  <h2
                    id="settings-dialog-title"
                    className={cn(
                      "font-bold flex items-center gap-3",
                      is_mobile ? "text-xl" : "text-2xl"
                    )}
                  >
                    {is_mobile ? (
                      <span className="text-2xl font-expressive italic font-black uppercase tracking-tight">
                        {activePage === "menu" ? "Settings" : currentPageTitle}
                      </span>
                    ) : (
                      <span className="font-display italic tracking-tight uppercase font-black">Settings</span>
                    )}
                  </h2>
                </div>
                <button
                  onClick={() => {
                    haptic.medium();
                    handleClose();
                  }}
                  aria-label="Close settings dialog"
                  className="group w-10 h-10 rounded-full bg-[var(--surface-variant)]/60 hover:bg-[var(--surface-variant)] border-0 flex items-center justify-center transition-all cursor-pointer text-[var(--on-surface)] active:scale-95 shrink-0 shadow-none"
                >
                  <X size={20} className="transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:rotate-180 group-hover:scale-110" />
                </button>
              </div>

              {is_mobile ? (
                <div 
                  ref={scrollRef}
                  className="flex flex-col overflow-y-auto scrollbar-hide flex-1 p-6 pb-8"
                >
                  <AnimatePresence mode="wait" custom={direction}>
                    {activePage === "menu" ? (
                      <motion.div
                        key="menu"
                        custom={direction}
                        variants={pageVariants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        className="flex flex-col justify-between flex-1"
                      >
                        {/* main pages group */}
                        <div className="flex flex-col gap-2">
                          {visibleMainPages.map((page, index, arr) => {
                            const PageIcon = page.icon;
                            const isFirst = index === 0;
                            const isLast = index === arr.length - 1;
                            const isSingle = arr.length === 1;
                            const roundedClass = isSingle
                              ? "rounded-[22px]"
                              : isFirst
                                ? "rounded-t-[22px] rounded-b-[6px]"
                                : isLast
                                  ? "rounded-b-[22px] rounded-t-[6px]"
                                  : "rounded-[6px]";
                            return (
                              <button
                                key={page.id}
                                onClick={() => {
                                  haptic.light();
                                  navigateTo(page.id);
                                }}
                                className={cn(
                                  "w-full flex items-center justify-between p-4 bg-[var(--surface-variant)] hover:bg-[var(--on-primary-container)]/20 hover:text-[var(--on-primary-container)] text-[var(--on-surface)] transition-all text-left group cursor-pointer border-0 shadow-none",
                                  roundedClass
                                )}
                              >
                                <div className="flex items-center gap-3.5">
                                  <div className="w-10 h-10 flex items-center justify-center rounded-full bg-[var(--surface)] text-[var(--primary)] group-hover:bg-[var(--primary)] group-hover:text-[var(--on-primary)] transition-all shrink-0 border-0 shadow-xs">
                                    <PageIcon size={20} className={cn("shrink-0", page.id === "debug" && "-translate-x-[0.9px]")} />
                                  </div>
                                  <div>
                                    <div className="font-bold text-[15px]">{page.title}</div>
                                    <div className="text-xs opacity-60 font-medium">
                                      {page.desc}
                                    </div>
                                  </div>
                                </div>
                                <ChevronRight
                                  size={18}
                                  className="group-hover:translate-x-1 transition-transform opacity-40 group-hover:opacity-80 shrink-0"
                                />
                              </button>
                            );
                          })}
                        </div>

                        {/* divider + bottom pages wrapped together so they stay anchored */}
                        <div className="flex flex-col gap-2 mt-4">
                          <div className="flex items-center gap-4 px-1 pt-1 pb-1">
                            <div className="flex-1 h-px bg-[var(--outline-variant)]/30" />
                            <span className="text-[12px] font-black tracking-[0.1em] uppercase opacity-40 font-expressive">More</span>
                            <div className="flex-1 h-px bg-[var(--outline-variant)]/30" />
                          </div>
                          {BOTTOM_PAGES.map((page, index, arr) => {
                            const PageIcon = page.icon;
                            const isFirst = index === 0;
                            const isLast = index === arr.length - 1;
                            const isSingle = arr.length === 1;
                            const roundedClass = isSingle
                              ? "rounded-[22px]"
                              : isFirst
                                ? "rounded-t-[22px] rounded-b-[6px]"
                                : isLast
                                  ? "rounded-b-[22px] rounded-t-[6px]"
                                  : "rounded-[6px]";
                            return (
                              <button
                                key={page.id}
                                onClick={() => {
                                  haptic.light();
                                  navigateTo(page.id);
                                }}
                                className={cn(
                                  "w-full flex items-center justify-between p-4 bg-[var(--surface-variant)]/70 hover:bg-[var(--primary-container)] hover:text-[var(--on-primary-container)] text-[var(--on-surface)] transition-all text-left group cursor-pointer border-0 shadow-none",
                                  roundedClass
                                )}
                              >
                                <div className="flex items-center gap-3.5">
                                  <div className="w-10 h-10 flex items-center justify-center rounded-full bg-[var(--surface)] text-[var(--primary)] group-hover:bg-[var(--primary)] group-hover:text-[var(--on-primary)] transition-all shrink-0 border-0 shadow-xs">
                                    <PageIcon size={20} className={cn("shrink-0", page.id === "debug" && "-translate-x-[0.5px]")} />
                                  </div>
                                  <div>
                                    <div className="font-bold text-[15px]">{page.title}</div>
                                    <div className="text-xs opacity-60 font-medium">
                                      {page.desc}
                                    </div>
                                  </div>
                                </div>
                                <ChevronRight
                                  size={18}
                                  className="group-hover:translate-x-1 transition-transform opacity-40 group-hover:opacity-80 shrink-0"
                                />
                              </button>
                            );
                          })}
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div
                        key={activePage}
                        custom={direction}
                        variants={pageVariants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                      >
                        {renderPageContent()}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="flex flex-row flex-1 overflow-hidden min-h-0">
                  {/* left nav sidebar — styled identically to sidebar / index.astro link items */}
                  <div className="w-[240px] border-r border-[var(--outline-variant)]/30 bg-[var(--surface-variant)]/20 py-4 px-3 flex flex-col overflow-y-auto shrink-0 select-none">
                    {/* main nav items */}
                    <div className="flex flex-col gap-1">
                      {MAIN_PAGES.map((p, index, arr) => {
                        const PageIcon = p.icon;
                        const isActive = activePage === p.id;
                        const isSingle = arr.length === 1;
                        const isFirst = index === 0;
                        const isLast = index === arr.length - 1;
                        const roundedClass = isSingle
                          ? "rounded-[22px]"
                          : isFirst
                            ? "rounded-t-[22px] rounded-b-[6px]"
                            : isLast
                              ? "rounded-b-[22px] rounded-t-[6px]"
                              : "rounded-[6px]";
                        return (
                          <motion.button
                            key={p.id}
                            onClick={() => {
                              haptic.light();
                              navigateTo(p.id);
                            }}
                            whileHover={!isActive ? { scale: 1.015, x: 2 } : {}}
                            whileTap={{ scale: 0.98 }}
                            transition={{ type: "spring", stiffness: 400, damping: 25 }}
                            className={cn(
                              "flex items-center w-full px-3 py-3 gap-3 transition-colors duration-200 border-0 outline-none select-none cursor-pointer group",
                              roundedClass,
                              isActive
                                ? "bg-[var(--primary-container)] text-[var(--on-primary-container)]"
                                : "bg-[var(--surface-variant)] text-[var(--on-surface)] hover:bg-[var(--surface-variant)]/80"
                            )}
                            aria-current={isActive ? "page" : undefined}
                          >
                            {/* left icon circle */}
                            <div
                              className={cn(
                                "w-9 h-9 flex items-center justify-center rounded-full transition-all shrink-0 border-0 shadow-none",
                                isActive
                                  ? "bg-[var(--primary)] text-[var(--on-primary)] shadow-sm"
                                  : "bg-[var(--surface)] text-[var(--primary)] group-hover:scale-105"
                              )}
                            >
                              <PageIcon size={18} fill={false} weight={isActive ? 600 : 450} />
                            </div>

                            {/* centered label */}
                            <span className={cn(
                              "flex-1 text-center font-display tracking-tight text-md leading-none",
                              isActive ? "font-black text-[var(--on-primary-container)]" : "font-bold text-[var(--on-surface)]"
                            )}>
                              {p.title}
                            </span>

                            {/* right chevron with no container */}
                            <div className="shrink-0 flex items-center justify-center w-4">
                              <ChevronRight
                                size={16}
                                className={cn(
                                  "transition-all duration-200",
                                  isActive
                                    ? "text-[var(--on-primary-container)] opacity-60"
                                    : "text-[var(--on-surface-variant)] opacity-35 group-hover:opacity-80 group-hover:translate-x-0.5"
                                )}
                              />
                            </div>
                          </motion.button>
                        );
                      })}
                    </div>

                    {/* spacer + divider */}
                    <div className="mt-auto pt-3">
                      <div className="mx-2 mb-2.5 h-px bg-[var(--outline-variant)]/30 rounded-full" />
                      <div className="flex flex-col gap-1">
                        {BOTTOM_PAGES.map((p, index, arr) => {
                          const PageIcon = p.icon;
                          const isActive = activePage === p.id;
                          const isSingle = arr.length === 1;
                          const isFirst = index === 0;
                          const isLast = index === arr.length - 1;
                          const roundedClass = isSingle
                            ? "rounded-[22px]"
                            : isFirst
                              ? "rounded-t-[22px] rounded-b-[6px]"
                              : isLast
                                ? "rounded-b-[22px] rounded-t-[6px]"
                                : "rounded-[6px]";
                          return (
                            <motion.button
                              key={p.id}
                              onClick={() => {
                                haptic.light();
                                navigateTo(p.id);
                              }}
                              whileHover={!isActive ? { scale: 1.015, x: 2 } : {}}
                              whileTap={{ scale: 0.98 }}
                              transition={{ type: "spring", stiffness: 400, damping: 25 }}
                              className={cn(
                                "flex items-center w-full px-3 py-3 gap-3 transition-colors duration-200 border-0 outline-none select-none cursor-pointer group",
                                roundedClass,
                                isActive
                                  ? "bg-[var(--primary-container)] text-[var(--on-primary-container)]"
                                  : "bg-[var(--surface-variant)]/60 text-[var(--on-surface)] hover:bg-[var(--surface-variant)]/90"
                              )}
                            >
                              <div
                                className={cn(
                                  "w-9 h-9 flex items-center justify-center rounded-full transition-all shrink-0 border-0 shadow-none",
                                  isActive
                                    ? "bg-[var(--primary)] text-[var(--on-primary)] shadow-sm"
                                    : "bg-[var(--surface)] text-[var(--primary)] group-hover:scale-105"
                                )}
                              >
                                <PageIcon size={18} className={cn("shrink-0", (p.id === "debug" || p.id === "info") && "translate-x-[0.5px]")} fill={false} weight={isActive ? 600 : 450} />
                              </div>
                              <span className={cn(
                                "flex-1 text-center font-display tracking-tight text-md leading-none",
                                isActive ? "font-black text-[var(--on-primary-container)]" : "font-bold text-[var(--on-surface)] opacity-90 group-hover:opacity-100"
                              )}>
                                {p.title}
                              </span>
                              <div className="shrink-0 flex items-center justify-center w-4">
                                <ChevronRight
                                  size={16}
                                  className={cn(
                                    "transition-all duration-200",
                                    isActive
                                      ? "text-[var(--on-primary-container)] opacity-60"
                                      : "text-[var(--on-surface-variant)] opacity-35 group-hover:opacity-80 group-hover:translate-x-0.5"
                                  )}
                                />
                              </div>
                            </motion.button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                  {/* right content with animated page transitions */}
                  <div
                    ref={scrollRef}
                    className="flex-1 overflow-y-auto scrollbar-hide min-h-0 relative"
                  >
                    <AnimatePresence mode="wait" custom={direction}>
                      <motion.div
                        key={activePage}
                        custom={direction}
                        variants={pageVariants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        className="p-8 space-y-8"
                      >
                        {renderPageContent()}
                      </motion.div>
                    </AnimatePresence>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
});
