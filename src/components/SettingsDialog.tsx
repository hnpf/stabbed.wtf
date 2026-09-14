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
            <div className="grid grid-cols-3 gap-1.5 w-full">
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
                      borderColor: isActive ? "var(--outline-variant)" : "var(--outline-variant)",
                      color: isActive ? "var(--on-primary)" : "var(--on-surface-variant)"
                    }}
                    transition={{
                      type: "spring",
                      stiffness: 300,
                      damping: 20
                    }}
                    className={cn(
                      "relative overflow-hidden flex items-center justify-center gap-2.5 py-4 border-[5px] transition-colors capitalize text-sm font-black tracking-wide cursor-pointer select-none",
                      roundedClass,
                      !isActive && "bg-[var(--surface-variant)]/30 hover:bg-black/5"
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
                marginBottom: (settings.mode === "dark" || settings.mode === "system") ? 24 : 0,
              }}
              transition={settingsSpring}
              className="overflow-hidden"
            >
              <label
                className={cn(
                  "flex items-center border-6 border-[var(--outline-variant)] justify-between p-5 transition-all text-left cursor-pointer rounded-[2rem]",
                  settings.amoledMode
                    ? "bg-[var(--primary-container)] text-[var(--on-primary-container)]"
                    : "bg-[var(--surface-variant)] hover:bg-[var(--outline-variant)]/30",
                )}
              >
                <div>
                  <div className="font-bold">AMOLED Mode</div>
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
              <div className="flex flex-wrap gap-4">
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
                      "group relative w-12 h-12 rounded-[1rem] overflow-hidden transition-all duration-300 shadow-sm",
                      settings.accent === c
                        ? "ring-2 ring-[var(--on-surface)] ring-offset-4 ring-offset-[var(--surface)] scale-110"
                        : "hover:scale-105",
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
                      <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                        <div className="bg-white rounded-full p-0.5 shadow-md w-6 h-6 flex items-center justify-center leading-none">
                          <Check
                            size={14}
                            className="text-black -translate-y-px"
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
                  <div className="text-sm font-bold opacity-70 text-[var(--on-surface)] mb-2">
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
                          "relative min-h-16 overflow-hidden rounded-[1.35rem] border-4 px-3 py-2 text-left transition-all",
                          selected
                            ? "border-[var(--on-surface)] scale-[1.02] shadow-md"
                            : "border-[var(--outline-variant)] hover:border-[var(--primary)] hover:scale-[1.01]",
                        )}
                        style={{ background: preview }}
                        aria-pressed={selected}
                      >
                        <span className="absolute inset-0 bg-black/20" />
                        <span className="relative flex items-center justify-between gap-2 text-sm font-black text-white drop-shadow-sm">
                          {label}
                          {selected && <Check size={17} strokeWidth={3} />}
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
            <div className="flex items-center gap-4 mb-7">
              <SettingsIcon size={20} className="text-[var(--primary)]" />
              <h3 className="text-[17px] font-black tracking-[0.1em] text-[var(--on-surface-variant)]">
                Customization settings
              </h3>
            </div>
            <div className="flex flex-col gap-1">
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
                  desc: "Sharp edges only",
                },
                {
                  key: "developerFont",
                  label: "Developer Font",
                  desc: "Use JetBrains Mono",
                },
                {
                  key: "focusMode",
                  label: "Focus Mode",
                  desc: "A minimal zen layout",
                },
                {
                  key: "highHz",
                  label: "120Hz Animations",
                  desc: "Replicates 120hz-level snappiness",
                },
                {
                  key: "disableAnimations",
                  label: "Disable Animations",
                  desc: "Turn off motion & transition effects",
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
                {
                  key: "metricUnits",
                  label: "Metric Units",
                  desc: "Use metric units (°C, km/h) for weather (off switches to imperial)",
                },
              ]
                .filter((tweak) => !(is_mobile && tweak.key === "bentoTilt"))
                .map((tweak, index, array) => (
                <label
                  key={tweak.key}
                  className={cn(
                    "flex items-center border-6 border-[var(--outline-variant)] justify-between p-5 transition-all text-left cursor-pointer",
                    array.length === 1
                      ? "rounded-[2rem]"
                      : index === 0
                        ? "rounded-t-[2rem] rounded-b-[0.9rem]"
                        : index === array.length - 1
                          ? "rounded-b-[2rem] rounded-t-[0.9rem]"
                          : "rounded-[0.9rem]",
                    settings[tweak.key as keyof typeof settings]
                      ? "bg-[var(--primary-container)] text-[var(--on-primary-container)]"
                      : "bg-[var(--surface-variant)] hover:bg-[var(--outline-variant)]/30",
                  )}
                >
                  <div>
                    <div className="font-bold">{tweak.label}</div>
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
                <div className="mt-3 px-4 py-3 rounded-[1.5rem] bg-[var(--surface-variant)] border-4 border-[var(--outline-variant)] text-[12px] leading-5 opacity-80">
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
              <div className="flex items-center gap-3 mb-7">
                <Layers size={20} className="text-[var(--primary)]" />
                <h3 className="text-[17px] font-black tracking-[0.1em] text-[var(--on-surface-variant)]">
                  Sidebar & Layout Options
                </h3>
              </div>
              <div className="flex flex-col gap-1">
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
                  .map((tweak, index, array) => (
                  <label
                    key={tweak.key}
                    className={cn(
                      "flex items-center border-6 border-[var(--outline-variant)] justify-between p-5 transition-all text-left cursor-pointer",
                      array.length === 1
                        ? "rounded-[2rem]"
                        : index === 0
                          ? "rounded-t-[2rem] rounded-b-[0.9rem]"
                          : index === array.length - 1
                            ? "rounded-b-[2rem] rounded-t-[0.9rem]"
                            : "rounded-[0.9rem]",
                      settings[tweak.key as keyof typeof settings]
                        ? "bg-[var(--primary-container)] text-[var(--on-primary-container)]"
                        : "bg-[var(--surface-variant)] hover:bg-[var(--outline-variant)]/30",
                    )}
                  >
                    <div>
                      <div className="font-bold">{tweak.label}</div>
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
                <div className="mt-3 px-4 py-3 rounded-[1.5rem] bg-[var(--surface-variant)] border-4 border-[var(--outline-variant)] text-[12px] leading-5 opacity-80">
                  Some desktop-only layout options are hidden on mobile.
                </div>
              )}
            </section>
          </div>
        );

      case "commandPalette":
        return (
          <section className="space-y-6">
            <div className="flex items-center gap-3 mb-7">
              <Monitor size={20} className="text-[var(--primary)]" />
              <h3 className="text-[17px] font-black tracking-[0.1em] text-[var(--on-surface-variant)]">
                Command palette
              </h3>
            </div>

            <div className="space-y-4">
              <div className="border-6 border-[var(--outline-variant)] bg-[var(--surface-variant)] rounded-[2rem] p-5">
                <div className="font-bold">Activation hotkey</div>
                <div className="text-xs opacity-60 font-medium mt-1 mb-4">
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
                      ? "rounded-[1.5rem]"
                      : isFirst
                        ? "rounded-t-[1.5rem] rounded-b-[0.9rem]"
                        : isLast
                          ? "rounded-b-[1.5rem] rounded-t-[0.9rem]"
                          : "rounded-[0.9rem]";
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => updateSettings({ paletteHotkey: option.value as any })}
                        className={cn(
                          "flex flex-col gap-2 w-full border-6 px-4 py-4 text-left transition-all",
                          roundClass,
                          active
                            ? "border-[var(--primary)] bg-[var(--primary-container)] text-[var(--on-primary-container)]"
                            : "border-[var(--outline-variant)] bg-[var(--surface)] hover:bg-[var(--surface-variant)]"
                        )}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-sm font-semibold">{option.label}</span>
                          {active && <Check size={16} />}
                        </div>
                        <span className="text-xs opacity-70">{option.desc}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="border-6 border-[var(--outline-variant)] bg-[var(--surface-variant)] rounded-[2rem] p-5">
                <div className="font-bold">Default view</div>
                <div className="text-xs opacity-60 font-medium mt-1 mb-4">
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
                      ? "rounded-[1.5rem]"
                      : isFirst
                        ? "rounded-t-[1.5rem] rounded-b-[0.9rem]"
                        : isLast
                          ? "rounded-b-[1.5rem] rounded-t-[0.9rem]"
                          : "rounded-[0.9rem]";
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => updateSettings({ paletteDefaultView: option.value as any })}
                        className={cn(
                          "flex flex-col gap-2 w-full border-6 px-4 py-4 text-left transition-all",
                          roundClass,
                          active
                            ? "border-[var(--primary)] bg-[var(--primary-container)] text-[var(--on-primary-container)]"
                            : "border-[var(--outline-variant)] bg-[var(--surface)] hover:bg-[var(--surface-variant)]"
                        )}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-sm font-semibold">{option.label}</span>
                          {active && <Check size={16} />}
                        </div>
                        <span className="text-xs opacity-70">{option.desc}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="border-6 border-[var(--outline-variant)] bg-[var(--surface-variant)] rounded-[2rem] p-5">
                <div className="font-bold">Search scope</div>
                <div className="text-xs opacity-60 font-medium mt-1 mb-4">
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
                      ? "rounded-[1.5rem]"
                      : isFirst
                        ? "rounded-t-[1.5rem] rounded-b-[0.9rem]"
                        : isLast
                          ? "rounded-b-[1.5rem] rounded-t-[0.9rem]"
                          : "rounded-[0.9rem]";
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => updateSettings({ paletteSearchScope: option.value as any })}
                        className={cn(
                          "flex flex-col gap-2 w-full border-6 px-4 py-4 text-left transition-all",
                          roundClass,
                          active
                            ? "border-[var(--primary)] bg-[var(--primary-container)] text-[var(--on-primary-container)]"
                            : "border-[var(--outline-variant)] bg-[var(--surface)] hover:bg-[var(--surface-variant)]"
                        )}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-sm font-semibold">{option.label}</span>
                          {active && <Check size={16} />}
                        </div>
                        <span className="text-xs opacity-70">{option.desc}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="border-6 border-[var(--outline-variant)] bg-[var(--surface-variant)] rounded-[2rem] p-5">
                <div className="font-bold">Results limit</div>
                <div className="text-xs opacity-60 font-medium mt-1 mb-4">
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
                          "flex items-center justify-between gap-3 w-full rounded-[1.5rem] border-6 px-4 py-4 text-left transition-all",
                          active
                            ? "border-[var(--primary)] bg-[var(--primary-container)] text-[var(--on-primary-container)]"
                            : "border-[var(--outline-variant)] bg-[var(--surface)] hover:bg-[var(--surface-variant)]"
                        )}
                      >
                        <span className="text-sm font-semibold">{limit}</span>
                        {active && <Check size={16} />}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="border-6 border-[var(--outline-variant)] bg-[var(--surface-variant)] rounded-[2rem] p-5">
                <div className="font-bold">Show recent actions</div>
                <div className="text-xs opacity-60 font-medium mt-1 mb-4">
                  Show recently selected commands when the palette opens empty.
                </div>
                <label className="flex items-center justify-between gap-4 rounded-[1.5rem] border-6 border-[var(--outline-variant)] bg-[var(--surface)] p-4">
                  <div>
                    <div className="font-bold">Recent actions</div>
                    <div className="text-xs opacity-60">Toggle recent command suggestions.</div>
                  </div>
                  <Switch
                    checked={settings.paletteShowRecentActions}
                    onChange={(checked) => updateSettings({ paletteShowRecentActions: checked })}
                  />
                </label>
              </div>

              <div className="border-6 border-[var(--outline-variant)] bg-[var(--surface-variant)] rounded-[2rem] p-5">
                <div className="font-bold">Keyboard navigation</div>
                <div className="text-xs opacity-60 font-medium mt-1 mb-4">
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
                      ? "rounded-[1.5rem]"
                      : isFirst
                        ? "rounded-t-[1.5rem] rounded-b-[0.9rem]"
                        : isLast
                          ? "rounded-b-[1.5rem] rounded-t-[0.9rem]"
                          : "rounded-[0.9rem]";
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => updateSettings({ paletteKeyboardNavBehavior: option.value as any })}
                        className={cn(
                          "flex flex-col gap-2 w-full border-6 px-4 py-4 text-left transition-all",
                          roundClass,
                          active
                            ? "border-[var(--primary)] bg-[var(--primary-container)] text-[var(--on-primary-container)]"
                            : "border-[var(--outline-variant)] bg-[var(--surface)] hover:bg-[var(--surface-variant)]"
                        )}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-sm font-semibold">{option.label}</span>
                          {active && <Check size={16} />}
                        </div>
                        <span className="text-xs opacity-70">{option.desc}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="border-6 border-[var(--outline-variant)] bg-[var(--surface-variant)] rounded-[2rem] p-5">
                <div className="font-bold">Suppress hover</div>
                <div className="text-xs opacity-60 font-medium mt-1 mb-4">
                  Keep keyboard selection fixed while moving your mouse.
                </div>
                <label className="flex items-center justify-between gap-4 rounded-[1.5rem] border-6 border-[var(--outline-variant)] bg-[var(--surface)] p-4">
                  <div>
                    <div className="font-bold">Suppress hover</div>
                    <div className="text-xs opacity-60">Allow keyboard selection to ignore pointer movement.</div>
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
            <div className="flex items-center gap-3 mb-7">
              <Fingerprint size={20} className="text-[var(--primary)]" />
              <h3 className="text-[17px] font-black tracking-[0.1em] text-[var(--on-surface-variant)]">
                Share & Backup Config
              </h3>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                className="flex items-center justify-between border-6 border-[var(--outline-variant)] p-5 bg-[var(--surface-variant)] hover:bg-[var(--primary-container)] hover:text-[var(--on-primary-container)] transition-all text-left rounded-[1.5rem] group cursor-pointer"
              >
                <div>
                  <div className="font-bold">Copy config link</div>
                  <div className="text-xs opacity-60 font-medium">
                    Get config as link
                  </div>
                </div>
                <ExternalLink
                  size={20}
                  className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"
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
                className="flex items-center justify-between border-6 border-[var(--outline-variant)] p-5 bg-[var(--surface-variant)] hover:bg-[var(--primary-container)] hover:text-[var(--on-primary-container)] transition-all text-left rounded-[1.5rem] group cursor-pointer"
              >
                <div>
                  <div className="font-bold">Export config file</div>
                  <div className="text-xs opacity-60 font-medium">
                    Get config as JSON
                  </div>
                </div>
                <Download
                  size={20}
                  className="group-hover:translate-y-0.5 transition-transform"
                />
              </button>
            </div>

            <div className="border-6 border-[var(--outline-variant)] bg-[var(--surface-variant)] p-5 rounded-[1.5rem] space-y-4">
              <div className="font-bold text-sm">Importing Your Config</div>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Paste sharing link/code here..."
                  className="flex-1 min-w-0 truncate bg-[var(--surface)] text-[var(--on-surface)] border-5 border-[var(--outline-variant)] rounded-xl px-4 py-2 text-[13px] font-black focus:outline-none focus:border-[var(--primary)]"
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
                  whileTap={{ scaleX: 1.08, scaleY: 0.88 }}
                  transition={{ type: "spring", stiffness: 1200, damping: 10, mass: 0.02 }}
                  onClick={() => {
                    haptic.light();
                  }}
                  className="shrink-0 whitespace-nowrap bg-[var(--primary)] text-[var(--on-primary)] hover:bg-[var(--primary-container)] hover:text-[var(--on-primary-container)] px-4 py-2 rounded-xl text-[10px] font-bold transition-all flex items-center justify-center cursor-pointer select-none"
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
              <div className="text-[13px] opacity-50 font-medium">
                Press Enter to apply pasted sharing link. Pressing `ENTER` WILL update your theme immediately.
              </div>
            </div>
          </section>
        );

      case "debug":
        return (
          <div className="space-y-8">
          <section className="space-y-6">
            <div className="flex items-center gap-3 mb-7">
              <Cpu size={20} className="text-[var(--primary)]" />
              <h3 className="text-[17px] font-black tracking-[0.1em] text-[var(--on-surface-variant)]">
                Debug Settings & Info
              </h3>
            </div>
            <div className="flex flex-col gap-1">
              <label
                className={cn(
                  "flex items-center border-6 border-[var(--outline-variant)] justify-between p-5 transition-all text-left cursor-pointer rounded-[2rem]",
                  settings.debugMode
                    ? "bg-[var(--primary-container)] text-[var(--on-primary-container)]"
                    : "bg-[var(--surface-variant)] hover:bg-[var(--outline-variant)]/30",
                )}
              >
                <div>
                  <div className="font-bold">Debug Mode</div>
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
              <div className="flex items-center gap-3 mb-7">
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
                className="w-full flex items-center justify-between border-6 border-[var(--outline-variant)]  p-5 bg-[var(--surface-variant)] hover:bg-[var(--primary-container)] hover:text-[var(--on-primary-container)] transition-all text-left rounded-[2rem] group cursor-pointer"
              >
                <div>
                  <div className="font-bold">View changelog</div>
                  <div className="text-xs opacity-60 font-medium">
                    See what's new in 2026.09.14-stable
                  </div>                </div>
                <ChevronRight
                  size={20}
                  className="group-hover:translate-x-1 transition-transform"
                />
              </button>
            </section>
            </div>

        );

      case "about":
        return (
          <div className="space-y-8">

            <section className="space-y-6">
              <div className="flex items-center gap-3 mb-7">
                <Bug size={20} className="text-[var(--primary)]" />
                <h3 className="text-[17px] font-black tracking-[0.1em] text-[var(--on-surface-variant)]">
                  Feedback
                </h3>
              </div>
              <div className="flex flex-col gap-1">
                <button
                  onClick={() => {
                    handleClose();
                    onReportBug();
                    haptic.light();
                  }}
                  className="w-full flex items-center justify-between border-6 border-[var(--outline-variant)] p-5 bg-[var(--surface-variant)] hover:bg-[var(--primary-container)] hover:text-[var(--on-primary-container)] transition-all text-left rounded-t-[2rem] rounded-b-[0.9rem] group cursor-pointer"
                >
                  <div>
                    <div className="font-bold">Report a bug</div>
                    <div className="text-xs opacity-60 font-medium">
                      Help us make virex.lol better by reporting issues
                    </div>
                  </div>
                  <ChevronRight
                    size={20}
                    className="group-hover:translate-x-1 transition-transform"
                  />
                </button>
                <button
                  onClick={() => {
                    handleClose();
                    onOpenKnownIssuess();
                    haptic.light();
                  }}
                  className="w-full flex items-center justify-between border-6 border-[var(--outline-variant)] p-5 bg-[var(--surface-variant)] hover:bg-[var(--primary-container)] hover:text-[var(--on-primary-container)] transition-all text-left rounded-b-[2rem] rounded-t-[0.9rem] group cursor-pointer"
                >
                  <div>
                    <div className="font-bold">Known issues</div>
                    <div className="text-xs opacity-60 font-medium">
                      View bugs that have already been reported
                    </div>
                  </div>
                  <ChevronRight
                    size={20}
                    className="group-hover:translate-x-1 transition-transform"
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
                ? "w-full h-[100dvh] max-w-none max-h-none rounded-t-[2rem] border-none" 
                : "w-full md:max-w-[700px] md:h-[780px] max-h-[90vh] rounded-[2rem] md:rounded-[2.8rem] border-3 border-[var(--outline-variant)]"
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
                  "flex justify-between items-center border-b-3 border-[var(--outline-variant)] bg-[var(--surface)] sticky top-0 z-10 shrink-0",
                  is_mobile ? "p-4" : "p-6 md:p-8"
                )}
              >
                <div className="flex items-center gap-3">
                  {is_mobile && activePage !== "menu" && (
                    <button
                      onClick={() => navigateTo("menu")}
                      aria-label="Back to settings menu"
                      className="group w-10 h-10 rounded-full bg-[var(--surface-variant)]/60 hover:bg-[var(--surface-variant)] border-3 border-[var(--outline-variant)]/50 flex items-center justify-center transition-all cursor-pointer text-[var(--on-surface)] active:scale-95 shrink-0 shadow-sm"
                    >
                      <ChevronLeft size={20} className="transition-transform duration-300 ease-out group-hover:-translate-x-0.5 group-hover:scale-110" />
                    </button>
                  )}
                  <div className="w-10 h-10 rounded-full bg-[var(--primary-container)]/60 border-3 border-[var(--primary)]/20 flex items-center justify-center shrink-0 text-[var(--primary)] shadow-sm">
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
                      <span>Settings</span>
                    )}
                  </h2>
                </div>
                <button
                  onClick={() => {
                    haptic.medium();
                    handleClose();
                  }}
                  aria-label="Close settings dialog"
                  className="group w-10 h-10 rounded-full bg-[var(--surface-variant)]/60 hover:bg-[var(--surface-variant)] border-3 border-[var(--outline-variant)]/50 flex items-center justify-center transition-all cursor-pointer text-[var(--on-surface)] active:scale-95 shrink-0 shadow-sm"
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
                        <div className="flex flex-col gap-1">
                          {visibleMainPages.map((page, index, arr) => {
                            const PageIcon = page.icon;
                            const isFirst = index === 0;
                            const isLast = index === arr.length - 1;
                            const isSingle = arr.length === 1;
                            const roundedClass = isSingle
                              ? "rounded-[2rem]"
                              : isFirst
                                ? "rounded-t-[2rem] rounded-b-[0.9rem]"
                                : isLast
                                  ? "rounded-b-[2rem] rounded-t-[0.9rem]"
                                  : "rounded-[0.9rem]";
                            return (
                              <button
                                key={page.id}
                                onClick={() => {
                                  haptic.light();
                                  navigateTo(page.id);
                                }}
                                className={cn(
                                  "w-full flex items-center justify-between border-6 border-[var(--outline-variant)] p-4 bg-[var(--surface-variant)]/50 hover:bg-[var(--primary-container)] hover:text-[var(--on-primary-container)] transition-all text-left group cursor-pointer",
                                  roundedClass
                                )}
                              >
                                <div className="flex items-center gap-4">
                                  <div className="w-10 h-10 flex items-center justify-center rounded-full border-[3px] border-[var(--outline-variant)] text-[var(--primary)] bg-[var(--surface)] group-hover:bg-[var(--primary)] group-hover:text-[var(--on-primary)] group-hover:border-[var(--primary)] transition-all shrink-0">
                                    <PageIcon size={18} className={cn("shrink-0", page.id === "debug" && "-translate-x-[0.9px]")} />
                                  </div>
                                  <div>
                                    <div className="font-bold text-[15px]">{page.title}</div>
                                    <div className="text-xs opacity-60 font-medium">
                                      {page.desc}
                                    </div>
                                  </div>
                                </div>
                                <ChevronRight
                                  size={20}
                                  className="group-hover:translate-x-1 transition-transform opacity-50"
                                />
                              </button>
                            );
                          })}
                        </div>

                        {/* divider + bottom pages — wrapped together so they stay anchored as a unit */}
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-4 px-1 pt-2 pb-2">
                            <div className="flex-1 h-px bg-[var(--outline-variant)]/50" />
                            <span className="text-[14px] font-black tracking-[0.1em] opacity-30">More</span>
                            <div className="flex-1 h-px bg-[var(--outline-variant)]/50" />
                          </div>
                          {BOTTOM_PAGES.map((page, index, arr) => {
                            const PageIcon = page.icon;
                            const isFirst = index === 0;
                            const isLast = index === arr.length - 1;
                            const isSingle = arr.length === 1;
                            const roundedClass = isSingle
                              ? "rounded-[2rem]"
                              : isFirst
                                ? "rounded-t-[2rem] rounded-b-[0.9rem]"
                                : isLast
                                  ? "rounded-b-[2rem] rounded-t-[0.9rem]"
                                  : "rounded-[0.9rem]";
                            return (
                              <button
                                key={page.id}
                                onClick={() => {
                                  haptic.light();
                                  navigateTo(page.id);
                                }}
                                className={cn(
                                  "w-full flex items-center justify-between border-6 border-[var(--outline-variant)] p-4 bg-[var(--surface-variant)]/30 hover:bg-[var(--primary-container)] hover:text-[var(--on-primary-container)] transition-all text-left group cursor-pointer opacity-80 hover:opacity-100",
                                  roundedClass
                                )}
                              >
                                <div className="flex items-center gap-4">
                                  <div className="w-10 h-10 flex items-center justify-center rounded-full border-[3px] border-[var(--outline-variant)] text-[var(--on-surface-variant)] bg-[var(--surface)] group-hover:bg-[var(--primary)] group-hover:text-[var(--on-primary)] group-hover:border-[var(--primary)] transition-all shrink-0">
                                    <PageIcon size={18} className={cn("shrink-0", page.id === "debug" && "-translate-x-[0.5px]")} />
                                  </div>
                                  <div>
                                    <div className="font-bold text-[15px]">{page.title}</div>
                                    <div className="text-xs opacity-60 font-medium">
                                      {page.desc}
                                    </div>
                                  </div>
                                </div>
                                <ChevronRight
                                  size={20}
                                  className="group-hover:translate-x-1 transition-transform opacity-50"
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
                  {/* left nav sidebar — mobile-style card buttons, compact */}
                  <div className="w-[230px] border-r border-[var(--outline-variant)]/60 bg-[var(--surface-variant)]/20 py-4 px-3 flex flex-col overflow-y-auto shrink-0 select-none">
                    {/* main nav items */}
                    <div className="flex flex-col gap-[3px]">
                      {MAIN_PAGES.map((p, index, arr) => {
                        const PageIcon = p.icon;
                        const isActive = activePage === p.id;
                        const isSingle = arr.length === 1;
                        const isFirst = index === 0;
                        const isLast = index === arr.length - 1;
                        const roundedClass = isSingle
                          ? "rounded-[2rem]"
                          : isFirst
                            ? "rounded-t-[1.5rem] rounded-b-[0.9rem]"
                            : isLast
                              ? "rounded-b-[1.5rem] rounded-t-[0.9rem]"
                              : "rounded-[0.9rem]";
                        return (
                          <motion.button
                            key={p.id}
                            onClick={() => {
                              haptic.light();
                              navigateTo(p.id);
                            }}
                            whileHover={!isActive ? { scale: 1.02 } : {}}
                            whileTap={{ scale: 0.96 }}
                            animate={{
                              backgroundColor: isActive ? "var(--primary-container)" : "transparent",
                              borderColor: isActive ? "var(--primary-container)" : "var(--outline-variant)",
                            }}
                            transition={{ type: "spring", stiffness: 350, damping: 22 }}
                            className={cn(
                              "grid grid-cols-[28px_1fr_15px] items-center px-3 py-2.5 border-[5px] cursor-pointer w-full group justify-items-center",
                              roundedClass,
                              isActive
                                ? "text-[var(--on-primary-container)] font-bold"
                                : "text-[var(--on-surface-variant)] hover:text-[var(--on-surface)]"
                            )}
                            aria-current={isActive ? "page" : undefined}
                          >
                            <motion.div
                              animate={{
                                backgroundColor: isActive ? "var(--primary)" : "var(--surface)",
                                borderColor: isActive ? "var(--primary)" : "var(--outline-variant)",
                                color: isActive ? "var(--on-primary)" : "var(--primary)",
                              }}
                              transition={{ type: "spring", stiffness: 350, damping: 22 }}
                              className="w-7 h-7 flex items-center justify-center rounded-full border-[2px] shrink-0"
                            >
                              <PageIcon size={14} />
                            </motion.div>
                            <span className="text-[13px] font-semibold text-center">{p.title}</span>
                          </motion.button>
                        );
                      })}
                    </div>

                    {/* spacer + divider */}
                    <div className="mt-auto pt-3">
                      <div className="flex items-center gap-2 mb-2 px-1">
                        <div className="flex-1 h-px bg-[var(--outline-variant)]/40" />
                      </div>
                      <div className="flex flex-col gap-[3px]">
                        {BOTTOM_PAGES.map((p, index, arr) => {
                          const PageIcon = p.icon;
                          const isActive = activePage === p.id;
                          const isSingle = arr.length === 1;
                          const isFirst = index === 0;
                          const isLast = index === arr.length - 1;
                          const roundedClass = isSingle
                            ? "rounded-[1.5rem]"
                            : isFirst
                              ? "rounded-t-[1.5rem] rounded-b-[0.6rem]"
                              : isLast
                                ? "rounded-b-[1.5rem] rounded-t-[0.6rem]"
                                : "rounded-[0.6rem]";
                          return (
                            <motion.button
                              key={p.id}
                              onClick={() => {
                                haptic.light();
                                navigateTo(p.id);
                              }}
                              whileHover={!isActive ? { scale: 1.02 } : {}}
                              whileTap={{ scale: 0.96 }}
                              animate={{
                                backgroundColor: isActive ? "var(--primary-container)" : "transparent",
                                borderColor: isActive ? "var(--primary-container)" : "var(--outline-variant)",
                                opacity: isActive ? 1 : 0.7,
                              }}
                              transition={{ type: "spring", stiffness: 350, damping: 22 }}
                              className={cn(
                                "grid grid-cols-[28px_1fr_15px] items-center px-3 py-2.5 border-[5px] cursor-pointer w-full group hover:opacity-100 justify-items-center",
                                roundedClass,
                                isActive
                                  ? "text-[var(--on-primary-container)] font-bold"
                                  : "text-[var(--on-surface-variant)] hover:text-[var(--on-surface)]"
                              )}
                            >
                              <motion.div
                                animate={{
                                  backgroundColor: isActive ? "var(--primary)" : "var(--surface)",
                                  borderColor: isActive ? "var(--primary)" : "var(--outline-variant)",
                                  color: isActive ? "var(--on-primary)" : "var(--on-surface-variant)",
                                }}
                                transition={{ type: "spring", stiffness: 350, damping: 22 }}
                                className="w-7 h-7 flex items-center justify-center rounded-full border-[2px] shrink-0"
                              >
                                <PageIcon size={14} className={cn("shrink-0", (p.id === "debug" || p.id === "info") && "translate-x-[0.5px]")} />
                              </motion.div>
                              <span className="text-[13px] font-semibold text-center">{p.title}</span>
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
