// @ts-nocheck
import React, { useState, useEffect, useRef, useCallback } from "react";
import ReactDOM from "react-dom";
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from "motion/react";
import { Group, X, Loader2, CheckCircle, Send, Calendar, Share2, Plus, Sparkles, ChevronDown } from "./MaterialIcon";
import { cn } from "../constants";
import { haptic, triggerReactionFeedback } from "../haptics";

const STICKER_PRESETS = [
  { id: "🔥 Fire", label: "🔥 Fire", color: "bg-orange-500/15 text-orange-500 border-orange-500/40" },
  { id: "✨ Spark", label: "✨ Spark", color: "bg-emerald-500/15 text-emerald-500 border-emerald-500/40" },
  { id: "💀 Skull", label: "💀 Skull", color: "bg-purple-500/15 text-purple-500 border-purple-500/40" },
  { id: "🔪 Stabbed", label: "🔪 Stabbed", color: "bg-red-500/15 text-red-500 border-red-500/40" },
  { id: "🎧 Music", label: "🎧 Music", color: "bg-blue-500/15 text-blue-500 border-blue-500/40" },
  { id: "♥️ Heart", label: "♥️ Heart", color: "bg-pink-500/15 text-pink-500 border-pink-500/40" },
  { id: "⚡ Bolt", label: "⚡ Bolt", color: "bg-amber-500/15 text-amber-500 border-amber-500/40" },
  { id: "🩸 Blood", label: "🩸 Blood", color: "bg-rose-500/15 text-rose-500 border-rose-500/40" },
];

const EMOJI_REACTIONS = [
  "🔥", "♥️", "🔪", "💀", "✨", "🎧", "⚡", "🩸", "👾", "💖", "🐐", "⭐", "🫧", "🦇", "🍙"
];

function getStickerBadgeStyle(stickerName: string) {
  const match = STICKER_PRESETS.find(p => p.id === stickerName || p.label === stickerName);
  if (match) return match.color;
  return "bg-[var(--primary)]/15 text-[var(--primary)] border-[var(--primary)]/40";
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

interface GuestbookDialogProps {
  isOpen: boolean;
  onClose: () => void;
  setToast: (msg: string) => void;
  isMobile: boolean;
  viewport?: { w: number; h: number };
}

export const GuestbookDialog = ({
  isOpen,
  onClose,
  setToast,
  isMobile,
  viewport,
}: GuestbookDialogProps) => {
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [selectedSticker, setSelectedSticker] = useState<string | null>(null);
  const [entries, setEntries] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [openPickerId, setOpenPickerId] = useState<string | number | null>(null);
  const [pickerPos, setPickerPos] = useState<{ top: number; left: number; align: "left" | "right" } | null>(null);
  const [stickerDropdownOpen, setStickerDropdownOpen] = useState(false);
  const [bursts, setBursts] = useState<BurstParticle[]>([]);

  const [userReactions, setUserReactions] = useState<Record<string | number, string[]>>(() => {
    try {
      const saved = localStorage.getItem("stabbed_guestbook_reactions");
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const saveUserReactions = (updated: Record<string | number, string[]>) => {
    setUserReactions(updated);
    try {
      localStorage.setItem("stabbed_guestbook_reactions", JSON.stringify(updated));
    } catch {}
  };
  useEffect(() => {
    if (openPickerId === null) return;
    const handlePointerDown = (e: PointerEvent | MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      if (
        !target.closest(`[data-reaction-picker="${openPickerId}"]`) &&
        !target.closest(`[data-reaction-btn="${openPickerId}"]`)
      ) {
        setOpenPickerId(null);
        setPickerPos(null);
      }
    };
    window.addEventListener("pointerdown", handlePointerDown);
    return () => window.removeEventListener("pointerdown", handlePointerDown);
  }, [openPickerId]);

  useEffect(() => {
    if (openPickerId === null || !pickerPos) return;
    const close = () => { setOpenPickerId(null); setPickerPos(null); };
    window.addEventListener("scroll", close, true);
    window.addEventListener("resize", close);
    return () => {
      window.removeEventListener("scroll", close, true);
      window.removeEventListener("resize", close);
    };
  }, [openPickerId, pickerPos]);

  const [defaultY, setDefaultY] = useState(() => isMobile ? (viewport ? viewport.h * 0.05 : window.innerHeight * 0.05) : 0);
  const y = useMotionValue(isMobile ? (viewport ? viewport.h : window.innerHeight) : 0);
  const modalHeight = useTransform(y, (latestY) => {
    const baseHeight = viewport ? viewport.h : window.innerHeight;
    return Math.max(0, baseHeight - latestY);
  });
  const scrollRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const dragStartY = useRef(0);
  const dragStartModalY = useRef(0);
  const isDraggingSheet = useRef(false);
  const touchTimes = useRef<{ y: number; t: number }[]>([]);

  useEffect(() => {
    if (!isMobile) return;
    const handleResize = () => {
      setDefaultY(viewport ? viewport.h * 0.05 : window.innerHeight * 0.05);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isMobile, viewport]);

  useEffect(() => {
    if (isOpen && isMobile) {
      y.set(window.innerHeight);
    }
  }, [isOpen, isMobile, y]);

  const handleClose = useCallback(() => {
    setOpenPickerId(null);
    setPickerPos(null);
    onClose();
  }, [onClose]);

  useEffect(() => {
    const modalEl = modalRef.current;
    if (!modalEl || !isMobile) return;

    const handleTouchStartRaw = (e: TouchEvent) => {
      const touch = e.touches[0];
      dragStartY.current = touch.clientY;
      dragStartModalY.current = y.get();
      
      const isInsideScroll = scrollRef.current && scrollRef.current.contains(e.target as Node);
      const scrollTop = scrollRef.current ? scrollRef.current.scrollTop : 0;
      
      if (!isInsideScroll) {
        isDraggingSheet.current = true;
      } else if (dragStartModalY.current > 0) {
        isDraggingSheet.current = true;
      } else if (scrollTop <= 0) {
        isDraggingSheet.current = false;
      } else {
        isDraggingSheet.current = false;
      }
      
      touchTimes.current = [{ y: touch.clientY, t: Date.now() }];
    };

    const handleTouchMoveRaw = (e: TouchEvent) => {
      const touch = e.touches[0];
      const clientY = touch.clientY;
      const deltaY = clientY - dragStartY.current;
      const scrollTop = scrollRef.current ? scrollRef.current.scrollTop : 0;
      
      touchTimes.current.push({ y: clientY, t: Date.now() });
      if (touchTimes.current.length > 5) {
        touchTimes.current.shift();
      }

      if (dragStartModalY.current === 0 && scrollTop <= 0 && !isDraggingSheet.current) {
        if (deltaY > 0) {
          isDraggingSheet.current = true;
          dragStartY.current = clientY;
          dragStartModalY.current = 0;
        }
      }

      if (!isDraggingSheet.current && scrollTop <= 0 && deltaY > 0) {
        isDraggingSheet.current = true;
        dragStartY.current = clientY;
        dragStartModalY.current = 0;
      }

      if (isDraggingSheet.current) {
        if (e.cancelable) {
          e.preventDefault();
        }
        
        let newY = dragStartModalY.current + deltaY;
        if (newY < 0) {
          newY = newY * 0.2; // pull resistance
        }
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
        const targetY = currentY < defaultY * 0.5 ? 0 : defaultY;
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
  }, [isMobile, y, defaultY, handleClose, isOpen]);

  const fetchEntries = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/guestbook");
      if (res.ok) {
        const data = await res.json();
        setEntries(data);
      }
    } catch (err) {
      console.error("Failed to fetch guestbook:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      setName("");
      setMessage("");
      setSelectedSticker(null);
      setStickerDropdownOpen(false);
      setIsSuccess(false);
      setOpenPickerId(null);
      fetchEntries();
    }
  }, [isOpen]);

  const triggerBurst = (emoji: string, originX: number, originY: number) => {
    const newParticles: BurstParticle[] = [];
    const count = 6;
    const now = Date.now();

    for (let i = 0; i < count; i++) {
      newParticles.push({
        id: now + i + Math.random(),
        emoji,
        startX: originX,
        startY: originY,
        targetX: originX + (Math.random() - 0.5) * 140,
        targetY: originY - 60 - Math.random() * 80,
        scale: 0.8 + Math.random() * 0.6,
        rotation: (Math.random() - 0.5) * 60,
        timestamp: now,
      });
    }

    setBursts((prev) => [...prev, ...newParticles]);
    setTimeout(() => {
      setBursts((prev) => prev.filter((b) => b.timestamp > Date.now() - 950));
    }, 1000);
  };

  const handleReact = async (entryId: string | number, emoji: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
      const rect = e.currentTarget.getBoundingClientRect();
      triggerBurst(emoji, rect.left + rect.width / 2, rect.top);
    }

    const currentEntryReacts = userReactions[entryId] || [];
    const isRemoving = currentEntryReacts.includes(emoji);
    triggerReactionFeedback(emoji, isRemoving);
    const prevEntryReactions = entries.find((en) => en.id === entryId)?.reactions || {};
    const nextUserEntryReactions = isRemoving
      ? currentEntryReacts.filter((r) => r !== emoji)
      : [...currentEntryReacts, emoji];
    const updatedUserReactions = {
      ...userReactions,
      [entryId]: nextUserEntryReactions,
    };
    saveUserReactions(updatedUserReactions);
    const applyReactions = (reactionsPatch: Record<string, number>) => {
      setEntries((prev) =>
        prev.map((entry) =>
          entry.id === entryId ? { ...entry, reactions: reactionsPatch } : entry
        )
      );
    };

    const optimisticReactions = { ...prevEntryReactions };
    const currentCount = Number(optimisticReactions[emoji]) || 0;
    const optimisticCount = Math.max(0, currentCount + (isRemoving ? -1 : 1));
    if (optimisticCount === 0) {
      delete optimisticReactions[emoji];
    } else {
      optimisticReactions[emoji] = optimisticCount;
    }
    applyReactions(optimisticReactions);
    try {
      const res = await fetch("/api/guestbook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "react",
          id: entryId,
          emoji,
          delta: isRemoving ? -1 : 1,
        }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();
      if (data && data.reactions && typeof data.reactions === "object") {
        applyReactions(data.reactions);
      }
    } catch (err) {
      console.warn("Reaction API sync error, rolling back:", err);
      applyReactions(prevEntryReactions);
      saveUserReactions({ ...updatedUserReactions, [entryId]: currentEntryReacts });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) {
      haptic.error();
      setToast("Please write a message!");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/guestbook", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim() || "anonymous",
          message: message.trim(),
          sticker: selectedSticker || undefined,
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to sign the guestbook.");
      }

      setIsSuccess(true);
      haptic.success();
      setToast("Guestbook signed successfully!");
      fetchEntries();

      // clear form but keep dialog open
      setName("");
      setMessage("");
      setSelectedSticker(null);
      setTimeout(() => setIsSuccess(false), 2000);
    } catch (err: any) {
      console.error(err);
      haptic.error();
      setToast(err.message || "Something went wrong signing the guestbook!");
    } finally {
      setIsSubmitting(false);
    }
  };

  const dialogSpring = {
    type: "spring" as const,
    stiffness: 400,
    damping: 30,
    mass: 0.8,
  };

  return (
    <>
    <AnimatePresence>
      {isOpen && (
        <div
          className={cn(
            "fixed inset-0 z-[110] flex justify-center overflow-hidden",
            isMobile ? "items-start p-0 bg-black/20" : "items-center p-4"
          )}
        >
          {/* backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => !isSubmitting && handleClose()}
            className="absolute inset-0 bg-black/60 backdrop-blur-md motion-gpu"
            style={{ willChange: "opacity" }}
          />
          <div className="fixed inset-0 pointer-events-none z-[130] overflow-hidden">
            <AnimatePresence>
              {bursts.map((b) => (
                <motion.div
                  key={b.id}
                  initial={{
                    x: b.startX - 14,
                    y: b.startY - 14,
                    opacity: 1,
                    scale: 0.4,
                    rotate: 0,
                  }}
                  animate={{
                    x: b.targetX,
                    y: b.targetY,
                    opacity: 0,
                    scale: b.scale,
                    rotate: b.rotation,
                  }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
                  className="fixed pointer-events-none select-none text-2xl filter drop-shadow-md"
                  style={{ left: 0, top: 0 }}
                >
                  {b.emoji}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* container */}
          <motion.div
            ref={modalRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="guestbook-title"
            aria-describedby="guestbook-description"
            initial={isMobile ? { y: window.innerHeight } : { opacity: 0, scale: 0.9, y: 20 }}
            animate={isMobile ? { y: defaultY } : { opacity: 1, scale: 1, y: 0 }}
            exit={isMobile ? {
              y: window.innerHeight,
              transition: { type: "spring", damping: 30, stiffness: 300, mass: 0.8 }
            } : {
              opacity: 0,
              scale: 0.9,
              y: 20,
              transition: { duration: 0.2 }
            }}
            transition={isMobile ? { type: "spring", damping: 30, stiffness: 350, mass: 0.8 } : dialogSpring}
            onClick={(e) => e.stopPropagation()}
            className={cn(
              "relative bg-[var(--surface)] shadow-2xl overflow-hidden flex flex-col motion-gpu border-[var(--outline-variant)]",
              isMobile
                ? "w-full h-[100dvh] max-w-none max-h-none rounded-t-[2rem] border-none"
                : "w-full max-w-3xl rounded-[2rem] md:rounded-[2.5rem] h-[82vh] border-3"
            )}
            style={isMobile ? {
              y,
              height: modalHeight,
              willChange: "transform, height",
              touchAction: "pan-y"
            } : {
              willChange: "transform, opacity"
            }}
          >
            <div className="flex flex-col h-full overflow-hidden">
              {/* handle drag for mobile */}
              {isMobile && (
                <div className="w-full flex justify-center pt-3 pb-1 shrink-0 bg-[var(--surface)]">
                  <div className="w-12 h-1.5 bg-[var(--outline-variant)] rounded-full opacity-40" />
                </div>
              )}

              {/* header */}
              <div className={cn(
                "flex justify-between items-center border-b-3 border-[var(--outline-variant)] bg-[var(--surface)] sticky top-0 z-10 shrink-0",
                isMobile ? "p-4" : "p-6 md:p-8"
              )}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[var(--primary-container)]/60 border-3 border-[var(--primary)]/20 flex items-center justify-center shrink-0 text-[var(--primary)] shadow-sm">
                    <Group size={20} />
                  </div>
                  <div>
                    <h2 className="font-black text-xl md:text-2xl font-expressive uppercase tracking-tight">
                      Guestbook
                    </h2>
                    <p className="text-[13px] font-bold opacity-50 tracking-wider -mt-0.5">
                      Signs & reactions
                    </p>
                  </div>
                </div>
                {!isSubmitting && (
                  <button
                    onClick={handleClose}
                    aria-label="Close guestbook dialog"
                    className="group w-10 h-10 rounded-full bg-[var(--surface-variant)]/60 hover:bg-[var(--surface-variant)] border-3 border-[var(--outline-variant)]/50 flex items-center justify-center transition-all cursor-pointer text-[var(--on-surface)] active:scale-95 shrink-0 shadow-sm"
                  >
                    <X size={20} className="transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:rotate-180 group-hover:scale-110" />
                  </button>
                )}
              </div>

              {/* main split layout */}
              <div className="flex-1 flex flex-col md:flex-row overflow-hidden min-h-0">
                {/* entries */}
                <div className="flex-1 flex flex-col min-h-0 min-w-0 w-full max-w-full overflow-hidden border-r border-[var(--outline-variant)]/30">
                  <div
                    ref={scrollRef}
                    className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 max-h-[45vh] md:max-h-none min-w-0"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-xs ml-1 font-black tracking-[0.15em] uppercase text-[var(--on-surface-variant)] opacity-60">
                        Recent signs ({entries.length})
                      </h3>
                      <span className="text-[10px] font-bold opacity-40 tracking-wider">
                        Click on reactions to vote
                      </span>
                    </div>

                    {isLoading ? (
                      <div className="flex flex-col items-center justify-center py-12 opacity-40">
                        <Loader2 size={32} className="animate-spin mb-2" />
                        <span className="text-sm font-bold">Loading entries...</span>
                      </div>
                    ) : entries.length === 0 ? (
                      <div className="text-center py-12 text-[var(--on-surface-variant)] opacity-40 italic font-medium">
                        Be the first person to sign! :)
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {entries.map((entry) => {
                          const reactionsMap = entry.reactions || {};
                          const reactionKeys = Object.keys(reactionsMap).filter(k => reactionsMap[k] > 0);
                          const userReactedList = userReactions[entry.id] || [];
                          const isPickerOpen = openPickerId === entry.id;

                          return (
                            <div
                              key={entry.id}
                              className="relative p-4 rounded-2xl bg-[var(--surface-variant)]/30 border-4 border-[var(--outline-variant)]/30 space-y-3 hover:border-[var(--primary)]/30 transition-all duration-200 w-full min-w-0 overflow-visible group"
                            >
                              <div className="flex items-start justify-between gap-3 w-full min-w-0">
                                <div className="flex items-center gap-2 min-w-0 flex-1 overflow-hidden">
                                  <span className="font-black text-sm text-[var(--primary)] truncate min-w-0 flex-shrink block">
                                    @{entry.name}
                                  </span>
                                  {entry.sticker && (
                                    <span
                                      className={cn(
                                        "shrink-0 whitespace-nowrap inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-lg border-2 shadow-xs select-none",
                                        getStickerBadgeStyle(entry.sticker)
                                      )}
                                    >
                                      {entry.sticker}
                                    </span>
                                  )}
                                </div>
                                <span className="text-[10px] font-bold opacity-40 uppercase tracking-wider flex items-center gap-1 shrink-0 mt-0.5 whitespace-nowrap">
                                  <Calendar size={10} />
                                  {new Date(entry.created_at).toLocaleDateString()}
                                </span>
                              </div>
                              <p className="text-sm text-[var(--on-surface)] font-medium break-words [word-break:break-word] whitespace-pre-wrap min-w-0">
                                {entry.message}
                              </p>
                              <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-[var(--outline-variant)]/20 relative">
                                {reactionKeys.map((emojiKey) => {
                                  const count = reactionsMap[emojiKey];
                                  const hasReacted = userReactedList.includes(emojiKey);

                                  return (
                                    <motion.button
                                      key={emojiKey}
                                      whileHover={{ scale: 1.08 }}
                                      whileTap={{ scale: 0.92 }}
                                      onClick={(e) => handleReact(entry.id, emojiKey, e)}
                                      className={cn(
                                        "inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-black transition-all cursor-pointer select-none border-2 shrink-0 whitespace-nowrap",
                                        hasReacted
                                          ? "bg-[var(--primary-container)] text-[var(--on-primary-container)] border-[var(--primary)] shadow-xs"
                                          : "bg-[var(--surface)] hover:bg-[var(--surface-variant)]/80 text-[var(--on-surface)] border-[var(--outline-variant)]/50"
                                      )}
                                    >
                                      <span className="text-sm leading-none">{emojiKey}</span>
                                      <span className="text-[11px] font-bold opacity-80">{count}</span>
                                    </motion.button>
                                  );
                                })}
                                <motion.button
                                  whileHover={{ scale: 1.08 }}
                                  whileTap={{ scale: 0.92 }}
                                  data-reaction-btn={entry.id}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    haptic.light();
                                    if (isPickerOpen) {
                                      setOpenPickerId(null);
                                      setPickerPos(null);
                                    } else {
                                      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                                      const PICKER_W = 256;
                                      const spaceRight = window.innerWidth - rect.left;
                                      const align = spaceRight >= PICKER_W + 8 ? "left" : "right";
                                      setPickerPos({
                                        top: rect.top - 8, // will use transform to flip above
                                        left: align === "left" ? rect.left : rect.right,
                                        align,
                                      });
                                      setOpenPickerId(entry.id);
                                    }
                                  }}
                                  className={cn(
                                    "inline-flex items-center gap-1 px-2 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer border-2 select-none",
                                    isPickerOpen
                                      ? "bg-[var(--primary)] text-[var(--on-primary)] border-[var(--primary)]"
                                      : "bg-[var(--surface)] hover:bg-[var(--surface-variant)] text-[var(--on-surface-variant)] border-[var(--outline-variant)]/40 opacity-70 hover:opacity-100"
                                  )}
                                  title="Add reaction"
                                >
                                  <Plus size={14} />
                                  <span className="text-[10px] uppercase font-black tracking-wider">React</span>
                                </motion.button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* share button at bottom left */}
                  <div className="p-4 mb-2 border-t-3 hidden sm:flex border-[var(--outline-variant)]/20 bg-[var(--surface-variant)]/5 flex justify-between items-center shrink-0">
                    <span className="text-[10px] mt-1 font-bold tracking-[0.05em] ml-3 uppercase opacity-45">
                      Share the guestbook!
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        const shareUrl = `${window.location.origin}/guestbook`;
                        navigator.clipboard.writeText(shareUrl);
                        haptic.medium();
                        setToast("Guestbook link copied!");
                      }}
                      className="flex items-center gap-2 px-4 py-3 bg-[var(--surface)] hover:bg-[var(--primary-container)] hover:text-[var(--on-primary-container)] rounded-xl border border-[var(--outline-variant)]/40 transition-colors text-xs font-black uppercase tracking-wide cursor-pointer active:scale-95"
                    >
                      <Share2 size={12} />
                      <span>Copy Link</span>
                    </button>
                  </div>
                </div>

                {/* right side: form (desktop) / bottom part (mobile) */}
                <div className="w-full md:w-84 p-6 bg-[var(--surface-variant)]/10 shrink-0 flex flex-col justify-between border-t-3 md:border-t-0 md:border-l border-[var(--outline-variant)]/30 overflow-y-auto">
                  <form onSubmit={handleSubmit} className="space-y-4 flex-1 flex flex-col justify-between">
                    <div className="space-y-3.5">
                      <div className="flex items-center justify-between">
                        <h3 className="text-[13px] font-black tracking-[0.1em] text-[var(--on-surface-variant)]">
                          Sign guestbook here!
                        </h3>
                        <Sparkles size={15} className="text-[var(--primary)] opacity-70" />
                      </div>

                      {/* name input */}
                      <div className="space-y-1">
                        <label className="text-[12px] font-black tracking-[0.15em] text-[var(--on-surface-variant)] opacity-60">
                          Your alias
                        </label>
                        <input
                          type="text"
                          disabled={isSubmitting}
                          placeholder="Enter an alias here..."
                          maxLength={30}
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="w-full bg-[var(--surface-variant)]/40 text-[var(--on-surface)] border-4 border-[var(--outline-variant)] focus:border-[var(--primary)] rounded-xl px-3 py-2 text-sm focus:outline-none transition-all duration-200"
                        />
                      </div>

                      {/* msg input */}
                      <div className="space-y-1">
                        <label className="text-[12px] font-black tracking-[0.15em] text-[var(--on-surface-variant)] opacity-60">
                          Your message
                        </label>
                        <textarea
                          required
                          disabled={isSubmitting}
                          maxLength={200}
                          rows={3}
                          placeholder="Leave a message, feedback, or greeting..."
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          className="w-full bg-[var(--surface-variant)]/40 text-[var(--on-surface)] border-4 border-[var(--outline-variant)] focus:border-[var(--primary)] rounded-xl px-3 py-2 text-sm focus:outline-none transition-all duration-200 resize-none min-h-[70px]"
                        />
                        <div className="text-[9px] text-right font-black opacity-30">
                          {message.length}/200
                        </div>
                      </div>

                      <div className="pt-1">
                        <button
                          type="button"
                          disabled={isSubmitting}
                          onClick={() => {
                            haptic.light();
                            setStickerDropdownOpen((v) => !v);
                          }}
                          className={cn(
                            "w-full flex items-center justify-between px-3 py-2 rounded-xl border-2 transition-all cursor-pointer text-xs font-black",
                            stickerDropdownOpen
                              ? "border-[var(--primary)]/60 bg-[var(--primary-container)]/20 text-[var(--on-surface)]"
                              : "border-[var(--outline-variant)]/40 bg-[var(--surface-variant)]/30 text-[var(--on-surface-variant)]"
                          )}
                        >
                          <span className="flex items-center gap-2">
                            <Sparkles size={13} className={cn("transition-colors", selectedSticker ? "text-[var(--primary)]" : "opacity-40")} />
                            {selectedSticker ? (
                              <span className={cn(
                                "inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-lg border-2",
                                getStickerBadgeStyle(selectedSticker)
                              )}>
                                {selectedSticker}
                              </span>
                            ) : (
                              <span className="opacity-50 text-[11px] tracking-wide font-bold">Add a sticker stamp…</span>
                            )}
                          </span>
                          <span className="flex items-center gap-1.5">
                            {selectedSticker && (
                              <span
                                role="button"
                                tabIndex={0}
                                onClick={(e) => { e.stopPropagation(); setSelectedSticker(null); haptic.light(); }}
                                onKeyDown={(e) => e.key === "Enter" && (e.stopPropagation(), setSelectedSticker(null))}
                                className="text-[9px] font-black text-rose-500 hover:underline uppercase tracking-wider cursor-pointer px-1"
                              >
                                Clear
                              </span>
                            )}
                            <ChevronDown
                              size={14}
                              className={cn("opacity-40 transition-transform duration-200", stickerDropdownOpen && "rotate-180")}
                            />
                          </span>
                        </button>

                        <AnimatePresence>
                          {stickerDropdownOpen && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ type: "spring", stiffness: 400, damping: 32, mass: 0.7 }}
                              className="overflow-hidden"
                            >
                              <div className="grid grid-cols-4 gap-1.5 pt-2">
                                {STICKER_PRESETS.map((stk) => {
                                  const isSelected = selectedSticker === stk.id;
                                  return (
                                    <button
                                      key={stk.id}
                                      type="button"
                                      disabled={isSubmitting}
                                      onClick={() => {
                                        if (isSelected) {
                                          setSelectedSticker(null);
                                          haptic.light();
                                        } else {
                                          setSelectedSticker(stk.id);
                                          setStickerDropdownOpen(false);
                                          triggerReactionFeedback(stk.id);
                                        }
                                      }}
                                      className={cn(
                                        "text-[10px] font-black px-1.5 py-2 rounded-xl border-2 transition-all cursor-pointer flex flex-col items-center justify-center gap-0.5 select-none",
                                        isSelected
                                          ? `${stk.color} ring-2 ring-[var(--primary)] shadow-sm`
                                          : "bg-[var(--surface)]/70 hover:bg-[var(--surface-variant)]/60 text-[var(--on-surface)]/80 border-[var(--outline-variant)]/40 active:scale-95"
                                      )}
                                    >
                                      <span className="text-base leading-none">{stk.label.split(" ")[0]}</span>
                                      <span className="text-[9px] font-black mt-1 tracking-wide opacity-70 leading-none">{stk.label.split(" ").slice(1).join(" ")}</span>
                                    </button>
                                  );
                                })}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>

                    <div className="pt-3 pb-2 md:pb-0 border-t-3 border-[var(--outline-variant)]/20 flex gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          const shareUrl = `${window.location.origin}/guestbook`;
                          haptic.light();
                          if (navigator.share) {
                            navigator.share({
                              title: "stabbed.wtf guestbook",
                              text: "Sign the stabbed.wtf guestbook!",
                              url: shareUrl
                            }).catch(() => {});
                          } else {
                            navigator.clipboard.writeText(shareUrl);
                            setToast("Guestbook link copied!");
                          }
                        }}
                        className="flex-1 bg-[var(--surface)] text-[var(--on-surface-variant)] py-3 rounded-xl hover:rounded-2xl active:scale-95 transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer text-xs font-black uppercase tracking-wider border border-[var(--outline-variant)]/40"
                      >
                        <Share2 size={14} />
                        <span>Share</span>
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmitting || !message.trim()}
                        className="flex-[2] bg-[var(--primary)] text-[var(--on-primary)] disabled:bg-[var(--surface-variant)]/50 disabled:text-[var(--outline)] disabled:scale-100 disabled:opacity-50 py-3 rounded-xl hover:rounded-2xl active:scale-95 transition-all duration-300 ease-out flex items-center justify-center gap-2 cursor-pointer text-xs font-black uppercase tracking-wider shadow-sm disabled:shadow-none"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 size={14} className="animate-spin" />
                            <span>Sending...</span>
                          </>
                        ) : isSuccess ? (
                          <>
                            <CheckCircle size={14} className="text-emerald-500" />
                            <span>Signed!</span>
                          </>
                        ) : (
                          <>
                            <Send size={14} />
                            <span>Sign Book</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>

    {typeof document !== "undefined" && ReactDOM.createPortal(
      <AnimatePresence>
        {openPickerId !== null && pickerPos && (() => {
          const entryForPicker = entries.find((en) => en.id === openPickerId);
          if (!entryForPicker) return null;
          const userReactedList = userReactions[openPickerId] || [];

          const style: React.CSSProperties = {
            position: "fixed",
            zIndex: 9999,
            top: pickerPos.top,
            ...(pickerPos.align === "left"
              ? { left: pickerPos.left }
              : { left: pickerPos.left, transform: "translateX(-100%)" }),
            // flip above the button
            transform: [
              pickerPos.align === "right" ? "translateX(-100%)" : "",
              "translateY(calc(-100% - 8px))",
            ].filter(Boolean).join(" ") || "translateY(calc(-100% - 8px))",
          };

          return (
            <motion.div
              key={String(openPickerId)}
              data-reaction-picker={openPickerId}
              initial={{ opacity: 0, scale: 0.88, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.88, y: 8 }}
              transition={{ type: "spring", stiffness: 480, damping: 28 }}
              onClick={(e) => e.stopPropagation()}
              style={style}
              className="bg-[var(--surface)] border-3 border-[var(--outline-variant)] rounded-2xl p-3 shadow-2xl w-64 backdrop-blur-md select-none"
            >
              <div className="text-[10px] font-black tracking-wider opacity-50 mb-1.5 px-1 flex items-center justify-between">
                <span>Guestbook Emojis</span>
                <Sparkles size={15} className="mb-0..5 text-[var(--primary)]" />
              </div>
              <div className="grid grid-cols-5 gap-1 mb-2.5">
                {EMOJI_REACTIONS.map((em) => {
                  const hasReacted = userReactedList.includes(em);
                  return (
                    <button
                      key={em}
                      type="button"
                      onClick={(e) => {
                        handleReact(openPickerId, em, e);
                        setOpenPickerId(null);
                        setPickerPos(null);
                      }}
                      className={cn(
                        "h-9 rounded-xl flex items-center justify-center text-lg hover:bg-[var(--primary-container)] hover:scale-110 active:scale-95 transition-all cursor-pointer border",
                        hasReacted
                          ? "border-[var(--primary)] bg-[var(--primary-container)]/50"
                          : "border-transparent bg-[var(--surface-variant)]/30"
                      )}
                    >
                      {em}
                    </button>
                  );
                })}
              </div>

              <div className="text-[10px] font-black tracking-wider opacity-50 mb-1.5 px-1 border-t border-[var(--outline-variant)]/20 pt-1.5">
                <span>Sticker Badges</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {STICKER_PRESETS.slice(0, 4).map((stk) => (
                  <button
                    key={stk.id}
                    type="button"
                    onClick={(e) => {
                      handleReact(openPickerId, stk.id, e);
                      setOpenPickerId(null);
                      setPickerPos(null);
                    }}
                    className={cn(
                      "text-[10px] font-black px-2 py-1 rounded-lg border-2 shadow-xs hover:scale-105 active:scale-95 transition-transform cursor-pointer shrink-0 whitespace-nowrap",
                      stk.color
                    )}
                  >
                    {stk.label}
                  </button>
                ))}
              </div>
            </motion.div>
          );
        })()}
      </AnimatePresence>,
      document.body
    )}
    </>
  );
};


