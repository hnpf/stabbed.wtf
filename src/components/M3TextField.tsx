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
    <div className="group relative flex h-14 min-w-0 items-center">
      {LeadingIcon && (
        <LeadingIcon
          size={20}
          className="pointer-events-none absolute left-3 z-10 text-[var(--on-surface-variant)] transition-colors group-focus-within:text-[var(--primary)]"
        />
      )}
      <input
        {...inputProps}
        disabled={disabled}
        placeholder=" "
        onKeyDown={(event) => {
          onKeyDown?.(event);
          if (!event.defaultPrevented && event.key === "Enter") onEnter?.();
        }}
        className={[
          "peer h-full w-full rounded-xl border bg-[var(--surface)] px-4 pb-1 pt-5 text-[13px] font-bold text-[var(--on-surface)] outline-none transition-colors",
          "border-[var(--outline-variant)]/65 shadow-[inset_0_1px_0_rgb(255_255_255_/_0.04)] hover:border-[var(--outline)] hover:bg-[var(--surface)] focus:border-2 focus:border-[var(--primary)]",
          "disabled:cursor-not-allowed disabled:opacity-40",
          LeadingIcon ? "pl-11" : "",
          trailing ? "pr-12" : "",
          className,
        ].join(" ")}
      />
      <label
        className={[
          "pointer-events-none absolute top-2 text-[11px] font-bold text-[var(--on-surface-variant)] transition-all peer-focus:text-[var(--primary)] peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-[13px] peer-focus:top-2 peer-focus:translate-y-0 peer-focus:text-[11px]",
          LeadingIcon ? "left-11" : "left-4",
        ].join(" ")}
      >
        {label}
      </label>
      {trailing && TrailingIcon && (
        <button
          type="button"
          onClick={trailing.onClick}
          disabled={trailing.disabled || disabled}
          aria-label={trailing.label}
          title={trailing.label}
          className="absolute right-1 flex size-10 items-center justify-center rounded-lg text-[var(--on-surface-variant)] transition-colors hover:bg-[var(--primary-container)] hover:text-[var(--on-primary-container)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--primary)] disabled:cursor-not-allowed disabled:opacity-40"
        >
          <TrailingIcon size={20} />
        </button>
      )}
    </div>
  );
}
