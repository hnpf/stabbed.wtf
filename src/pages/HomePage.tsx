import React, { useState, useEffect, memo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Activity, ChevronRight, ExternalLink, ArrowUpRight, Tag, MaterialIcon } from "../components/MaterialIcon";
import { cn, PROJECTS, BLOG_POSTS } from "../constants";
import { useTheme } from "../ThemeContext";
import { Card } from "../components/Card";
import { BounceButton } from "../components/TechStack";
import WavyProgress from "../components/WavyProgress";
import { haptic } from "../haptics";
import { Ripple } from "../components/Ripple";

const IS_APR = (() => {
  const now = new Date();
  return now.getMonth() === 3 && now.getDate() === 1;
})();

const FshBtn = () => {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [clicks, setClicks] = useState(0);
  const active = IS_APR;

  const run_away = (e: React.MouseEvent) => {
    if (!active || clicks > 5) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const bx = rect.left + rect.width / 2;
    const by = rect.top + rect.height / 2;
    const dx = e.clientX - bx;
    const dy = e.clientY - by;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < 100) {
      setPos((p) => ({
        x: p.x + (dx > 0 ? -50 : 50),
        y: p.y + (dy > 0 ? -50 : 50),
      }));
    }
  };

  if (!active) return null;

  return (
    <motion.button
      animate={{ x: pos.x, y: pos.y }}
      onMouseMove={run_away}
      onClick={() => setClicks((c) => c + 1)}
      className="m3-button-filled mt-8 w-fit"
    >
      LOGIN RIGHT NOW!!!!!
    </motion.button>
  );
};

const AdCard = () => {
  const ads = [
    {
      t: "HOT SPIDERS WANT TO CHAT (NO VIRUS)",
      img: "/photography/PXL_20260108_040856251.webp",
    },
    { t: "DOWNLOAD 128GB RAM (FREE)", img: "/fsh-spin.gif" },
    { t: "THIS FISH SPINS. SEE HOW HE DOES IT.", img: "/fsh-spin.gif" },
  ];
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const itv = setInterval(() => setIdx((i) => (i + 1) % ads.length), 2000);
    return () => clearInterval(itv);
  }, [ads.length]);

  if (!IS_APR) return null;

  return (
    <Card className="" innerClassName="fsh-ad flex flex-col items-center justify-center p-4 !bg-yellow-400">
      <div className="text-[10px] font-black uppercase tracking-widest bg-red-600 text-white px-2 mb-2">
        PROMOTED
      </div>
      <h3 className="text-xl font-bold text-center mb-4">{ads[idx].t}</h3>
      <img
        src={ads[idx].img}
        className="w-32 h-32 object-cover border-4 border-black"
        alt="ad"
      />
      <button
        onClick={() => (window.location.href = "/fsh-spin.gif")}
        className="mt-4 bg-blue-600 text-white font-black px-6 py-2 uppercase italic text-sm hover:scale-110 transition-transform"
      >
        CLICK HERE NOW!!!
      </button>
    </Card>
  );
};

const HelloVirex = ({ tickIndex }: { tickIndex: number }) => {
  const words = [
    "virex",         // Global / English 
    "fáyráks",       // Stylized Arabic Romanization
    "víreks",        // Slavic/Cyrillic Romanization 
    "vìréx",         // Catalan / Western European 
    "vïrëx",         // Albanian / European Stylized 
  ];

  const widx = tickIndex % words.length;
  const { settings } = useTheme();
  const containerRef = React.useRef<HTMLDivElement>(null);
  const textRef = React.useRef<HTMLHeadingElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const checkSize = () => {
      if (!containerRef.current || !textRef.current) return;
      const containerWidth = containerRef.current.clientWidth;
      const textWidth = textRef.current.scrollWidth;
      if (textWidth > 0 && containerWidth > 0) {
        if (textWidth > containerWidth) {
          const fitScale = Math.min(1, Math.max(0.35, containerWidth / textWidth));
          setScale(fitScale);
        } else {
          setScale(1);
        }
      }
    };

    checkSize();
    const timer = setTimeout(checkSize, 50);

    const observer = new ResizeObserver(checkSize);
    if (containerRef.current) observer.observe(containerRef.current);

    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, [widx]);

  return (
    <div ref={containerRef} className="w-full min-h-[5.5rem] sm:min-h-[8.5rem] md:min-h-[15rem] flex items-center overflow-visible py-4">
      <AnimatePresence mode="wait">
        <motion.h1
          key={words[widx]}
          ref={textRef}
          initial={{
            opacity: 0,
            y: 40,
            rotate: -2,
            scale: scale,
          }}
          animate={{
            opacity: 1,
            y: 0,
            rotate: 0,
            scale: scale,
          }}
          exit={{
            opacity: 0,
            y: -40,
            rotate: 2,
            scale: scale,
          }}
          transition={{
            type: settings.disableAnimations ? "tween" : "spring",
            duration: settings.disableAnimations ? 0 : undefined,
            stiffness: settings.highHz ? 600 : 400,
            damping: settings.highHz ? 25 : 22,
            mass: 1,
          }}
          style={{ transformOrigin: "left center" }}
          className="text-8xl sm:text-8xl md:text-9xl lg:text-[12rem] xl:text-[14rem] font-expressive italic tracking-[-0.08em] leading-[0.85] whitespace-nowrap flex items-baseline origin-left py-2"
        >
          {words[widx]}
          <motion.span className="text-[var(--primary)] select-none relative z-[60] inline-block ml-[0.05em]">
            .
          </motion.span>
        </motion.h1>
      </AnimatePresence>
    </div>
  );
};

const YearProg = () => {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const ticker = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(ticker);
  }, []);

  const year = now.getFullYear();
  const start = new Date(year, 0, 1).getTime();
  const end = new Date(year + 1, 0, 1).getTime();
  const pct = ((now.getTime() - start) / (end - start)) * 100;

  const ms_left = end - now.getTime();
  const days_left = Math.floor(ms_left / (1000 * 60 * 60 * 24));

  return (
    <div className="flex flex-col h-full justify-between relative isolate">
      <div>
        <div className="flex flex-col -space-y-2">
          <span className="text-6xl md:text-8xl font-expressive-bold italic font-black tracking-[-0.08em] mb-3 leading-none text-[var(--primary)]">
            {year}
          </span>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl sm:text-3xl md:text-5xl font-display font-black italic tracking-tighter">
              {pct.toFixed(2)}
            </span>
            <span className="text-xl font-expressive-bold italic opacity-40">%</span>
          </div>
        </div>
      </div>

      <div className="py-4 pt-7">
        <WavyProgress
          percent={pct}
          className="text-[var(--primary)]"
          thickness={6}
          height={16}
        />
      </div>

      <div className="mt-4 flex flex-col gap-1 relative z-10 border-[var(--outline-variant)]/20">
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-display font-black italic">{days_left}</span>
          <span className="text-[15px] ml-1 font-black font-sans italic font-display opacity-50 tracking-widest">more days to go!</span>
        </div>
        <div className="text-[13px] font-black font-display font-sans opacity-50
          tracking-widest">
          {now.toLocaleTimeString().toLowerCase()}
        </div>
      </div>
    </div>
  );
};

const RoleTicker = ({ settings, tickIndex }: { settings: any; tickIndex: number }) => {
  const roles = [
    "independent software developer",
    "music producer & audio engineering",
    "linux enthusiast",
    "cybersecurity student"
  ];
  const idx = tickIndex % roles.length;

  return (
    <div className="h-16 flex items-center overflow-hidden py-2">
      <AnimatePresence mode="wait">
        <motion.div
          key={roles[idx]}
          initial={{
            opacity: 0,
            y: 40,
            rotate: -2,
          }}
          animate={{
            opacity: 1,
            y: 0,
            rotate: 0,
          }}
          exit={{
            opacity: 0,
            y: -40,
            rotate: 2,
          }}
          transition={{
            type: settings.disableAnimations ? "tween" : "spring",
            duration: settings.disableAnimations ? 0 : undefined,
            stiffness: settings.highHz ? 600 : 400,
            damping: settings.highHz ? 25 : 22,
            mass: 1,
          }}
          className="text-xl md:text-3xl capitalize font-black text-[var(--on-surface-variant)] leading-none tracking-[0.1em] mt-4"
        >
          {roles[idx]}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

type WeatherData = {
  temperature: number;
  humidity: number;
  windSpeed: number;
  weatherCode: number;
};

const VIREX_LOCATION = {
  label: "Nederland",
  latitude: 52.1326,
  longitude: 5.2913,
};

let cachedUserLocation: { label: string; latitude: number; longitude: number } | null = null;

const detectUserLocation = async (signal?: AbortSignal) => {
  if (cachedUserLocation) return cachedUserLocation;
  try {
    const res = await fetch("https://get.geojs.io/v1/ip/geo.json", { signal });
    if (res.ok) {
      const data = await res.json();
      if (data.latitude && data.longitude) {
        cachedUserLocation = {
          label: data.city || data.region || data.country || "Local",
          latitude: parseFloat(data.latitude),
          longitude: parseFloat(data.longitude),
        };
        return cachedUserLocation;
      }
    }
  } catch {}

  try {
    const res = await fetch("https://ipwho.is/", { signal });
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.latitude && data.longitude) {
        cachedUserLocation = {
          label: data.city || data.region || data.country || "Local",
          latitude: data.latitude,
          longitude: data.longitude,
        };
        return cachedUserLocation;
      }
    }
  } catch {}

  return VIREX_LOCATION;
};

const weatherDescription = (code: number) => {
  switch (code) {
    case 0:
      return { title: "Clear", detail: "Skies", icon: "sunny" };
    case 1:
      return { title: "Mostly", detail: "Clear", icon: "sunny" };
    case 2:
      return { title: "Partly", detail: "Cloudy", icon: "partly_cloudy_day" };
    case 3:
      return { title: "Overcast", detail: "Clouds", icon: "cloud" };
    case 45:
    case 48:
      return { title: "Misty", detail: "Fog", icon: "foggy" };
    case 51:
    case 53:
    case 55:
      return { title: "Light", detail: "Drizzle", icon: "rainy" };
    case 56:
    case 57:
      return { title: "Freezing", detail: "Drizzle", icon: "ac_unit" };
    case 61:
    case 63:
      return { title: "Rainy", detail: "Weather", icon: "rainy" };
    case 65:
      return { title: "Heavy", detail: "Rain", icon: "rainy" };
    case 66:
    case 67:
      return { title: "Freezing", detail: "Rain", icon: "ac_unit" };
    case 71:
    case 73:
      return { title: "Light", detail: "Snow", icon: "weather_snowy" };
    case 75:
      return { title: "Heavy", detail: "Snow", icon: "weather_snowy" };
    case 77:
      return { title: "Snow", detail: "Grains", icon: "weather_snowy" };
    case 80:
    case 81:
      return { title: "Passing", detail: "Showers", icon: "rainy" };
    case 82:
      return { title: "Heavy", detail: "Showers", icon: "rainy" };
    case 85:
    case 86:
      return { title: "Snow", detail: "Showers", icon: "weather_snowy" };
    case 95:
      return { title: "Thunder", detail: "Storm", icon: "thunderstorm" };
    case 96:
    case 99:
      return { title: "Severe", detail: "Storm", icon: "thunderstorm" };
    default:
      if (code <= 3) return { title: "Clear", detail: "Skies", icon: "sunny" };
      if (code <= 48) return { title: "Misty", detail: "Fog", icon: "foggy" };
      if (code <= 67) return { title: "Rainy", detail: "Weather", icon: "rainy" };
      if (code <= 86) return { title: "Snowy", detail: "Weather", icon: "weather_snowy" };
      return { title: "Stormy", detail: "Weather", icon: "thunderstorm" };
  }
};

const WeatherWidget = () => {
  const { settings, updateSettings } = useTheme();
  const useMetric = settings.metricUnits ?? true;
  const isDynamic = Boolean(settings.dynamicWeatherLocation);

  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<{ label: string; latitude: number; longitude: number }>(VIREX_LOCATION);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    const fetchWeatherAndLocation = async () => {
      setIsLoading(true);
      let targetLocation = VIREX_LOCATION;

      if (isDynamic) {
        setIsDetectingLocation(true);
        targetLocation = await detectUserLocation(controller.signal);
        if (!isMounted) return;
        setIsDetectingLocation(false);
      }

      if (isMounted) {
        setCurrentLocation(targetLocation);
      }

      try {
        const params = new URLSearchParams({
          latitude: String(targetLocation.latitude),
          longitude: String(targetLocation.longitude),
          current: "temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m",
          temperature_unit: useMetric ? "celsius" : "fahrenheit",
          wind_speed_unit: useMetric ? "kmh" : "mph",
          timezone: "auto",
        });

        const response = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`, {
          signal: controller.signal,
        });

        if (!response.ok) throw new Error(`weather request failed: ${response.status}`);
        const data = await response.json();
        const current = data.current;
        if (!current) throw new Error("weather response had no current conditions");

        if (isMounted) {
          setWeather({
            temperature: Math.round(current.temperature_2m),
            humidity: Math.round(current.relative_humidity_2m),
            windSpeed: Math.round(current.wind_speed_10m),
            weatherCode: current.weather_code,
          });
          setHasError(false);
          setIsLoading(false);
        }
      } catch (error: any) {
        if (error.name !== "AbortError" && isMounted) {
          setHasError(true);
          setIsLoading(false);
        }
      }
    };

    fetchWeatherAndLocation();

    // 15 min auto refreshing
    const interval = setInterval(() => {
      fetchWeatherAndLocation();
    }, 15 * 60 * 1000);

    return () => {
      isMounted = false;
      controller.abort();
      clearInterval(interval);
    };
  }, [useMetric, isDynamic]);

  const condition = weather !== null ? weatherDescription(weather.weatherCode) : { title: "Current", detail: "Weather", icon: "sunny" };

  return (
    <motion.div 
      className="flex flex-col h-full justify-between relative isolate overflow-hidden"
      whileHover="hover"
      initial="initial"
      animate="animate"
    >
      <div className="absolute bottom-2 right-0 md:right-5 transform translate-x-6 md:translate-x-0 flex items-end opacity-[0.03] pointer-events-none">
        <motion.div
          key={condition.icon}
          className="transform-gpu md:scale-100 scale-75 origin-bottom"
          variants={{
            initial: { opacity: 0, scale: 0.8, rotate: -8 },
            animate: { opacity: 1, scale: 1, rotate: 0 },
            hover: { scale: 1.1 }
          }}
          transition={{
            type: "spring",
            stiffness: 120,
            damping: 18,
          }}
        >
          <MaterialIcon name={condition.icon} size={180} fill />
        </motion.div>
      </div>

      <div className="relative z-10">
        <div className="flex items-baseline gap-1">
          <span className="text-8xl md:text-9xl mt-1.5 font-expressive-bold italic font-black tracking-[-0.08em] leading-[0.7]">
            {isLoading ? "--" : weather ? weather.temperature : "?"}
          </span>
          <span className="text-4xl md:text-5xl font-expressive-bold italic opacity-40 ml-1">{weather ? "°" : ""}</span>
        </div>
      </div>

      <div className="mt-6 flex flex-col -space-y-1 relative z-10">
        <span className="text-4xl md:text-6xl font-expressive-bold italic font-black tracking-[-0.05em] uppercase leading-none text-[var(--primary)]">
          {hasError ? "Unavailable" : condition.title}
        </span>
        <span className="text-3xl md:text-5xl font-display font-black italic uppercase tracking-[-0.02em] leading-none opacity-60">
          {hasError ? "Right now" : condition.detail}
        </span>
      </div>

      <div className="mt-8 flex items-center gap-4 sm:gap-6 relative z-10 pt-6 before:absolute before:top-0 before:left-0 before:right-40 md:before:right-[200px] before:border-t-4 before:border-[var(--outline-variant)]/20">
        <div className="flex items-baseline gap-1 shrink-0">
          <span className="text-1xl md:text-2xl font-display font-black italic">{weather ? weather.humidity : "--"}</span>
          <span className="text-[10px] md:text-[15px] font-black ml-1 italic font-display font-sans opacity-50 tracking-widest">Hum</span>
        </div>
        <div className="flex items-baseline gap-1 shrink-0">
          <span className="text-1xl md:text-2xl font-display font-black italic">{weather ? weather.windSpeed : "--"}</span>
          <span className="text-[10px] md:text-[15px] font-black ml-1 italic font-display font-sans opacity-50 tracking-widest">{useMetric ? "Km/h" : "Mph"}</span>
        </div>
        <motion.button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            haptic.light();
            updateSettings({ dynamicWeatherLocation: !isDynamic });
          }}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.94 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
          className={cn(
            "ml-auto flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-transparent transition-all cursor-pointer select-none group",
            isDynamic
              ? "bg-[var(--primary-container)]/50 text-[var(--on-primary-container)] border-[var(--primary)]/20 shadow-sm"
              : "opacity-45 hover:opacity-100 hover:bg-[var(--surface-variant)] hover:border-[var(--outline-variant)]/40"
          )}
          title={
            isDynamic
              ? `Currently showing your local weather (${currentLocation.label}) - click to switch to virex's local weather`
              : `Currently showing virex's local weather (nederland) - click to switch to your local weather`
          }
        >
          <MaterialIcon
            name={isDetectingLocation ? "progress_activity" : isDynamic ? "my_location" : "location_on"}
            className={cn(
              "transition-transform shrink-0",
              isDetectingLocation && "animate-spin text-[var(--primary)]",
              isDynamic && !isDetectingLocation && "text-[var(--primary)] scale-105"
            )}
            size={16}
            fill={!isDetectingLocation}
          />
          <span className="text-[11px] italic md:text-[14px] font-black tracking-wider max-w-[85px] sm:max-w-[120px] truncate transition-transform duration-200 group-hover:-translate-x-0.5">
            {currentLocation.label}
          </span>
          <span className="w-0 opacity-0 group-hover:w-3.5 group-hover:opacity-70 transition-all duration-200 ease-out overflow-hidden flex items-center justify-center shrink-0 -translate-x-1 group-hover:translate-x-0">
            <MaterialIcon
              name="sync_alt"
              size={13}
            />
          </span>
        </motion.button>
      </div>
      <a
        href="https://open-meteo.com/"
        target="_blank"
        rel="noreferrer"
        className="relative z-10 mt-3 text-[9px] uppercase tracking-[0.18em] opacity-25 hover:opacity-70 transition-opacity w-fit"
      >
      </a>
    </motion.div>
  );
};

const AncBar = ({ setPage, settings }: { setPage: (page: string, postId: string | null) => void, settings: any }) => {
  const latestPost = BLOG_POSTS[0];
  const [shouldAnimate, setShouldAnimate] = useState(false);

  useEffect(() => {
    if (settings.disableAnimations) {
      setShouldAnimate(true);
      return;
    }
    const timer = setTimeout(() => {
      setShouldAnimate(true);
    }, 800); // 0.8s delay
    return () => clearTimeout(timer);
  }, [settings.disableAnimations]);

  const initialValues = settings.disableAnimations ? false : { opacity: 0, y: 15 };

  if (!latestPost) return null;

  return (
    <motion.div
      initial={initialValues}
      animate={
        shouldAnimate || settings.disableAnimations
          ? { opacity: 1, y: 0 }
          : initialValues
      }
      transition={settings.disableAnimations ? { duration: 0 } : {
        type: "spring",
        stiffness: settings.highHz ? 800 : 700,
        damping: settings.highHz ? 30 : 28,
        mass: 0.8,
      }}
      
      whileTap={settings.disableAnimations ? {} : { scale: 0.98 }}
      onClick={() => setPage("blog", latestPost.id)}
      data-ripple
      className="flex flex-col sm:flex-row items-stretch justify-between gap-4 p-5 sm:p-6 border-6 border-[var(--outline-variant)] rounded-[2.5rem] bg-[var(--surface-variant)] hover:border-[var(--primary)] hover:shadow-2xl transition-[border-color,box-shadow] duration-200 relative overflow-hidden group cursor-pointer select-none"
    >
      {/* left: badges, title, + snippet filling desktop wid */}
      <div className="flex-1 min-w-0 flex flex-col justify-between space-y-2">
        <div className="flex flex-wrap items-center gap-2 min-w-0">
          <span className="px-3 py-1 bg-[var(--primary-container)] text-[var(--on-primary-container)] rounded-full text-[11px] font-expressive italic font-bold tracking-widest border-3 border-[var(--primary)]/30 shadow-xs flex items-center gap-1.5 shrink-0">
            <span className="w-2 h-2 rounded-full bg-[var(--primary)]" />
            New Post!
          </span>
          {latestPost.category && (
            <span className="px-2.5 py-1 bg-[var(--surface)]/80 text-[var(--on-surface-variant)] rounded-full text-[11px] font-expressive italic font-bold border-3 border-[var(--outline-variant)]/60 shadow-2xs flex items-center gap-1.5 shrink-0 tracking-wider">
              <Tag size={11} className="text-[var(--primary)] shrink-0 opacity-80" />
              <span className="capitalize">{latestPost.category}</span>
            </span>
          )}
          {latestPost.readTime && (
            <span className="text-[13px] font-display font-black opacity-50 shrink-0 hidden md:inline-block ml-2">
              • {latestPost.readTime}
            </span>
          )}
        </div>

        <div className="min-w-0 w-full space-y-1">
          <h4 className="text-[18px] sm:text-[20px] md:text-[22px] font-display font-black italic text-[var(--on-surface-variant)] group-hover:text-[var(--primary)] transition-colors duration-200 truncate min-w-0 w-full leading-snug">
            {latestPost.title}
          </h4>
          <p className="text-[13px] sm:text-[14px] opacity-50 font-sans line-clamp-1 sm:line-clamp-2 min-w-0 w-full leading-relaxed max-w-4xl">
            {latestPost.snippet}
          </p>
        </div>
      </div>

      {/* date top right; post link bottom right */}
      <div className="shrink-0 flex sm:flex-col justify-between items-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-[var(--outline-variant)]/20 sm:border-none">
        <span className="text-[12px] font-display font-black opacity-60 shrink-0 bg-[var(--surface)]/50 px-4 py-1.5 rounded-full border-3 border-[var(--outline-variant)] self-start sm:self-end">
          {latestPost.date}
        </span>

        <div 
          onClick={() => {
            haptic.light();
          }}
          className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] group-hover:bg-[var(--primary)] group-hover:text-[var(--on-primary)] transition-all duration-300 border-3 border-[var(--primary)]/20 shadow-xs font-expressive-bold italic font-black text-[12px] uppercase tracking-wider shrink-0 self-end whitespace-nowrap cursor-pointer select-none active:scale-x-105 active:scale-y-90"
        >
          <span>Read Post</span>
          <ArrowUpRight size={16} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </div>
      </div>
    </motion.div>
  );
};

export const HomePage = memo(({ setPage, settings, onOpenGuestbook }: any) => {
  const [latestEntry, setLatestEntry] = useState<any>(null);
  const [tickIndex, setTickIndex] = useState(0);

  useEffect(() => {
    const ticker = setInterval(() => {
      setTickIndex((prev) => prev + 1);
    }, 4000);
    return () => clearInterval(ticker);
  }, []);

  useEffect(() => {
    fetch("/api/guestbook")
      .then(res => res.text())
      .then(text => (text ? JSON.parse(text) : []))
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setLatestEntry(data[0]);
        }
      })
      .catch(err => console.error("Error loading guestbook preview:", err));
  }, []);

  const IS_JUNE = new Date().getMonth() === 5;
  return (
    <div className="space-y-16 max-w-6xl mx-auto px-4 md:px-0 relative">
      <header className="page-header space-y-12">
        {settings.helloAnimation ? (
          <HelloVirex tickIndex={tickIndex} />
        ) : (
          <motion.h1
            initial={settings.disableAnimations ? false : {
              opacity: 0,
              y: 30,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{ duration: settings.disableAnimations ? 0 : 0.6, ease: [0.33, 1, 0.68, 1] }}
            className="page-title !text-6xl sm:!text-8xl md:!text-9xl lg:!text-[12rem] xl:!text-[14rem] leading-[0.7] text-balance flex items-baseline font-expressive-bold italic tracking-[-0.08em]"
          >
            virex
            <motion.span 
              animate={IS_JUNE ? { 
                color: ["#E40303", "#FF8C00", "#FFED00", "#008026", "#24408E", "#732982", "#E40303"] 
              } : {}}
              transition={IS_JUNE ? { duration: 10, repeat: Infinity, ease: "linear" } : {}}
              className="text-[var(--primary)] select-none relative z-[60] inline-block ml-[-0.05em]"
            >
              .
            </motion.span>
          </motion.h1>
        )}
        <RoleTicker settings={settings} tickIndex={tickIndex} />
        <FshBtn />
      </header>

      <section id="works-section" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-8">
        <Card
          delay={0.7}
          className="md:col-span-2 lg:col-span-1 xl:col-span-2"
          innerClassName="bg-[var(--primary)] text-[var(--on-primary)] border-none p-6 sm:p-12 md:p-16 flex flex-col justify-between min-h-0 md:min-h-[440px] overflow-hidden group"
        >
          <div className="relative isolate">
            <div className="absolute md:-top-20 -top-10  -left-10 text-[20rem] font-expressive-bold italic opacity-10 pointer-events-none select-none tracking-tighter leading-none group-hover:scale-110 transition-transform duration-700">
              "
            </div>
            <div className="flex flex-col gap-2 relative z-10">
              <h2 className="text-5xl sm:text-7xl md:text-[7rem] mt-5 md:mt-2 opacity-82 italic font-expressive-bold leading-[0.8] tracking-[-0.08em] pr-2">
                Software should <br /> be readable,
              </h2>
              <h2 className="text-3xl sm:text-4xl md:text-6xl italic font-expressive-bold md:ml-12 ml-2 leading-none tracking-[-0.05em] mt-4 sm:mt-6 opacity-40">
                period.
              </h2>
            </div>
          </div>
          <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 md:gap-8 mt-8 md:mt-12 relative z-10">
            <p className="text-lg md:text-2xl opacity-80 font-display font-black italic max-w-xl leading-snug">
              I love simple, non-stressful setups and code that doesn't need a constant manual :)
            </p>
            <motion.button
              whileHover={{
                scale: 1.02,
                backgroundColor: "var(--primary-container)",
                color: "var(--on-primary-container)",
                borderRadius: "40px",
                boxShadow: "0 20px 40px -10px var(--primary)",
              }}
              whileTap={{
                scale: 0.98,
              }}
              transition={{
                type: "spring",
                stiffness: 800,
                damping: 20,
                mass: 0.5,
              }}
              onClick={() => {
                setPage("readme")
                haptic.light();
              }}
              className="m3-button-filled ring-6 ring-[var(--on-primary-container)] !transition-none bg-white text-black text-[18px] sm:text-[20px] font-expressive-bold italic font-black tracking-tight h-16 sm:h-18 px-8 sm:px-12 rounded-[24px] flex items-center gap-3 group shrink-0 w-full md:w-auto justify-center whitespace-nowrap relative overflow-hidden"
            >
              <Ripple color="var(--primary)" />
              <span className="relative z-[1]">Read more!</span>
              <ChevronRight
                size={28}
                className="group-hover:translate-x-1 transition-transform relative z-[1]"
              />
            </motion.button>
          </div>
        </Card>

        {/* anc bar / active site indicator (act 2 gate) */}
        <div className="md:col-span-2 lg:col-span-1 xl:col-span-2">
          <AncBar setPage={setPage} settings={settings} />
        </div>

        <Card
          delay={0.6}
          className="flex-1"
          innerClassName="flex flex-col border-6 border-[var(--outline-variant)] justify-center p-8 md:p-12 min-h-[450px] group overflow-hidden relative items-start" /*no transitiopn-all cat*/
        >
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-all duration-700 group-hover:rotate-12 group-hover:scale-110">
            <Activity size={130} className="-rotate-175 md:mr-6 md:mt-3" />
          </div>
          <div className="isolate flex flex-col -space-y-3 md:-space-y-4">
            <span className="text-4xl md:text-5xl font-display mb-1 font-black italic uppercase tracking-tight opacity-40">I NEVER</span>
            <span className="text-7xl md:text-8xl font-expressive-bold mb-1 italic font-black tracking-[-0.08em] leading-none uppercase">SHIP</span>
            <span className="text-4xl md:text-5xl font-display mb-1 font-black italic uppercase tracking-[-0.02em] opacity-40">WHAT I DON'T</span>
            <span className="text-8xl md:text-[9rem] font-expressive-bold italic tracking-[-0.08em] leading-none uppercase text-[var(--primary)]">USE.</span>
          </div>
        </Card>

        <div className="flex flex-col gap-8">
          <Card
            delay={0.6}
            className="flex-1"
            innerClassName="border-6 border-[var(--outline-variant)]/40 flex flex-col justify-center p-10 min-h-[250px] transition-colors"
          >
            <YearProg />
          </Card>
          <Card
            delay={0.7}
            className="flex-1"
            innerClassName="border-6 border-[var(--outline-variant)]/40 p-10 min-h-[200px] transition-colors"
          >
            <WeatherWidget />
          </Card>
        </div>

        <div id="projects-section" className="md:col-span-2 lg:col-span-1 xl:col-span-2 mt-16 mb-8 flex flex-col items-center gap-2">
          <div className="text-[15px] font-black font-display font-sans italic tracking-[0.2em] opacity-30">Index / Select works</div>
          <h3 className="text-4xl md:text-6xl font-expressive-bold italic font-black tracking-[-0.05em] uppercase text-center">
            Projects & Research
          </h3>
          <div className="h-1 w-24 bg-[var(--primary)] mt-4" />
        </div>

        <div className="md:col-span-2 lg:col-span-1 xl:col-span-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-8">
          <AdCard />
          {PROJECTS.map((project, i) => (
            <div id={`project-${project.id}`} key={project.id}>
              <Card
                delay={0.7 + i * 0.1}
                className=""
                innerClassName="flex border-6 border-[var(--outline-variant)]/40 flex-col justify-between p-8 sm:p-10 min-h-[350px] transition-colors"
              >
              <div>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-6">
                  <h4 className="text-[28px] sm:text-[36px] font-bold font-black tracking-[0.04em] leading-tight italic flex-1 min-w-0 break-words">
                    {project.title}
                  </h4>
                  <div className="flex flex-wrap gap-2 sm:justify-end shrink-0">
                    {project.tags.map((tag) => (
                      <span key={tag} className="m3-chip uppercase italic tracking-widest font-black text-[10px] shrink-0">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <p className="opacity-50 mt-3 sm:mt-13 mb-8 text-lg sm:text-xl font-medium italic leading-snug">
                  {project.description}
                </p>
              </div>
              <div className="w-full">
                {project.link.startsWith("/") ? (
                  <BounceButton
                    icon={ChevronRight}
                    label="View project"
                    onClick={() => {
                      setPage(project.link.replace("/", ""));
                      haptic.light();
                    }}
                    className="m3-button-filled w-full uppercase italic tracking-widest font-black text-[16px] !bg-[var(--surface-variant)]/60 !text-[var(--on-surface)] border-6 border-[var(--outline-variant)]/40 !py-4 rounded-[20px] px-4"
                  />
                ) : (
                  <BounceButton
                    icon={ExternalLink}
                    label="View project"
                    url={project.link}
                    className="m3-button-filled w-full uppercase italic tracking-widest font-black text-[16px] !bg-[var(--surface-variant)]/60 !text-[var(--on-surface)] border-6 border-[var(--outline-variant)]/40 !py-4 rounded-[20px] px-4"
                  />
                )}
              </div>
            </Card>
            </div>
          ))}
        </div>
      </section>

      {/* guestbook */}
      <section className="mt-20 flex flex-col items-center gap-6">
        <div className="text-[15px] font-black font-display font-sans italic tracking-[0.1em] opacity-30">Community / Extra feedback</div>
        <h3 className="text-4xl md:text-6xl font-expressive-bold italic font-black tracking-[-0.05em] uppercase text-center">
          The Guestbook
        </h3>
        <div className="h-1.5 w-48 opacity-60 bg-[var(--primary)] mt-2 mb-4 rounded-full" />
        <Card
          delay={0.8}
          onClick={onOpenGuestbook}
          className="w-full max-w-4xl cursor-pointer"
          innerClassName="border-6 border-[var(--outline-variant)]/40 p-6 sm:p-8 md:p-12 hover:border-[var(--primary)] hover:shadow-2xl transition-[border-color,box-shadow] duration-150 flex flex-col md:flex-row justify-between items-center gap-6 w-full"
        >
          <div className="space-y-4 text-center md:text-left flex-1 min-w-0">
            <h4 className="text-3xl font-display font-black italic">Leave a note!</h4>
            <p className="opacity-50 text-lg max-w-xl font-medium leading-relaxed">
              Drop by and leave your thoughts, a greeting, or tell me what you think of this site. Click to view all entries and sign!
            </p>
            {latestEntry && (
              <div className="inline-flex flex-col sm:flex-row sm:items-center gap-2 mt-2 p-3 bg-[var(--surface-variant)]/40 rounded-2xl border-4 border-[var(--outline-variant)]/40 text-sm w-full text-left overflow-hidden">
                <span className="font-black text-[var(--primary)] shrink-0">@{latestEntry.name}:</span>
                <span className="opacity-85 truncate flex-1 font-medium italic min-w-0">"{latestEntry.message}"</span>
              </div>
            )}
          </div>
          <div className="w-full md:w-16 h-14 md:h-16 rounded-2xl md:rounded-3xl shrink-0 flex items-center justify-center bg-[var(--primary)] text-[var(--on-primary)] hover:scale-105 active:scale-95 transition-all shadow-xl shadow-[var(--primary)]/20">
            <span className="md:hidden font-expressive text-sm tracking-wider pt-0.5 mr-2">Open guestbook</span>
            <ChevronRight size={25} className="shrink-0 leading-none flex items-center justify-center" />
          </div>
        </Card>
      </section>
    </div>
  );
});
