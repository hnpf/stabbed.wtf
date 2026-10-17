import { useEffect, useRef, useState, useCallback } from "react";
import { useSpring, MotionValue } from "motion/react";
import { haptic } from "../haptics";

const MAX_OVERSCROLL = 160;
const THRESHOLD = 32;
function rubberBand(raw: number): number {
  const sign = raw < 0 ? -1 : 1;
  return sign * Math.min(MAX_OVERSCROLL, Math.sqrt(Math.abs(raw)) * 8.5);
}

interface OverscrollState {
  y: MotionValue<number>;
  active: boolean;
  edge: "top" | "bottom" | null;
}

export function useOverscroll(enabled: boolean): OverscrollState {
  const y = useSpring(0, { stiffness: 240, damping: 22, mass: 0.9 });
  const [active, setActive] = useState(false);
  const [edge, setEdge] = useState<"top" | "bottom" | null>(null);
  const rawRef = useRef(0);
  const hapticFiredRef = useRef(false);
  const touchActiveRef = useRef(false);
  const lastTouchY = useRef(0);
  const wheelAccRef = useRef(0);
  const wheelTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const applyRaw = useCallback((raw: number) => {
    rawRef.current = raw;
    const bounded = rubberBand(raw);
    y.set(bounded);
    const newEdge: "top" | "bottom" | null =
      raw > THRESHOLD ? "top" : raw < -THRESHOLD ? "bottom" : null;

    if (newEdge && !hapticFiredRef.current) {
      haptic.medium();
      hapticFiredRef.current = true;
    }
    setActive(Math.abs(bounded) > 8);
    setEdge(newEdge);
  }, [y]);

  const snapBack = useCallback(() => {
    if (Math.abs(rawRef.current) > THRESHOLD) {
      haptic.ripple();
    }
    rawRef.current = 0;
    hapticFiredRef.current = false;
    y.set(0);
    setActive(false);
    setEdge(null);
  }, [y]);

  useEffect(() => {
    if (!enabled) {
      y.set(0);
      setActive(false);
      setEdge(null);
      return;
    }

    // ─── touch ────────────────────────────────────────────────────────
    const onTouchStart = (e: TouchEvent) => {
      touchActiveRef.current = true;
      lastTouchY.current = e.touches[0].clientY;
      hapticFiredRef.current = false;
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!touchActiveRef.current) return;
      const dy = e.touches[0].clientY - lastTouchY.current;
      lastTouchY.current = e.touches[0].clientY;

      const atTop = window.scrollY <= 0;
      const atBottom =
        window.scrollY + window.innerHeight >=
        document.documentElement.scrollHeight - 2;
      if (atTop && dy > 0) {
        applyRaw(rawRef.current + dy);
      } else if (atBottom && dy < 0) {
        applyRaw(rawRef.current + dy);
      } else {
        if (rawRef.current !== 0) {
          rawRef.current = 0;
          hapticFiredRef.current = false;
          y.set(0);
          setActive(false);
          setEdge(null);
        }
      }
    };

    const onTouchEnd = () => {
      touchActiveRef.current = false;
      if (rawRef.current !== 0) snapBack();
    };

    // ─── wheel ────────────────────────────────────────────────────────
    const onWheel = (e: WheelEvent) => {
      const atTop = window.scrollY <= 0;
      const atBottom =
        window.scrollY + window.innerHeight >=
        document.documentElement.scrollHeight - 2;

      if (!atTop && !atBottom) {
        if (wheelAccRef.current !== 0) {
          wheelAccRef.current = 0;
          hapticFiredRef.current = false;
          y.set(0);
          setActive(false);
          setEdge(null);
        }
        return;
      }
      if (atTop && e.deltaY > 0 && wheelAccRef.current !== 0) {
        wheelAccRef.current = 0;
        snapBack();
        return;
      }
      if (atBottom && e.deltaY < 0 && wheelAccRef.current !== 0) {
        wheelAccRef.current = 0;
        snapBack();
        return;
      }

      if ((atTop && e.deltaY < 0) || (atBottom && e.deltaY > 0)) {
        if (Math.abs(e.deltaY) >= 3) {
          wheelAccRef.current -= e.deltaY * 0.65;
          applyRaw(wheelAccRef.current);
          if (wheelTimerRef.current) clearTimeout(wheelTimerRef.current);
          wheelTimerRef.current = setTimeout(() => {
            wheelAccRef.current = 0;
            snapBack();
          }, 80);
        }
      }
    };

    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("touchend", onTouchEnd, { passive: true });
    window.addEventListener("wheel", onWheel, { passive: true });
    return () => {
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("wheel", onWheel);
      if (wheelTimerRef.current) clearTimeout(wheelTimerRef.current);
    };
  }, [enabled, applyRaw, snapBack, y]);
  return { y, active, edge };
}
