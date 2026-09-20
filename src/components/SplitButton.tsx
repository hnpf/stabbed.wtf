import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronDown } from "./MaterialIcon";
import { cn } from "../constants";
import { M3ScrollBar } from "./M3ScrollBar";
import { Ripple } from "./Ripple";

interface SplitButtonProps {
  variant?: "elevated" | "filled" | "tonal" | "outlined";
  label: React.ReactNode;
  onClick?: () => void;
  menu: React.ReactNode;
  className?: string;
  icon?: React.ReactNode;
}

export const SplitButton: React.FC<SplitButtonProps> = ({
  variant = "tonal",
  label,
  onClick,
  menu,
  className,
  icon,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const variantStyles = {
    elevated: "bg-[var(--surface-variant)] text-[var(--primary)] shadow-sm hover:shadow-md",
    filled: "bg-[var(--primary)] text-[var(--on-primary)]",
    tonal: "bg-[var(--primary-container)] text-[var(--on-primary-container)]",
    outlined: "bg-transparent border-2 border-[var(--outline-variant)] text-[var(--on-surface-variant)] hover:bg-[var(--surface-variant)]/50",
  };

  const toggleMenu = () => setIsOpen((open) => !open);

  return (
    <div
      ref={containerRef}
      className={cn("m3-split-button-container", className)}
    >
      <button
        type="button"
        onClick={() => {
          if (onClick) {
            onClick();
            return;
          }
          toggleMenu();
        }}
        className={cn("m3-split-button-main", variantStyles[variant])}
      >
        <Ripple />
        {icon && <span className="mr-2 relative z-[1]">{icon}</span>}
        <span className="relative z-[1]">{label}</span>
      </button>
      <div className="relative">
        <button
          type="button"
          aria-haspopup="true"
          aria-expanded={isOpen}
          onClick={toggleMenu}
          className={cn(
            "m3-split-button-menu-toggle",
            variantStyles[variant],
            isOpen && "open"
          )}
        >
          <Ripple />
          <ChevronDown
            size={18}
            className={cn(
              "relative z-[1] transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]",
              isOpen && "rotate-180"
            )}
          />
        </button>
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -10 }}
              transition={{
                type: "spring",
                stiffness: 400,
                damping: 25,
              }}
              className="absolute right-0 top-full mt-2 min-w-[17rem] bg-[var(--surface-variant)] rounded-[1.5rem] shadow-2xl border-4 border-[var(--outline-variant)] overflow-hidden z-50 p-2"
              style={{ height: "min(23rem, calc(100dvh - 10rem))" }}
            >
              {/* scroll container, native bar hidden, M3ScrollBar overlaid */}
              <div className="relative h-full min-h-0">
                <div
                  ref={scrollRef}
                  onClick={() => setIsOpen(false)}
                  className="flex h-full min-h-0 flex-col gap-1 overflow-y-auto overscroll-contain pr-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                >
                  {menu}
                </div>
                <M3ScrollBar scrollEl={scrollRef} thinOnly colorful alwaysVisible />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
