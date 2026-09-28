// @ts-nocheck
import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, ChevronUp, ChevronDown, Search } from "./MaterialIcon";
import { cn } from "../constants";

export function TextSearchBar({
  isOpen,
  query,
  onQueryChange,
  onClose,
  matchCount,
  currentMatch,
  onNextMatch,
  onPrevMatch,
}: {
  isOpen: boolean;
  query: string;
  onQueryChange: (query: string) => void;
  onClose: () => void;
  onNextMatch: () => void;
  onPrevMatch: () => void;
  matchCount: number;
  currentMatch: number;
}) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="fixed top-4 right-4 z-[9999] bg-[var(--surface)] border-3 border-[var(--outline-variant)]/50 rounded-[2rem] shadow-lg backdrop-blur-md"
      >
        <div className="flex items-center gap-3 p-4">
          <Search size={18} className="text-[var(--on-surface-variant)]" />
          
          <input
            autoFocus
            type="text"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Find on page..."
            className="w-48 outline-none bg-transparent text-sm font-medium text-[var(--on-surface)] placeholder:text-[var(--on-surface-variant)]/50"
          />

          {query && matchCount > 0 && (
            <span className="text-xs font-bold text-[var(--on-surface-variant)] whitespace-nowrap">
              {currentMatch} of {matchCount}
            </span>
          )}

          {query && matchCount === 0 && (
            <span className="text-xs font-bold text-red-500 whitespace-nowrap">
              No matches
            </span>
          )}

          <div className="flex items-center gap-1 border-l-2 border-[var(--outline-variant)]/20 pl-2">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={onPrevMatch}
              className="p-1.5 hover:bg-[var(--surface-variant)] rounded-lg transition-colors"
              title="Previous match (Shift+Enter)"
            >
              <ChevronUp size={16} className="text-[var(--on-surface-variant)] pt-1.5" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={onNextMatch}
              className="p-1.5 hover:bg-[var(--surface-variant)] rounded-lg transition-colors"
              title="Next match (Enter)"
            >
              <ChevronDown size={16} className="text-[var(--on-surface-variant)] pt-1.5" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={onClose}
              className="p-1.5 hover:bg-[var(--surface-variant)] rounded-lg transition-colors"
              title="Close (Escape)"
            >
              <X size={16} className="text-[var(--on-surface-variant)] pt-1.5" />
            </motion.button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
