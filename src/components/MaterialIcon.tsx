import type { CSSProperties, HTMLAttributes } from "react";

type MaterialIconProps = Omit<HTMLAttributes<HTMLSpanElement>, "children"> & {
  name: string;
  size?: number | string;
  fill?: boolean | string | number;
  weight?: number;
  strokeWidth?: number;
  grade?: number;
  opsz?: number;
};

/** official material symbols rounded, tweaked for virex.lol! */
export function MaterialIcon({
  name,
  size = 24,
  fill = false,
  weight,
  strokeWidth,
  grade = 0,
  opsz,
  className = "",
  style,
  ...props
}: MaterialIconProps) {
  const sizePx = typeof size === "number" ? `${size}px` : size;
  const numericSize = typeof size === "number" ? size : parseInt(String(size), 10) || 24;
  const isFilled = fill === true || fill === 1 || fill === "1" || fill === "true";
  const resolvedWeight = weight ?? (strokeWidth ? (strokeWidth >= 2.5 ? 600 : 450) : 450);
  const resolvedOpsz = opsz ?? Math.min(48, Math.max(20, Math.round(numericSize)));

  const iconStyle: CSSProperties = {
    fontFamily: '"Material Symbols Rounded", sans-serif',
    fontSize: sizePx,
    width: sizePx,
    height: sizePx,
    lineHeight: 1,
    fontWeight: resolvedWeight,
    fontStretch: "100%",
    fontStyle: "normal",
    letterSpacing: "normal",
    textTransform: "none",
    fontVariationSettings: `'FILL' ${isFilled ? 1 : 0}, 'wght' ${resolvedWeight}, 'GRAD' ${grade}, 'opsz' ${resolvedOpsz}`,
    WebkitFontSmoothing: "antialiased",
    MozOsxFontSmoothing: "grayscale",
    ...style,
  };

  return (
    <span
      className={`material-symbols-rounded shrink-0 leading-none select-none inline-flex items-center justify-center ${className}`.trim()}
      style={iconStyle}
      aria-hidden="true"
      {...props}
    >
      {name}
    </span>
  );
}

export function materialIcon(name: string, defaults?: Omit<MaterialIconProps, "name">) {
  return function MaterialIconGlyph(props: Omit<MaterialIconProps, "name">) {
    return <MaterialIcon name={name} {...defaults} {...props} />;
  };
}

// familiar component names make the remaining UI changes ez. still not a breeze to setup, however.
export const X = materialIcon("close");
export const Settings = materialIcon("settings");
export const Palette = materialIcon("palette");
export const Sun = materialIcon("light_mode");
export const Moon = materialIcon("dark_mode");
export const Monitor = materialIcon("desktop_windows");
export const Pipette = materialIcon("colorize");
export const Check = materialIcon("check");
export const Layers = materialIcon("layers");
export const Cpu = materialIcon("memory");
export const Fingerprint = materialIcon("fingerprint");
export const ExternalLink = materialIcon("open_in_new");
export const Download = materialIcon("download");
export const Terminal = materialIcon("terminal");
export const ChevronRight = materialIcon("chevron_right");
export const ChevronLeft = materialIcon("chevron_left");
export const ChevronDown = materialIcon("keyboard_arrow_down");
export const ChevronUp = materialIcon("keyboard_arrow_up");
export const Bug = materialIcon("bug_report");
export const AlertCircle = materialIcon("error");
export const AlertTriangle = materialIcon("warning");
export const CheckCircle = materialIcon("check_circle");
export const CheckCircle2 = materialIcon("task_alt");
export const Activity = materialIcon("monitor_heart");
export const Link = materialIcon("link");
export const Link2 = materialIcon("link");
export const Compass = materialIcon("explore");
export const MessageSquare = materialIcon("chat_bubble");
export const Loader2 = materialIcon("progress_activity");
export const Send = materialIcon("send");
export const Calendar = materialIcon("calendar_month");
export const Share2 = materialIcon("share");
export const MapPin = materialIcon("location_on");
export const History = materialIcon("history");
export const Target = materialIcon("my_location");
export const SquareTerminal = materialIcon("terminal");
export const Code2 = materialIcon("code");
export const Archive = materialIcon("archive");
export const ArrowUpRight = materialIcon("north_east");
export const ArrowRight = materialIcon("arrow_forward");
export const ArrowLeft = materialIcon("arrow_back");
export const ArrowUp = materialIcon("arrow_upward");
export const ArrowDown = materialIcon("arrow_downward");
export const Filter = materialIcon("filter_alt");
export const Pin = materialIcon("push_pin");
export const Copy = materialIcon("content_copy");
export const Hash = materialIcon("tag");
export const Globe = materialIcon("language");
export const Construction = materialIcon("construction");
export const Info = materialIcon("info");
export const Zap = materialIcon("bolt");
export const Database = materialIcon("database");
export const Search = materialIcon("search");
export const MousePointer = materialIcon("ads_click");
export const HelpCircle = materialIcon("help");
export const Wifi = materialIcon("wifi");
export const CornerDownRight = materialIcon("subdirectory_arrow_right");
export const CornerDownLeft = materialIcon("keyboard_return");
export const Minimize2 = materialIcon("minimize");
export const Tag = materialIcon("sell");
export const Folder = materialIcon("folder");
export const ViewModule = materialIcon("view_module");
export const ViewList = materialIcon("view_list");
export const Home = materialIcon("home");
export const Cloud = materialIcon("cloud");
export const ImageIcon = materialIcon("image");
export const Trash2 = materialIcon("delete");
export const RefreshCw = materialIcon("refresh");
export const Sparkles = materialIcon("auto_awesome");
export const Ghost = materialIcon("ghost");
