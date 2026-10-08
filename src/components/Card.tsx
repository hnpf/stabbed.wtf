import React, { useState, useEffect, memo } from "react";
import { cn } from "../constants";
import { useTheme } from "../ThemeContext";
import { TiltContainer } from "./TiltContainer";

export const Card = memo(({ children, className, innerClassName, delay = 0, onClick, whileHover, whileTap, noDefaultStyles = false, style, ...props }: any) => {
  const { settings } = useTheme();
  const [shouldAnimate, setShouldAnimate] = useState(false);

  useEffect(() => {
    if (settings.disableAnimations || delay === 0) {
      setShouldAnimate(true);
      return;
    }
    const timer = setTimeout(() => {
      setShouldAnimate(true);
    }, delay * 1000);
    return () => clearTimeout(timer);
  }, [delay, settings.disableAnimations]);

  const initialValues = settings.disableAnimations ? false : {
    opacity: 0,
    y: 20,
    scale: 0.95,
  };

  const defaultWhileHover = {
    transition: { type: "spring", stiffness: 400, damping: 18 },
  };

  const whileHoverValue = whileHover ?? (onClick ? defaultWhileHover : undefined);

  return (
    <TiltContainer
      settings={settings}
      onClick={onClick}
      className={className}
      style={style}
      {...props}
      innerClassName={cn(
        !noDefaultStyles && "m3-card readme-card overflow-hidden cursor-default relative border border-[var(--outline-variant)]",
        onClick && "cursor-pointer",
        innerClassName,
      )}
      initial={initialValues}
      animate={
        shouldAnimate || settings.disableAnimations
          ? { opacity: 1, y: 0, scale: 1 }
          : initialValues
      }
      transition={settings.disableAnimations ? { duration: 0 } : {
        type: "spring",
        stiffness: settings.highHz ? 800 : 700,
        damping: settings.highHz ? 30 : 28,
        mass: 0.8,
      }}
      whileHover={whileHoverValue}
      whileTap={whileTap || { scale: 0.98 }}
    >
      {children}
    </TiltContainer>
  );
});

