import type { CSSProperties, HTMLAttributes } from "react"

type MaterialIconProps = Omit<HTMLAttributes<HTMLSpanElement>, "children"> & {
  name: string
  size?: number | string
  fill?: boolean | string | number
  weight?: number
  strokeWidth?: number
  grade?: number
  opsz?: number
}

/** official material symbols rounded, tweaked for stabbed.wtf! */
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
  const sizePx = typeof size === "number" ? `${size}px` : size
  const numericSize = typeof size === "number" ? size : parseInt(String(size), 10) || 24
  const isFilled = fill === true || fill === 1 || fill === "1" || fill === "true"
  const resolvedWeight = weight ?? (strokeWidth ? (strokeWidth >= 2.5 ? 500 : strokeWidth >= 2 ? 400 : 300) : 300)
  const resolvedOpsz = opsz ?? Math.min(48, Math.max(20, Math.round(numericSize)))

  const iconStyle: CSSProperties = {
    fontFamily: '"Material Symbols Rounded", sans-serif',
    fontSize: sizePx,
    width: sizePx,
    height: sizePx,
    lineHeight: 1,
    fontWeight: "normal",
    fontStretch: "100%",
    fontStyle: "normal",
    letterSpacing: "normal",
    textTransform: "none",
    fontFeatureSettings: '"liga" 1',
    fontVariationSettings: `'FILL' ${isFilled ? 1 : 0}, 'wght' ${resolvedWeight}, 'GRAD' ${grade}, 'opsz' ${resolvedOpsz}`,
    WebkitFontSmoothing: "antialiased",
    MozOsxFontSmoothing: "grayscale",
    ...style,
  }

  return (
    <span
      className={`material-symbols-rounded shrink-0 leading-none select-none inline-flex items-center justify-center ${className}`.trim()}
      style={iconStyle}
      aria-hidden="true"
      {...props}
    >
      {name}
    </span>
  )
}

export function materialIcon(name: string, defaults?: Omit<MaterialIconProps, "name">) {
  return function MaterialIconGlyph(props: Omit<MaterialIconProps, "name">) {
    return <MaterialIcon name={name} {...defaults} {...props} />
  }
}

export const AccountCircle = materialIcon("account_circle")
export const AddReaction = materialIcon("add_reaction")
export const Activity = materialIcon("monitor_heart")
export const Album = materialIcon("album")
export const AlertCircle = materialIcon("error")
export const AlertTriangle = materialIcon("warning")
export const Archive = materialIcon("archive")
export const ArrowDown = materialIcon("arrow_downward")
export const ArrowLeft = materialIcon("arrow_back")
export const ArrowRight = materialIcon("arrow_forward")
export const ArrowUp = materialIcon("arrow_upward")
export const ArrowUpRight = materialIcon("north_east")
export const Article = materialIcon("article")
export const BadgeIcon = materialIcon("badge")
export const Bolt = materialIcon("bolt")
export const Boxes = materialIcon("widgets")
export const Bug = materialIcon("bug_report")
export const Calendar = materialIcon("calendar_month")
export const Career = materialIcon("work", { weight: 500, fill: true }) // custom defaults are natively supported via second arg
export const Check = materialIcon("check")
export const CheckCircle = materialIcon("check_circle")
export const CheckCircle2 = materialIcon("task_alt")
export const ChevronDown = materialIcon("keyboard_arrow_down")
export const ChevronLeft = materialIcon("chevron_left")
export const ChevronRight = materialIcon("chevron_right")
export const ChevronUp = materialIcon("keyboard_arrow_up")
export const Cloud = materialIcon("cloud")
export const Compass = materialIcon("explore")
export const Construction = materialIcon("construction")
export const Copy = materialIcon("content_copy")
export const CornerDownLeft = materialIcon("keyboard_return")
export const CornerDownRight = materialIcon("subdirectory_arrow_right")
export const Cpu = materialIcon("memory")
export const Database = materialIcon("database")
export const deployed_code = materialIcon("deployed_code")
export const Download = materialIcon("download")
export const ExternalLink = materialIcon("open_in_new")
export const Face = materialIcon("face")
export const FileText = materialIcon("description")
export const Filter = materialIcon("local_fire_department")
export const Fingerprint = materialIcon("fingerprint")
export const Folder = materialIcon("folder")
export const Ghost = materialIcon("ghost")
export const Globe = materialIcon("language")
export const Group = materialIcon("group")
/** @deprecated use Group */
export const group = Group
export const Hash = materialIcon("tag")
export const Headphones = materialIcon("headphones")
export const Heart = materialIcon("favorite")
export const HelpCircle = materialIcon("help")
export const History = materialIcon("history")
export const Home = materialIcon("cottage")
export const ImageIcon = materialIcon("image")
export const Info = materialIcon("info")
export const Layers = materialIcon("layers")
export const Link = materialIcon("link")
export const Link2 = materialIcon("link")
export const Loader2 = materialIcon("progress_activity")
export const MapPin = materialIcon("location_on")
export const Minimize2 = materialIcon("minimize")
export const Minus = materialIcon("remove")
export const Monitor = materialIcon("desktop_windows")
export const Moon = materialIcon("dark_mode")
export const MousePointer = materialIcon("ads_click")
export const MusicNote = materialIcon("music_note")
export const Palette = materialIcon("palette")
export const Person = materialIcon("person")
export const PhotoLibrary = materialIcon("photo_library")
export const Pin = materialIcon("push_pin")
export const Pipette = materialIcon("colorize")
export const PlayArrow = materialIcon("play_arrow")
export const Plus = materialIcon("add")
export const Psychology = materialIcon("psychology")
export const Public = materialIcon("public")
export const QMark = materialIcon("question_mark")
export const RefreshCw = materialIcon("refresh")
export const Science = materialIcon("science")
export const Search = materialIcon("search")
export const Send = materialIcon("send")
export const Settings = materialIcon("settings")
export const Share2 = materialIcon("share")
export const Smile = materialIcon("sentiment_satisfied")
export const Sparkles = materialIcon("auto_awesome")
export const SquareTerminal = materialIcon("terminal")
export const Sun = materialIcon("light_mode")
export const Tag = materialIcon("sell")
export const Target = materialIcon("strategy")
export const tech_stack = materialIcon("stacks")
export const Terminal = materialIcon("terminal")
export const Trash2 = materialIcon("delete")
export const TravelExplore = materialIcon("travel_explore")
export const Tune = materialIcon("tune")
export const Upload = materialIcon("upload")
export const ViewList = materialIcon("view_list")
export const ViewModule = materialIcon("view_module")
export const Wifi = materialIcon("wifi")
export const X = materialIcon("close")
export const Zap = materialIcon("bolt")
export const cottage = materialIcon("cottage")