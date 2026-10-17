import React, { useRef, useState, useEffect, useCallback, memo } from "react";
import { cn } from "../constants";
import { useTheme } from "../ThemeContext";
import { Badge, BadgeProps } from "./Badge";

export interface LiquidGlassContextType {
  mouseX: number;
  mouseY: number;
  active: boolean;
  popping: boolean;
  width: number;
  height: number;
}

export const LiquidGlassContext = React.createContext<LiquidGlassContextType>({
  mouseX: 0,
  mouseY: 0,
  active: false,
  popping: false,
  width: 0,
  height: 0,
});

export const useLiquidGlass = () => React.useContext(LiquidGlassContext);

interface LiquidGlassCardProps {
  children: React.ReactNode;
  className?: string;
  innerClassName?: string;
  radius?: number;
  interactive?: boolean;
}

function getAppleSquirclePath(
  width: number,
  height: number,
  cornerRadius: number,
  cornerSmoothing = 0.6,
  inset = 0
): string {
  const w = width - inset * 2;
  const h = height - inset * 2;
  if (w <= 0 || h <= 0) return "";
  const maxBudget = Math.min(w, h) / 2;
  const r = Math.min(Math.max(cornerRadius - inset, 4), maxBudget);
  const maxSmoothing = maxBudget / r - 1;
  const smoothing = Math.min(cornerSmoothing, Math.max(0, maxSmoothing));
  const p = Math.min((1 + smoothing) * r, maxBudget);
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const arcMeasure = 90 * (1 - smoothing);
  const arcLen = Math.sin(toRad(arcMeasure / 2)) * r * Math.SQRT2;
  const angleAlpha = (90 - arcMeasure) / 2;
  const p3ToP4 = r * Math.tan(toRad(angleAlpha / 2));
  const angleBeta = 45 * smoothing;
  const c = p3ToP4 * Math.cos(toRad(angleBeta));
  const d = c * Math.tan(toRad(angleBeta));
  const b = (p - arcLen - c - d) / 3;
  const a = 2 * b;
  const f = (n: number) => Number((n + inset).toFixed(3));

  return [
    `M ${f(w - p)} ${inset}`,
    `c ${Number(a.toFixed(3))} 0 ${Number((a + b).toFixed(3))} 0 ${Number((a + b + c).toFixed(3))} ${Number(d.toFixed(3))}`,
    `a ${Number(r.toFixed(3))} ${Number(r.toFixed(3))} 0 0 1 ${Number(arcLen.toFixed(3))} ${Number(arcLen.toFixed(3))}`,
    `c ${Number(d.toFixed(3))} ${Number(c.toFixed(3))} ${Number(d.toFixed(3))} ${Number((b + c).toFixed(3))} ${Number(d.toFixed(3))} ${Number((a + b + c).toFixed(3))}`,
    `L ${f(w)} ${f(h - p)}`,
    `c 0 ${Number(a.toFixed(3))} 0 ${Number((a + b).toFixed(3))} ${Number((-d).toFixed(3))} ${Number((a + b + c).toFixed(3))}`,
    `a ${Number(r.toFixed(3))} ${Number(r.toFixed(3))} 0 0 1 ${Number((-arcLen).toFixed(3))} ${Number(arcLen.toFixed(3))}`,
    `c ${Number((-c).toFixed(3))} ${Number(d.toFixed(3))} ${Number((-(b + c)).toFixed(3))} ${Number(d.toFixed(3))} ${Number((-(a + b + c)).toFixed(3))} ${Number(d.toFixed(3))}`,
    `L ${f(p)} ${f(h)}`,
    `c ${Number((-a).toFixed(3))} 0 ${Number((-(a + b)).toFixed(3))} 0 ${Number((-(a + b + c)).toFixed(3))} ${Number((-d).toFixed(3))}`,
    `a ${Number(r.toFixed(3))} ${Number(r.toFixed(3))} 0 0 1 ${Number((-arcLen).toFixed(3))} ${Number((-arcLen).toFixed(3))}`,
    `c ${Number((-d).toFixed(3))} ${Number((-c).toFixed(3))} ${Number((-d).toFixed(3))} ${Number((-(b + c)).toFixed(3))} ${Number((-d).toFixed(3))} ${Number((-(a + b + c)).toFixed(3))}`,
    `L ${inset} ${f(p)}`,
    `c 0 ${Number((-a).toFixed(3))} 0 ${Number((-(a + b)).toFixed(3))} ${Number(d.toFixed(3))} ${Number((-(a + b + c)).toFixed(3))}`,
    `a ${Number(r.toFixed(3))} ${Number(r.toFixed(3))} 0 0 1 ${Number(arcLen.toFixed(3))} ${Number((-arcLen).toFixed(3))}`,
    `c ${Number(c.toFixed(3))} ${Number((-d).toFixed(3))} ${Number((b + c).toFixed(3))} ${Number((-d).toFixed(3))} ${Number((a + b + c).toFixed(3))} ${Number((-d).toFixed(3))}`,
    "Z",
  ].join(" ");
}

export const LiquidGlassBadge = memo(({
  icon,
  children,
  className,
  ...props
}: BadgeProps) => {
  const badgeRef = useRef<HTMLDivElement>(null);
  const { mouseX, mouseY, active, popping } = useLiquidGlass();
  const [glint, setGlint] = useState({
    x: 50,
    y: 50,
    intensity: 0,
    pushX: 0,
    pushY: 0,
  });

  useEffect(() => {
    if (!active || !badgeRef.current) {
      setGlint((prev) => ({
        ...prev,
        intensity: 0,
        pushX: 0,
        pushY: 0,
      }));
      return;
    }
    const el = badgeRef.current;
    const rect = el.getBoundingClientRect();
    const parent = el.closest(".group\\/liquid")?.getBoundingClientRect();
    if (!parent) return;

    const bx = rect.left - parent.left + rect.width / 2;
    const by = rect.top - parent.top + rect.height / 2;
    const dx = mouseX - bx;
    const dy = mouseY - by;
    const dist = Math.hypot(dx, dy);

    const localX = mouseX - (rect.left - parent.left);
    const localY = mouseY - (rect.top - parent.top);
    const maxRadius = 220;
    const ratio = Math.max(0, 1 - dist / maxRadius);
    const intensity = ratio * ratio * (3 - 2 * ratio);
    const pushRadius = 130;
    const pushRatio = Math.max(0, 1 - dist / pushRadius);
    const pushEase = pushRatio * pushRatio;
    const angle = Math.atan2(dy, dx);
    const pushDist = pushEase * 3; // 0-3px
    const pushX = -Math.cos(angle) * pushDist;
    const pushY = -Math.sin(angle) * pushDist;

    setGlint({
      x: Math.round(localX),
      y: Math.round(localY),
      intensity,
      pushX: Number(pushX.toFixed(2)),
      pushY: Number(pushY.toFixed(2)),
    });
  }, [mouseX, mouseY, active]);

  return (
    <div
      ref={badgeRef}
      className="relative group/badge rounded-full will-change-transform"
      style={{
        transform: `translate3d(${glint.pushX}px, ${glint.pushY}px, 0)`,
        transition: active
          ? "transform 80ms ease-out"
          : "transform 450ms cubic-bezier(0.34, 1.56, 0.64, 1)",
      }}
    >
      <div
        aria-hidden="true"
        className="absolute -inset-[1px] rounded-full pointer-events-none z-20"
        style={{
          opacity: popping ? 0 : glint.intensity,
          transform: popping ? "scale(1.12)" : "scale(1)",
          transition: active
            ? "opacity 120ms ease-out"
            : "opacity 380ms cubic-bezier(0.16, 1, 0.3, 1), transform 420ms cubic-bezier(0.34, 1.56, 0.64, 1)",
          background: `radial-gradient(circle 90px at ${glint.x}px ${glint.y}px, #ffffff 0%, var(--primary) 35%, transparent 75%)`,
          WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          WebkitMaskComposite: "xor",
          maskComposite: "exclude",
          padding: "1.5px",
        }}
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 rounded-full pointer-events-none z-10 overflow-hidden"
        style={{
          opacity: popping ? 0 : glint.intensity * 0.25,
          transition: active
            ? "opacity 120ms ease-out"
            : "opacity 350ms cubic-bezier(0.16, 1, 0.3, 1)",
          background: `radial-gradient(circle 100px at ${glint.x}px ${glint.y}px, rgba(255, 255, 255, 0.4) 0%, var(--primary) 40%, transparent 80%)`,
        }}
      />
      <Badge
        icon={icon}
        className={cn(
          "relative backdrop-blur-md transition-colors",
          className
        )}
        {...props}
      >
        {children}
      </Badge>
    </div>
  );
});

export interface LiquidGlassCharProps {
  children: React.ReactNode;
  className?: string;
  isFlickering?: boolean;
  isAccent?: boolean;
  actualTheme?: string;
  style?: React.CSSProperties;
}

export const LiquidGlassChar = memo(({
  children,
  className,
  isFlickering = false,
  isAccent = false,
  actualTheme: propTheme,
  style,
}: LiquidGlassCharProps) => {
  const { actualTheme: contextTheme } = useTheme();
  const actualTheme = propTheme || contextTheme || "dark";
  const spanRef = useRef<HTMLSpanElement>(null);
  const { mouseX, mouseY, active, popping } = useLiquidGlass();
  const [rim, setRim] = useState<{
    specX: number;
    specY: number;
    shadowX: number;
    shadowY: number;
    ease: number;
  }>({
    specX: 0,
    specY: -1,
    shadowX: 0,
    shadowY: 2,
    ease: 0,
  });

  useEffect(() => {
    if (!active || !spanRef.current) {
      setRim((prev) => (prev.ease === 0 ? prev : { specX: 0, specY: -1, shadowX: 0, shadowY: 2, ease: 0 }));
      return;
    }
    const el = spanRef.current;
    const rect = el.getBoundingClientRect();
    const parent = el.closest(".group\\/liquid")?.getBoundingClientRect();
    if (!parent) return;
    const cx = rect.left - parent.left + rect.width / 2;
    const cy = rect.top - parent.top + rect.height / 2;
    const dx = mouseX - cx;
    const dy = mouseY - cy;
    const dist = Math.hypot(dx, dy);
    const maxRadius = 320;
    const rawRatio = Math.max(0, 1 - dist / maxRadius);
    const ease = rawRatio * rawRatio * (3 - 2 * rawRatio);

    if (dist < 1) {
      setRim({ specX: 0, specY: 0, shadowX: 0, shadowY: 0, ease });
      return;
    }

    const nx = dx / dist;
    const ny = dy / dist;

    setRim({
      specX: Number((nx * 1.5 * ease).toFixed(2)),
      specY: Number((ny * 1.5 * ease).toFixed(2)),
      shadowX: Number((-nx * 3 * ease).toFixed(2)),
      shadowY: Number((-ny * 3 * ease).toFixed(2)),
      ease,
    });
  }, [mouseX, mouseY, active]);

  const isDark = actualTheme === "dark";
  const specularAlpha = isDark ? (0.2 + rim.ease * 0.75) : (0.35 + rim.ease * 0.55);
  const shadowAlpha = isDark ? (0.6 + rim.ease * 0.35) : (0.15 + rim.ease * 0.25);
  const dynamicTextShadow = rim.ease > 0 && !popping
    ? `${rim.specX}px ${rim.specY}px ${1 + rim.ease * 2}px rgba(255, 255, 255, ${specularAlpha.toFixed(2)}),
       ${rim.shadowX}px ${rim.shadowY}px ${2 + rim.ease * 3}px rgba(0, 0, 0, ${shadowAlpha.toFixed(2)}),
       0 6px 30px rgba(0, 0, 0, ${isDark ? 0.75 : 0.12})`
    : (isDark
        ? "0 1px 2px rgba(255, 255, 255, 0.18), 0 4px 28px rgba(0, 0, 0, 0.75), 0 1px 3px rgba(0, 0, 0, 0.9)"
        : "0 1px 2px rgba(255, 255, 255, 0.6), 0 2px 20px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)");

  return (
    <span
      ref={spanRef}
      className={cn("inline-block pr-[0.06em] -mr-[0.06em] will-change-[text-shadow]", className)}
      style={{
        ...style,
        textShadow: dynamicTextShadow,
        transition: active
          ? "none"
          : "text-shadow 400ms cubic-bezier(0.16, 1, 0.3, 1)",
      }}
    >
      {children}
    </span>
  );
});

export const LiquidGlassCard = memo(({
  children,
  className,
  innerClassName,
  radius = 44,
  interactive = true,
}: LiquidGlassCardProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const popTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [mousePos, setMousePos] = useState({ x: 0, y: 0, active: false, popping: false });
  const { actualTheme } = useTheme();

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const updateSize = () => {
      const rect = el.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        setSize({ w: Math.round(rect.width), h: Math.round(rect.height) });
      }
    };

    updateSize();
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) {
          setSize({ w: Math.round(width), h: Math.round(height) });
        }
      }
    });

    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!interactive) return;
    if (popTimeoutRef.current) {
      clearTimeout(popTimeoutRef.current);
      popTimeoutRef.current = null;
    }
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      active: true,
      popping: false,
    });
  }, [interactive]);

  const handleMouseLeave = useCallback(() => {
    if (popTimeoutRef.current) clearTimeout(popTimeoutRef.current);
    setMousePos((prev) => ({ ...prev, active: false, popping: true }));
    popTimeoutRef.current = setTimeout(() => {
      setMousePos((prev) => ({ ...prev, popping: false }));
    }, 450);
  }, []);

  useEffect(() => {
    return () => {
      if (popTimeoutRef.current) clearTimeout(popTimeoutRef.current);
    };
  }, []);

  const pathD = size.w > 0 && size.h > 0 ? getAppleSquirclePath(size.w, size.h, radius, 0.6, 0) : "";
  const clipId = React.useId().replace(/:/g, "_");

  return (
    <LiquidGlassContext.Provider
      value={{
        mouseX: mousePos.x,
        mouseY: mousePos.y,
        active: mousePos.active,
        popping: mousePos.popping,
        width: size.w,
        height: size.h,
      }}
    >
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className={cn(
          "relative isolate group/liquid cursor-default transition-all duration-300",
          className
        )}
      >
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none -z-30 transition-shadow duration-500"
          style={{
            borderRadius: `${radius}px`,
            boxShadow: actualTheme === "dark"
              ? [
                  "0 6px 18px -8px rgba(0, 0, 0, 0.25)",           // mobile base (overridden at md)
                  "0 0 20px -10px color-mix(in oklch, var(--primary) 8%, transparent)",
                ].join(", ")
              : [
                  "0 4px 12px -6px rgba(0, 0, 0, 0.06)",
                  "0 0 16px -8px color-mix(in oklch, var(--primary) 5%, transparent)",
                ].join(", "),
          }}
        />
        <div
          aria-hidden="true"
          className="hidden sm:block absolute inset-0 pointer-events-none -z-30 transition-shadow duration-500"
          style={{
            borderRadius: `${radius}px`,
            boxShadow: actualTheme === "dark"
              ? "0 16px 36px -12px rgba(0, 0, 0, 0.4), 0 0 30px -10px color-mix(in oklch, var(--primary) 12%, transparent)"
              : "0 12px 28px -10px rgba(0, 0, 0, 0.08), 0 0 24px -10px color-mix(in oklch, var(--primary) 8%, transparent)",
          }}
        />
        <div
          className="absolute inset-0 pointer-events-none transform-gpu backdrop-blur-sm md:backdrop-blur-md"
          style={{
            clipPath: pathD ? `path('${pathD}')` : undefined,
            WebkitClipPath: pathD ? `path('${pathD}')` : undefined,
            borderRadius: `${radius}px`,
          }}
        >
          <div className="absolute inset-0 bg-white/[0.025] dark:bg-white/[0.015] transition-colors duration-300" />
          <div
            aria-hidden="true"
            className="absolute inset-x-0 top-0 h-1/3 pointer-events-none opacity-20 dark:opacity-15"
            style={{
              background: "linear-gradient(to bottom, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.02) 40%, transparent 100%)",
            }}
          />
          {size.w > 0 && (
            <div
              aria-hidden="true"
              className="absolute inset-0 pointer-events-none transform-gpu"
              style={{
                opacity: mousePos.active ? 0.14 : 0,
                transform: mousePos.popping ? "scale(1.2)" : "scale(1)",
                transition: mousePos.active
                  ? "opacity 120ms ease-out, transform 80ms ease-out"
                  : "opacity 420ms cubic-bezier(0.16, 1, 0.3, 1), transform 450ms cubic-bezier(0.34, 1.56, 0.64, 1)",
                background: `radial-gradient(
                  circle ${mousePos.popping ? 240 : 180}px at ${mousePos.x}px ${mousePos.y}px,
                  rgba(255, 255, 255, 0.5) 0%,
                  var(--primary) 30%,
                  transparent 70%
                )`,
              }}
            />
          )}
        </div>

        {size.w > 0 && size.h > 0 && pathD && (
          <svg
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 size-full overflow-visible z-20"
            width={size.w}
            height={size.h}
          >
            <defs>
              <linearGradient id={`ambient_${clipId}`} x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#ffffff" stopOpacity={actualTheme === "dark" ? 0.28 : 0.32} />
                <stop offset="12%" stopColor="#ffffff" stopOpacity={actualTheme === "dark" ? 0.12 : 0.16} />
                <stop offset="28%" stopColor="var(--outline-variant)" stopOpacity={0.04} />
                <stop offset="50%" stopColor="transparent" stopOpacity={0} />
                <stop offset="100%" stopColor="transparent" stopOpacity={0} />
              </linearGradient>

              <radialGradient
                id={`spotlight_${clipId}`}
                cx={mousePos.x || size.w * 0.5}
                cy={mousePos.y || size.h * 0.1}
                r={mousePos.popping ? 230 : 160}
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="0%" stopColor="#ffffff" stopOpacity={actualTheme === "dark" ? 0.55 : 0.45} />
                <stop offset="35%" stopColor="var(--primary)" stopOpacity={actualTheme === "dark" ? 0.3 : 0.22} />
                <stop offset="70%" stopColor="var(--primary)" stopOpacity={0.06} />
                <stop offset="100%" stopColor="transparent" stopOpacity={0} />
              </radialGradient>
            </defs>

            <path
              d={pathD}
              fill="none"
              stroke={`url(#ambient_${clipId})`}
              strokeWidth={1}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d={pathD}
              fill="none"
              stroke={`url(#spotlight_${clipId})`}
              strokeWidth={1.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="pointer-events-none"
              style={{
                opacity: mousePos.active ? 0.85 : 0,
                transition: mousePos.active
                  ? "opacity 150ms ease-out"
                  : "opacity 450ms cubic-bezier(0.16, 1, 0.3, 1)",
              }}
            />
          </svg>
        )}
        <div className={cn("relative z-10", innerClassName)}>
          {children}
        </div>
      </div>
    </LiquidGlassContext.Provider>
  );
});

export default LiquidGlassCard;
