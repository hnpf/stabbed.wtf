import React from "react";

type M3TextFieldProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> & {
  label: string;
  leadingIcon?: React.ElementType;
  trailing?: {
    icon: React.ElementType;
    label: string;
    onClick: () => void;
    disabled?: boolean;
  };
  onEnter?: () => void;
};

/** m3e field component. */
export function M3TextField({
  label,
  leadingIcon: LeadingIcon,
  trailing,
  onEnter,
  className = "",
  disabled,
  onKeyDown,
  ...inputProps
}: M3TextFieldProps) {
  const TrailingIcon = trailing?.icon;

  return (
    <div className="group relative flex min-h-14 min-w-0 items-center rounded-xl border border-[var(--outline-variant)]/80 bg-[var(--surface)] px-4 py-2.5 transition-colors focus-within:border-2 focus-within:border-[var(--primary)] hover:border-[var(--outline)]">
      {LeadingIcon && (
        <span className="flex size-9 items-center justify-center rounded-lg bg-[var(--surface-variant)] text-[var(--primary)] transition-colors group-focus-within:bg-[var(--primary)] group-focus-within:text-[var(--on-primary)] shrink-0 mr-3">
          <LeadingIcon size={20} />
        </span>
      )}
      <div className="relative flex-1 min-w-0 flex flex-col justify-center">
        <label className="block text-[11px] font-bold text-[var(--on-surface-variant)] group-focus-within:text-[var(--primary)] transition-colors leading-tight">
          {label}
        </label>
        <input
          {...inputProps}
          disabled={disabled}
          placeholder="Paste config URL or Base64 code..."
          onKeyDown={(event) => {
            onKeyDown?.(event);
            if (!event.defaultPrevented && event.key === "Enter") onEnter?.();
          }}
          className={[
            "w-full bg-transparent text-[13px] font-bold text-[var(--on-surface)] outline-none placeholder:text-[11px] placeholder:font-medium placeholder:opacity-50",
            "disabled:cursor-not-allowed disabled:opacity-40",
            className,
          ].join(" ")}
        />
      </div>
      {trailing && TrailingIcon && (
        <button
          type="button"
          onClick={trailing.onClick}
          disabled={trailing.disabled || disabled}
          aria-label={trailing.label}
          title={trailing.label}
          className="flex size-9 items-center justify-center rounded-lg text-[var(--on-surface-variant)] opacity-55 transition-all hover:opacity-100 hover:bg-[var(--primary-container)] hover:text-[var(--on-primary-container)] group-focus-within:opacity-100 group-hover:translate-x-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--primary)] disabled:cursor-not-allowed disabled:opacity-30 shrink-0 ml-1"
        >
          <TrailingIcon size={20} />
        </button>
      )}
    </div>
  );
}
