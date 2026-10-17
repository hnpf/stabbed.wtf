import React, { memo, useRef, useState, useEffect } from "react";
import { cn } from "../constants";
import { useTheme } from "../ThemeContext";
import { TiltContainer } from "./TiltContainer";

export const Card = memo(({
  children,
  className,
  innerClassName,
  delay = 0,
  onClick,
  whileHover,
  whileTap,
  noDefaultStyles = false,
  style,
  ...props
}: any) => {
  const { settings } = useTheme();
  const cardRef = useRef<HTMLDivElement>(null);
  const [viewState, setViewState] = useState<"visible" | "below" | "above">("visible");

  const defaultWhileHover = {
    transition: { type: "spring", stiffness: 400, damping: 18 },
  };

  const whileHoverValue = whileHover ?? (onClick ? defaultWhileHover : undefined);

  useEffect(() => {
    if (settings.disableAnimations) return;
    const el = cardRef.current;
    if (!el) return;

    // Check initial position on mount
    const rect = el.getBoundingClientRect();
    const windowH = window.innerHeight;
    if (rect.bottom > 0 && rect.top < windowH) {
      setViewState("visible");
    } else if (rect.bottom <= 0) {
      setViewState("above");
    } else {
      setViewState("below");
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting) {
          setViewState("visible");
        } else {
          // If top is negative, it scrolled off the top of the screen; otherwise it is below the viewport
          if (entry.boundingClientRect.top < 0) {
            setViewState("above");
          } else {
            setViewState("below");
          }
        }
      },
      { threshold: 0.08 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [settings.disableAnimations]);

  if (settings.disableAnimations) {
    return (
      <TiltContainer
        settings={settings}
        onClick={onClick}
        className={className}
        style={style}
        {...props}
        innerClassName={cn(
          !noDefaultStyles && "m3-card info-card readme-card overflow-hidden cursor-default relative border border-[var(--outline-variant)]",
          onClick && "cursor-pointer",
          innerClassName,
        )}
        whileHover={whileHoverValue}
        whileTap={whileTap || { scale: 0.98 }}
      >
        {children}
      </TiltContainer>
    );
  }

  // Bidirectional spring pop:
  // - Entering from bottom (scrolling down): below -> visible (y: 50 -> 0)
  // - Entering from top (scrolling up): above -> visible (y: -50 -> 0, inverted!)
  const cardVariants = {
    below: {
      opacity: 0,
      y: 50,
      scale: 0.94,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
    },
    above: {
      opacity: 0,
      y: -50,
      scale: 0.94,
    },
  };

  const isEntering = viewState === "visible";

  return (
    <TiltContainer
      containerRef={cardRef}
      settings={settings}
      onClick={onClick}
      className={className}
      style={style}
      {...props}
      innerClassName={cn(
        !noDefaultStyles && "m3-card info-card readme-card overflow-hidden cursor-default relative border border-[var(--outline-variant)]",
        onClick && "cursor-pointer",
        innerClassName,
      )}
      initial={false}
      animate={viewState}
      variants={cardVariants}
      transition={
        isEntering
          ? {
              type: "spring",
              stiffness: settings.highHz ? 210 : 170,
              damping: settings.highHz ? 16 : 14,
              mass: 0.85,
            }
          : {
              duration: 0.22,
              ease: "easeOut",
            }
      }
      whileHover={whileHoverValue}
      whileTap={whileTap || { scale: 0.98 }}
    >
      {children}
    </TiltContainer>
  );
});

