import React, { useState, memo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "../constants";
import { haptic } from "../haptics";
import { ChevronRight } from "./MaterialIcon";
import { ExpressiveTooltip } from "./ExpressiveTooltip";

export const SideItem = memo(
  ({
    glyph: Icon,
    text,
    isSelected,
    onSelect,
    isMini,
    isFirst,
    isLast,
    isFloating,
    isShort,
    layoutId,
    highHz,
    isFlipped,
  }: any) => {
    const [isHovered, setIsHovered] = useState(false);

    const squishySpring = {
      type: "spring" as const,
      stiffness: highHz ? 450 : 380,
      damping: highHz ? 32 : 28,
      mass: 0.6,
    };

    const rd =
      isFirst && isLast
        ? "rounded-[24px]"
        : isFirst
          ? "rounded-t-[22px] rounded-b-[6px]"
          : isLast
            ? "rounded-t-[6px] rounded-b-[22px]"
            : "rounded-[6px]";

    if (isMini) {
      return (
        <motion.button
          initial={false}
          animate={{
            opacity: 1,
            scale: 1,
          }}
          transition={squishySpring}
          whileHover={{ scale: 1.08, rotate: 2 }}
          whileTap={{ scale: 0.92, rotate: -4 }}
          onClick={(e) => {
            haptic.light();
            onSelect(e);
          }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className={cn(
            "relative group outline-none cursor-pointer select-none flex flex-col justify-center items-center w-full shadow-none bg-transparent gap-0 sidebar-item",
            isShort ? "h-12" : "h-16",
            isSelected && "active",
          )}
        >
          {/* icon container */}
          <div className="relative z-10 shrink-0 flex items-center justify-center h-8 w-14 border-0 shadow-none outline-none ring-0">
            {/* m3 active indicator pill (mini version) */}
            {isSelected && (
              <motion.div
                layoutId="sidebar-active-indicator"
                transition={squishySpring}
                className="absolute inset-0 bg-[var(--primary-container)] rounded-full z-0 sidebar-pill border-0 shadow-none outline-none ring-0"
              />
            )}

            {/* mini hover pill */}
            {isHovered && !isSelected && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 0.8, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.15 }}
                className="absolute inset-0 bg-[var(--surface-variant)] rounded-full -z-10 border-0 shadow-none outline-none ring-0"
              />
            )}

            <div
              className={cn(
                "relative z-10 flex items-center justify-center transition-transform duration-200 ease-out",
                isSelected
                  ? "text-[var(--on-primary-container)] scale-110 -rotate-6"
                  : isHovered
                    ? text === "Settings"
                      ? "text-[var(--primary)] scale-105 rotate-45"
                      : "text-[var(--primary)] scale-105 -rotate-3"
                    : "text-[var(--on-surface-variant)] scale-100 rotate-0"
              )}
            >
              <Icon size={24} weight={isSelected ? 600 : 450} fill={false} />
            </div>
          </div>

          <span className="text-[11px] font-expressive font-black uppercase tracking-widest mt-1 opacity-60 group-hover:opacity-100 transition-opacity relative z-10 italic">
            {text}
          </span>

          <ExpressiveTooltip text={text} show={isHovered} isFlipped={isFlipped} />
        </motion.button>
      );
    }

    return (
      <motion.button
        initial={false}
        animate={{
          opacity: 1,
          scale: 1,
          x: 0,
        }}
        transition={squishySpring}
        whileHover={{ scale: 1.015, x: 4 }}
        whileTap={{ scale: 0.98, x: -1 }}
        onClick={(e) => {
          haptic.light();
          onSelect(e);
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={cn(
          "relative group outline-none cursor-pointer flex items-center w-full px-3.5 gap-3.5 transition-colors duration-200 sidebar-item select-none border-0 shadow-none ring-0",
          isFloating ? "py-4" : isShort ? "py-2.5" : "py-3.5",
          rd,
          isSelected
            ? "bg-[var(--primary-container)] text-[var(--on-primary-container)]"
            : "bg-[var(--surface-variant)]/40 text-[var(--on-surface)] hover:bg-[var(--surface-variant)]/80"
        )}
      >
        {/* left icon container */}
        <div
          className={cn(
            "relative z-10 shrink-0 flex items-center justify-center w-11 h-11 rounded-full transition-colors duration-200 border-0 shadow-none outline-none ring-0",
            isSelected
              ? "bg-[var(--primary)] text-[var(--on-primary)]"
              : "bg-[var(--surface)] text-[var(--primary)]"
          )}
        >
          <div
            className={cn(
              "flex items-center justify-center transition-transform duration-200 ease-out",
              isSelected
                ? "scale-105 -rotate-6"
                : isHovered
                  ? text === "Settings"
                    ? "scale-105 rotate-45"
                    : "scale-105 -rotate-3"
                  : "scale-100 rotate-0"
            )}
          >
            <Icon size={24} weight={isSelected ? 600 : 450} fill={false} />
          </div>
        </div>

        {/* centered text */}
        <span
          className={cn(
            "flex-1 text-center font-bold tracking-[1.6px] text-[18px] relative z-10 transition-colors duration-200 leading-none",
            isSelected
              ? "text-[var(--on-primary-container)] font-black"
              : "text-[var(--on-surface)] font-bold opacity-90 group-hover:opacity-100"
          )}
        >
          {text}
        </span>

        {/* small semi-opaque chevron right on right with no container */}
        <div className="shrink-0 flex items-center justify-center w-5 relative z-10">
          <ChevronRight
            size={20}
            className={cn(
              "transition-all duration-200",
              isSelected
                ? "text-[var(--on-primary-container)] opacity-60"
                : "text-[var(--on-surface-variant)] opacity-35 group-hover:opacity-80 group-hover:translate-x-0.5"
            )}
          />
        </div>
      </motion.button>
    );
  },
);

