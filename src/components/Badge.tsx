import React, { HTMLAttributes } from "react";
import { cn } from "../constants";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  icon?: any;
  iconSize?: number;
  children: React.ReactNode;
  size?: "sm" | "md";
  variant?: "default" | "primary" | "surface" | "tonal";
  className?: string;
  iconClassName?: string;
}

const sizeClasses = {
  sm: "px-3 py-1 sm:px-3.5 sm:py-1.5 text-[10px] sm:text-[11px] font-black uppercase tracking-wider gap-1.5 border-2",
  md: "px-4 sm:px-5 py-2 sm:py-2.5 text-[11px] sm:text-[12px] font-bold tracking-wider gap-2 sm:gap-2.5 border-2",
};

const defaultIconSizes = {
  sm: 14,
  md: 18,
};

const variantClasses = {
  default: "bg-[var(--surface-variant)]/50 text-[var(--on-surface)] border-[var(--outline-variant)]/50 shadow-xs",
  surface: "bg-[var(--surface)] text-[var(--on-surface)] border-[var(--outline-variant)] shadow-2xs",
  primary: "bg-[var(--primary-container)]/70 text-[var(--on-primary-container)] border-[var(--primary)]/30 font-black uppercase tracking-widest shadow-md",
  tonal: "bg-[var(--primary)]/10 text-[var(--primary)] border-[var(--primary)]/30 font-bold",
};

export const Badge = ({
  icon: Icon,
  iconSize,
  children,
  size = "md",
  variant = "default",
  className,
  iconClassName,
  ...props
}: BadgeProps) => {
  const resolvedIconSize = iconSize ?? defaultIconSizes[size];

  return (
    <span
      className={cn(
        "rounded-full transition-colors select-none whitespace-nowrap inline-flex items-center shrink-0",
        sizeClasses[size],
        variantClasses[variant],
        className
      )}
      {...props}
    >
      {Icon && (
        <Icon
          size={resolvedIconSize}
          className={cn("shrink-0 text-[var(--primary)]", iconClassName)}
        />
      )}
      {children}
    </span>
  );
};
