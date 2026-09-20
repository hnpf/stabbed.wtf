// @ts-nocheck
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowUp, Sparkles } from "./MaterialIcon";
import { cn } from "../constants";
import { haptic } from "../haptics";

export type TopButtonShape = "clover" | "cookie" | "squircle";

const SHAPES: Record<TopButtonShape, { d: string; name: string }> = {
  clover: {
    name: "4-leaf clover",
    d: "M230.4 50.5a75.4 75.4 0 0 1 99.1 99.1L325 160a75 75 0 0 0 0 60l4.5 10.4a75.4 75.4 0 0 1-99.1 99.1L220 325a75 75 0 0 0-60 0l-10.4 4.5a75.4 75.4 0 0 1-99.1-99.1L55 220a75 75 0 0 0 0-60l-4.5-10.4a75.4 75.4 0 0 1 99.1-99.1L160 55a75 75 0 0 0 60 0z",
  },
  cookie: {
    name: "7-sided cookie",
    d: "M142.7 51.8l7-6a66 66 0 0 1 87.6 6l2.4 2A66 66 0 0 0 272 68.6l9 1.8a66 66 0 0 1 50.4 63.2l-.3 9.2-.2 3.2a66 66 0 0 0 7.2 31.6l1.5 2.9a66.2 66.2 0 0 1-13.7 87l-7.3 5.4c-1.3 1-2 1.4-2.6 2a66 66 0 0 0-21.4 28.2c-2 4.4-2.8 6.6-3.8 8.5a66 66 0 0 1-81.5 32.7l-3.1-.8a66 66 0 0 0-32.4 0l-3 .8-9 2.4A66 66 0 0 1 85.5 303l-1.3-2.9A66 66 0 0 0 64 274.7l-2.6-1.9a66.2 66.2 0 0 1-25.3-84.3c.9-1.9 2-4 4.3-8.1l1.5-2.9A66 66 0 0 0 49 146l-.2-3.2-.3-9.2A66 66 0 0 1 99 70.3c2-.5 4.4-1 9-1.8l3.2-.5a66 66 0 0 0 31.6-16.2z",
  },
  squircle: {
    name: "M3 squircle",
    d: "",
  },
};

interface ScrollToTopButtonProps {
  showTop: boolean;
  isMobile: boolean;
  showBottomNav: boolean;
  scrollDirection: "up" | "down";
  settings: any;
  updateSettings?: (newSettings: any) => void;
}

export const ScrollToTopButton: React.FC<ScrollToTopButtonProps> = ({
  showTop,
  isMobile,
  showBottomNav,
  scrollDirection,
  settings,
  updateSettings,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [suppressExpand, setSuppressExpand] = useState(false);
  const hintTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const shape: TopButtonShape = settings.toTopShape || "clover";

  // desktop expands on hover (unless just clicked); mobile expands when scrolling up
  const isExpanded = !suppressExpand && (isHovered || (isMobile && scrollDirection === "up" && !settings.focusMode));
  const isFlipped = settings.sidebarFlipped;

  const clearHintTimer = () => {
    if (hintTimer.current) {
      clearTimeout(hintTimer.current);
      hintTimer.current = null;
    }
    setShowHint(false);
  };

  useEffect(() => {
    if (isHovered && !isMobile && !suppressExpand) {
      hintTimer.current = setTimeout(() => {
        setShowHint(true);
      }, 750);
    } else {
      clearHintTimer();
    }
    return () => {
      clearHintTimer();
    };
  }, [isHovered, isMobile, suppressExpand]);

  const cycleShape = (e: React.MouseEvent) => {
    e.preventDefault();
    clearHintTimer();
    if (!updateSettings) return;
    const nextShape: Record<TopButtonShape, TopButtonShape> = {
      clover: "cookie",
      cookie: "squircle",
      squircle: "clover",
    };
    updateSettings({ toTopShape: nextShape[shape] });
  };

  const handleClick = (e: React.MouseEvent) => {
    e.currentTarget.blur();
    clearHintTimer();
    setSuppressExpand(true);
    setIsHovered(false);
    setIsClicked(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
    setTimeout(() => {
      setIsClicked(false);
    }, 350);
  };

  const handleMouseEnter = () => {
    setSuppressExpand(false);
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setSuppressExpand(false);
    setIsHovered(false);
    clearHintTimer();
  };

  if (!showTop) return null;

  const currentSvgPath = SHAPES[shape]?.d;

  return (
    <AnimatePresence>
      <motion.div
        key={isFlipped ? "top-btn-flipped" : "top-btn-normal"}
        initial={{ opacity: 0, scale: 0.8, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.8, y: 20 }}
        transition={{ type: "spring", stiffness: 450, damping: 24 }}
        className={cn(
          "fixed z-50 select-none pointer-events-auto",
          isMobile
            ? (showBottomNav ? "bottom-[calc(env(safe-area-inset-bottom,12px)_+_84px)]" : "bottom-20")
            : "bottom-12 lg:bottom-12",
          isFlipped ? "left-6 lg:left-12" : "right-6 lg:right-12"
        )}
      >
        {/* tuff context hint! */}
        <AnimatePresence>
          {showHint && (
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.88 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.88 }}
              transition={{ type: "spring", stiffness: 450, damping: 24 }}
              className={cn(
                "absolute -top-13 z-50 pointer-events-none flex flex-col items-center",
                isFlipped ? "left-4" : "right-4"
              )}
            >
              <div className="bg-[var(--surface-variant)]/95 border-3 border-[var(--outline)]/40 text-[var(--on-surface-variant)] px-3 py-1.5 rounded-2xl text-[11px] font-bold tracking-wider shadow-xl backdrop-blur-xl flex items-center gap-1.5 whitespace-nowrap">
                <Sparkles size={13} className="text-[var(--primary)]" />
                <span>Right-click to change icon shape! :)</span>
              </div>
              {/* tail pointer */}
              <div className="w-2.5 h-2.5 bg-[var(--surface-variant)] border-r-2 border-b-2 border-[var(--outline-variant)] rotate-45 -mt-1.5" />
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          layout
          initial={{ scale: 1, y: 0 }}
          whileHover={{ scale: 1.04, y: -3 }}
          whileTap={{ scale: 0.94, y: 1 }}
          transition={{ type: "spring", stiffness: 450, damping: 25 }}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onClick={(e) => {
            haptic.light();
            handleClick?.(e);
          }}
          onContextMenu={cycleShape}
          className={cn(
            "flex items-center justify-center rounded-full group cursor-pointer outline-none focus:outline-none select-none",
            isExpanded
              ? (isMobile
                ? "p-1 bg-[var(--surface-container)]/95 backdrop-blur-xl shadow-lg"
                : "p-1.5 md:p-2 border-6 border-[var(--outline)]/40 bg-[var(--surface-variant)]/95 backdrop-blur-xl shadow-2xl")
              : "p-0 bg-transparent shadow-none",
            isFlipped ? "flex-row" : "flex-row-reverse"
          )}
        >
          {/* m3 expressive shape icon badge */}
          <motion.div
            layout
            animate={{
              scale: isClicked ? 0.95 : 1,
              rotate: 0,
            }}
            transition={{
              type: "spring",
              stiffness: 450,
              damping: 22,
            }}
            className={cn(
              "relative flex items-center justify-center shrink-0 p-0",
              "w-12 h-12 md:w-20 md:h-20"
            )}
          >
            {shape === "squircle" ? (
              <div className="absolute inset-0 bg-[var(--primary)] rounded-2xl md:rounded-[2rem] shadow-md" />
            ) : (
              <svg
                viewBox="0 0 380 380"
                className="absolute inset-0 w-full h-full"
              >
                <path
                  d={currentSvgPath}
                  fill="var(--primary)"
                  stroke="var(--outline-variant)"
                  strokeWidth="16"
                />
              </svg>
            )}

            {/* arrow icon in shape badge */}
            <div className="relative z-10 text-[var(--on-primary)] flex items-center justify-center pointer-events-none w-full h-full">
              <ArrowUp
                className="text-[var(--on-primary)] w-6 h-6 md:w-10 md:h-10 shrink-0"
                strokeWidth={3}
              />
            </div>
          </motion.div>

          {/* expanding Label */}
          <motion.div
            layout
            initial={false}
            animate={{
              maxWidth: isExpanded ? 200 : 0,
              opacity: isExpanded ? 1 : 0,
            }}
            transition={{
              type: "spring",
              stiffness: 350,
              damping: 25,
            }}
            className="overflow-hidden flex items-center whitespace-nowrap"
          >
            <span
              className={cn(
                "font-expressive-bold font-black text-xs md:text-lg tracking-[0.15em] md:tracking-[0.25em] text-[var(--on-surface-variant)] group-hover:text-[var(--on-surface)] transition-colors duration-200",
                isFlipped ? "pl-2 pr-3 md:pl-5 md:pr-6" : "pr-2 pl-3 md:pr-6 md:pl-5"
              )}
            >
              To top!
            </span>
          </motion.div>
        </motion.button>
      </motion.div>
    </AnimatePresence>
  );
};
