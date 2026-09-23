import React, { useState, useEffect, useRef, useCallback } from "react";
import { haptic } from "../haptics";
import { useTheme } from "../ThemeContext";

export interface RippleProps {
  target?: HTMLElement;
  color?: string;
  opacity?: number;
  hoverOpacity?: number;
  disabled?: boolean;
  className?: string;
  enableHover?: boolean;
  enableHaptics?: boolean;
}

interface RippleWave {
  id: number;
  x: number;
  y: number;
  size: number;
  isExiting: boolean;
}

interface GesturePointer {
  clientX: number;
  clientY: number;
  canceled: boolean;
}

/**
 * M3 guideline-compliant state layer and ripple overlay
 * 
 * note: use `<Ripple />` inside any `<button>`, `<a>`, or clickable element
 * note 2: be sure parent container uses `relative` and `overflow-hidden` (or `m3-button-*` classes)!!
 */
export const Ripple: React.FC<RippleProps> = ({
  target,
  color = "currentColor",
  opacity = 0.14,
  hoverOpacity = 0.08,
  disabled = false,
  className = "",
  enableHover = true,
  enableHaptics = true,
}) => {
  const { settings } = useTheme();
  const isEnabled = settings.ripplesEnabled;
  const containerRef = useRef<HTMLDivElement>(null);
  const [ripples, setRipples] = useState<RippleWave[]>([]);
  const nextId = useRef(0);
  const activeRipplesCount = useRef(0);
  const gesturePointer = useRef<GesturePointer | null>(null);
  const touchRippleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const createRipple = useCallback(
    (clientX?: number, clientY?: number) => {
      if (disabled) return;
      const owner = target ?? containerRef.current?.parentElement;
      if (!owner) return;

      const rect = owner.getBoundingClientRect();
      let x: number;
      let y: number;

      if (clientX !== undefined && clientY !== undefined) {
        x = clientX - rect.left;
        y = clientY - rect.top;
      } else {
        x = rect.width / 2;
        y = rect.height / 2;
      }

      // find distance to the furthest corner for absolute coverage
      const dX = Math.max(x, rect.width - x);
      const dY = Math.max(y, rect.height - y);
      const radius = Math.sqrt(dX * dX + dY * dY);
      const size = radius * 2;
      const newRipple: RippleWave = {
        id: nextId.current++,
        x: x - radius,
        y: y - radius,
        size,
        isExiting: false,
      };

      activeRipplesCount.current += 1;
      setRipples((prev) => [...prev, newRipple]);
      if (enableHaptics) {
        haptic.ripple();
      }
    },
    [disabled, enableHaptics, target]
  );

  const releaseRipples = useCallback(() => {
    if (activeRipplesCount.current === 0) return;
    activeRipplesCount.current = 0;
    setRipples((prev) =>
      prev.map((r) => (r.isExiting ? r : { ...r, isExiting: true }))
    );
  }, []);

  useEffect(() => {
    if (!isEnabled) return;
    const owner = target ?? containerRef.current?.parentElement;
    if (!owner) return;

    const handlePointerDown = (e: PointerEvent) => {
      if (e.button !== 0 && e.pointerType === "mouse") return; // primary click only
      const eventTarget = e.target instanceof Element ? e.target : null;
      if (target && eventTarget?.closest("[data-m3-ripple-target]") !== owner) return;

      if (e.pointerType !== "mouse") {
        gesturePointer.current = {
          clientX: e.clientX,
          clientY: e.clientY,
          canceled: false,
        };
        touchRippleTimer.current = setTimeout(() => {
          if (gesturePointer.current && !gesturePointer.current.canceled) {
            createRipple(e.clientX, e.clientY);
          }
          touchRippleTimer.current = null;
        }, 60);
        return;
      }

      createRipple(e.clientX, e.clientY);
    };

    const cancelIfMoved = (clientX: number, clientY: number) => {
      const gesture = gesturePointer.current;
      if (!gesture || gesture.canceled) return;

      const movedX = clientX - gesture.clientX;
      const movedY = clientY - gesture.clientY;
      if (Math.hypot(movedX, movedY) > 8) {
        gesture.canceled = true;
        if (touchRippleTimer.current) {
          clearTimeout(touchRippleTimer.current);
          touchRippleTimer.current = null;
        }
        releaseRipples();
      }
    };

    const handlePointerMove = (e: PointerEvent) => {
      cancelIfMoved(e.clientX, e.clientY);
    };

    const handleTouchMove = (e: TouchEvent) => {
      const touch = e.touches[0];
      if (touch) cancelIfMoved(touch.clientX, touch.clientY);
    };

    const handlePointerUp = () => {
      if (touchRippleTimer.current) {
        clearTimeout(touchRippleTimer.current);
        touchRippleTimer.current = null;
        const gesture = gesturePointer.current;
        if (gesture && !gesture.canceled) {
          createRipple(gesture.clientX, gesture.clientY);
        }
      }
      gesturePointer.current = null;
      releaseRipples();
    };

    const handlePointerCancel = () => {
      if (touchRippleTimer.current) {
        clearTimeout(touchRippleTimer.current);
        touchRippleTimer.current = null;
      }
      gesturePointer.current = null;
      releaseRipples();
    };

    const handlePointerLeave = () => {
      if (touchRippleTimer.current) {
        clearTimeout(touchRippleTimer.current);
        touchRippleTimer.current = null;
      }
      gesturePointer.current = null;
      releaseRipples();
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        if (!e.repeat) {
          createRipple();
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        releaseRipples();
      }
    };

    owner.addEventListener("pointerdown", handlePointerDown);
    owner.addEventListener("pointermove", handlePointerMove);
    owner.addEventListener("pointerup", handlePointerUp);
    owner.addEventListener("pointercancel", handlePointerCancel);
    owner.addEventListener("pointerleave", handlePointerLeave);
    owner.addEventListener("keydown", handleKeyDown);
    owner.addEventListener("keyup", handleKeyUp);
    window.addEventListener("pointermove", handlePointerMove, true);
    window.addEventListener("touchmove", handleTouchMove, { capture: true, passive: true });
    return () => {
      owner.removeEventListener("pointerdown", handlePointerDown);
      owner.removeEventListener("pointermove", handlePointerMove);
      owner.removeEventListener("pointerup", handlePointerUp);
      owner.removeEventListener("pointercancel", handlePointerCancel);
      owner.removeEventListener("pointerleave", handlePointerLeave);
      owner.removeEventListener("keydown", handleKeyDown);
      owner.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("pointermove", handlePointerMove, true);
      window.removeEventListener("touchmove", handleTouchMove, true);
    };
  }, [createRipple, releaseRipples, target, isEnabled]);

  const removeRipple = (id: number) => {
    setRipples((prev) => prev.filter((r) => r.id !== id));
  };

  if (!isEnabled) return null;

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      data-m3-ripple-scope={target ? "" : undefined}
      className={`m3-ripple-container pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit] select-none z-0 ${className}`}
      style={
        {
          "--ripple-color": color,
          "--ripple-opacity": opacity,
          "--ripple-hover-opacity": hoverOpacity,
        } as React.CSSProperties
      }
    >
      {/* state layer for hover */}
      {enableHover && !disabled && <div className="m3-ripple-hover" />}

      {/* wave */}
      {ripples.map((ripple) => (
        <span
          key={ripple.id}
          className={`m3-ripple-wave ${ripple.isExiting ? "m3-ripple-wave--exiting" : ""}`}
          style={{
            left: `${ripple.x}px`,
            top: `${ripple.y}px`,
            width: `${ripple.size}px`,
            height: `${ripple.size}px`,
          }}
          onAnimationEnd={(e) => {
            if (ripple.isExiting || e.animationName === "m3-ripple-exit") {
              removeRipple(ripple.id);
            }
          }}
          onTransitionEnd={() => {
            if (ripple.isExiting) {
              removeRipple(ripple.id);
            }
          }}
        />
      ))}
    </div>
  );
};

export default Ripple;
