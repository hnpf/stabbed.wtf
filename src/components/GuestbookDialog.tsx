// @ts-nocheck
import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from "motion/react";
import { MessageSquare, X, Loader2, CheckCircle, Send, Calendar, Share2 } from "./MaterialIcon";
import { cn } from "../constants";

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
  const [entries, setEntries] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

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
      setIsSuccess(false);
      fetchEntries();
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) {
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
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to sign the guestbook.");
      }

      setIsSuccess(true);
      setToast("Guestbook signed successfully!");
      fetchEntries();
      
      // clear form but keep dialog open
      setName("");
      setMessage("");
      setTimeout(() => setIsSuccess(false), 2000);
    } catch (err: any) {
      console.error(err);
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
                : "w-full max-w-2xl rounded-[2rem] md:rounded-[2.5rem] h-[80vh] border-3"
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
                    <MessageSquare size={20} />
                  </div>
                  <h2 className="font-black text-xl md:text-2xl font-expressive uppercase tracking-tight">
                    Guestbook
                  </h2>
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
                    <h3 className="text-md ml-1 font-bold tracking-[0.1em] text-[var(--on-surface-variant)] opacity-60 mb-2">
                      Recent signs ({entries.length})
                    </h3>
                    
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
                        {entries.map((entry) => (
                          <div 
                            key={entry.id} 
                            className="p-4 rounded-2xl bg-[var(--surface-variant)]/30 border-4 border-[var(--outline-variant)]/30 space-y-2 hover:border-[var(--primary)]/30 transition-colors w-full min-w-0 overflow-hidden"
                          >
                            <div className="grid grid-cols-[1fr_auto] items-center gap-2 w-full min-w-0">
                              <span className="font-black text-sm text-[var(--primary)] truncate min-w-0 block">
                                @{entry.name}
                              </span>
                              <span className="text-[10px] font-bold opacity-40 uppercase tracking-wider flex items-center gap-1 shrink-0">
                                <Calendar size={10} />
                                {new Date(entry.created_at).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-sm text-[var(--on-surface)] font-medium break-words [word-break:break-word] whitespace-pre-wrap min-w-0">
                              {entry.message}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  {/* share button at bottom left */}
                  <div className="p-4 mb-2 border-t-3 border-[var(--outline-variant)]/20 bg-[var(--surface-variant)]/5 flex justify-between items-center shrink-0">
                    <span className="text-[10px] mt-1 font-bold tracking-[0.05em] ml-3 uppercase opacity-45">
                      Share the guestbook!
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        const shareUrl = `${window.location.origin}/guestbook`;
                        navigator.clipboard.writeText(shareUrl);
                        setToast("Guestbook link copied!");
                      }}
                      className="flex items-center gap-2 px-4 py-3 bg-[var(--surface)] hover:bg-[var(--primary-container)] hover:text-[var(--on-primary-container)] rounded-xl border border-[var(--outline-variant)]/40 transition-colors text-xs font-black uppercase tracking-wide cursor-pointer"
                    >
                      <Share2 size={12} />
                      <span>Copy Link</span>
                    </button>
                  </div>
                </div>

                {/* right side: form (desktop) / bottom part (mobile) */}
                <div className="w-full md:w-80 p-6 bg-[var(--surface-variant)]/10 shrink-0 flex flex-col justify-between border-t-3 md:border-t-0 md:border-l border-[var(--outline-variant)]/30">
                  <form onSubmit={handleSubmit} className="space-y-4 flex-1 flex flex-col justify-between">
                    <div className="space-y-4">
                      <h3 className="text-[13px] font-black tracking-[0.1em] text-[var(--on-surface-variant)]">
                        Sign guestbook here!
                      </h3>
                      
                      {/* name input */}
                      <div className="space-y-1">
                        <label className="text-[12px] font-black tracking-[0.15em] text-[var(--on-surface-variant)] opacity-60">
                          Your Alias
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
                         Your Message
                        </label>
                        <textarea
                          required
                          disabled={isSubmitting}
                          maxLength={200}
                          rows={4}
                          placeholder="Leave your message or drop some feedback..."
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          className="w-full bg-[var(--surface-variant)]/40 text-[var(--on-surface)] border-4 border-[var(--outline-variant)] focus:border-[var(--primary)] rounded-xl px-3 py-2 text-sm focus:outline-none transition-all duration-200 resize-none min-h-[80px]"
                        />
                        <div className="text-[9px] text-right font-black opacity-30">
                          {message.length}/200
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 border-t-3 border-[var(--outline-variant)]/20 flex gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          const shareUrl = `${window.location.origin}/guestbook`;
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
  );
};
