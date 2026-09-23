// @ts-nocheck
import React, {
  useRef,
  useState,
  useEffect,
  useCallback,
  forwardRef,
  useImperativeHandle,
} from "react";
import { motion, AnimatePresence } from "motion/react";

const BAR_WIDTH     = 6;
const BAR_WIDE      = 24;
const TRACK_GAP     = 6;
const PAD           = 6;
const ROUNDING_LG   = 14;
const MIN_THUMB_PX  = 32; 
const OVERDRAG_MAX  = 24; 

const EXPAND_SPRING = { type: "spring", stiffness: 500, damping: 30, mass: 0.6 };
const SQUISH_SPRING = { type: "spring", stiffness: 600, damping: 34 };

function rubberBand(pastPx: number) {
  const sign = pastPx < 0 ? -1 : 1;
  const mag  = Math.min(OVERDRAG_MAX, Math.sqrt(Math.abs(pastPx)) * 3);
  return sign * mag;
}

function useScrollbarCore(targetGetter: () => HTMLElement | Window | null, isWindow: boolean) {
  const [thumbRatio, setThumbRatio]   = useState(0);
  const [thumbOffset, setThumbOffset] = useState(0);
  const [scrollable, setScrollable]   = useState(false);
  const [trackPx, setTrackPx]         = useState(0);

  const rawRatio = useRef(1);

  const getMetrics = useCallback(() => {
    if (isWindow) {
      return {
        scrollTop: window.scrollY,
        scrollHeight: document.documentElement.scrollHeight,
        clientHeight: window.innerHeight,
      };
    }
    const el = targetGetter() as HTMLElement | null;
    if (!el) return null;
    return { scrollTop: el.scrollTop, scrollHeight: el.scrollHeight, clientHeight: el.clientHeight };
  }, [targetGetter, isWindow]);

  const sync = useCallback(() => {
    const m = getMetrics();
    if (!m) return;
    const { scrollTop, scrollHeight, clientHeight } = m;
    const ratio  = scrollHeight > 0 ? clientHeight / scrollHeight : 1;
    const offset = scrollHeight > clientHeight ? scrollTop / (scrollHeight - clientHeight) : 0;
    rawRatio.current = Math.min(1, ratio);
    setThumbRatio(Math.min(1, ratio));
    setThumbOffset(Math.max(0, Math.min(1, offset)));
    setScrollable(ratio < 0.999);
    setTrackPx(clientHeight - PAD * 2);
  }, [getMetrics]);

  return { thumbRatio, thumbOffset, scrollable, trackPx, rawRatio, sync, getMetrics };
}

function clampThumbRatio(ratio: number, trackPx: number) {
  if (trackPx <= 0) return ratio;
  const minRatio = MIN_THUMB_PX / trackPx;
  return Math.max(ratio, Math.min(1, minRatio));
}

interface M3ScrollBarProps {
  scrollEl?: React.RefObject<HTMLElement | null>;
  thumbColor?: string;
  alwaysVisible?: boolean;
  colorful?: boolean;
  className?: string;
  thinOnly?: boolean;
}

export const M3ScrollBar = forwardRef<HTMLDivElement, M3ScrollBarProps>(
  function M3ScrollBar({ scrollEl, thumbColor, alwaysVisible = false, colorful = true, thinOnly = false, className = "" }, ref) {
    const hostRef = useRef<HTMLDivElement>(null);
    useImperativeHandle(ref, () => hostRef.current!);

    const targetRef = useRef<HTMLElement | null>(null);
    const getTarget = useCallback(() => targetRef.current, []);
    const { thumbRatio: rawThumbRatio, thumbOffset, scrollable, trackPx: rawTrackPx, rawRatio, sync } =
      useScrollbarCore(getTarget, false);
    const trackPx = rawTrackPx || 1;

    const thumbRatio = clampThumbRatio(rawThumbRatio, trackPx);

    const [hovered,   setHovered]   = useState(false);
    const [dragging,  setDragging]  = useState(false);
    const [scrolling, setScrolling] = useState(false);
    const scrollTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    const [overdrag, setOverdrag] = useState(0);

    useEffect(() => {
      if (scrollEl?.current) {
        targetRef.current = scrollEl.current;
        return;
      }
      const host = hostRef.current;
      if (!host) return;
      let el = host.parentElement;
      while (el && el !== document.body) {
        const { overflow, overflowY } = getComputedStyle(el);
        if (/auto|scroll/.test(overflow) || /auto|scroll/.test(overflowY)) {
          targetRef.current = el;
          break;
        }
        el = el.parentElement;
      }
    }, [scrollEl]);

    useEffect(() => {
      const el = targetRef.current;
      if (!el) return;
      sync();
      const onScroll = () => {
        sync();
        if (thinOnly) {
          setScrolling(true);
          if (scrollTimer.current) clearTimeout(scrollTimer.current);
          scrollTimer.current = setTimeout(() => setScrolling(false), 1000);
        }
      };
      el.addEventListener("scroll", onScroll, { passive: true });
      const ro = new ResizeObserver(sync);
      ro.observe(el);
      return () => {
        el.removeEventListener("scroll", onScroll);
        ro.disconnect();
        if (scrollTimer.current) clearTimeout(scrollTimer.current);
      };
    }, [sync, thinOnly]);

    const dragStartY  = useRef(0);
    const dragStartST = useRef(0);

    const onPointerDown = useCallback((e: React.PointerEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragging(true);
      dragStartY.current  = e.clientY;
      dragStartST.current = targetRef.current?.scrollTop ?? 0;
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    }, []);

    const onPointerMove = useCallback((e: React.PointerEvent) => {
      if (!dragging) return;
      const el = targetRef.current;
      if (!el) return;
      const trackH   = (hostRef.current?.clientHeight ?? el.clientHeight) - PAD * 2;
      const thumbH   = trackH * thumbRatio;
      const usable   = trackH - thumbH;
      const dy       = e.clientY - dragStartY.current;
      const maxScroll = el.scrollHeight - el.clientHeight;
      const targetST  = dragStartST.current + (dy / usable) * maxScroll;

      el.scrollTop = Math.max(0, Math.min(maxScroll, targetST));

      const past = targetST < 0 ? targetST : targetST > maxScroll ? targetST - maxScroll : 0;
      setOverdrag(rubberBand(past));
    }, [dragging, thumbRatio]);

    const onPointerUp = useCallback(() => {
      setDragging(false);
      setOverdrag(0);
    }, []);

    const onTrackPointerDown = useCallback((e: React.PointerEvent) => {
      const el = targetRef.current;
      if (!el || !hostRef.current) return;
      e.preventDefault();
      e.stopPropagation();

      const hostRect = hostRef.current.getBoundingClientRect();
      const trackH   = hostRect.height - PAD * 2;
      const thumbH   = trackH * thumbRatio;
      const clickY   = e.clientY - hostRect.top - PAD;

      const targetTopPx = Math.max(0, Math.min(trackH - thumbH, clickY - thumbH / 2));
      const frac = trackH > thumbH ? targetTopPx / (trackH - thumbH) : 0;

      const maxScroll = el.scrollHeight - el.clientHeight;
      el.scrollTo({ top: frac * maxScroll, behavior: "smooth" });
    }, [thumbRatio]);

    const thumb = thumbColor ?? (colorful ? "var(--primary)" : "var(--on-surface-variant)");
    const track = `color-mix(in srgb, ${thumb} 25%, transparent)`;

    const active     = !thinOnly && (hovered || dragging);
    const showBar    = alwaysVisible || (scrollable && (thinOnly ? (scrolling || hovered) : active));
    const opacity    = showBar ? (thinOnly ? 0.6 : 0.85) : 0;

    const thumbTopFrac = thumbOffset * (1 - thumbRatio);

    const topTrackPx    = Math.max(1, (thumbTopFrac * trackPx) - TRACK_GAP);
    const bottomTrackPx = Math.max(1, ((1 - thumbTopFrac - thumbRatio) * trackPx) - TRACK_GAP);
    
    const topTrackScale = overdrag > 0
      ? (topTrackPx + Math.abs(overdrag)) / topTrackPx
      : overdrag < 0
        ? Math.max(0, 1 - Math.abs(overdrag) / (OVERDRAG_MAX * 1.4))
        : 1;
        
    const bottomTrackScale = overdrag < 0
      ? (bottomTrackPx + Math.abs(overdrag)) / bottomTrackPx
      : overdrag > 0
        ? Math.max(0, 1 - Math.abs(overdrag) / (OVERDRAG_MAX * 1.4))
        : 1;

    if (!scrollable && !alwaysVisible) {
      return <div ref={hostRef} style={{ position: "absolute", top: 0, right: 0, bottom: 0, width: thinOnly ? BAR_WIDTH + 6 : BAR_WIDE + 6, pointerEvents: "none" }} />;
    }

    return (
      <div
        ref={hostRef}
        className={className}
        style={{ position: "absolute", top: 0, right: 0, bottom: 0, width: thinOnly ? BAR_WIDTH + 6 : BAR_WIDE + 6, display: "flex", justifyContent: "flex-end", alignItems: "stretch", zIndex: 10, touchAction: "none" }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => { if (!dragging) setHovered(false); }}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <div style={{ position: "relative", width: BAR_WIDE + 4, opacity, transition: "opacity 350ms cubic-bezier(0.4,0,0.2,1)" }}>

          <div style={{ position: "absolute", top: PAD, bottom: PAD, right: 0, width: "100%" }}>
            <motion.div
              onPointerDown={onTrackPointerDown}
              style={{ position: "absolute", right: 0, top: 0, height: `max(0px, calc(${thumbTopFrac * 100}% - ${TRACK_GAP}px))`, width: BAR_WIDTH, borderRadius: 9999, backgroundColor: track, cursor: "pointer", transformOrigin: "top" }}
              animate={{ scaleY: topTrackScale }}
              transition={SQUISH_SPRING}
            />

            <motion.div
              onPointerDown={onTrackPointerDown}
              style={{ position: "absolute", right: 0, top: `calc(${(thumbTopFrac + thumbRatio) * 100}% + ${TRACK_GAP}px)`, bottom: 0, width: BAR_WIDTH, borderRadius: 9999, backgroundColor: track, cursor: "pointer", transformOrigin: "bottom" }}
              animate={{ scaleY: bottomTrackScale }}
              transition={SQUISH_SPRING}
            />

            <motion.div
              style={{ position: "absolute", right: 0, top: `${thumbTopFrac * 100}%`, height: `${thumbRatio * 100}%`, cursor: dragging ? "grabbing" : "grab", display: "flex", alignItems: "center", justifyContent: "center" }}
              onPointerDown={onPointerDown}
              animate={{ y: overdrag }}
              transition={SQUISH_SPRING}
            >
              <motion.div
                animate={{
                  width: active ? BAR_WIDE : BAR_WIDTH,
                  borderTopLeftRadius:    active ? ROUNDING_LG : BAR_WIDTH / 2,
                  borderBottomLeftRadius: active ? ROUNDING_LG : BAR_WIDTH / 2,
                  borderTopRightRadius:    BAR_WIDTH / 2,
                  borderBottomRightRadius: BAR_WIDTH / 2,
                  // scaleY squish removed here so the edges don't tear away from the tracks
                }}
                transition={EXPAND_SPRING}
                style={{ position: "absolute", right: 0, top: 0, bottom: 0, backgroundColor: thumb, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}
              >
                <AnimatePresence>
                  {active && (
                    <motion.div
                      key="arrows"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2, ease: [0.4, 0, 0.6, 1] }}
                      style={{ display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}
                    >
                      <DragHandle />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
    );
  }
);


function DragHandle() {
  const c = "var(--surface)";
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke={c}
      strokeWidth="3.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ display: "block", flexShrink: 0, opacity: 0.9 }}
    >
      <path d="M16 15l-4 4-4-4" />
      <path d="M8 9l4-4 4 4" />
    </svg>
  );
}

interface M3WindowScrollBarProps {
  colorful?: boolean;
  right?: number;
}

export function M3WindowScrollBar({ colorful = true, right = 4 }: M3WindowScrollBarProps) {
  const getWindow = useCallback(() => (typeof window !== "undefined" ? window : null), []);
  const { thumbRatio: rawThumbRatio, thumbOffset, scrollable, trackPx: rawTrackPx, sync } =
    useScrollbarCore(getWindow, true);
  const trackPx = rawTrackPx || 1;

  const thumbRatio = clampThumbRatio(rawThumbRatio, trackPx);

  const [hovered,  setHovered]  = useState(false);
  const [dragging, setDragging] = useState(false);
  const [isTouch,  setIsTouch]  = useState(false);
  const [overdrag, setOverdrag] = useState(0);

  useEffect(() => {
    setIsTouch(window.matchMedia("(pointer: coarse)").matches);
  }, []);

  useEffect(() => {
    sync();
    window.addEventListener("scroll", sync, { passive: true });
    window.addEventListener("resize", sync, { passive: true });
    const ro = new ResizeObserver(sync);
    ro.observe(document.documentElement);
    return () => {
      window.removeEventListener("scroll", sync);
      window.removeEventListener("resize", sync);
      ro.disconnect();
    };
  }, [sync]);

  const hostRef     = useRef<HTMLDivElement>(null);
  const dragStartY  = useRef(0);
  const dragStartST = useRef(0);

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    setDragging(true);
    dragStartY.current  = e.clientY;
    dragStartST.current = window.scrollY;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, []);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragging) return;
    const trackH  = window.innerHeight - PAD * 2;
    const thumbH  = trackH * thumbRatio;
    const usable  = trackH - thumbH;
    const dy      = e.clientY - dragStartY.current;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const targetST  = dragStartST.current + (dy / usable) * maxScroll;

    window.scrollTo({ top: Math.max(0, Math.min(maxScroll, targetST)) });

    const past = targetST < 0 ? targetST : targetST > maxScroll ? targetST - maxScroll : 0;
    setOverdrag(rubberBand(past));
  }, [dragging, thumbRatio]);

  const onPointerUp = useCallback(() => {
    setDragging(false);
    setOverdrag(0);
  }, []);

  const onTrackPointerDown = useCallback((e: React.PointerEvent) => {
    if (!hostRef.current) return;
    e.preventDefault();
    e.stopPropagation();

    const hostRect = hostRef.current.getBoundingClientRect();
    const trackH   = hostRect.height - PAD * 2;
    const thumbH   = trackH * thumbRatio;
    const clickY   = e.clientY - hostRect.top - PAD;

    const targetTopPx = Math.max(0, Math.min(trackH - thumbH, clickY - thumbH / 2));
    const frac = trackH > thumbH ? targetTopPx / (trackH - thumbH) : 0;

    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    window.scrollTo({ top: frac * maxScroll, behavior: "smooth" });
  }, [thumbRatio]);

  if (isTouch || !scrollable) return null;

  const thumb = colorful ? "var(--primary)" : "var(--on-surface-variant)";
  const track = `color-mix(in srgb, ${thumb} 25%, transparent)`;
  const active = hovered || dragging;
  const thumbTopFrac = thumbOffset * (1 - thumbRatio);

  const topTrackPx    = Math.max(1, (thumbTopFrac * trackPx) - TRACK_GAP);
  const bottomTrackPx = Math.max(1, ((1 - thumbTopFrac - thumbRatio) * trackPx) - TRACK_GAP);
  
  const topTrackScale = overdrag > 0
    ? (topTrackPx + Math.abs(overdrag)) / topTrackPx
    : overdrag < 0
      ? Math.max(0, 1 - Math.abs(overdrag) / (OVERDRAG_MAX * 1.4))
      : 1;
      
  const bottomTrackScale = overdrag < 0
    ? (bottomTrackPx + Math.abs(overdrag)) / bottomTrackPx
    : overdrag > 0
      ? Math.max(0, 1 - Math.abs(overdrag) / (OVERDRAG_MAX * 1.4))
      : 1;

  return (
    <div
      ref={hostRef}
      style={{
        position: "fixed",
        top: 0,
        right,
        bottom: 0,
        width: BAR_WIDE + 6,
        display: "flex",
        justifyContent: "flex-end",
        alignItems: "stretch",
        zIndex: 9000,
        pointerEvents: "auto",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { if (!dragging) setHovered(false); }}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      <div style={{
        position: "relative",
        width: BAR_WIDE + 4,
        opacity: active ? 0.85 : scrollable ? 0.4 : 0,
        transition: "opacity 350ms cubic-bezier(0.4,0,0.2,1)",
      }}>
        <div style={{ position: "absolute", top: PAD, bottom: PAD, right: 0, width: "100%" }}>
          <motion.div
            onPointerDown={onTrackPointerDown}
            style={{ position: "absolute", right: 0, top: 0, height: `max(0px, calc(${thumbTopFrac * 100}% - ${TRACK_GAP}px))`, width: BAR_WIDTH, borderRadius: 9999, backgroundColor: track, cursor: "pointer", transformOrigin: "top" }}
            animate={{ scaleY: topTrackScale }}
            transition={SQUISH_SPRING}
          />

          <motion.div
            onPointerDown={onTrackPointerDown}
            style={{ position: "absolute", right: 0, top: `calc(${(thumbTopFrac + thumbRatio) * 100}% + ${TRACK_GAP}px)`, bottom: 0, width: BAR_WIDTH, borderRadius: 9999, backgroundColor: track, cursor: "pointer", transformOrigin: "bottom" }}
            animate={{ scaleY: bottomTrackScale }}
            transition={SQUISH_SPRING}
          />

          <motion.div
            style={{ position: "absolute", right: 0, top: `${thumbTopFrac * 100}%`, height: `${thumbRatio * 100}%`, cursor: dragging ? "grabbing" : "grab", display: "flex", alignItems: "center" }}
            onPointerDown={onPointerDown}
            animate={{ y: overdrag }}
            transition={SQUISH_SPRING}
          >
            <motion.div
              animate={{
                width: active ? BAR_WIDE : BAR_WIDTH,
                borderTopLeftRadius:    active ? ROUNDING_LG : BAR_WIDTH / 2,
                borderBottomLeftRadius: active ? ROUNDING_LG : BAR_WIDTH / 2,
                borderTopRightRadius:    BAR_WIDTH / 2,
                borderBottomRightRadius: BAR_WIDTH / 2,
              }}
              transition={EXPAND_SPRING}
              style={{ position: "absolute", right: 0, top: 0, bottom: 0, backgroundColor: thumb, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}
            >
              <AnimatePresence>
                {active && (
                  <motion.div
                    key="arrows"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2, ease: [0.4, 0, 0.6, 1] }}
                    style={{ display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}
                  >
                    <DragHandle />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
