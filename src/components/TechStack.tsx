// @ts-nocheck
import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Loader2 } from "./MaterialIcon";
import { cn } from "../constants";

export const BounceButton = ({
  icon: Icon,
  label,
  url,
  onClick,
  className = "",
  disabled = false,
  loading: externalLoading,
  title,
  iconClassName = "",
  layout = false,
  layoutId,
  isMini = false,
  transition,
}: {
  icon?: any;
  label?: React.ReactNode;
  url?: string;
  onClick?: (e: React.MouseEvent) => void;
  className?: string;
  disabled?: boolean;
  loading?: boolean;
  title?: string;
  iconClassName?: string;
  layout?: boolean | "position" | "size";
  layoutId?: string;
  isMini?: boolean;
  transition?: any;
}) => {
  const [internalLoading, set_loading] = useState(false);
  const isLoading = externalLoading ?? internalLoading;

  const _on_click = (e: React.MouseEvent) => {
    if (disabled || isLoading) {
      e.preventDefault();
      return;
    }
    if (onClick) {
      onClick(e);
      return;
    }
    if (!url) return;
    e.preventDefault();
    set_loading(true);
    setTimeout(() => {
      window.open(url, "_blank");
      set_loading(false);
    }, 600);
  };

  return (
    <motion.button
      layout={layout}
      layoutId={layoutId}
      whileHover={
        disabled || isLoading
          ? undefined
          : {
              scale: 1.04,
              y: -2,
            }
      }
      whileTap={disabled || isLoading ? undefined : { scale: 0.98, rotate: -0.5 }}
      transition={
        transition || {
          type: "spring",
          stiffness: 450,
          damping: 28,
          mass: 0.6,
        }
      }
      onClick={_on_click}
      disabled={disabled || isLoading}
      title={title || (typeof label === "string" ? label : undefined)}
      aria-label={title || (typeof label === "string" ? label : undefined)}
      className={cn(
        "relative overflow-hidden cursor-pointer select-none",
        (disabled || isLoading) && "cursor-not-allowed opacity-60 pointer-events-none",
        className,
      )}
    >
      <AnimatePresence mode="wait">
        {internalLoading && !onClick && externalLoading === undefined ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center justify-center gap-2"
          >
            <Loader2 size={18} className="animate-spin" />
          </motion.div>
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="flex items-center justify-center w-full h-full"
          >
            {Icon && (
              <div className="flex items-center justify-center shrink-0">
                <Icon size={isMini ? 22 : 18} className={cn("shrink-0", iconClassName)} />
              </div>
            )}
            {label && (
              <motion.span
                initial={false}
                animate={{
                  opacity: isMini ? 0 : 1,
                  maxWidth: isMini ? 0 : 140,
                  marginLeft: isMini ? 0 : 8,
                }}
                transition={{
                  opacity: {
                    duration: isMini ? 0.1 : 0.2,
                    delay: isMini ? 0 : 0.08,
                    ease: "easeInOut",
                  },
                  maxWidth: transition || {
                    type: "spring",
                    stiffness: 450,
                    damping: 28,
                    mass: 0.6,
                  },
                  marginLeft: transition || {
                    type: "spring",
                    stiffness: 450,
                    damping: 28,
                    mass: 0.6,
                  },
                }}
                className="whitespace-nowrap overflow-hidden inline-flex items-center"
                style={{ pointerEvents: isMini ? "none" : "auto" }}
              >
                {typeof label === "string" ? <span className="font-bold">{label}</span> : label}
              </motion.span>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
};

export const TechChip = ({ label, key }: { label: string; key?: any }) => { // yes this is a required key prop, don't ask :(
  const ref = useRef<HTMLSpanElement>(null);
  const [pos, set_pos] = useState({ x: 50, y: 50 });
  const [hovered, set_hovered] = useState(false);

  const _on_move = (e: React.MouseEvent) => {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    set_pos({
      x: ((e.clientX - r.left) / r.width) * 100,
      y: ((e.clientY - r.top) / r.height) * 100,
    });
  };

  return (
    <span
      ref={ref}
      onMouseMove={_on_move}
      onMouseEnter={() => set_hovered(true)}
      onMouseLeave={() => set_hovered(false)}
      style={{
        background: hovered
          ? `radial-gradient(ellipse 80% 80% at ${pos.x}% ${pos.y}%, color-mix(in srgb, var(--primary) 20%, transparent), var(--primary-container) 0%) , color-mix(in srgb, var(--primary-container) 30%, transparent)`
          : undefined,
      }}
      className="px-2 py-1 md:px-4 md:py-2 bg-[var(--primary-container)]/30 text-[var(--on-surface)] rounded-lg md:rounded-xl text-[10px] md:text-sm font-bold border-6 border-[var(--outline-variant)] active:scale-95 hover:border-[var(--primary)]/40 transition-all duration-150 ease-out cursor-default select-none will-change-transform"
    >
      {label}
    </span>
  );
};
