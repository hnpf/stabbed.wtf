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
  Upload,
  Link,
  Terminal,
  ChevronRight,
  ChevronLeft,
  Bug,
  Sparkles,
} from "./MaterialIcon";
import { M3TextField } from "./M3TextField";
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
    const pages = ["menu", "appearance", "interface", "motion", "commandPalette", "system"];
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
    { id: "appearance", title: "Appearance", desc: "Theme mode, colors, palettes & lens", icon: Palette },
    { id: "interface", title: "Interface & Layout", desc: "Typography, sidebar dock, zen & layout", icon: Layers },
    { id: "motion", title: "Motion & Extras", desc: "Hero animation, 3D tilt & widgets", icon: Sparkles },
    { id: "commandPalette", title: "Command Palette", desc: "Palette activation, search scope, and results", icon: Monitor },
  ] as const;

  const visibleMainPages = is_mobile
    ? MAIN_PAGES.filter((page) => page.id !== "commandPalette")
    : MAIN_PAGES;

  const BOTTOM_PAGES = [
    { id: "system", title: "Backup & System", desc: "Config backup, changelog, diagnostics & bugs", icon: Fingerprint },
  ] as const;

  const PAGES = [...MAIN_PAGES, ...BOTTOM_PAGES] as const;

  const currentPageTitle = PAGES.find(p => p.id === activePage)?.title || "Settings";
  const [importText, setImportText] = React.useState("");
  const [shareCopied, setShareCopied] = React.useState(false);
  const [backupExported, setBackupExported] = React.useState(false);

  const applyImportedSettings = React.useCallback((decoded: unknown) => {
    if (!decoded || typeof decoded !== "object" || Array.isArray(decoded)) {
      throw new Error("Config must be an object");
    }

    const imported = decoded as Record<string, unknown>;
    const validatedSettings: Record<string, unknown> = {};
    for (const key of Object.keys(settings)) {
      if (imported[key] !== undefined) validatedSettings[key] = imported[key];
    }
    if (Object.keys(validatedSettings).length === 0) {
      throw new Error("No supported settings found");
    }
    updateSettings(validatedSettings);
  }, [settings, updateSettings]);

  const importFromLink = React.useCallback(() => {
    const value = importText.trim();
    if (!value) return;
    try {
      let capsule = value;
      if (value.includes("theme=")) {
        const urlParams = new URLSearchParams(value.substring(value.indexOf("?")));
        capsule = urlParams.get("theme") || value;
      }
      applyImportedSettings(JSON.parse(atob(capsule)));
      setImportText("");
      setToast("config has been loaded!");
      haptic.light();
    } catch {
      setToast("non valid capsule code or link :(");
    }
  }, [applyImportedSettings, importText, setToast]);

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
            <div className="flex items-center gap-3 mb-6">
              <Palette size={20} className="text-[var(--primary)]" />
              <h3 className="text-[17px] font-black tracking-[0.1em] text-[var(--on-surface-variant)] font-display">
                Appearance & Theme
              </h3>
            </div>

            {/* Theme Mode */}
            <div className="bg-[var(--surface-variant)]/40 rounded-2xl p-5 border-0 space-y-4">
              <div className="text-[13px] font-black tracking-[0.05em] text-[var(--primary)]">
                Theme Mode
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
                }}
                transition={settingsSpring}
                className="overflow-hidden"
              >
                <label
                  className={cn(
                    "flex items-center justify-between p-4.5 rounded-2xl transition-all text-left cursor-pointer border-0 mt-2",
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
            </div>

            {/* Color & Palette */}
            <div className="bg-[var(--surface-variant)]/40 rounded-2xl p-5 border-0 space-y-4">
              <div className="text-[13px] font-black tracking-[0.05em] text-[var(--primary)]">
                Color & Palette
              </div>
              <div className="space-y-3">
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
                  <div className="text-sm font-bold opacity-70 text-[var(--on-surface)] mb-1">
                    Color palette
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
            </div>

            {/* Dynamic Theming */}
            <div className="bg-[var(--surface-variant)]/40 rounded-2xl p-5 border-0 space-y-3">
              <div className="text-[13px] font-black tracking-[0.05em] text-[var(--primary)]">
                Dynamic Theming
              </div>
              <label
                className={cn(
                  "flex items-center justify-between p-4.5 rounded-2xl transition-all text-left cursor-pointer border-0",
                  settings.lensDynamicTheming
                    ? "bg-[var(--primary-container)] text-[var(--on-primary-container)]"
                    : "bg-[var(--surface-variant)] hover:bg-[var(--on-primary-container)]/10 text-[var(--on-surface)]",
                )}
              >
                <div>
                  <div className="font-bold text-[15px]">Lens Dynamic Theming</div>
                  <div className="text-xs opacity-60 font-medium">
                    Match the theme to an expanded Lens photo
                  </div>
                </div>
                <Switch
                  checked={settings.lensDynamicTheming}
                  onChange={(checked) =>
                    updateSettings({ lensDynamicTheming: checked })
                  }
                />
              </label>
            </div>
          </section>
        );

      case "interface":
        return (
          <section className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <Layers size={20} className="text-[var(--primary)]" />
              <h3 className="text-[17px] font-black tracking-[0.1em] text-[var(--on-surface-variant)] font-display">
                Interface & Layout
              </h3>
            </div>

            {/* Typography & Styling */}
            <div className="bg-[var(--surface-variant)]/40 rounded-2xl p-5 border-0 space-y-3.5">
              <div className="text-[13px] font-black tracking-[0.05em] text-[var(--primary)]">
                Typography & Styling
              </div>

              {/* custom font scaling */}
              <div className="px-1 py-2 text-[var(--on-surface)] space-y-3.5">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <div className="font-bold text-[15px]">Custom Font Scaling</div>
                    <div className="text-xs opacity-60 font-medium">
                      Scale font size whilst keeping size contrast & hierarchy
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs font-black px-2.5 py-1 rounded-full bg-[var(--primary-container)] text-[var(--on-primary-container)]">
                      {(settings.fontScale ?? 100) === 100 ? "100% (Default)" : `${settings.fontScale}%`}
                    </span>
                    {(settings.fontScale ?? 100) !== 100 && (
                      <button
                        onClick={() => {
                          updateSettings({ fontScale: 100 });
                          haptic.light();
                        }}
                        className="text-[11px] font-black px-2 py-1 rounded-lg bg-[var(--surface)] hover:bg-[var(--primary-container)] text-[var(--primary)] transition-colors cursor-pointer border-0"
                        title="Reset font scaling to default"
                      >
                        Reset
                      </button>
                    )}
                  </div>
                </div>

                <div className="pt-1">
                  <Slider
                    value={settings.fontScale ?? 100}
                    onChange={(v: number) => updateSettings({ fontScale: v })}
                    min={80}
                    max={125}
                    step={5}
                    stops={true}
                    endStops={true}
                    size="s"
                    leadingIcon={<span className="font-bold text-xs select-none">A</span>}
                    trailingIcon={<span className="font-black text-lg select-none">A</span>}
                    format={(v: number) => (v === 100 ? "100% (Default)" : `${v}%`)}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                {[
                  {
                    key: "developerFont",
                    label: "Developer Font",
                    desc: "Use JetBrains Mono as the primary UI typeface",
                  },
                  {
                    key: "brutalistMode",
                    label: "Brutalist Mode",
                    desc: "Brutal styling with sharp corners globally",
                  },
                ].map((tweak) => (
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
            </div>

            {/* Navigation & Sidebar */}
            <div className="bg-[var(--surface-variant)]/40 rounded-2xl p-5 border-0 space-y-3">
              <div className="text-[13px] font-black tracking-[0.05em] text-[var(--primary)]">
                Navigation & Sidebar
              </div>
              <div className="flex flex-col gap-2">
                {[
                  {
                    key: "sidebarFlipped",
                    label: "Flip Sidebar",
                    desc: "Changes desktop sidebar position to the right",
                  },
                  {
                    key: "floatingSidebar",
                    label: "Floating Sidebar",
                    desc: "Floating sidebar state with rounded corners",
                  },
                  {
                    key: "profileContainer",
                    label: "Profile Container",
                    desc: "Toggles a clean container around the profile",
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
            </div>

            {/* Layout Modes */}
            <div className="bg-[var(--surface-variant)]/40 rounded-2xl p-5 border-0 space-y-3">
              <div className="text-[13px] font-black tracking-[0.05em] text-[var(--primary)]">
                Layout Modes
              </div>
              <div className="flex flex-col gap-2">
                {[
                  {
                    key: "focusMode",
                    label: "Focus Mode",
                    desc: "A focused, minimal zen layout",
                  },
                  {
                    key: "forceDesktop",
                    label: "Force Desktop",
                    desc: "Stops mobile mode switching on small displays",
                  },
                  {
                    key: "infoFullscreen",
                    label: "Info Page Fullscreen",
                    desc: "Hides navigation bars when on the /info page",
                  },
                ].map((tweak) => (
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
                <div className="mt-2 px-4 py-3 rounded-2xl bg-[var(--surface-variant)]/60 text-[12px] leading-5 opacity-80 border-0">
                  Some desktop-only layout options are hidden on mobile.
                </div>
              )}
            </div>
          </section>
        );

      case "motion":
        return (
          <section className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <Sparkles size={20} className="text-[var(--primary)]" />
              <h3 className="text-[17px] font-black tracking-[0.1em] text-[var(--on-surface-variant)] font-display">
                Motion & Extras
              </h3>
            </div>

            {/* Animations & Physics */}
            <div className="bg-[var(--surface-variant)]/40 rounded-2xl p-5 border-0 space-y-3">
              <div className="text-[13px] font-black tracking-[0.05em] text-[var(--primary)]">
                Animations & Physics
              </div>
              <div className="flex flex-col gap-2">
                {[
                  {
                    key: "helloAnimation",
                    label: "Hello Animation",
                    desc: "Toggles the hero language cycling animation",
                  },
                  {
                    key: "bentoTilt",
                    label: "3D Card Tilt",
                    desc: "Cursor-tracking parallax tilt effect on cards",
                  },
                  {
                    key: "disableAnimations",
                    label: "Disable Animations",
                    desc: "Disables motion & transitions (requires refresh!)",
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
              </div>
            </div>

            {/* Widgets & Preferences */}
            <div className="bg-[var(--surface-variant)]/40 rounded-2xl p-5 border-0 space-y-3">
              <div className="text-[13px] font-black tracking-[0.05em] text-[var(--primary)]">
                Widgets & Preferences
              </div>
              <div className="flex flex-col gap-2">
                {[
                  {
                    key: "metricUnits",
                    label: "Metric Units",
                    desc: "Use metric (°C, km/h) units. off = imperial",
                  },
                  {
                    key: "dynamicWeatherLocation",
                    label: "Local Weather Detection",
                    desc: "Use your city for weatherwidget (off shows virex's)",
                  },
                ].map((tweak) => (
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
            </div>
          </section>
        );

      case "commandPalette":
        return (
          <section className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <Monitor size={20} className="text-[var(--primary)]" />
              <h3 className="text-[17px] font-black tracking-[0.1em] text-[var(--on-surface-variant)] font-display">
                Command palette
              </h3>
            </div>

            <div className="space-y-4">
              {/* Shortcuts & Default View */}
              <div className="bg-[var(--surface-variant)]/40 rounded-2xl p-5 border-0">
                <div className="text-[13px] font-black tracking-[0.05em] text-[var(--primary)] mb-4">
                  Shortcuts & Default View
                </div>
                <div className="space-y-4">
                  <div>
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

                  <div className="pt-2 border-t border-[var(--outline-variant)]/20">
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
                </div>
              </div>

              {/* Search Scope & Limit */}
              <div className="bg-[var(--surface-variant)]/40 rounded-2xl p-5 border-0">
                <div className="text-[13px] font-black tracking-[0.05em] text-[var(--primary)] mb-4">
                  Search Scope & Limit
                </div>
                <div className="space-y-4">
                  <div>
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

                  <div className="pt-2 border-t border-[var(--outline-variant)]/20">
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
                </div>
              </div>

              {/* Interaction & Behavior */}
              <div className="bg-[var(--surface-variant)]/40 rounded-2xl p-5 border-0 space-y-4">
                <div className="text-[13px] font-black tracking-[0.05em] text-[var(--primary)] mb-4">
                  Interaction & Behavior
                </div>

                <div>
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

                <div className="pt-2 border-t border-[var(--outline-variant)]/20 space-y-2">
                  <label className="flex items-center justify-between gap-4 p-4.5 rounded-2xl bg-[var(--surface)] hover:bg-[var(--surface-variant)]/60 text-[var(--on-surface)] transition-all cursor-pointer">
                    <div>
                      <div className="font-bold text-[15px]">Recent actions</div>
                      <div className="text-xs opacity-60 font-medium mt-0.5">Toggle recent command suggestions when palette is empty.</div>
                    </div>
                    <Switch
                      checked={settings.paletteShowRecentActions}
                      onChange={(checked) => updateSettings({ paletteShowRecentActions: checked })}
                    />
                  </label>

                  <label className="flex items-center justify-between gap-4 p-4.5 rounded-2xl bg-[var(--surface)] hover:bg-[var(--surface-variant)]/60 text-[var(--on-surface)] transition-all cursor-pointer">
                    <div>
                      <div className="font-bold text-[15px]">Suppress hover</div>
                      <div className="text-xs opacity-60 font-medium mt-0.5">Allow keyboard selection to ignore pointer movement.</div>
                    </div>
                    <Switch
                      checked={settings.paletteSuppressHover}
                      onChange={(checked) => updateSettings({ paletteSuppressHover: checked })}
                    />
                  </label>
                </div>
              </div>
            </div>
          </section>
        );

      case "system":
        return (
          <section className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <Fingerprint size={20} className="text-[var(--primary)]" />
              <h3 className="text-[17px] font-black tracking-[0.1em] text-[var(--on-surface-variant)] font-display">
                Backup & System
              </h3>
            </div>
            
            {/* Share & Backup */}
            <div className="bg-[var(--surface-variant)]/40 rounded-2xl p-5 border-0 space-y-4">
              <div className="text-[13px] font-black tracking-[0.05em] text-[var(--primary)]">
                Share & Backup
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <motion.button
                  onClick={async () => {
                    try {
                      const str = btoa(JSON.stringify(settings));
                      const shareUrl = `${window.location.origin}/?theme=${str}`;
                      await navigator.clipboard.writeText(shareUrl);
                      setToast("Sharing link copied to clipboard!");
                      setShareCopied(true);
                      window.setTimeout(() => setShareCopied(false), 1800);
                    } catch (e) {
                      setToast("Failed to generate sharing link! :(");
                    }
                    haptic.light();
                  }}
                  whileHover={settings.disableAnimations ? undefined : { y: -2 }}
                  whileTap={settings.disableAnimations ? undefined : { scale: 0.98 }}
                  animate={shareCopied && !settings.disableAnimations ? { scale: [1, 1.025, 0.99, 1] } : { scale: 1 }}
                  transition={{ type: "spring", stiffness: 480, damping: 25, mass: 0.55 }}
                  className={cn(
                    "flex items-center justify-between p-4.5 transition-colors text-left rounded-2xl group cursor-pointer border-0",
                    shareCopied
                      ? "bg-[var(--primary-container)] text-[var(--on-primary-container)]"
                      : "bg-[var(--surface-variant)] hover:bg-[var(--primary-container)] hover:text-[var(--on-primary-container)] text-[var(--on-surface)]",
                  )}
                  aria-live="polite"
                >
                  <div>
                    <div className="font-bold text-[15px]">{shareCopied ? "Link copied!" : "Copy config link"}</div>
                    <div className="text-xs opacity-60 font-medium">
                      {shareCopied ? "Ready to share" : "Get config as link"}
                    </div>
                  </div>
                  <AnimatePresence mode="wait" initial={false}>
                    {shareCopied ? (
                      <motion.span key="copied" initial={{ opacity: 0, scale: 0.65, rotate: -35 }} animate={{ opacity: 1, scale: 1, rotate: 0 }} exit={{ opacity: 0, scale: 0.65 }} transition={{ type: "spring", stiffness: 520, damping: 20 }}>
                        <Check size={20} />
                      </motion.span>
                    ) : (
                      <motion.span key="share" initial={{ opacity: 0, scale: 0.65, rotate: 25 }} animate={{ opacity: 0.6, scale: 1, rotate: 0 }} exit={{ opacity: 0, scale: 0.65 }} transition={{ type: "spring", stiffness: 520, damping: 20 }}>
                        <ExternalLink size={20} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.button>

                <motion.button
                  onClick={() => {
                    try {
                      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(settings, null, 2));
                      const downloadAnchor = document.createElement('a');
                      downloadAnchor.setAttribute("href", dataStr);
                      downloadAnchor.setAttribute("download", "virexconf.json");
                      downloadAnchor.click();
                      downloadAnchor.remove();
                      setToast("backup downloaded!");
                      setBackupExported(true);
                      window.setTimeout(() => setBackupExported(false), 1800);
                    } catch (e) {
                      setToast("failed to download backup :(");
                    }
                    haptic.light();
                  }}
                  whileHover={settings.disableAnimations ? undefined : { y: -2 }}
                  whileTap={settings.disableAnimations ? undefined : { scale: 0.98 }}
                  animate={backupExported && !settings.disableAnimations ? { scale: [1, 1.025, 0.99, 1] } : { scale: 1 }}
                  transition={{ type: "spring", stiffness: 480, damping: 25, mass: 0.55 }}
                  className={cn(
                    "flex items-center justify-between p-4.5 transition-colors text-left rounded-2xl group cursor-pointer border-0",
                    backupExported
                      ? "bg-[var(--primary-container)] text-[var(--on-primary-container)]"
                      : "bg-[var(--surface-variant)] hover:bg-[var(--primary-container)] hover:text-[var(--on-primary-container)] text-[var(--on-surface)]",
                  )}
                  aria-live="polite"
                >
                  <div>
                    <div className="font-bold text-[15px]">{backupExported ? "Downloaded!" : "Export config file"}</div>
                    <div className="text-xs opacity-60 font-medium">
                      {backupExported ? "Saved virexconf.json" : "Get config as JSON"}
                    </div>
                  </div>
                  <AnimatePresence mode="wait" initial={false}>
                    {backupExported ? (
                      <motion.span key="downloaded" initial={{ opacity: 0, scale: 0.65, rotate: -35 }} animate={{ opacity: 1, scale: 1, rotate: 0 }} exit={{ opacity: 0, scale: 0.65 }} transition={{ type: "spring", stiffness: 520, damping: 20 }}>
                        <Check size={20} />
                      </motion.span>
                    ) : (
                      <motion.span key="download" initial={{ opacity: 0, scale: 0.65, y: -4 }} animate={{ opacity: 0.6, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.65, y: 4 }} transition={{ type: "spring", stiffness: 520, damping: 20 }}>
                        <Download size={20} className="group-hover:translate-y-0.5 transition-transform" />
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.button>
              </div>

              <div className="rounded-2xl bg-[var(--surface-variant)] p-4.5 space-y-3">
                <div>
                  <div className="font-bold text-[15px]">Restore a saved setup</div>
                  <p className="mt-0.5 text-[12px] font-medium opacity-60">
                    Paste a config link or choose a virexconf.json backup. Your available settings update right away.
                  </p>
                </div>
                <M3TextField
                  type="text"
                  label="Config link or code"
                  leadingIcon={Link}
                  value={importText}
                  onChange={(event) => setImportText(event.target.value)}
                  onEnter={importFromLink}
                  trailing={{ icon: ChevronRight, label: "Apply config link", onClick: importFromLink, disabled: !importText.trim() }}
                  aria-describedby="config-restore-help"
                />
                <div className="flex items-center gap-3" aria-hidden="true">
                  <div className="h-px flex-1 bg-[var(--outline-variant)]/50" />
                  <span className="text-[11px] font-bold uppercase tracking-[0.12em] opacity-45">or</span>
                  <div className="h-px flex-1 bg-[var(--outline-variant)]/50" />
                </div>
                <label className="group flex min-h-14 cursor-pointer items-center gap-3 rounded-xl border border-dashed border-[var(--outline-variant)]/80 bg-[var(--surface)] px-4 py-2.5 text-[var(--on-surface)] transition-colors hover:border-[var(--primary)] hover:bg-[var(--primary-container)] hover:text-[var(--on-primary-container)] focus-within:outline focus-within:outline-2 focus-within:outline-[var(--primary)]">
                  <span className="flex size-9 items-center justify-center rounded-lg bg-[var(--surface-variant)] text-[var(--primary)] transition-colors group-hover:bg-[var(--primary)] group-hover:text-[var(--on-primary)]">
                    <Upload size={20} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[13px] font-bold">Choose a backup file</span>
                    <span className="block truncate text-[11px] font-medium opacity-60">JSON backup exported from virex.lol</span>
                  </span>
                  <ChevronRight size={20} className="opacity-55 transition-transform group-hover:translate-x-0.5" />
                  <input
                    type="file"
                    accept="application/json,.json"
                    className="sr-only"
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.onload = () => {
                        try {
                          applyImportedSettings(JSON.parse(String(reader.result)));
                          setToast("settings have been restored from backup!");
                          haptic.light();
                        } catch {
                          setToast("non valid backup JSON file :(");
                        } finally {
                          event.target.value = "";
                        }
                      };
                      reader.readAsText(file);
                    }}
                  />
                </label>
                <p id="config-restore-help" className="text-[11px] font-medium opacity-50">
                  Restore replaces only settings included in the link or backup; it never uploads your file.
                </p>
              </div>
            </div>

            {/* Support & Diagnostics */}
            <div className="bg-[var(--surface-variant)]/40 rounded-2xl p-5 border-0 space-y-3">
              <div className="text-[13px] font-black tracking-[0.05em] text-[var(--primary)]">
                Support & Diagnostics
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

                <button
                  onClick={() => {
                    handleClose();
                    goto("changelog");
                  }}
                  className="w-full flex items-center justify-between p-4.5 bg-[var(--surface-variant)] hover:bg-[var(--on-primary-container)]/20 hover:text-[var(--on-primary-container)] transition-all text-left rounded-2xl group cursor-pointer border-0 text-[var(--on-surface)]"
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

                <button
                  onClick={() => {
                    handleClose();
                    onReportBug();
                    haptic.light();
                  }}
                  className="w-full flex items-center justify-between p-4.5 bg-[var(--surface-variant)] hover:bg-[var(--on-primary-container)]/20 hover:text-[var(--on-primary-container)] transition-all text-left rounded-2xl group cursor-pointer border-0 text-[var(--on-surface)]"
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
                  className="w-full flex items-center justify-between p-4.5 bg-[var(--surface-variant)] hover:bg-[var(--on-primary-container)]/20 hover:text-[var(--on-primary-container)] transition-all text-left rounded-2xl group cursor-pointer border-0 text-[var(--on-surface)]"
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
            </div>
          </section>
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
      isDraggingSheet.current = false;
      
      touchTimes.current = [{ y: touch.clientY, t: Date.now() }];
    };

    const handleTouchMoveRaw = (e: TouchEvent) => {
      const touch = e.touches[0];
      const clientY = touch.clientY;
      const deltaY = clientY - dragStartY.current;
      const isInsideScroll = scrollRef.current?.contains(e.target as Node) ?? false;
      const scrollTop = scrollRef.current ? scrollRef.current.scrollTop : 0;
      
      touchTimes.current.push({ y: clientY, t: Date.now() });
      if (touchTimes.current.length > 5) {
        touchTimes.current.shift();
      }

      if (!isDraggingSheet.current) {
        const sheetDragThreshold = 8;
        const hasDraggedFarEnough = Math.abs(deltaY) >= sheetDragThreshold;
        const canDragSheet = !isInsideScroll || dragStartModalY.current > 0 || (scrollTop <= 0 && deltaY > 0);

        if (!hasDraggedFarEnough || !canDragSheet) {
          return;
        }

        isDraggingSheet.current = true;
      }

      if (isDraggingSheet.current) {
        if (e.cancelable) {
          e.preventDefault();
        }
        
        const proposedY = dragStartModalY.current + deltaY;
        const topRubberBandDistance = 96;
        const newY = proposedY < 0
          ? -(((-proposedY) * topRubberBandDistance) / ((-proposedY) + topRubberBandDistance))
          : proposedY;
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
                        <div className="flex flex-col gap-1">
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
                                    <PageIcon size={20} className="shrink-0" />
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
                        <div className="flex flex-col gap-1 mt-4">
                          <div className="flex items-center gap-4 px-1 pt-1 pb-1">
                            <div className="flex-1 h-px bg-[var(--outline-variant)]/30" />
                            <span className="text-[12px] font-black tracking-[0.1em] uppercase opacity-40 font-expressive">System & Support</span>
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
                                  <div className="w-10 h-10 flex items-center justify-center rounded-full bg-[var(--surface)] text-[var(--primary)] group-hover:bg-[var(--primary)] group-hover:text-[var(--on-primary)] transition-colors duration-200 shrink-0 border-0 shadow-xs">
                                    <div className="flex items-center justify-center transition-transform duration-200 ease-out group-hover:scale-105">
                                      <PageIcon size={20} className="shrink-0" />
                                    </div>
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
                  {/* left nav sidebar */}
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
                                "w-9 h-9 flex items-center justify-center rounded-full transition-colors duration-200 shrink-0 border-0 shadow-none",
                                isActive
                                    ? "bg-[var(--primary)] text-[var(--on-primary)] shadow-sm"
                                    : "bg-[var(--surface)] text-[var(--primary)]"
                              )}
                            >
                              <div className="flex items-center justify-center transition-transform duration-200 ease-out group-hover:scale-105">
                                <PageIcon size={18} fill={false} weight={isActive ? 600 : 450} />
                              </div>
                            </div>

                            {/* centered label */}
                            <span className={cn(
                              "flex-1 text-center font-display tracking-tight text-md leading-none",
                              isActive ? "font-black text-[var(--on-primary-container)]" : "font-bold text-[var(--on-surface)]"
                            )}>
                              {p.title}
                            </span>

                            {/* right chevron */}
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

                    {/* spacer + bottom pages (Backup & System) */}
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
                                  "w-9 h-9 flex items-center justify-center rounded-full transition-colors duration-200 shrink-0 border-0 shadow-none",
                                  isActive
                                    ? "bg-[var(--primary)] text-[var(--on-primary)] shadow-sm"
                                    : "bg-[var(--surface)] text-[var(--primary)]"
                                )}
                              >
                                <div className="flex items-center justify-center transition-transform duration-200 ease-out group-hover:scale-105">
                                  <PageIcon size={18} fill={false} weight={isActive ? 600 : 450} />
                                </div>
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
