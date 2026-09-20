import { useRef, useState, useEffect, useCallback, ReactNode } from "react";
import { motion, useSpring, useTransform, animate, useMotionValue } from "motion/react";
import { haptic } from "../haptics";



type SliderSize = "xs" | "s" | "m" | "l" | "xl";

interface SliderProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number | "any";
  disabled?: boolean;
  showValue?: boolean;
  size?: SliderSize;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
  stops?: boolean;
  endStops?: boolean;
  vertical?: boolean;
  format?: (n: number) => string;
  className?: string;
}

export default function Slider({
  value,
  onChange,
  min = 0,
  max = 100,
  step = "any",
  disabled = false,
  showValue = true,
  size = "xs",
  leadingIcon,
  trailingIcon,
  stops = false,
  endStops = true,
  vertical = false,
  format = (n) => n.toFixed(0),
  className,
}: SliderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [offsetWidth, setOffsetWidth] = useState(600);
  const [offsetHeight, setOffsetHeight] = useState(600);
  const inlineSize = vertical ? offsetHeight : offsetWidth;
  const [isDragging, setIsDragging] = useState(false);

  const prevIntValRef = useRef(Math.round(value));

  const handleInput = (val: number) => {
    const rounded = Math.round(val);
    if (rounded !== prevIntValRef.current) {
      haptic.light();
      prevIntValRef.current = rounded;
    }
    onChange(val);
  };

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      setOffsetWidth(el.offsetWidth);
      setOffsetHeight(el.offsetHeight);
    });
    ro.observe(el);
    setOffsetWidth(el.offsetWidth);
    setOffsetHeight(el.offsetHeight);
    return () => ro.disconnect();
  }, []);

  const springValue = useSpring(value, { stiffness: 170, damping: 26 });
  const overshoot = useMotionValue(0);
  const springOvershoot = useSpring(overshoot, { stiffness: 600, damping: 30 });

  useEffect(() => {
    springValue.set(value);
  }, [value, springValue]);

  const range = max - min;
  const _getHandle = (v: number) => (v - min) / range;

  const handlePos = useTransform(springValue, (v) => _getHandle(v) - 0.5);

  const _buildStopList = useCallback(() => {
    const output: number[] = [];
    const add = (stop: number) => {
      if (leadingIcon && stop === 0) return;
      if (trailingIcon && stop === 1) return;
      output.push(stop);
    };

    if (stops && typeof step === "number") {
      for (let i = 0; i <= range; i += step) add(i / range);
    }
    if (endStops && !output.includes(1)) {
      add(1);
    }

    return output;
  }, [stops, step, range, endStops, leadingIcon, trailingIcon]);

  const stopList = _buildStopList();

  const iconSize = { xs: 0, s: 16, m: 24, l: 24, xl: 32 }[size];
  const iconThreshold = size === "xl" ? 48 : 40;

  // squish/bounce logic
  const handlePointerMove = useCallback((e: PointerEvent) => {
    if (!isDragging || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const pos = vertical ? e.clientY : e.clientX;
    const start = vertical ? rect.top : rect.left;
    const end = vertical ? rect.bottom : rect.right;
    const total = vertical ? rect.height : rect.width;

    if (pos < start) {
      const delta = (start - pos) / total;
      overshoot.set(-Math.pow(delta, 0.7) * 40); // logarithm,ic resistance
    } else if (pos > end) {
      const delta = (pos - end) / total;
      overshoot.set(Math.pow(delta, 0.7) * 40);
    } else {
      overshoot.set(0);
    }
  }, [isDragging, vertical, overshoot]);

  const handlePointerUp = useCallback(() => {
    setIsDragging(false);
    animate(overshoot, 0, { type: "spring", stiffness: 500, damping: 20 });
  }, [overshoot]);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener("pointermove", handlePointerMove);
      window.addEventListener("pointerup", handlePointerUp);
      return () => {
        window.removeEventListener("pointermove", handlePointerMove);
        window.removeEventListener("pointerup", handlePointerUp);
      };
    }
  }, [isDragging, handlePointerMove, handlePointerUp]);

  const trackScale = useTransform(springOvershoot, (v) => 1 + Math.abs(v) / 150);
  const trackX = useTransform(springOvershoot, (v) => v);
  const originX = useTransform(springOvershoot, (v) => {
    if (vertical) return 0.5;
    return v > 0 ? 0 : 1;
  });
  const originY = useTransform(springOvershoot, (v) => {
    if (!vertical) return 0.5;
    return v > 0 ? 0 : 1;
  });

  return (
    <motion.div
      ref={containerRef}
      className={`m3-slider m3-slider--${size}${vertical ? " m3-slider--vertical" : ""}${className ? ` ${className}` : ""}`}
      style={
        {
          "--handle": handlePos,
        } as any
      }
      onPointerDown={() => !disabled && setIsDragging(true)}
    >
      <input
        type="range"
        onInput={(e) => handleInput(Number(e.currentTarget.value))}
        value={value}
        min={min}
        max={max}
        step={step === "any" ? undefined : step}
        disabled={disabled}
        onChange={() => {}}
      />

      <motion.div
        className="m3-slider__track-container"
        style={{
          x: trackX,
          scaleX: vertical ? 1 : trackScale,
          scaleY: vertical ? trackScale : 1,
          originX,
          originY,
        }}
      >
        {/* track-1 (filled) */}
        <div className="m3-slider__track-1">
          {stopList.map((stop, i) => (
            <div key={i} className="m3-slider__stop" style={{ "--x": stop - 0.5 } as React.CSSProperties} />
          ))}
        </div>

        {/* track-2 (empty) */}
        <div className="m3-slider__track-2">
          {stopList.map((stop, i) => (
            <div key={i} className="m3-slider__stop" style={{ "--x": stop - 0.5 } as React.CSSProperties} />
          ))}
        </div>

        <div className="m3-slider__handle" />
      </motion.div>

      {leadingIcon && (
        <span
          className="m3-slider__icon m3-slider__icon--leading transition-colors duration-200"
          style={{
            width: iconSize,
            height: iconSize,
            color: inlineSize * _getHandle(value) < iconThreshold
              ? "var(--primary)"
              : "var(--on-primary)",
          }}
        >
          {leadingIcon}
        </span>
      )}

      {trailingIcon && (
        <span
          className="m3-slider__icon m3-slider__icon--trailing transition-colors duration-200"
          style={{
            width: iconSize,
            height: iconSize,
            color: inlineSize * (1 - _getHandle(value)) < iconThreshold
              ? "var(--on-primary)"
              : "var(--primary)",
          }}
        >
          {trailingIcon}
        </span>
      )}

      {showValue && (
        <div className="m3-slider__value">{format(value)}</div>
      )}
    </motion.div>
  );
}

