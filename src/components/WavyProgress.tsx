import { useMemo, useState, useEffect, useRef } from "react";
import { linear, trackOpacity } from "../_wavy";
import { useTheme } from "../ThemeContext";

interface WavyProgressProps {
  width?: number;
  height?: number;
  thickness?: number;
  percent: number;
  className?: string;
  pride?: boolean;
  animated?: boolean;
  showHandle?: boolean;
}

const PRIDE_PALETTES: Record<string, string[]> = {
  rainbow: ["#E40303", "#FF8C00", "#FFED00", "#008026", "#24408E", "#732982"],
  trans: ["#5BCEFA", "#F5A9B8", "#FFFFFF", "#F5A9B8", "#5BCEFA"],
  bi: ["#D60270", "#9B4F96", "#0038A8"],
  pan: ["#FF218C", "#FFD800", "#21B1FF"],
  nonbinary: ["#FCF434", "#FFFFFF", "#9C59D1", "#2C2C2C"],
  lesbian: ["#D52D00", "#EF7627", "#FF9A56", "#FFFFFF", "#D462A6", "#B55690", "#A30262"],
};

const IS_JUNE = new Date().getMonth() === 5;

export default function WavyProgress({
  width = 600,
  height = 10,
  thickness = 4,
  percent,
  className,
  pride = false,
  animated = true,
  showHandle = false,
}: WavyProgressProps) {
  const { settings } = useTheme();
  const svgRef = useRef<SVGSVGElement>(null);
  const [paletteIndex, setPaletteIndex] = useState(0);
  const isPrideActive = pride || IS_JUNE;

  const palettes = useMemo(() => Object.values(PRIDE_PALETTES), []);
  const currentPalette = palettes[paletteIndex];

  useEffect(() => {
    if (!isPrideActive || !animated || settings.disableAnimations) return;
    const interval = setInterval(() => {
      setPaletteIndex((prev) => (prev + 1) % palettes.length);
    }, 4000); // cycle every 4 seconds
    return () => clearInterval(interval);
  }, [isPrideActive, animated, settings.disableAnimations, palettes.length]);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    if (animated && !settings.disableAnimations) svg.unpauseAnimations();
    else svg.pauseAnimations();
  }, [animated, settings.disableAnimations]);

  const safePercent = Math.min(100, Math.max(0, Number.isNaN(Number(percent)) ? 0 : Number(percent)));
  const left = thickness * 0.5;
  const right = width - thickness * 0.5;
  const percentX = (safePercent / 100) * (right - left) + left;

  const smil_data = useMemo(() => {
    let paths: string[] = [];
    for (let x = 0; x <= 1000; x += 1000 / 20) {
      paths.push(linear(thickness / 2, height - thickness / 2, left, right, x));
    }
    return paths;
  }, [height, left, right, thickness]);

  const gap = showHandle ? thickness + 2 : 0;
  const clipWidth = showHandle ? (safePercent === 0 ? 0 : Math.max(0, percentX - gap)) : percentX;
  const track_x1 = showHandle ? Math.min(right, percentX + gap) : (percentX + thickness + 4);
  const track_opacity = trackOpacity(right, track_x1);

  const gradientId = useMemo(() => `pride-grad-${Math.random().toString(36).substr(2, 9)}`, []);
  const clipId = useMemo(() => `wavy-progress-clip-${Math.random().toString(36).substr(2, 9)}`, []);

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${width} ${height}`}
      role="progressbar"
      className={className}
      preserveAspectRatio="none"
      style={{ width: "100%", height: "auto", overflow: "visible" }}
      shapeRendering="geometricPrecision"
    >
      {isPrideActive && (
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
            {currentPalette.map((color, i) => (
              <stop
                key={`${paletteIndex}-${i}`}
                offset={`${(i / (currentPalette.length - 1)) * 100}%`}
                stopColor={color}
              >
                {!settings.disableAnimations && (
                  <animate
                    attributeName="stop-color"
                    values={color}
                    dur="1s"
                    repeatCount="indefinite"
                  />
                )}
              </stop>
            ))}
          </linearGradient>
        </defs>
      )}
      <defs>
        <clipPath id={clipId}>
          <rect x="0" y="0" width={clipWidth} height={height} />
        </clipPath>
      </defs>
      <path
        fill="none"
        stroke={isPrideActive ? `url(#${gradientId})` : "currentColor"}
        strokeWidth={thickness}
        strokeLinecap="round"
        strokeLinejoin="round"
        clipPath={`url(#${clipId})`}
        d={settings.disableAnimations ? smil_data[0] : undefined}
      >
        {!settings.disableAnimations && (
          <animate attributeName="d" dur="1s" repeatCount="indefinite" values={smil_data.join(";")} />
        )}
      </path>
      {showHandle && (
        <line
          fill="none"
          stroke={isPrideActive ? `url(#${gradientId})` : "currentColor"}
          strokeWidth={thickness}
          strokeLinecap="round"
          x1={percentX}
          y1={height * -0.2}
          x2={percentX}
          y2={height * 1.2}
        />
      )}
      <line
        fill="none"
        stroke="currentColor"
        strokeWidth={thickness}
        strokeLinecap="round"
        x1={track_x1}
        y1={height / 2}
        x2={right}
        y2={height / 2}
        opacity={track_opacity * (isPrideActive ? 0.15 : 0.3)} // even more dimmed for pride mode to let gradient shine
      />
    </svg>
  );
}
