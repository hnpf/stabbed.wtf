// @ts-nocheck
import React, { useState, useEffect, useRef, useCallback } from "react";
import ReactDOM from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import { Plus, Sparkles } from "./MaterialIcon";
import { cn } from "../constants";
import { haptic, triggerReactionFeedback } from "../haptics";

const BLOG_EMOJIS = [
  "👍", "👎", "🔥", "😭", "💯",
  "🎉", "👏", "♥️", "✨", "⚡",
  "🤯", "🎧", "👾", "🦇", "⭐",
  "🐐", "🫪", "🩸", "🔪", "💀",
];

const LS_KEY = "stabbed_blog_reactions";

function loadLocalReactions(): Record<string, string[]> {
  try {
    const s = localStorage.getItem(LS_KEY);
    return s ? JSON.parse(s) : {};
  } catch {
    return {};
  }
}

function saveLocalReactions(data: Record<string, string[]>) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(data));
  } catch {}
}

interface BurstParticle {
  id: number;
  emoji: string;
  startX: number;
  startY: number;
  targetX: number;
  targetY: number;
  scale: number;
  rotation: number;
  timestamp: number;
}

interface BlogReactionsProps {
  slug: string;
  initialReactions?: Record<string, number>;
  compact?: boolean;
  className?: string;
}

export function BlogReactions({ slug, initialReactions, compact, className }: BlogReactionsProps) {
  const [reactions, setReactions] = useState<Record<string, number>>(initialReactions || {});
  const [userReacted, setUserReacted] = useState<string[]>([]);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerPos, setPickerPos] = useState<{ top: number; left: number; align: "left" | "right" } | null>(null);
  const [bursts, setBursts] = useState<BurstParticle[]>([]);
  const [loading, setLoading] = useState(!initialReactions);
  const hasLiveData = useRef(false);
  useEffect(() => {
    const local = loadLocalReactions();
    setUserReacted(local[slug] || []);
    // skip fetch if caller passed initialReactions (bulk loaded)
    if (initialReactions) {
      setReactions(initialReactions);
      return;
    }

    fetch(`/api/blog-reactions?slug=${encodeURIComponent(slug)}`)
      .then((r) => r.json())
      .then((data) => {
        if (data?.reactions) setReactions(data.reactions);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [slug]);
  useEffect(() => {
    if (hasLiveData.current) return;
    if (initialReactions) {
      setReactions(initialReactions);
      setLoading(false);
    }
  }, [initialReactions]);
  useEffect(() => {
    if (!pickerOpen) return;
    const handlePointerDown = (e: PointerEvent) => {
      const t = e.target as HTMLElement;
      if (!t?.closest("[data-blog-picker]") && !t?.closest("[data-blog-picker-btn]")) {
        setPickerOpen(false);
        setPickerPos(null);
      }
    };
    window.addEventListener("pointerdown", handlePointerDown);
    return () => window.removeEventListener("pointerdown", handlePointerDown);
  }, [pickerOpen]);

  useEffect(() => {
    if (!pickerOpen) return;
    const close = () => { setPickerOpen(false); setPickerPos(null); };
    window.addEventListener("scroll", close, true);
    window.addEventListener("resize", close);
    return () => {
      window.removeEventListener("scroll", close, true);
      window.removeEventListener("resize", close);
    };
  }, [pickerOpen]);

  const triggerBurst = (emoji: string, originX: number, originY: number) => {
    const count = 6;
    const now = Date.now();
    const newParticles: BurstParticle[] = Array.from({ length: count }, (_, i) => ({
      id: now + i + Math.random(),
      emoji,
      startX: originX,
      startY: originY,
      targetX: originX + (Math.random() - 0.5) * 160,
      targetY: originY - 60 - Math.random() * 90,
      scale: 0.8 + Math.random() * 0.7,
      rotation: (Math.random() - 0.5) * 70,
      timestamp: now,
    }));
    setBursts((prev) => [...prev, ...newParticles]);
    setTimeout(() => {
      setBursts((prev) => prev.filter((b) => b.timestamp > Date.now() - 950));
    }, 1000);
  };

  const handleReact = useCallback(async (emoji: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      triggerBurst(emoji, rect.left + rect.width / 2, rect.top);
    }

    const isRemoving = userReacted.includes(emoji);
    triggerReactionFeedback(emoji, isRemoving);
    const prevReactions = { ...reactions };
    const prevUserReacted = [...userReacted];
    const nextUserReacted = isRemoving
      ? userReacted.filter((r) => r !== emoji)
      : [...userReacted, emoji];
    setUserReacted(nextUserReacted);

    const local = loadLocalReactions();
    local[slug] = nextUserReacted;
    saveLocalReactions(local);
    const optimistic = { ...reactions };
    const cur = Number(optimistic[emoji]) || 0;
    const next = Math.max(0, cur + (isRemoving ? -1 : 1));
    if (next === 0) delete optimistic[emoji]; else optimistic[emoji] = next;
    setReactions(optimistic);
    try {
      const res = await fetch("/api/blog-reactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, emoji, delta: isRemoving ? -1 : 1 }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (data?.reactions) {
        hasLiveData.current = true;
        setReactions(data.reactions);
      }
    } catch {
      setReactions(prevReactions);
      setUserReacted(prevUserReacted);
      const local2 = loadLocalReactions();
      local2[slug] = prevUserReacted;
      saveLocalReactions(local2);
    }
  }, [reactions, userReacted, slug]);

  const reactionKeys = Object.keys(reactions).filter((k) => reactions[k] > 0);
  const totalReactions = reactionKeys.reduce((s, k) => s + reactions[k], 0);

  return (
    <>
      {typeof document !== "undefined" && ReactDOM.createPortal(
        <AnimatePresence>
          {bursts.map((b) => (
            <motion.div
              key={b.id}
              initial={{ x: b.startX - 14, y: b.startY - 14, opacity: 1, scale: 0.4, rotate: 0 }}
              animate={{ x: b.targetX, y: b.targetY, opacity: 0, scale: b.scale, rotate: b.rotation }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
              className="fixed pointer-events-none select-none text-2xl filter drop-shadow-md z-[9999]"
              style={{ left: 0, top: 0 }}
            >
              {b.emoji}
            </motion.div>
          ))}
        </AnimatePresence>,
        document.body
      )}

      {typeof document !== "undefined" && ReactDOM.createPortal(
        <AnimatePresence>
          {pickerOpen && pickerPos && (
            <motion.div
              data-blog-picker
              initial={{ opacity: 0, scale: 0.88, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.88, y: 8 }}
              transition={{ type: "spring", stiffness: 480, damping: 28 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                position: "fixed",
                zIndex: 9998,
                top: pickerPos.top,
                left: pickerPos.left,
                transform: [
                  pickerPos.align === "right" ? "translateX(-100%)" : "",
                  "translateY(calc(-100% - 10px))",
                ].filter(Boolean).join(" ") || "translateY(calc(-100% - 10px))",
              }}
              className="bg-[var(--surface)] border-3 border-[var(--outline-variant)] rounded-2xl p-3 shadow-2xl w-72 backdrop-blur-md select-none"
            >
              <div className="text-[12px] font-black tracking-wider opacity-50 mb-2 px-1 flex items-center justify-between">
                <span>React to this post</span>
                <Sparkles size={14} className="text-[var(--primary)]" />
              </div>
              <div className="grid grid-cols-5 gap-1">
                {BLOG_EMOJIS.map((em) => {
                  const reacted = userReacted.includes(em);
                  return (
                    <button
                      key={em}
                      type="button"
                      onClick={(e) => {
                        handleReact(em, e);
                        setPickerOpen(false);
                        setPickerPos(null);
                      }}
                      className={cn(
                        "h-10 rounded-xl flex items-center justify-center text-lg hover:scale-110 active:scale-95 transition-all cursor-pointer border",
                        reacted
                          ? "border-[var(--primary)] bg-[var(--primary-container)]/50"
                          : "border-transparent bg-[var(--surface-variant)]/30 hover:bg-[var(--primary-container)]"
                      )}
                    >
                      {em}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
      <div className={cn("flex flex-wrap items-center gap-1.5", className)}>
        <AnimatePresence mode="popLayout">
          {reactionKeys.map((emoji) => {
            const count = reactions[emoji];
            const reacted = userReacted.includes(emoji);
            return (
              <motion.button
                key={emoji}
                layout
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.7 }}
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.92 }}
                transition={{ type: "spring", stiffness: 500, damping: 28 }}
                type="button"
                onClick={(e) => handleReact(emoji, e)}
                className={cn(
                  "inline-flex items-center font-black transition-colors cursor-pointer select-none border-2",
                  compact
                    ? "gap-1 px-2 py-1 rounded-xl text-xs"
                    : "gap-1.5 px-3 py-1.5 rounded-2xl text-sm",
                  reacted
                    ? "bg-[var(--primary-container)] text-[var(--on-primary-container)] border-[var(--primary)] shadow-sm"
                    : "bg-[var(--surface-variant)]/40 hover:bg-[var(--surface-variant)] text-[var(--on-surface)] border-[var(--outline-variant)]/50"
                )}
              >
                <span className={cn("leading-none", compact ? "text-sm" : "text-base")}>{emoji}</span>
                <span className={cn("font-black opacity-80 tabular-nums", compact ? "text-[10px]" : "text-xs")}>{count}</span>
              </motion.button>
            );
          })}
        </AnimatePresence>

        <motion.button
          data-blog-picker-btn
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            haptic.light();
            if (pickerOpen) {
              setPickerOpen(false);
              setPickerPos(null);
            } else {
              const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
              const PICKER_W = 288;
              const spaceRight = window.innerWidth - rect.left;
              const align = spaceRight >= PICKER_W + 8 ? "left" : "right";
              setPickerPos({
                top: rect.top,
                left: align === "left" ? rect.left : rect.right,
                align,
              });
              setPickerOpen(true);
            }
          }}
          className={cn(
            "inline-flex items-center font-black border-2 transition-all cursor-pointer select-none",
            compact
              ? "gap-1 px-2 py-1 rounded-xl text-[10px]"
              : "gap-1.5 px-3 py-1.5 rounded-2xl text-xs",
            pickerOpen
              ? "bg-[var(--primary)] text-[var(--on-primary)] border-[var(--primary)]"
              : compact && reactionKeys.length === 0
                ? "bg-[var(--surface-variant)]/20 text-[var(--on-surface-variant)] border-[var(--outline-variant)]/20 opacity-50 hover:opacity-80"
                : "bg-[var(--surface-variant)]/40 hover:bg-[var(--surface-variant)] text-[var(--on-surface-variant)] border-[var(--outline-variant)]/40 opacity-70 hover:opacity-100"
          )}
        >
          <Plus size={compact ? 11 : 14} />
          <span className="tracking-wider">React</span>
        </motion.button>

        {!compact && totalReactions > 0 && (
          <span className="text-[11px] font-black opacity-30 uppercase tracking-widest ml-1">
            {totalReactions} reaction{totalReactions !== 1 ? "s" : ""}
          </span>
        )}
      </div>
    </>
  );
}
