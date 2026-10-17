import React, { useRef, useEffect, memo } from "react";
import { motion, useSpring } from "motion/react";
import { cn } from "../constants";

export const TiltContainer = memo(({ children, className, innerClassName, onClick, settings, whileHover, whileTap, containerRef, ...props }: any) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const rectRef = useRef<DOMRect | null>(null);
  
  // use springs for much smoother tracking than manual animate calls
  const springConfig = { stiffness: 150, damping: 25, mass: 0.5 };
  const rx = useSpring(0, springConfig);
  const ry = useSpring(0, springConfig);

  useEffect(() => {
    if (!settings?.bentoTilt) {
      rx.set(0);
      ry.set(0);
    }
  }, [settings?.bentoTilt, rx, ry]);

  const handleMouseEnter = () => {
    if (settings?.disableAnimations || !settings?.bentoTilt || window.innerWidth < 768) return;
    rectRef.current = wrapperRef.current?.getBoundingClientRect() || null;
    const card = cardRef.current;
    if (card) card.style.setProperty("--glare-opacity", "1");
  };
  
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (settings?.disableAnimations || !settings?.bentoTilt || window.innerWidth < 768) return;
    
    // Use cached rect if available, fallback only if necessary
    let rect = rectRef.current;
    if (!rect) {
      rect = wrapperRef.current?.getBoundingClientRect() || null;
      rectRef.current = rect;
    }
    if (!rect) return;
    
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    // sink: tilt away from the cursor
    const targetX = -((py - centerY) / centerY) * 12;
    const targetY = ((px - centerX) / centerX) * 12;
    
    rx.set(targetX);
    ry.set(targetY);
    
    const glareX = (px / rect.width) * 100;
    const glareY = (py / rect.height) * 100;
    const card = cardRef.current;
    if (card) {
      card.style.setProperty("--glare-x", `${glareX}%`);
      card.style.setProperty("--glare-y", `${glareY}%`);
    }
  };
  
  const handleMouseLeave = () => {
    rectRef.current = null;
    rx.set(0);
    ry.set(0);
    const card = cardRef.current;
    if (card) card.style.setProperty("--glare-opacity", "0");
  };

  const useTilt = settings?.bentoTilt && window.innerWidth >= 768;
  
  const isInteractive = !!onClick;

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (!isInteractive) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onClick?.(e as any);
    }
  };

  return (
    <div 
      ref={(el) => {
        (wrapperRef as any).current = el;
        if (containerRef) {
          if (typeof containerRef === "function") containerRef(el);
          else containerRef.current = el;
        }
      }}
      className={cn("h-full group/tilt", className, useTilt && "hover:tilt-active")} 
      onMouseEnter={handleMouseEnter}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <motion.div
        ref={cardRef}
        onClick={onClick}
        tabIndex={isInteractive ? 0 : undefined}
        role={isInteractive ? "button" : undefined}
        onKeyDown={handleKeyDown}
        whileHover={settings?.disableAnimations ? undefined : whileHover}
        whileTap={settings?.disableAnimations ? undefined : whileTap}
        {...props}
        className={cn("w-full h-full outline-none", innerClassName, useTilt && "group-hover/tilt:tilt-card")}
        style={{
          ...props.style,
          ...(useTilt ? {
            rotateX: rx,
            rotateY: ry,
          } : {}),
          backfaceVisibility: "hidden",
          WebkitBackfaceVisibility: "hidden",
        }}
      >
        {/* glare layer, only pulled forward slightly */}
        {settings?.bentoTilt && (
          <div
            className="pointer-events-none absolute inset-[-1px] transition-opacity duration-300 rounded-[inherit] glare-layer"
            style={{
              transform: "translateZ(1px)", 
              zIndex: 1,
            }}
          />
        )}
        {children}
      </motion.div>
    </div>
  );
});
