import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import { useTheme } from "../ThemeContext";
import { cn } from "../constants";

export interface ExpressiveTooltipProps {
  text?: React.ReactNode;
  show: boolean;
  isFlipped?: boolean;
  anchorRef?: React.RefObject<HTMLElement | null>;
  className?: string;
}

export const ExpressiveTooltip = ({
  text,
  show,
  isFlipped,
  anchorRef,
  className = "",
}: ExpressiveTooltipProps) => {
  const innerRef = useRef<HTMLSpanElement>(null);
  const [coords, setCoords] = useState<{ top: number; left?: number; right?: number } | null>(null);

  let themeFlipped = false;
  try {
    const { settings } = useTheme();
    themeFlipped = settings?.sidebarFlipped ?? false;
  } catch (e) {
    // In case used outside ThemeProvider
  }

  const flipped = isFlipped !== undefined ? isFlipped : themeFlipped;

  useEffect(() => {
    if (!show) {
      setCoords(null);
      return;
    }

    const targetEl = anchorRef?.current || innerRef.current?.parentElement;
    if (!targetEl) return;

    const updateCoords = () => {
      const rect = targetEl.getBoundingClientRect();
      if (rect.width === 0 && rect.height === 0) return;
      // Slightly bias towards the top half to align with icon centers
      const top = rect.top + rect.height / 2 - 1;
      if (flipped) {
        setCoords({ top, right: window.innerWidth - rect.left + 10 });
      } else {
        setCoords({ top, left: rect.right + 10 });
      }
    };

    updateCoords();
    window.addEventListener("scroll", updateCoords, true);
    window.addEventListener("resize", updateCoords);
    return () => {
      window.removeEventListener("scroll", updateCoords, true);
      window.removeEventListener("resize", updateCoords);
    };
  }, [show, flipped, anchorRef]);

  if (!text) return null;

  return (
    <>
      <span ref={innerRef} className="hidden" aria-hidden="true" />
      {typeof document !== "undefined" &&
        createPortal(
          <AnimatePresence>
            {show && coords && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, x: flipped ? 6 : -6, y: "-50%" }}
                animate={{ opacity: 1, scale: 1, x: 0, y: "-50%" }}
                exit={{ opacity: 0, scale: 0.9, x: flipped ? 6 : -6, y: "-50%" }}
                transition={{
                  type: "spring",
                  stiffness: 480,
                  damping: 30,
                  mass: 0.5,
                }}
                style={{
                  position: "fixed",
                  top: coords.top,
                  left: coords.left !== undefined ? coords.left : undefined,
                  right: coords.right !== undefined ? coords.right : undefined,
                  zIndex: 99999,
                }}
                className={cn(
                  "pointer-events-none select-none flex items-center justify-center px-2.5 py-1 rounded-xl bg-[var(--primary)] text-[var(--on-primary)] font-expressive font-black text-[11px] tracking-wider uppercase italic leading-none shadow-xl shadow-[var(--primary)]/25 border border-white/25 dark:border-white/15 whitespace-nowrap will-change-transform",
                  className
                )}
              >
                {text}
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </>
  );
};
