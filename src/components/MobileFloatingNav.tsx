import React, { useState, useCallback, useRef, useEffect } from "react";
import { motion, MotionConfig } from "motion/react";
import { cn } from "../constants";
import { haptic } from "../haptics";
import { useTheme } from "../ThemeContext";
import { Ripple } from "./Ripple";

/* types*/
interface NavItem {
  key: string;
  glyph: React.ElementType;
  label: string;
}

interface Props {
  items: NavItem[];
  activePage: string;
  onSelect: (key: string) => void;
  onSettings: () => void;
  settingsGlyph: React.ElementType;
  /** layoutId shared with desktop settings icon = shared-element animation */
  settingsLayoutId?: string;
}

/*  spring presets  */
const PILL_SPRING = {
  type: "spring" as const,
  stiffness: 500,
  damping: 32,
  mass: 0.7,
};

const BOUNCE_SPRING = {
  type: "spring" as const,
  stiffness: 700,
  damping: 18,
  mass: 0.5,
};

const ACTIVE_PILL_SPRING = {
  type: "spring" as const,
  stiffness: 520,
  damping: 36,
  mass: 0.5,
};

const ICON_SPRING = {
  type: "spring" as const,
  stiffness: 520,
  damping: 38,
  mass: 0.45,
};

const LABEL_SPRING = {
  type: "spring" as const,
  stiffness: 480,
  damping: 38,
  mass: 0.45,
};

const SETTINGS_SPRING = {
  type: "spring" as const,
  stiffness: 420,
  damping: 32,
  mass: 1.1,
  restDelta: 0.001,
};

/*  single nav pill item  */
const NavPillItem = React.memo(
  ({
    item,
    isActive,
    onSelect,
    highHz,
  }: {
    item: NavItem;
    isActive: boolean;
    onSelect: () => void;
    highHz: boolean;
  }) => {
    const [pressed, setPressed] = useState(false);
    const Icon = item.glyph;

    const spring = highHz
      ? { ...PILL_SPRING, stiffness: 600, damping: 36 }
      : PILL_SPRING;

    const bounceSpring = highHz
      ? { ...BOUNCE_SPRING, stiffness: 800, damping: 20 }
      : BOUNCE_SPRING;

    const handleClick = useCallback(() => {
      haptic.light();
      onSelect();
    }, [onSelect]);

    return (
      <motion.button
        layout
        onClick={handleClick}
        onPointerDown={() => setPressed(true)}
        onPointerUp={() => setPressed(false)}
        onPointerLeave={() => setPressed(false)}
        animate={pressed ? { scale: 0.92, y: 1 } : { scale: 1, y: 0 }}
        transition={pressed ? { duration: 0.08 } : spring}
        className={cn(
          "relative flex items-center justify-center outline-none cursor-pointer shrink-0 select-none overflow-hidden",
          isActive ? "gap-2 px-4 py-3 rounded-full" : "w-10 h-10 rounded-full",
        )}
        aria-label={item.label}
        aria-pressed={isActive}
      >
        <Ripple enableHaptics={false} />
        {isActive && (
          <motion.div
            layout
            layoutId="mobile-nav-active-pill"
            initial={false}
            animate={{
              opacity: 1,
              scaleX: 1,
              scaleY: 1,
            }}
            transition={ACTIVE_PILL_SPRING}
            className="absolute inset-0 rounded-full z-0 pointer-events-none"
            style={{
              backgroundColor: "var(--primary)",
              boxShadow: "0 16px 32px -18px rgba(79, 70, 229, 0.85)",
            }}
          />
        )}

        {/* icon */}
        <motion.div
          animate={{
            scale: isActive ? 1.18 : 1,
            rotate: isActive ? -8 : 0,
          }}
          transition={ICON_SPRING}
          style={{
            color: isActive
              ? "var(--on-primary)"
              : "var(--on-surface)",
          }}
          className="relative z-[1] shrink-0 flex items-center justify-center"
        >
          <Icon size={20} strokeWidth={isActive ? 2.8 : 2} />
        </motion.div>

        {/* this still uses AnimatePresence, safe here tho since it
            doesnt interfere w the buttons layout anim */}
        <motion.span
          layout
          initial={false}
          animate={{
            opacity: isActive ? 1 : 0,
            maxWidth: isActive ? 128 : 0,
            x: isActive ? 0 : -8,
          }}
          transition={{ ...LABEL_SPRING, duration: 0.24 }}
          className="relative z-[1] inline-block text-[11px] pr-1 font-expressive font-black uppercase tracking-widest italic whitespace-nowrap overflow-hidden"
          style={{
            color: "var(--on-primary)",
          }}
        >
          <span className="inline-block px-0">
            {item.label}
          </span>
        </motion.span>
      </motion.button>
    );
  },
);

/*  settings squircle  */
const SettingsSquircle = React.memo(
  ({
    glyph: Icon,
    onPress,
    layoutId,
    highHz,
    size,
  }: {
    glyph: React.ElementType;
    onPress: () => void;
    layoutId?: string;
    highHz: boolean;
    size: number;
  }) => {
    const [pressed, setPressed] = useState(false);
    const [hovered, setHovered] = useState(false);

    const handleClick = useCallback(() => {
      haptic.ripple();
      onPress();
    }, [onPress]);

    const spring = highHz
      ? SETTINGS_SPRING
      : { ...SETTINGS_SPRING, stiffness: 340, damping: 28 };

    return (
      <motion.button
        onClick={handleClick}
        onPointerDown={() => setPressed(true)}
        onPointerUp={() => setPressed(false)}
        onPointerLeave={() => { setPressed(false); setHovered(false); }}
        onHoverStart={() => setHovered(true)}
        onHoverEnd={() => setHovered(false)}
        animate={
          pressed
            ? { scale: 0.88, rotate: 5 }
            : { scale: 1, rotate: 0 }
        }
        transition={spring}
        aria-label="Settings"
        className="relative flex items-center justify-center outline-none cursor-pointer shrink-0 overflow-hidden"
        style={{
          width: size,
          height: size,
          borderRadius: size * 0.32,
          backgroundColor: "var(--surface-container)",
          boxShadow: "0 4px 16px -2px rgba(0,0,0,0.18), 0 1px 4px -1px rgba(0,0,0,0.1)",
        }}
      >
        <Ripple enableHaptics={false} />
        {/* settings icon shared element w/ desktop */}
        <motion.div
          layoutId={layoutId}
          style={{ color: "var(--on-surface)" }}
          className="relative z-[1] flex items-center justify-center"
        >
          <Icon size={Math.round(size * 0.48)} strokeWidth={2} />
        </motion.div>
      </motion.button>
    );
  },
);

/*  main component  */
export const MobileFloatingNav = React.memo(
  ({
    items,
    activePage,
    onSelect,
    onSettings,
    settingsGlyph,
    settingsLayoutId,
  }: Props) => {
    const { settings } = useTheme();
    const highHz = settings.highHz;

    /* pill height driving squircle size */
    const PILL_H = 64;
    const SQUIRCLE_SIZE = Math.round(PILL_H * 0.88);
    const SIDE_PAD = Math.round(PILL_H * 0.5);

    const prevPage = useRef(activePage);
    const [bounce, setBounce] = useState(false);

    /* bounce whole pill when the page changes */
    useEffect(() => {
      if (prevPage.current !== activePage) {
        prevPage.current = activePage;
        setBounce(true);
        const t = setTimeout(() => setBounce(false), 420);
        return () => clearTimeout(t);
      }
    }, [activePage]);

    const pillSpring = highHz
      ? { ...PILL_SPRING, stiffness: 600, damping: 36 }
      : PILL_SPRING;

    return (
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: "spring", damping: 28, stiffness: 140 }}
        className="fixed z-40 flex items-center"
        style={{
          bottom: `calc(env(safe-area-inset-bottom, 12px) + 12px)`,
          left: SIDE_PAD,
          right: SIDE_PAD,
          gap: 10,
        }}
      >
        {/* main pill */}
        <motion.div
          layout
          animate={
            bounce
              ? { y: [-6, 0], scale: [1.04, 1] }
              : { y: 0, scale: 1 }
          }
          transition={
            bounce
              ? {
                  y: {
                    type: "spring",
                    stiffness: highHz ? 900 : 700,
                    damping: highHz ? 22 : 18,
                    mass: 0.5,
                  },
                  scale: {
                    type: "spring",
                    stiffness: highHz ? 700 : 550,
                    damping: highHz ? 18 : 15,
                    mass: 0.4,
                  },
                }
              : pillSpring
          }
          className="flex-1 flex items-center justify-around relative"
          style={{
            height: PILL_H,
            borderRadius: PILL_H / 2,
            backgroundColor: "var(--surface-container)",
            paddingLeft: 8,
            paddingRight: 8,
            boxShadow:
              "0 8px 24px -6px rgba(0,0,0,0.18), 0 2px 6px -2px rgba(0,0,0,0.10)",
          }}
        >
          <MotionConfig reducedMotion={settings.disableAnimations ? "always" : "user"}>
            {items.map((item) => (
              <NavPillItem
                key={item.key}
                item={item}
                isActive={activePage === item.key}
                onSelect={() => onSelect(item.key)}
                highHz={highHz}
              />
            ))}
          </MotionConfig>
        </motion.div>

        {/* settings squircle */}
        <SettingsSquircle
          glyph={settingsGlyph}
          onPress={onSettings}
          layoutId={settingsLayoutId}
          highHz={highHz}
          size={SQUIRCLE_SIZE}
        />
      </motion.div>
    );
  },
);

MobileFloatingNav.displayName = "MobileFloatingNav";
