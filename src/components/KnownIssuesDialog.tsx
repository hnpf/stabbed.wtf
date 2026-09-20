// @ts-nocheck
import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from "motion/react";
import { Bug, X, ChevronDown, ChevronUp, AlertCircle, CheckCircle, Info, Construction } from "./MaterialIcon";
import { cn, KNOWN_ISSUES, KnownIssues } from "../constants";
import { haptic } from "../haptics";

interface KnownIssuesDialogProps {
  isOpen: boolean;
  onClose: () => void;
  isMobile: boolean;
  viewport?: { w: number; h: number };
}

export const KnownIssuesDialog = ({
  isOpen,
  onClose,
  isMobile,
  viewport,
}: KnownIssuesDialogProps) => {
  const [expandedBugId, setExpandedBugId] = useState<string | null>(null);
  const defaultY = isMobile ? (viewport ? viewport.h * 0.05 : window.innerHeight * 0.05) : 0;
  const y = useMotionValue(isMobile ? (viewport ? viewport.h : window.innerHeight) : 0);
  const modalHeight = useTransform(y, (latestY) => (viewport ? viewport.h : window.innerHeight) - latestY);

  const scrollRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  const dragStartY = useRef(0);
  const dragStartModalY = useRef(0);
  const isDraggingSheet = useRef(false);
  const touchTimes = useRef<{ y: number; t: number }[]>([]);

  // track isOpen transitions to reset y position synchronously during render
  const prevIsOpen = useRef(isOpen);
  if (isOpen && !prevIsOpen.current) {
    if (isMobile) {
      y.set(viewport ? viewport.h : window.innerHeight);
    }
    prevIsOpen.current = true;
  } else if (!isOpen && prevIsOpen.current) {
    prevIsOpen.current = false;
  }

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
        const midpoint = defaultY * 0.5;
        const targetY = currentY < midpoint ? 0 : defaultY;
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

  const toggleExpand = (id: string) => {
    haptic.light();
    setExpandedBugId((prev) => (prev === id ? null : id));
  };

  const getStatusBadge = (status: KnownIssues["status"]) => {
    switch (status) {
      case "investigating":
        return {
          icon: <Info size={12} />,
          text: "Investigating",
          classes: "bg-amber-500/10 text-amber-500 border border-amber-500/30",
        };
      case "identified":
        return {
          icon: <AlertCircle size={12} />,
          text: "Identified",
          classes: "bg-orange-500/10 text-orange-500 border border-orange-500/30",
        };
      case "fixing":
        return {
          icon: <Construction size={12} />,
          text: "Fixing",
          classes: "bg-blue-500/10 text-blue-500 border border-blue-500/30",
        };
      case "resolved":
        return {
          icon: <CheckCircle size={12} />,
          text: "Resolved",
          classes: "bg-emerald-500/10 text-emerald-500 border border-emerald-500/30",
        };
      case "wontfix":
      default:
        return {
          icon: <X size={12} />,
          text: "Declined",
          classes: "bg-neutral-500/10 text-neutral-500 border border-neutral-500/30",
        };
    }
  };

  const getSeverityBadge = (severity: KnownIssues["severity"]) => {
    switch (severity) {
      case "high":
        return "bg-rose-500/15 text-rose-500 font-black";
      case "medium":
        return "bg-orange-500/15 text-orange-500 font-bold";
      case "low":
      default:
        return "bg-sky-500/15 text-sky-500 font-medium";
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
        <div className={cn(
          "fixed inset-0 z-[110] flex justify-center overflow-hidden",
          isMobile ? "items-start p-0 bg-black/20" : "items-center p-4"
        )}>
          {/* backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-md motion-gpu"
          />

          {/* modal container */}
          <motion.div
            ref={modalRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="known-issues-title"
            aria-describedby="known-issues-description"
            initial={isMobile ? { y: viewport ? viewport.h : window.innerHeight } : { opacity: 0, scale: 0.9, y: 20 }}
            animate={isMobile ? { y: defaultY } : { opacity: 1, scale: 1, y: 0 }}
            exit={isMobile ? { 
              y: viewport ? viewport.h : window.innerHeight,
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
                : "w-full max-w-lg rounded-[2rem] md:rounded-[2.5rem] max-h-[85vh] border-3"
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
              {/* drag handle for mobile */}
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
                    <Bug size={20} />
                  </div>
                  <h2 className="font-black text-xl md:text-2xl font-expressive uppercase tracking-tight">
                    Known Issues
                  </h2>
                </div>
                <button
                  onClick={() => {
                    haptic.light();
                    onClose();
                  }}
                  aria-label="Close known issues dialog"
                  className="group w-10 h-10 rounded-full bg-[var(--surface-variant)]/60 hover:bg-[var(--surface-variant)] border-3 border-[var(--outline-variant)]/50 flex items-center justify-center transition-all cursor-pointer text-[var(--on-surface)] active:scale-95 shrink-0 shadow-sm"
                >
                  <X size={20} className="transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:rotate-180 group-hover:scale-110" />
                </button>
              </div>

              {/* list of bugs */}
              <div 
                ref={scrollRef}
                className={cn(
                  "space-y-4 overflow-y-auto scrollbar-hide flex-1",
                  isMobile ? "p-6 pb-32" : "p-6 md:p-8"
                )}
              >
                {KNOWN_ISSUES.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center text-[var(--on-surface-variant)]/60">
                    <CheckCircle size={70} className="mb-7 text-emerald-500/80" />
                    <p className="font-bold">No known bugs or issues have been reported!</p>
                    <p className="text-xs font-display mt-1">Everything seems to be running fine. If this is wrong, make a report!</p>
                  </div>
                ) : (
                  KNOWN_ISSUES.map((bug) => {
                    const statusBadge = getStatusBadge(bug.status);
                    const isExpanded = expandedBugId === bug.id;
                    
                    return (
                      <div
                        key={bug.id}
                        onClick={() => toggleExpand(bug.id)}
                        data-ripple
                        className={cn(
                          "border-6 border-[var(--outline-variant)] bg-[var(--surface-variant)]/40 hover:bg-[var(--surface-variant)]/70 transition-all rounded-[1.5rem] overflow-hidden cursor-pointer",
                          isExpanded && "bg-[var(--surface-variant)]/80 ring-1 ring-[var(--primary)]/20"
                        )}
                      >
                        {/* bug header sum */}
                        <div className="p-4 flex flex-col gap-2">
                          <div className="flex items-start justify-between gap-3">
                            <h3 className="font-bold text-sm text-[var(--on-surface)] flex-1 leading-tight">
                              {bug.title}
                            </h3>
                            <div className="shrink-0 transition-transform duration-200">
                              {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-2 items-center text-[10px] pt-1">
                            {/* status badge */}
                            <span className={cn(
                              "flex items-center gap-1 px-2.5 py-1 rounded-full font-bold uppercase tracking-wider",
                              statusBadge.classes
                            )}>
                              {statusBadge.icon}
                              <span>{statusBadge.text}</span>
                            </span>

                            {/* severity badge */}
                            <span className={cn(
                              "px-2.5 py-1 rounded-full uppercase tracking-wider font-bold border border-black/5",
                              getSeverityBadge(bug.severity)
                            )}>
                              {bug.severity} severity
                            </span>

                            {/* date */}
                            <span className="text-[var(--on-surface-variant)]/60 ml-auto font-medium">
                              {bug.date}
                            </span>
                          </div>
                        </div>

                        {/* expanded details */}
                        <AnimatePresence initial={false}>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0 }}
                              animate={{ height: "auto" }}
                              exit={{ height: 0 }}
                              transition={{ duration: 0.2, ease: "easeInOut" }}
                              className="overflow-hidden bg-[var(--surface)] border-t-3 border-[var(--primary)]/20"
                            >
                              <div className="p-4 text-xs text-[var(--on-surface-variant)] leading-relaxed space-y-2">
                                <p className="font-medium">{bug.description}</p>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })
                )}
              </div>

              {/* footer */}
              <div className="p-6 border-t border-[var(--outline-variant)] shrink-0">
                <button
                  onClick={() => {
                    haptic.light();
                    onClose();
                  }}
                  className="flex-1 w-full bg-[var(--surface-variant)] hover:bg-[var(--outline-variant)]/40 text-[var(--on-surface-variant)] py-3.5 mb-6 rounded-2xl hover:rounded-xl active:scale-95 text-sm font-black tracking-wide border-3 border-[var(--outline-variant)] transition-all duration-200 cursor-pointer text-center"                >
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
