// @ts-nocheck
import React, { memo } from "react";
import { motion, AnimatePresence, useTransform, MotionValue } from "motion/react";

// 7-sided cookie path from the site's existing ScrollToTopButton shapes
const COOKIE_PATH =
  "M142.7 51.8l7-6a66 66 0 0 1 87.6 6l2.4 2A66 66 0 0 0 272 68.6l9 1.8a66 66 0 0 1 50.4 63.2l-.3 9.2-.2 3.2a66 66 0 0 0 7.2 31.6l1.5 2.9a66.2 66.2 0 0 1-13.7 87l-7.3 5.4c-1.3 1-2 1.4-2.6 2a66 66 0 0 0-21.4 28.2c-2 4.4-2.8 6.6-3.8 8.5a66 66 0 0 1-81.5 32.7l-3.1-.8a66 66 0 0 0-32.4 0l-3 .8-9 2.4A66 66 0 0 1 85.5 303l-1.3-2.9A66 66 0 0 0 64 274.7l-2.6-1.9a66.2 66.2 0 0 1-25.3-84.3c.9-1.9 2-4 4.3-8.1l1.5-2.9A66 66 0 0 0 49 146l-.2-3.2-.3-9.2A66 66 0 0 1 99 70.3c2-.5 4.4-1 9-1.8l3.2-.5a66 66 0 0 0 31.6-16.2z";

interface OverscrollContainerProps {
  active: boolean;
  edge: "top" | "bottom" | null;
  y: MotionValue<number>;
}

export const OverscrollContainer = memo(({ active, edge, y }: OverscrollContainerProps) => {
  const isTop = edge === "top";
  const heightTransform = useTransform(y, (v) => Math.max(0, Math.abs(v)));

  return (
    <AnimatePresence>
      {edge && (
        <motion.div
          key={edge}
          aria-hidden
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed left-4 right-4 sm:left-8 sm:right-8 max-w-xl mx-auto pointer-events-none z-50 flex flex-col items-center justify-center overflow-hidden"
          style={{
            [isTop ? "top" : "bottom"]: 0,
            height: heightTransform,
            backgroundColor: "var(--surface-variant)",
            // Top overscroll: bottom corners rounded like a card (0 0 28px 28px)
            // Bottom overscroll: top corners rounded like a card (28px 28px 0 0)
            borderRadius: isTop ? "0 0 28px 28px" : "28px 28px 0 0",
            boxShadow: isTop
              ? "0 16px 36px -6px rgba(0,0,0,0.3)"
              : "0 -16px 36px -6px rgba(0,0,0,0.3)",
          }}
        >
          {/* Centered on screen with comfortable gap from sidebar */}
          <AnimatePresence>
            {active && (
              <motion.div
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.6 }}
                transition={{ type: "spring", stiffness: 420, damping: 22, mass: 0.7 }}
                className="flex flex-col items-center justify-center"
              >
                {/* 7-sided cookie badge with wobble animation */}
                <motion.div
                  className="relative flex items-center justify-center shrink-0"
                  style={{ width: 68, height: 68 }}
                  animate={{ rotate: [0, -8, 8, -5, 5, 0] }}
                  transition={{
                    duration: 0.7,
                    ease: "easeInOut",
                    repeat: Infinity,
                    repeatDelay: 0.8,
                  }}
                >
                  <svg viewBox="0 0 380 380" className="absolute inset-0 w-full h-full drop-shadow-xl">
                    <path d={COOKIE_PATH} fill="var(--primary)" />
                  </svg>
                  <div className="relative z-10 flex items-center justify-center w-full h-full select-none text-[30px] leading-none pointer-events-none">
                    👋
                  </div>
                </motion.div>

                {/* Pill label without borders */}
                <motion.span
                  initial={{ opacity: 0, y: isTop ? -6 : 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1, type: "spring", stiffness: 380, damping: 24 }}
                  className="mt-1 px-3 py-0.5 rounded-full text-[10px] font-black tracking-widest whitespace-nowrap shadow-md"
                  style={{
                    backgroundColor: "var(--primary-container)",
                    color: "var(--on-primary-container)",
                  }}
                >
                  {isTop ? "That's the top!" : "That's the bottom!"}
                </motion.span>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
});
OverscrollContainer.displayName = "OverscrollContainer";

export const OverscrollUnderlay = () => null;
export const OverscrollWave = () => null;
