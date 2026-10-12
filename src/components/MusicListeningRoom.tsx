// @ts-nocheck
import React, { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, animate, motion, useDragControls, useMotionValue, useTransform } from "motion/react";
import { MUSIC_RELEASES, type MusicRelease, type MusicTrack } from "../constants";
import { useTheme } from "../ThemeContext";
import { triggerReactionFeedback } from "../haptics";
import M3Switch from "./M3Switch";
import { Ripple } from "./Ripple";
import { BounceButton } from "./TechStack";
import WavyProgress from "./WavyProgress";
import { Album, PlayArrow, X, Share2, Heart, Info, MusicNote, ViewModule, ViewList, materialIcon } from "./MaterialIcon";

const REACTIONS = ["🔥", "♥️", "💀", "✨"];
const STORAGE_KEY = "stabbed_music_feedback_v1";
const ARTIST = "rxvirex";
const Pause = materialIcon("pause");
const MoreVert = materialIcon("more_vert");
const SkipNext = materialIcon("skip_next");
const SkipPrevious = materialIcon("skip_previous");
const Shuffle = materialIcon("shuffle");
const Repeat = materialIcon("repeat");
const DragHandle = materialIcon("drag_indicator");
const QueueMusic = materialIcon("queue_music");
const ReadMore = materialIcon("read_more");
const ThumbDown = materialIcon("thumb_down");
const ExpandMore = materialIcon("expand_more");
const OpenInFull = materialIcon("open_in_full");
const CloseFullscreen = materialIcon("close_fullscreen");
const ChevronUp = materialIcon("keyboard_arrow_up");
const ChevronDown = materialIcon("keyboard_arrow_down");
const Tune = materialIcon("tune");
const TRANSPORT_SPRING = { type: "spring", stiffness: 680, damping: 30, mass: 0.48 };

function AlbumCover({ release, className = "", iconSize = 24, style = {} }) {
  const [extension, setExtension] = useState("webp");
  const [missing, setMissing] = useState(false);
  if (missing) return <div className={`grid place-items-center bg-[var(--surface-variant)] text-[var(--primary)] ${className}`}><Album size={iconSize} /></div>;
  return <img style={style} src={release.coverUrl || `/albums/${release.id}.${extension}`} alt={`${release.title} cover`} onError={() => {
    if (extension === "webp") setExtension("png");
    else if (extension === "png") setExtension("jpg");
    else setMissing(true);
  }} className={`bg-[var(--surface-variant)] object-cover ${className}`} />;
}

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const minutes = Math.floor(seconds / 60);
  return `${minutes}:${String(Math.floor(seconds % 60)).padStart(2, "0")}`;
}

function readFeedback() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
}

export function MusicListeningRoom({ active, catalogHost, hideMiniPlayer = false }: { active: boolean; catalogHost: HTMLElement | null; hideMiniPlayer?: boolean }) {
  const { settings } = useTheme();
  const tracks = useMemo(() => MUSIC_RELEASES.flatMap((release) => (release.tracks || []).map((track) => ({ track, release }))), []);
  const rootRef = useRef<HTMLDivElement>(null);
  const releaseCyclerRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const dragControls = useDragControls();
  const countedListenRef = useRef(null);
  const playerEntryY = useMotionValue(0);
  const playerEntryOpacity = useMotionValue(1);
  const playerPointerStart = useRef<{ x: number; y: number; lastY: number; lastTime: number; velocityY: number } | null>(null);
  const miniProgress = useMotionValue(0);
  const wasPlayerDragged = useRef(false);
  const pointerStart = useRef<{ x: number; y: number } | null>(null);
  const queueDragRef = useRef<{ trackId: string; pointerId: number } | null>(null);
  const optionsTouchStart = useRef<number | null>(null);
  const [isMobile, setIsMobile] = useState(() => window.matchMedia("(max-width: 767px)").matches);
  const [selectedReleaseId, setSelectedReleaseId] = useState(MUSIC_RELEASES[0]?.id);
  const [releasePickerOpen, setReleasePickerOpen] = useState(false);
  const [current, setCurrent] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [playerView, setPlayerView] = useState<"now-playing" | "up-next">("now-playing");
  const [trackLayout, setTrackLayout] = useState<"list" | "grid">("list");
  const [releaseCyclerHasMore, setReleaseCyclerHasMore] = useState(false);
  const [releaseCyclerHasBefore, setReleaseCyclerHasBefore] = useState(false);
  const [activeTransport, setActiveTransport] = useState<string | null>(null);
  const [activeQueueDrag, setActiveQueueDrag] = useState<string | null>(null);
  const [feedbackPulse, setFeedbackPulse] = useState({ trackId: null, kind: null, version: 0 });
  const [queueOpen, setQueueOpen] = useState(false);
  const [queue, setQueue] = useState(tracks);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [audioError, setAudioError] = useState(false);
  const [menuTrack, setMenuTrack] = useState(null);
  const [menuSource, setMenuSource] = useState<"player" | "track">("track");
  const [shareFeedback, setShareFeedback] = useState("");
  const [menuAnchor, setMenuAnchor] = useState<{ right: number; bottom: number } | null>(null);
  const [menuTab, setMenuTab] = useState("options");
  const [analytics, setAnalytics] = useState({});
  const [feedback, setFeedback] = useState(readFeedback);
  const selectedRelease = MUSIC_RELEASES.find((release) => release.id === selectedReleaseId) || MUSIC_RELEASES[0];
  const stats = current ? analytics[current.track.id] || {} : {};
  const safeBottomInset = Number.parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--safe-area-inset-bottom")) || 0;
  const miniBottomOffset = 88 + safeBottomInset;
  const miniHeight = useTransform(miniProgress, (progress) => 64 + (window.innerHeight - 64) * progress);
  const miniInset = useTransform(miniProgress, (progress) => 16 * (1 - progress));
  const miniTop = useTransform(miniProgress, (progress) => Math.max(0, window.innerHeight - miniBottomOffset - 64) * (1 - progress));
  const miniBottom = useTransform(miniProgress, (progress) => miniBottomOffset * (1 - progress));
  const miniRadius = useTransform(miniProgress, (progress) => 28 + 971 * (1 - progress));
  const miniProgressOpacity = useTransform(miniProgress, (progress) => Math.max(0, 1 - progress / 0.2));
  const expandedCoverSize = Math.min(window.innerWidth - 40, window.innerWidth * 0.78, 360);
  const coverSize = useTransform(miniProgress, (progress) => 40 + (expandedCoverSize - 40) * progress);
  const coverLeft = useTransform(miniProgress, (progress) => 12 + ((window.innerWidth - expandedCoverSize) / 2 - 12) * progress);
  const coverTop = useTransform(miniProgress, (progress) => 12 + 52 * progress);
  const coverRadius = useTransform(miniProgress, (progress) => 12 + 16 * progress);
  const coverTransitionOpacity = useTransform(miniProgress, (value) => {
    const progress = Math.max(0, Math.min(1, value));
    return Math.min(1, progress / 0.12, (1 - progress) / 0.12);
  });
  const coverSlotOpacity = useTransform(coverTransitionOpacity, (opacity) => 1 - opacity);
  useEffect(() => {
    const query = window.matchMedia("(max-width: 767px)");
    const update = () => setIsMobile(query.matches);
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    const handleQueuePointerMove = (event: PointerEvent) => {
      const drag = queueDragRef.current;
      if (!drag || drag.pointerId !== event.pointerId) return;
      const target = document.elementFromPoint(event.clientX, event.clientY)?.closest("[data-queue-track-id]");
      const targetTrackId = target?.getAttribute("data-queue-track-id");
      if (!targetTrackId || targetTrackId === drag.trackId) return;
      setQueue((previous) => {
        const from = previous.findIndex((item) => item.track.id === drag.trackId);
        const targetIndex = previous.findIndex((item) => item.track.id === targetTrackId);
        if (from < 0 || targetIndex < 0) return previous;
        const targetBounds = target.getBoundingClientRect();
        let insertionIndex = targetIndex + (event.clientY > targetBounds.top + targetBounds.height / 2 ? 1 : 0);
        if (from < insertionIndex) insertionIndex -= 1;
        if (insertionIndex === from) return previous;
        const next = [...previous];
        const [item] = next.splice(from, 1);
        next.splice(insertionIndex, 0, item);
        return next;
      });
    };
    const handleQueuePointerEnd = (event: PointerEvent) => {
      if (queueDragRef.current?.pointerId !== event.pointerId) return;
      queueDragRef.current = null;
      setActiveQueueDrag(null);
    };
    window.addEventListener("pointermove", handleQueuePointerMove);
    window.addEventListener("pointerup", handleQueuePointerEnd);
    window.addEventListener("pointercancel", handleQueuePointerEnd);
    return () => {
      window.removeEventListener("pointermove", handleQueuePointerMove);
      window.removeEventListener("pointerup", handleQueuePointerEnd);
      window.removeEventListener("pointercancel", handleQueuePointerEnd);
    };
  }, []);

  useEffect(() => {
    const cycler = releaseCyclerRef.current;
    if (!cycler) return;
    const updateOverflow = () => {
      setReleaseCyclerHasBefore(cycler.scrollLeft > 4);
      setReleaseCyclerHasMore(cycler.scrollLeft + cycler.clientWidth < cycler.scrollWidth - 4);
    };
    updateOverflow();
    const observer = new ResizeObserver(updateOverflow);
    observer.observe(cycler);
    cycler.addEventListener("scroll", updateOverflow, { passive: true });
    return () => {
      observer.disconnect();
      cycler.removeEventListener("scroll", updateOverflow);
    };
  }, [active]);

  useEffect(() => {
    fetch("/api/music-analytics")
      .then((response) => response.ok ? response.json() : {})
      .then(setAnalytics)
      .catch(() => {});
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(feedback));
  }, [feedback]);

  useEffect(() => {
    if (!current || !isPlaying) return;
    const audio = audioRef.current;
    if (!audio) return;
    audio.play().catch(() => {
      setIsPlaying(false);
      setAudioError(true);
    });
  }, [current, isPlaying]);

  const settlePlayer = (shouldExpand: boolean) => {
    const target = shouldExpand ? 1 : 0;
    setExpanded(shouldExpand);
    if (!isMobile) {
      miniProgress.set(target);
      return;
    }
    animate(miniProgress, target, {
      type: "spring",
      stiffness: 560,
      damping: 27,
      mass: 0.52,
    });
  };

  useEffect(() => {
    if (!expanded && !menuTrack) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuTrack(null);
        settlePlayer(false);
        setReleasePickerOpen(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [expanded, menuTrack, isMobile]);

  const sendMetric = async (trackId, action, delta = 1, emoji) => {
    try {
      const response = await fetch("/api/music-analytics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trackId, action, delta, ...(emoji ? { emoji } : {}) }),
      });
      if (response.ok) {
        const updated = await response.json();
        setAnalytics((previous) => ({ ...previous, [trackId]: updated }));
      }
    } catch {}
  };

  const startTrack = (item, shouldExpand = false) => {
    if (!queue.length) setQueue([item, ...tracks.filter((entry) => entry.track.id !== item.track.id)]);
    if (!current) {
      const startOffset = isMobile ? Math.max(64, window.innerHeight * (shouldExpand ? 0.16 : 0.1)) : 36;
      playerEntryY.set(settings.disableAnimations ? 0 : startOffset);
      playerEntryOpacity.set(settings.disableAnimations ? 1 : 0);
      if (!settings.disableAnimations) {
        requestAnimationFrame(() => {
          animate(playerEntryY, 0, { type: "spring", stiffness: 560, damping: 27, mass: 0.52 });
          animate(playerEntryOpacity, 1, { duration: 0.22, ease: [0.22, 1, 0.36, 1] });
        });
      }
    }
    setCurrent(item);
    countedListenRef.current = null;
    setSelectedReleaseId(item.release.id);
    setAudioError(false);
    setTime(0);
    setDuration(0);
    setIsPlaying(true);
    if (shouldExpand) {
      miniProgress.set(1);
      setExpanded(true);
    }
  };

  useEffect(() => {
    if (!active) return;
    const trackId = new URLSearchParams(window.location.search).get("track");
    if (!trackId) return;
    const item = tracks.find((entry) => entry.track.id === trackId);
    if (!item) return;
    setQueue([item, ...tracks.filter((entry) => entry.track.id !== item.track.id)]);
    startTrack(item, true);
    setIsPlaying(false);
  }, [active, tracks]);

  const playAt = (index) => {
    if (!queue.length) return;
    const safeIndex = (index + queue.length) % queue.length;
    startTrack(queue[safeIndex]);
  };

  const currentIndex = current ? queue.findIndex((item) => item.track.id === current.track.id) : -1;
  const moveNext = (manual = false) => {
    if (!queue.length) return;
    if (manual && current) sendMetric(current.track.id, "skip");
    if (shuffle && queue.length > 1) {
      let nextIndex = currentIndex;
      while (nextIndex === currentIndex) nextIndex = Math.floor(Math.random() * queue.length);
      playAt(nextIndex);
      return;
    }
    playAt(currentIndex < 0 ? 0 : currentIndex + 1);
  };
  const movePrevious = () => {
    if (time > 3 && audioRef.current) {
      audioRef.current.currentTime = 0;
      return;
    }
    playAt(currentIndex < 0 ? 0 : currentIndex - 1);
  };

  const onAudioPlay = () => {
    setIsPlaying(true);
    if (current && countedListenRef.current !== current.track.id) {
      countedListenRef.current = current.track.id;
      sendMetric(current.track.id, "listen");
    }
  };

  const togglePlayback = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      setAudioError(false);
      audio.play().catch(() => {
        setIsPlaying(false);
        setAudioError(true);
      });
    } else {
      audio.pause();
    }
  };

  const pulseFeedbackControl = (event) => {
    const button = event.currentTarget;
    if (!settings.disableAnimations && typeof button.animate === "function") {
      button.animate(
        [
          { transform: "scale(1)", opacity: 1 },
          { transform: "scale(1.16) translateY(-2px)", opacity: 0.72, offset: 0.45 },
          { transform: "scale(1)", opacity: 1 },
        ],
        { duration: 420, easing: "cubic-bezier(0.34, 1.56, 0.64, 1)" },
      );
    }
  };

  const handlePlayerLike = (event, trackId = current?.track.id) => {
    pulseFeedbackControl(event);
    toggleFeedback("like", trackId);
  };

  const toggleFeedback = (kind, trackId = current?.track.id) => {
    if (!trackId) return;
    const key = `${kind}:${trackId}`;
    const wasSelected = Boolean(feedback[key]);
    const next = { ...feedback };
    if (wasSelected) delete next[key];
    else next[key] = true;
    if (kind === "like" || kind === "dislike") {
      const opposite = `${kind === "like" ? "dislike" : "like"}:${trackId}`;
      if (next[opposite]) {
        delete next[opposite];
        sendMetric(trackId, kind === "like" ? "dislike" : "like", -1);
      }
    }
    setFeedback(next);
    if (kind === "like" || kind === "dislike") {
      setFeedbackPulse((pulse) => ({ trackId, kind, version: pulse.version + 1 }));
    }
    sendMetric(trackId, kind, wasSelected ? -1 : 1);
  };

  const toggleReaction = (emoji) => {
    if (!current) return;
    const key = `reaction:${current.track.id}:${emoji}`;
    const wasSelected = Boolean(feedback[key]);
    triggerReactionFeedback(emoji, wasSelected);
    const next = { ...feedback };
    if (wasSelected) delete next[key];
    else next[key] = true;
    setFeedback(next);
    sendMetric(current.track.id, "reaction", wasSelected ? -1 : 1, emoji);
  };

  const addToQueue = (item, next = false) => {
    setQueue((previous) => {
      const withoutDuplicate = previous.filter((entry) => entry.track.id !== item.track.id);
      const insertionIndex = next && current ? Math.max(0, withoutDuplicate.findIndex((entry) => entry.track.id === current.track.id) + 1) : withoutDuplicate.length;
      withoutDuplicate.splice(insertionIndex, 0, item);
      return withoutDuplicate;
    });
    setMenuTrack(null);
  };

  const openTrackMenu = (item, source: "player" | "track" = "track") => {
    const player = expanded ? rootRef.current?.querySelector<HTMLElement>(".pointer-events-auto") : null;
    const bounds = player?.getBoundingClientRect();
    setMenuAnchor(bounds ? { right: Math.max(0, window.innerWidth - bounds.right), bottom: Math.max(0, window.innerHeight - bounds.bottom) } : null);
    setMenuTab("options");
    setMenuSource(source);
    setMenuTrack(item);
  };

  const dismissPlayerAndQueue = () => {
    const audio = audioRef.current;
    audio?.pause();
    if (audio) audio.currentTime = 0;
    setCurrent(null);
    setIsPlaying(false);
    setQueue([]);
    setExpanded(false);
    miniProgress.set(0);
    setPlayerView("now-playing");
    setQueueOpen(false);
    setAudioError(false);
    setTime(0);
    setDuration(0);
    setMenuTrack(null);
    setMenuSource("track");
  };

  const dismissQueueTrack = (trackId) => {
    setQueue((previous) => previous.filter((item) => item.track.id !== trackId));
  };

  const endQueueDrag = (event, trackId) => {
    if (queueDragRef.current?.trackId !== trackId || queueDragRef.current.pointerId !== event.pointerId) return;
    queueDragRef.current = null;
    setActiveQueueDrag(null);
  };

  const shareTrack = async (item) => {
    const url = `${window.location.origin}/music?view=listen&track=${encodeURIComponent(item.track.id)}`;
    const payload = { title: item.track.title, text: `${item.track.title} by ${ARTIST}`, url };
    const copyLink = async () => {
      if (navigator.clipboard?.writeText) {
        try {
          await navigator.clipboard.writeText(url);
          return;
        } catch {}
      }
      const input = document.createElement("textarea");
      input.value = url;
      input.setAttribute("readonly", "");
      input.style.position = "fixed";
      input.style.opacity = "0";
      document.body.appendChild(input);
      input.select();
      const copied = document.execCommand("copy");
      input.remove();
      if (!copied) throw new Error("Clipboard copy failed");
    };
    try {
      if (navigator.share) {
        try {
          await navigator.share(payload);
          setShareFeedback("Shared");
          window.setTimeout(() => setShareFeedback(""), 2200);
          return;
        } catch {}
      }
      await copyLink();
      setShareFeedback("Link copied");
    } catch {
      setShareFeedback("Sharing failed");
    }
    window.setTimeout(() => setShareFeedback(""), 2200);
  };

  const selectedFeedback = (kind, trackId = current?.track.id) => Boolean(trackId && feedback[`${kind}:${trackId}`]);
  const feedbackIcon = (kind, trackId, selected, Icon, size = 18) => {
    const pulse = feedbackPulse.trackId === trackId && feedbackPulse.kind === kind ? feedbackPulse.version : 0;
    return (
      <motion.span
        key={`${trackId}:${kind}:${pulse}`}
        initial={pulse ? { scale: 0.45, rotate: -22 } : false}
        animate={pulse ? { scale: [0.45, 1.35, 1], rotate: [-22, 12, 0] } : { scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 600, damping: 13 }}
        className="inline-flex size-6 shrink-0 items-center justify-center align-middle"
      >
        <Icon size={size} fill={selected} />
      </motion.span>
    );
  };
  const nextUp = currentIndex >= 0 ? queue.slice(currentIndex + 1, currentIndex + 5) : queue.slice(0, 4);

  const progressControl = (
    <div className="space-y-1">
      <div className="relative h-6 px-1">
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-1 top-1/2 -translate-y-1/2">
          <WavyProgress percent={duration ? (time / duration) * 100 : 0} height={18} thickness={3} animated={isPlaying} className="block w-full text-[var(--primary)]" />
        </div>
        <input
          aria-label="Track progress"
          type="range"
          min="0"
          max={duration || 0}
          step="0.1"
          value={Math.min(time, duration || 0)}
          onChange={(event) => {
            const value = Number(event.target.value);
            setTime(value);
            if (audioRef.current) audioRef.current.currentTime = value;
          }}
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
        />
      </div>
      <div className="flex justify-between text-[11px] tabular-nums opacity-55"><span>{formatTime(time)}</span><span>{formatTime(duration)}</span></div>
    </div>
  );

  const transportButton = (name, Icon, onClick, label) => {
    const isPressed = activeTransport === name;
    const width = isPressed ? (name === "play" ? 130 : 114) : 94;
    return (
      <motion.button
        key={name}
        layout
        animate={{ width }}
        transition={TRANSPORT_SPRING}
        onPointerDown={() => setActiveTransport(name)}
        onPointerUp={() => setActiveTransport(null)}
        onPointerLeave={() => setActiveTransport(null)}
        onClick={onClick}
        whileTap={{ scale: 0.96 }}
        className={`flex h-[68px] shrink-0 items-center justify-center rounded-full ${name === "play" ? "bg-[var(--primary)] text-[var(--on-primary)]" : "bg-[var(--surface-variant)] hover:bg-[var(--primary-container)]"}`}
        aria-label={label}
      >
        <span className="relative grid size-9 place-items-center overflow-hidden">
          {name === "play" ? (
            <AnimatePresence mode="wait" initial={false}>
              <motion.span key={label} initial={{ opacity: 0, y: 7, scale: 0.72 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -7, scale: 0.72 }} transition={{ duration: 0.15, ease: "easeOut" }} className="absolute grid place-items-center">
                <Icon size={30} fill />
              </motion.span>
            </AnimatePresence>
          ) : (
            <motion.span whileTap={{ x: name === "previous" ? -4 : 4, scale: 0.82 }} transition={TRANSPORT_SPRING} className="grid place-items-center">
              <Icon size={27} fill />
            </motion.span>
          )}
        </span>
      </motion.button>
    );
  };

  const transportControls = (
    <div className="flex items-center justify-center gap-2" aria-label="Playback controls">
      {transportButton("previous", SkipPrevious, movePrevious, "Previous track")}
      {transportButton("play", isPlaying ? Pause : PlayArrow, togglePlayback, isPlaying ? "Pause" : "Play")}
      {transportButton("next", SkipNext, () => moveNext(true), "Next track")}
    </div>
  );

  const playerOptionsBar = (
    <div
      className="flex items-center justify-center gap-2"
      onTouchStart={(event) => { optionsTouchStart.current = event.touches[0]?.clientY ?? null; }}
      onTouchEnd={(event) => {
        if (optionsTouchStart.current === null) return;
        const delta = event.changedTouches[0].clientY - optionsTouchStart.current;
        if (delta < -42) setPlayerView("up-next");
        if (delta > 42) setPlayerView("now-playing");
        optionsTouchStart.current = null;
      }}
    >
      <div className="flex items-center rounded-full bg-[var(--surface-variant)] p-1">
        <motion.button layout whileTap={{ scale: 0.88 }} transition={TRANSPORT_SPRING} onClick={() => setShuffle((value) => !value)} className={`grid h-12 w-16 place-items-center rounded-full ${shuffle ? "bg-[var(--primary)] text-[var(--on-primary)]" : "opacity-65"}`} aria-label="Toggle shuffle"><Shuffle size={21} /></motion.button>
        <motion.button layout whileTap={{ scale: 0.88 }} transition={TRANSPORT_SPRING} onClick={() => setRepeat((value) => !value)} className={`relative grid h-12 w-16 place-items-center rounded-full ${repeat ? "bg-[var(--primary)] text-[var(--on-primary)]" : "opacity-65"}`} aria-label="Toggle repeat once"><Repeat size={21} /><span className="absolute bottom-2 right-3 text-[8px] font-black">1</span></motion.button>
        <motion.button
          layout
          initial={feedbackPulse.trackId === current?.track.id && feedbackPulse.kind === "like" ? { scale: 0.72, rotate: -12, y: 3, opacity: 0.55 } : false}
          animate={feedbackPulse.trackId === current?.track.id && feedbackPulse.kind === "like" ? { scale: [0.72, 1.2, 1], rotate: [-12, 8, 0], y: [3, -2, 0], opacity: [0.55, 1, 1] } : { scale: 1, rotate: 0, y: 0, opacity: 1 }}
          whileTap={{ scale: 0.88 }}
          transition={TRANSPORT_SPRING}
          onClick={handlePlayerLike}
          className={`grid h-12 w-16 place-items-center rounded-full ${selectedFeedback("like") ? "bg-[var(--primary)] text-[var(--on-primary)]" : "opacity-65"}`}
          aria-label="Like track"
        >{feedbackIcon("like", current?.track.id, selectedFeedback("like"), Heart, 21)}</motion.button>
      </div>
      <motion.button layout whileTap={{ scale: 0.88 }} transition={TRANSPORT_SPRING} onClick={() => openTrackMenu(current, "player")} className="grid size-12 place-items-center rounded-[16px] bg-[var(--surface-variant)] hover:bg-[var(--primary-container)]" aria-label="Current track options"><MoreVert size={21} /></motion.button>
    </div>
  );

  const trackRow = (item, index, inQueue = false, total = 1, grid = false) => {
    const isFirst = index === 0;
    const isLast = index === total - 1;
    const rowRounding = total === 1
      ? "rounded-xl"
      : isFirst
        ? "rounded-t-3xl rounded-b-[6px]"
        : isLast
          ? "rounded-b-3xl rounded-t-[6px]"
          : "rounded-[6px]";
    return (
    <motion.div
      key={`${inQueue ? "queue" : "track"}-${item.track.id}`}
      data-ripple
      data-queue-track-id={inQueue ? item.track.id : undefined}
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...TRANSPORT_SPRING, delay: Math.min(index * 0.035, 0.28) }}
      onPointerDown={(event) => { pointerStart.current = { x: event.clientX, y: event.clientY }; }}
      onPointerUp={(event) => {
        if (inQueue && pointerStart.current) {
          const deltaX = event.clientX - pointerStart.current.x;
          if (deltaX < -80) dismissQueueTrack(item.track.id);
        }
        pointerStart.current = null;
      }}
      className={`group ${grid ? "flex min-h-56 flex-col items-stretch rounded-2xl border border-[var(--outline-variant)]/50 bg-[var(--surface-container)]/45 p-3 hover:bg-[var(--surface-container)]" : `flex min-h-16 items-center gap-3 border border-[var(--outline-variant)]/45 bg-[var(--surface)] px-3 ${rowRounding} hover:bg-[var(--surface-variant)]`} ${current?.track.id === item.track.id ? "!bg-[var(--primary)]/10" : ""} ${activeQueueDrag === item.track.id ? "z-10 shadow-xl" : ""}`}
    >
      {grid && <button data-ripple-skip onClick={() => startTrack(item)} className="mb-3 aspect-square w-full overflow-hidden rounded-xl" aria-label={`Play ${item.track.title}`}><AlbumCover release={item.release} className="h-full w-full object-cover" iconSize={28} /></button>}
      <div className={`flex min-w-0 ${grid ? "flex-1 items-center gap-1" : "flex-1 items-center gap-3"}`}>
      {inQueue && <button
        data-ripple-skip
        onPointerDown={(event) => {
          event.preventDefault();
          queueDragRef.current = { trackId: item.track.id, pointerId: event.pointerId };
          setActiveQueueDrag(item.track.id);
          event.currentTarget.setPointerCapture(event.pointerId);
        }}
        onPointerUp={(event) => endQueueDrag(event, item.track.id)}
        onPointerCancel={(event) => endQueueDrag(event, item.track.id)}
        className="cursor-grab touch-none opacity-45 hover:opacity-100 active:cursor-grabbing"
        aria-label="Drag to reorder"
      ><DragHandle size={20} /></button>}
      <button data-ripple-skip onClick={() => startTrack(item)} className={`flex min-w-0 flex-1 items-center text-left ${grid ? "gap-2" : "gap-3"}`} aria-label={`Play ${item.track.title}`}>
        {!grid && <span className="relative flex h-7 w-7 shrink-0 items-center justify-end overflow-hidden text-xs tabular-nums opacity-55">
          <AnimatePresence mode="wait" initial={false}>
            {current?.track.id === item.track.id && isPlaying ? (
              <motion.span key="playing" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} transition={{ duration: 0.16, ease: "easeOut" }} className="absolute inset-0 flex items-center justify-center text-[var(--primary)]"><MusicNote size={20} fill /></motion.span>
            ) : (
              <motion.span key="track-number" initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 5 }} transition={{ duration: 0.16, ease: "easeOut" }} className="absolute inset-0 flex items-center justify-end">{String(index + 1).padStart(2, "0")}</motion.span>
            )}
          </AnimatePresence>
        </span>}
        <span className="min-w-0 flex-1">
          <span className={`block truncate text-sm font-bold ${current?.track.id === item.track.id ? "text-[var(--primary)]" : ""}`}>{item.track.title}</span>
          <span className="block truncate text-xs opacity-55">{item.release.title}</span>
        </span>
      </button>
      <span className={`text-xs tabular-nums opacity-50 ${grid ? "ml-1" : "hidden sm:block"}`}>{item.track.duration || "WAV"}</span>
      <button data-ripple-skip onClick={() => openTrackMenu(item)} className="grid size-10 shrink-0 place-items-center rounded-full hover:bg-[var(--surface-variant)]" aria-label={`More options for ${item.track.title}`}><MoreVert size={20} /></button>
      {inQueue && <button data-ripple-skip onClick={() => dismissQueueTrack(item.track.id)} className="grid size-9 place-items-center rounded-full opacity-55 hover:opacity-100" aria-label={`Remove ${item.track.title} from queue`}><X size={18} /></button>}
      </div>
    </motion.div>
  );
  };

  return (
    <>
      {catalogHost && createPortal(<section className={active ? "space-y-7" : "hidden"} aria-label="Listen to music">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl sm:text-4xl font-expressive-bold italic">Listen here</h2>
          </div>
          <div className="flex w-full items-center justify-between gap-3 sm:w-auto sm:justify-end">
            <p className="truncate text-xs opacity-55 sm:text-sm">{tracks.length} tracks · hosted here</p>
            <label data-ripple-skip className="ml-auto flex shrink-0 items-center gap-2 rounded-full border border-[var(--outline-variant)]/50 bg-[var(--surface-variant)]/60 px-3 py-2 text-xs font-bold">
              <span className={trackLayout === "list" ? "text-[var(--on-surface)]" : "opacity-55"}>List</span>
              <M3Switch
                checked={trackLayout === "grid"}
                onChange={(checked) => setTrackLayout(checked ? "grid" : "list")}
                icons="both"
                checkedIcon={<ViewModule size={14} />}
                uncheckedIcon={<ViewList size={14} />}
              />
              <span className={trackLayout === "grid" ? "text-[var(--on-surface)]" : "opacity-55"}>Grid</span>
            </label>
          </div>
        </div>

        <div className="group/release-cycler relative">
        <div
          ref={releaseCyclerRef}
          className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide"
          style={releaseCyclerHasBefore || releaseCyclerHasMore ? {
            maskImage: `linear-gradient(to right, ${releaseCyclerHasBefore ? "transparent" : "black"} 0, black 20px, black calc(100% - 20px), ${releaseCyclerHasMore ? "transparent" : "black"} 100%)`,
            WebkitMaskImage: `linear-gradient(to right, ${releaseCyclerHasBefore ? "transparent" : "black"} 0, black 20px, black calc(100% - 20px), ${releaseCyclerHasMore ? "transparent" : "black"} 100%)`,
          } : undefined}
        >
          {MUSIC_RELEASES.filter((release) => release.tracks?.length).map((release, index) => (
            <motion.button layout key={release.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ ...TRANSPORT_SPRING, delay: index * 0.07 }} onClick={() => setSelectedReleaseId(release.id)} className={`flex w-48 shrink-0 items-center gap-3 rounded-2xl border p-2 text-left transition-colors ${selectedRelease.id === release.id ? "border-[var(--primary)] bg-[var(--primary)]/10" : "border-[var(--outline-variant)]/45 bg-[var(--surface-variant)]/35 opacity-75 hover:opacity-100"}`}>
              <AlbumCover release={release} className="size-14 rounded-xl" iconSize={24} />
              <span className="min-w-0"><span className="block truncate text-sm font-black">{release.title}</span><span className="text-xs opacity-60">{release.tracks.length} {release.tracks.length === 1 ? "track" : "tracks"}</span></span>
            </motion.button>
          ))}
        </div>
          <AnimatePresence>
            {releaseCyclerHasBefore && <motion.div aria-hidden="true" initial={{ opacity: 0, x: -5 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -5 }} transition={{ duration: 0.24 }} className="pointer-events-none absolute inset-y-1 left-0 w-[2px] bg-black/45 shadow-[8px_0_14px_3px_rgba(0,0,0,0.7)]" />}
            {releaseCyclerHasMore && <motion.div aria-hidden="true" initial={{ opacity: 0, x: 5 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 5 }} transition={{ duration: 0.24 }} className="pointer-events-none absolute inset-y-1 right-0 w-[2px] bg-black/45 shadow-[-8px_0_14px_3px_rgba(0,0,0,0.7)]" />}
          </AnimatePresence>
        </div>

        {selectedRelease && (
          <AnimatePresence mode="wait" initial={false}>
          <motion.div key={selectedRelease.id} layout initial={{ opacity: 0, y: 16, scale: 0.985 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -12, scale: 0.985 }} transition={TRANSPORT_SPRING} className="overflow-hidden bg-[var(--surface)]/35">
            <div className="flex flex-col items-center gap-6 p-4 pb-6 sm:flex-row sm:items-end sm:p-6">
              <button onClick={() => setReleasePickerOpen((open) => !open)} className="relative size-48 shrink-0 cursor-pointer overflow-hidden rounded-2xl text-left shadow-xl sm:size-56" aria-label="Choose release">
                <AlbumCover release={selectedRelease} className="size-full rounded-2xl" iconSize={48} />
                <span className="absolute bottom-2 right-2 grid size-9 place-items-center rounded-full bg-black/65 text-white"><ExpandMore size={20} /></span>
              </button>
              <div className="w-full min-w-0 text-center sm:text-left">
                <p className="text-xs font-black uppercase opacity-55">{selectedRelease.type} · {selectedRelease.releaseDate}</p>
                <h3 className="mt-2 text-3xl font-black leading-tight sm:text-5xl">{selectedRelease.title}</h3>
                <p className="mt-1 text-sm opacity-60">{ARTIST} · {selectedRelease.tracks?.length} tracks</p>
                <p className="mt-3 max-w-2xl text-sm leading-relaxed opacity-65">{selectedRelease.description}</p>
                <BounceButton
                  icon={PlayArrow}
                  label="Play release"
                  onClick={() => startTrack({ track: selectedRelease.tracks[0], release: selectedRelease }, true)}
                  className="mt-5 inline-flex min-h-12 items-center gap-2 rounded-full bg-[var(--primary)] px-6 py-3 text-sm font-black text-[var(--on-primary)] hover:brightness-110"
                />
              </div>
            </div>
            {releasePickerOpen && <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} className="m-3 grid gap-2 rounded-3xl border border-[var(--outline-variant)]/55 bg-[var(--surface)] p-2 sm:grid-cols-2">{MUSIC_RELEASES.filter((release) => release.tracks?.length).map((release, index) => <motion.button layout key={release.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ ...TRANSPORT_SPRING, delay: index * 0.04 }} onClick={() => { setSelectedReleaseId(release.id); setReleasePickerOpen(false); }} className="flex items-center gap-3 rounded-3xl p-2 text-left hover:bg-[var(--surface-variant)]"><AlbumCover release={release} className="size-12 rounded-lg" iconSize={20} /><span className="text-sm font-bold">{release.title}</span><span className="ml-auto text-xs opacity-50">{release.tracks.length} tracks</span></motion.button>)}</motion.div>}
            <div className={`p-3 ${trackLayout === "grid" ? "grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4" : "flex flex-col gap-1 overflow-hidden rounded-3xl border border-[var(--outline-variant)]/50 bg-[var(--surface-container)]"}`}>
              {selectedRelease.tracks.map((track, index) => trackRow({ track, release: selectedRelease }, index, false, selectedRelease.tracks.length, trackLayout === "grid"))}
            </div>
          </motion.div>
          </AnimatePresence>
        )}
      </section>, catalogHost)}

      <div ref={rootRef} className="pointer-events-none fixed inset-0 z-[90] md:z-[120]">
        {current && (
          <motion.div
            key={isMobile ? "mobile-player" : "desktop-player"}
            layout={!isMobile}
            drag={isMobile ? false : true}
            dragSnapToOrigin={false}
            dragElastic={{ top: 0.16, bottom: 0.34 }}
            dragListener={!isMobile && !expanded}
            dragControls={dragControls}
            dragMomentum={false}
            dragConstraints={rootRef}
            onDragEnd={(_event, info) => {
              if (!isMobile && expanded && info.offset.y > 110) setExpanded(false);
            }}
            transition={{ ...TRANSPORT_SPRING, stiffness: 560, damping: 27, mass: 0.52, layout: { type: "spring", stiffness: 360, damping: 34, mass: 0.8 } }}
            className={`${isMobile && hideMiniPlayer && !expanded ? "pointer-events-none" : "pointer-events-auto"} ${isMobile ? "overflow-hidden" : "absolute right-4 top-[max(16px,env(safe-area-inset-top))] w-[min(420px,calc(100vw-2rem))]"}`}
            style={isMobile ? { position: "fixed", left: miniInset, right: miniInset, top: miniTop, bottom: miniBottom, width: "auto", height: miniHeight, borderRadius: miniRadius, y: playerEntryY, opacity: hideMiniPlayer && !expanded ? 0 : playerEntryOpacity, visibility: hideMiniPlayer && !expanded ? "hidden" : "visible" } : { y: playerEntryY, opacity: playerEntryOpacity }}
          >
            <AnimatePresence mode={isMobile ? "sync" : "wait"} initial={false}>
            <motion.div
              key={expanded ? "expanded-content" : "mini-content"}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className={isMobile ? "absolute inset-0" : ""}
              style={isMobile ? { borderRadius: miniRadius } : undefined}
            >
            {!expanded ? (
              <div data-ripple className={`relative isolate flex h-full items-center gap-4 overflow-hidden p-3 backdrop-blur-xl ${isMobile ? "rounded-[inherit] border-0 bg-[var(--surface-container)] shadow-lg" : "h-[68px] rounded-[28px] border border-[var(--outline-variant)] bg-[var(--surface)]/95 shadow-2xl"}`}>
                <motion.div
                  aria-hidden="true"
                  initial={false}
                  animate={{ width: `${duration ? Math.min(100, (time / duration) * 100) : 0}%` }}
                  transition={{ duration: 0.35, ease: "linear" }}
                  style={isMobile ? { opacity: miniProgressOpacity } : undefined}
                  className="pointer-events-none absolute inset-y-0 left-0 rounded-full bg-[var(--primary)]/10"
                />
                <button
                  data-ripple-skip
                  onPointerDown={(event) => {
                    if (!isMobile || event.pointerType !== "touch") return;
                    playerPointerStart.current = { x: event.clientX, y: event.clientY, lastY: event.clientY, lastTime: event.timeStamp, velocityY: 0 };
                    event.currentTarget.setPointerCapture(event.pointerId);
                  }}
                  onPointerMove={(event) => {
                    if (!isMobile || event.pointerType !== "touch" || !playerPointerStart.current) return;
                    const start = playerPointerStart.current;
                    const elapsed = Math.max(1, event.timeStamp - start.lastTime);
                    start.velocityY = (event.clientY - start.lastY) / elapsed;
                    start.lastY = event.clientY;
                    start.lastTime = event.timeStamp;
                    const progress = Math.max(0, Math.min(1, (start.y - event.clientY) / Math.max(240, window.innerHeight * 0.68)));
                    miniProgress.set(progress);
                  }}
                  onPointerUp={(event) => {
                    if (!isMobile || event.pointerType !== "touch") return;
                    const start = playerPointerStart.current;
                    if (start) {
                      const deltaX = event.clientX - start.x;
                      const deltaY = event.clientY - start.y;
                      wasPlayerDragged.current = Math.hypot(deltaX, deltaY) > 20;
                      if (wasPlayerDragged.current) window.setTimeout(() => { wasPlayerDragged.current = false; }, 250);
                      const shouldExpand = Math.abs(deltaY) > Math.abs(deltaX) && (deltaY < -32 || (deltaY < -12 && start.velocityY < -0.5));
                      settlePlayer(shouldExpand);
                      playerPointerStart.current = null;
                    }
                  }}
                  onPointerCancel={() => {
                    playerPointerStart.current = null;
                    settlePlayer(false);
                  }}
                  onClick={() => {
                    if (wasPlayerDragged.current) {
                      wasPlayerDragged.current = false;
                      return;
                    }
                    settlePlayer(true);
                  }}
                  className={`relative z-10 flex min-w-0 flex-1 items-center gap-3 overflow-hidden text-left ${isMobile ? "touch-none" : ""}`}
                >
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.span key={current.track.id} initial={{ opacity: 0, x: 14 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -14 }} transition={TRANSPORT_SPRING} className="flex min-w-0 flex-1 items-center gap-3">
                      {isMobile ? <motion.div aria-hidden="true" className="size-10 shrink-0 overflow-hidden rounded-xl" style={{ opacity: coverSlotOpacity }}><AlbumCover release={current.release} className="h-full w-full rounded-xl" iconSize={20} /></motion.div> : <AlbumCover release={current.release} className="size-10 rounded-xl" iconSize={20} />}
                      <span className="min-w-0 flex-1"><span className="block truncate text-sm font-black">{current.track.title}</span><span className="block truncate text-xs opacity-55">{current.release.title}</span></span>
                    </motion.span>
                  </AnimatePresence>
                </button>
                <motion.button
                  data-ripple-skip
                  onClick={togglePlayback}
                  whileTap={{ scale: 0.88 }}
                  transition={TRANSPORT_SPRING}
                  aria-label={isPlaying ? "Pause" : "Play"}
                  className="relative z-10 grid size-11 shrink-0 place-items-center rounded-full bg-[var(--primary)] text-[var(--on-primary)]"
                >
                  <span className="relative grid size-6 place-items-center overflow-hidden">
                    <AnimatePresence mode="wait" initial={false}>
                      <motion.span key={isPlaying ? "pause" : "play"} initial={{ opacity: 0, y: 5, scale: 0.75 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -5, scale: 0.75 }} transition={{ duration: 0.14, ease: "easeOut" }} className="material-symbols-rounded absolute">{isPlaying ? "pause" : "play_arrow"}</motion.span>
                    </AnimatePresence>
                  </span>
                </motion.button>
                <button data-ripple-skip onClick={() => settlePlayer(true)} className="relative z-10 grid size-10 shrink-0 place-items-center rounded-full hover:bg-[var(--surface-variant)]" aria-label="Expand player"><OpenInFull size={18} /></button>
              </div>
            ) : (
              <div className={`flex flex-col overflow-hidden bg-[var(--surface)] text-[var(--on-surface)] ${isMobile ? "h-full rounded-[28px]" : "max-h-[min(820px,calc(100dvh-2rem))] rounded-[28px] border border-[var(--outline-variant)] shadow-2xl backdrop-blur-xl"}`}>
                <AnimatePresence mode="wait" initial={false}>
                  {playerView === "now-playing" ? (
                    <motion.section
                      key="now-playing"
                      initial={{ opacity: 0, y: 18 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -14 }}
                      transition={TRANSPORT_SPRING}
                      className="flex min-h-0 flex-1 flex-col"
                    >
                      <div className="relative flex h-14 shrink-0 items-center justify-center px-4 md:h-16 md:px-6">
                        <button
                          onPointerDown={(event) => {
                            if (isMobile && event.pointerType === "touch") {
                              playerPointerStart.current = { x: event.clientX, y: event.clientY, lastY: event.clientY, lastTime: event.timeStamp, velocityY: 0 };
                              event.currentTarget.setPointerCapture(event.pointerId);
                            } else if (!isMobile) {
                              dragControls.start(event);
                            }
                          }}
                          onPointerMove={(event) => {
                            if (!isMobile || event.pointerType !== "touch" || !playerPointerStart.current) return;
                            const start = playerPointerStart.current;
                            const elapsed = Math.max(1, event.timeStamp - start.lastTime);
                            start.velocityY = (event.clientY - start.lastY) / elapsed;
                            start.lastY = event.clientY;
                            start.lastTime = event.timeStamp;
                            const progress = Math.max(0, Math.min(1, 1 - (event.clientY - start.y) / Math.max(240, window.innerHeight * 0.68)));
                            miniProgress.set(progress);
                          }}
                          onPointerUp={(event) => {
                            if (!isMobile || event.pointerType !== "touch") return;
                            const start = playerPointerStart.current;
                            if (start) {
                              const deltaY = event.clientY - start.y;
                              const shouldCollapse = deltaY > 48 || (deltaY > 12 && start.velocityY > 0.5);
                              settlePlayer(!shouldCollapse);
                            }
                            playerPointerStart.current = null;
                          }}
                          onPointerCancel={() => {
                            playerPointerStart.current = null;
                            settlePlayer(true);
                          }}
                          className="flex h-full flex-1 touch-none items-center justify-center md:justify-start"
                          aria-label="Drag down to collapse player"
                        >
                          <span className="h-1.5 w-12 rounded-full bg-[var(--outline-variant)]/70 md:hidden" />
                          <span className="hidden text-xs font-black uppercase opacity-50 md:block">Now playing</span>
                        </button>
                        <button onClick={() => settlePlayer(false)} className="absolute right-3 top-2 grid size-11 place-items-center rounded-[18px] bg-[var(--surface-variant)] hover:bg-[var(--primary-container)] md:right-4 md:top-3" aria-label="Collapse player"><CloseFullscreen size={18} /></button>
                      </div>
                      <div className="flex min-h-0 flex-1 flex-col items-center gap-5 overflow-y-auto px-5 pb-5 pt-2 md:justify-center md:gap-4 md:pt-0">
                        <div className="aspect-square w-full max-w-[min(78vw,360px)] overflow-hidden rounded-3xl shadow-xl md:max-w-[min(34vh,320px)]">{isMobile ? <motion.div className="h-full w-full" style={{ opacity: coverSlotOpacity }}><AlbumCover release={current.release} className="h-full w-full rounded-3xl" iconSize={44} /></motion.div> : <AlbumCover release={current.release} className="h-full w-full rounded-3xl" iconSize={44} />}</div>
                        <div className="w-full max-w-lg space-y-2">
                          <h2 className="truncate text-left text-xl font-black sm:text-2xl">{current.track.title}</h2>
                          <p className="truncate text-left text-sm opacity-60">{ARTIST}</p>
                          {progressControl}
                        </div>
                        {transportControls}
                        {audioError && <p role="status" className="text-center text-xs text-[var(--error)]">The audio file couldn't be played. :(</p>}
                        <div
                          className="sticky bottom-0 z-10 mt-auto w-full max-w-lg space-y-3 border-t border-[var(--outline-variant)]/40 bg-[var(--surface)]/95 pb-[calc(env(safe-area-inset-bottom)+12px)] pt-3 backdrop-blur-xl md:static md:border-0 md:bg-transparent md:pb-0 md:pt-0 md:backdrop-blur-none"
                          onTouchStart={(event) => { optionsTouchStart.current = event.touches[0]?.clientY ?? null; }}
                          onTouchEnd={(event) => {
                            if (optionsTouchStart.current === null) return;
                            const delta = event.changedTouches[0].clientY - optionsTouchStart.current;
                            if (delta < -48) setPlayerView("up-next");
                            optionsTouchStart.current = null;
                          }}
                        >
                          {playerOptionsBar}
                          <motion.button layout whileTap={{ scale: 0.98 }} transition={TRANSPORT_SPRING} onClick={() => setPlayerView("up-next")} className="flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-[var(--surface-variant)] px-4 text-sm font-black hover:bg-[var(--primary-container)]">
                            <QueueMusic size={18} /> Up next <span className="text-xs font-medium opacity-55">· {nextUp.length} tracks</span><ChevronUp size={18} />
                          </motion.button>
                        </div>
                      </div>
                    </motion.section>
                  ) : (
                    <motion.section
                      key="up-next"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 16 }}
                      transition={TRANSPORT_SPRING}
                      className="flex min-h-0 flex-1 flex-col"
                    >
                      <div className="flex shrink-0 items-center gap-3 border-b border-[var(--outline-variant)]/45 px-4 py-3">
                        <button onPointerDown={(event) => { if (!isMobile) dragControls.start(event); }} onClick={() => setPlayerView("now-playing")} className="flex min-w-0 flex-1 items-center gap-3 text-left touch-none" aria-label="Back to now playing">
                          <AlbumCover release={current.release} className="size-11 rounded-xl" iconSize={20} />
                          <span className="min-w-0"><span className="block truncate text-sm font-black">{current.track.title}</span><span className="block truncate text-xs opacity-55">{current.release.title} · {ARTIST}</span></span>
                          <ChevronDown className="md:hidden" size={19} />
                        </button>
                        <button onClick={() => settlePlayer(false)} className="grid size-10 place-items-center rounded-full hover:bg-[var(--surface-variant)]" aria-label="Collapse player"><CloseFullscreen size={18} /></button>
                      </div>
                      <div className="min-h-0 flex-1 overflow-y-auto">
                        <div className="px-5 pb-4 pt-5">
                          <div
                            onTouchStart={(event) => { optionsTouchStart.current = event.touches[0]?.clientY ?? null; }}
                            onTouchEnd={(event) => {
                              if (optionsTouchStart.current === null) return;
                              if (event.changedTouches[0].clientY - optionsTouchStart.current > 48) setPlayerView("now-playing");
                              optionsTouchStart.current = null;
                            }}
                            className="flex items-center gap-4 rounded-2xl border border-[var(--outline-variant)]/45 bg-[var(--surface-variant)]/25 p-3"
                          >
                            <button onClick={() => setReleasePickerOpen((open) => !open)} aria-label="Choose release" className="size-20 shrink-0 overflow-hidden rounded-xl"><AlbumCover release={current.release} className="size-20 rounded-xl" iconSize={26} /></button>
                            <div className="min-w-0 flex-1"><p className="truncate text-lg font-black">{current.track.title}</p><p className="truncate text-sm opacity-55">{current.release.title} · {ARTIST}</p><p className="mt-1 text-xs opacity-50">{stats.listens || 0} plays</p></div>
                          </div>
                          {releasePickerOpen && <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} className="mt-3 grid gap-2 rounded-2xl border border-[var(--outline-variant)] bg-[var(--surface)] p-2">{MUSIC_RELEASES.filter((release) => release.tracks?.length).map((release, index) => <motion.button layout key={release.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ ...TRANSPORT_SPRING, delay: index * 0.04 }} onClick={() => { setSelectedReleaseId(release.id); setReleasePickerOpen(false); }} className="flex items-center gap-3 rounded-xl p-2 text-left hover:bg-[var(--surface-variant)]"><AlbumCover release={release} className="size-10 rounded-lg" iconSize={18} /><span className="text-sm font-bold">{release.title}</span></motion.button>)}</motion.div>}
                          <div className="mt-4">{progressControl}</div>
                          <div className="mt-2">{transportControls}</div>
                          {audioError && <p role="status" className="mt-3 text-center text-xs text-[var(--error)]">The audio file couldn't be played. :(</p>}
                          <div className="mt-4 flex items-center justify-between gap-2 rounded-4xl border border-[var(--outline-variant)]/40 bg-[var(--surface-variant)]/25 px-2 py-2">
                            <div className="flex shrink-0 items-center rounded-full bg-[var(--surface-variant)] p-1">
                              <button onClick={() => toggleFeedback("like")} className={`inline-flex h-10 items-center gap-2 rounded-full px-3 text-sm ${selectedFeedback("like") ? "bg-[var(--primary)] text-[var(--on-primary)]" : "hover:bg-[var(--surface)]"}`} aria-label={`Like track, ${stats.likes || 0} likes`}>{feedbackIcon("like", current.track.id, selectedFeedback("like"), Heart)}<span>Like</span><motion.span key={`likes:${stats.likes || 0}`} initial={{ scale: 0.7 }} animate={{ scale: 1 }} transition={TRANSPORT_SPRING} className="text-xs tabular-nums opacity-65">{stats.likes || 0}</motion.span></button>
                              <button onClick={() => toggleFeedback("dislike")} className={`inline-flex h-10 items-center gap-2 rounded-full px-3 text-sm ${selectedFeedback("dislike") ? "bg-[var(--primary)] text-[var(--on-primary)]" : "hover:bg-[var(--surface)]"}`} aria-label={`Dislike track, ${stats.dislikes || 0} dislikes`}>{feedbackIcon("dislike", current.track.id, selectedFeedback("dislike"), ThumbDown)}<span>Dislike</span><motion.span key={`dislikes:${stats.dislikes || 0}`} initial={{ scale: 0.7 }} animate={{ scale: 1 }} transition={TRANSPORT_SPRING} className="text-xs tabular-nums opacity-65">{stats.dislikes || 0}</motion.span></button>
                            </div>
                            <div role="region" aria-label="Track reactions" tabIndex={0} className="flex w-[9.5rem] max-w-[32vw] shrink-0 snap-x snap-mandatory gap-1 overflow-x-auto overscroll-x-contain scrollbar-hide focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--primary)]">
                              {REACTIONS.map((emoji) => <motion.button key={emoji} whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }} transition={{ type: "spring", stiffness: 500, damping: 28 }} onClick={() => toggleReaction(emoji)} className={`flex h-10 w-12 min-w-12 shrink-0 snap-start items-center justify-center gap-1 rounded-full px-1 ${feedback[`reaction:${current.track.id}:${emoji}`] ? "bg-[var(--primary)]/15" : "hover:bg-[var(--surface-variant)]"}`} aria-label={`React ${emoji}, ${stats.reactions?.[emoji] || 0}`}><span className="text-lg">{emoji}</span><motion.span key={`${emoji}:${stats.reactions?.[emoji] || 0}`} initial={{ scale: 0.7 }} animate={{ scale: 1 }} transition={TRANSPORT_SPRING} className="text-[10px] tabular-nums opacity-65">{stats.reactions?.[emoji] || 0}</motion.span></motion.button>)}
                            </div>
                          </div>
                        </div>
                        {queueOpen ? (
                          <div className="border-t border-[var(--outline-variant)]/45 px-4 pb-3">
                            <div className="flex items-center justify-between py-3"><h3 className="font-black">Queue <span className="text-xs font-medium opacity-50">{queue.length}</span></h3><button onClick={() => setQueueOpen(false)} className="grid size-9 place-items-center rounded-full hover:bg-[var(--surface-variant)]" aria-label="Show upcoming tracks"><ChevronUp size={18} /></button></div>
                            <div className="flex flex-col gap-1 rounded-3xl border border-[var(--outline-variant)]/50 bg-[var(--surface-container)] p-2">
                              {queue.map((item, index) => trackRow(item, index, true, queue.length))}
                            </div>
                          </div>
                        ) : (
                          <div className="px-4 pb-3">
                            <div className="flex items-center justify-between rounded-t-3xl border border-b-0 border-[var(--outline-variant)]/50 bg-[var(--surface-container)] px-3 py-2"><h3 className="text-sm font-black">Up next</h3><button onClick={() => setQueueOpen(true)} className="inline-flex items-center gap-2 rounded-full bg-[var(--surface)] px-3 py-2 text-xs font-bold hover:bg-[var(--surface-variant)]"><QueueMusic size={17} /> Full queue</button></div>
                            <div className="flex flex-col gap-1 rounded-b-3xl border border-[var(--outline-variant)]/50 bg-[var(--surface-container)] p-2">{nextUp.map((item, index) => trackRow(item, index, false, nextUp.length))}</div>
                          </div>
                        )}
                        <div
                          className="sticky bottom-0 space-y-2 border-t border-[var(--outline-variant)]/45 bg-[var(--surface)]/95 px-4 pb-[calc(env(safe-area-inset-bottom)+12px)] pt-3 backdrop-blur-xl md:pb-3"
                          onTouchStart={(event) => { optionsTouchStart.current = event.touches[0]?.clientY ?? null; }}
                          onTouchEnd={(event) => {
                            if (optionsTouchStart.current === null) return;
                            if (event.changedTouches[0].clientY - optionsTouchStart.current > 48) setPlayerView("now-playing");
                            optionsTouchStart.current = null;
                          }}
                        >
                          {playerOptionsBar}
                          <motion.button layout whileTap={{ scale: 0.98 }} transition={TRANSPORT_SPRING} onClick={() => setQueueOpen((open) => !open)} className="flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-[var(--primary-container)] px-4 py-3 text-sm font-black text-[var(--on-primary-container)]">
                            <AnimatePresence mode="wait" initial={false}>
                              <motion.span key={queueOpen ? "show-next-icon" : "full-queue-icon"} initial={{ opacity: 0, y: queueOpen ? -5 : 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: queueOpen ? 5 : -5 }} transition={{ duration: 0.14, ease: "easeOut" }} className="flex shrink-0 items-center">
                                {queueOpen ? <ChevronUp size={19} /> : <QueueMusic size={19} />}
                              </motion.span>
                            </AnimatePresence>
                            <AnimatePresence mode="wait" initial={false}>
                              <motion.span key={queueOpen ? "show-next-label" : "full-queue-label"} initial={{ opacity: 0, y: queueOpen ? -5 : 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: queueOpen ? 5 : -5 }} transition={{ duration: 0.14, ease: "easeOut" }}>
                                {queueOpen ? "Show what's next" : "Full queue"}
                              </motion.span>
                            </AnimatePresence>
                            <AnimatePresence mode="wait" initial={false}>
                              <motion.span key={`${queueOpen ? "queue-count" : "next-count"}-${queueOpen ? queue.length : nextUp.length}`} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 0.6, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.14, ease: "easeOut" }} className="text-xs">
                                · {queueOpen ? queue.length : nextUp.length} tracks
                              </motion.span>
                            </AnimatePresence>
                          </motion.button>
                        </div>
                      </div>
                    </motion.section>
                  )}
                </AnimatePresence>
              </div>
            )}
            </motion.div>
            </AnimatePresence>
            {isMobile && (
              <motion.div
                aria-hidden="true"
                className="pointer-events-none absolute z-40 overflow-hidden"
                style={{ left: coverLeft, top: coverTop, width: coverSize, height: coverSize, borderRadius: coverRadius, opacity: coverTransitionOpacity }}
              >
                <AlbumCover release={current.release} className="h-full w-full" iconSize={36} />
              </motion.div>
            )}
          </motion.div>
        )}
      </div>

      {createPortal(
        <AnimatePresence>
        {menuTrack && <motion.div key={menuTrack.track.id} data-ripple-skip initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} style={expanded && menuAnchor && !isMobile ? { paddingRight: menuAnchor.right, paddingBottom: menuAnchor.bottom } : undefined} className={`fixed inset-0 z-[130] flex items-end justify-center ${isMobile ? `${expanded ? "bg-transparent" : "bg-black/45"} px-2 pt-3` : expanded && menuAnchor ? "md:items-end md:justify-end md:bg-transparent" : "bg-black/45 md:items-start md:justify-end md:bg-transparent md:p-4"}`} onClick={() => setMenuTrack(null)}>
          <motion.div initial={isMobile ? { opacity: 0, y: 70, scale: 0.97 } : { opacity: 0, y: -12, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={isMobile ? { opacity: 0, y: 50, scale: 0.98 } : { opacity: 0, y: -8, scale: 0.97 }} transition={{ type: "spring", stiffness: 420, damping: 34, mass: 0.8 }} drag={isMobile ? "y" : false} dragConstraints={{ top: 0, bottom: 0 }} dragElastic={{ top: 0, bottom: 0.22 }} onDragEnd={(_event, info) => { if (info.offset.y > 100) setMenuTrack(null); }} className={`flex max-h-[calc(100dvh-12px)] w-full flex-col overflow-hidden border border-[var(--outline-variant)] bg-[var(--surface)] text-[var(--on-surface)] shadow-2xl ${isMobile ? "rounded-t-[28px] rounded-b-none" : "rounded-[28px] md:w-[420px] md:max-h-[min(820px,calc(100dvh-2rem))]"}`} onClick={(event) => event.stopPropagation()}>
            <div className="flex shrink-0 items-center gap-3 p-4"><AlbumCover release={menuTrack.release} className="size-14 rounded-xl" iconSize={22} /><div className="min-w-0 flex-1"><p className="truncate font-black">{menuTrack.track.title}</p><p className="truncate text-xs opacity-55">{menuTrack.release.title} · {ARTIST}</p></div><button onClick={() => setMenuTrack(null)} className="group relative isolate grid size-10 min-w-10 shrink-0 aspect-square place-items-center overflow-hidden rounded-[18px] bg-[var(--surface-variant)] hover:bg-[var(--primary-container)]" aria-label="Close track menu"><Ripple enableHaptics={false} /><span className="relative py-2"><X size={18} className="transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:rotate-180 group-hover:scale-110" /></span></button></div>
            <div className="min-h-0 flex-1 overflow-y-auto">
            <AnimatePresence mode="wait" initial={false}>
            {menuTab === "options" ? <motion.div key="menu-options" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ type: "spring", stiffness: 420, damping: 32 }} className="px-4 pb-4">
              <div className="grid grid-cols-3 gap-2">
                <motion.button initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ ...TRANSPORT_SPRING, delay: 0.03 }} whileTap={{ scale: 0.96 }} onClick={(event) => { pulseFeedbackControl(event); startTrack(menuTrack, true); window.setTimeout(() => setMenuTrack(null), 100); }} className="relative isolate flex flex-col items-center gap-1 overflow-hidden rounded-2xl bg-[var(--primary-container)] py-3 text-sm font-black text-[var(--on-primary-container)]"><Ripple enableHaptics={false} /><span className="relative z-[1] flex flex-col items-center gap-1"><PlayArrow size={23} fill />Play</span></motion.button>
                <motion.button initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ ...TRANSPORT_SPRING, delay: 0.08 }} whileTap={{ scale: 0.96 }} onClick={(event) => handlePlayerLike(event, menuTrack.track.id)} aria-pressed={selectedFeedback("like", menuTrack.track.id)} className={`relative isolate flex flex-col items-center gap-1 overflow-hidden rounded-2xl py-3 text-sm font-black ${selectedFeedback("like", menuTrack.track.id) ? "bg-[var(--primary)] text-[var(--on-primary)]" : "bg-[var(--surface-variant)]"}`}><Ripple enableHaptics={false} /><span className="relative z-[1] flex flex-col items-center gap-1">{feedbackIcon("like", menuTrack.track.id, selectedFeedback("like", menuTrack.track.id), Heart, 22)}<span>Like</span></span></motion.button>
                <motion.button initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ ...TRANSPORT_SPRING, delay: 0.13 }} whileTap={{ scale: 0.96 }} onClick={(event) => { pulseFeedbackControl(event); void shareTrack(menuTrack); }} className="relative isolate flex flex-col items-center gap-1 overflow-hidden rounded-2xl bg-[var(--primary-container)] py-3 text-sm font-black text-[var(--on-primary-container)]"><Ripple enableHaptics={false} /><span className="relative z-[1] flex flex-col items-center gap-1"><Share2 size={22} />{shareFeedback || "Share"}</span></motion.button>
              </div>
              <div className="mt-2 grid grid-cols-2 gap-2">
                <motion.button initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ ...TRANSPORT_SPRING, delay: 0.16 }} whileTap={{ scale: 0.985 }} onClick={() => addToQueue(menuTrack)} className="relative isolate inline-flex min-h-12 items-center justify-center gap-1.5 overflow-hidden rounded-full bg-[var(--primary-container)] px-3 py-3 text-sm font-black text-[var(--on-primary-container)]"><Ripple enableHaptics={false} /><span className="relative z-[1] inline-flex items-center justify-center gap-1.5"><QueueMusic size={18} />Add to queue</span></motion.button>
                <motion.button initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ ...TRANSPORT_SPRING, delay: 0.2 }} whileTap={{ scale: 0.985 }} onClick={() => addToQueue(menuTrack, true)} className="relative isolate inline-flex min-h-12 items-center justify-center gap-1.5 overflow-hidden rounded-full bg-[var(--surface-variant)] px-3 py-3 text-sm font-black"><Ripple enableHaptics={false} /><span className="relative z-[1] inline-flex items-center justify-center gap-1.5"><ReadMore size={18} />Play next</span></motion.button>
              </div>
              {menuSource === "player" && <motion.button initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ ...TRANSPORT_SPRING, delay: 0.24 }} whileTap={{ scale: 0.985 }} onClick={dismissPlayerAndQueue} className="relative isolate mt-2 flex min-h-12 w-full items-center justify-center gap-2 overflow-hidden rounded-full bg-[var(--error)]/10 px-4 py-3 text-sm font-black text-[var(--error)]"><Ripple enableHaptics={false} /><span className="relative z-[1] flex items-center justify-center gap-2"><X size={18} />Dismiss player &amp; clear queue</span></motion.button>}
            </motion.div> : <motion.div key="menu-info" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ type: "spring", stiffness: 420, damping: 32 }} className="divide-y divide-[var(--outline-variant)]/40 px-4 pb-3 text-sm">
              {[['Duration', menuTrack.track.duration || (menuTrack.release.duration ?? 'Available on playback')], ['Release', menuTrack.release.title], ['Artist', ARTIST], ['Audio', menuTrack.track.format || 'WAV'], ['Sample rate', `${(menuTrack.track.sampleRate || 0) / 1000} kHz`], ['Bitrate', `${Math.round((menuTrack.track.bitrate || 0) / 1000)} kb/s`], ['Streams', `${analytics[menuTrack.track.id]?.listens || 0} plays`]].map(([label, value], index, list) => <motion.div key={label} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ ...TRANSPORT_SPRING, delay: index * 0.045 }} className={`flex justify-between gap-4 py-3 ${index === 0 ? "pt-4" : ""} ${index === list.length - 1 ? "pb-4" : ""}`}><span className="opacity-55">{label}</span><span className="text-right font-bold">{value}</span></motion.div>)}
            </motion.div>}
            </AnimatePresence>
            </div>
            <div className="shrink-0 border-t border-[var(--outline-variant)]/45 bg-[var(--surface)] px-3 pb-[calc(env(safe-area-inset-bottom)+8px)] pt-2 md:pb-2">
              <div className="grid grid-cols-2 gap-1 rounded-full bg-[var(--surface-variant)] p-1">
                <motion.button layout whileTap={{ scale: 0.96 }} onClick={() => setMenuTab("options")} className={`relative isolate inline-flex w-full items-center justify-center gap-2 overflow-hidden rounded-full py-2.5 text-sm font-black ${menuTab === "options" ? "bg-[var(--on-surface)]/16 text-[var(--on-surface)] shadow-inner" : "opacity-65 hover:bg-[var(--surface)]/60"}`}><Ripple enableHaptics={false} /><span className="relative z-[1] inline-flex items-center justify-center gap-2"><Tune size={17} />Options</span></motion.button>
                <motion.button layout whileTap={{ scale: 0.96 }} onClick={() => setMenuTab("info")} className={`relative isolate inline-flex w-full items-center justify-center gap-2 overflow-hidden rounded-full py-2.5 text-sm font-black ${menuTab === "info" ? "bg-[var(--on-surface)]/16 text-[var(--on-surface)] shadow-inner" : "opacity-65 hover:bg-[var(--surface)]/60"}`}><Ripple enableHaptics={false} /><span className="relative z-[1] inline-flex items-center justify-center gap-2"><Info size={17} />Info</span></motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>}
        </AnimatePresence>
        , document.body)}

      <audio
        ref={audioRef}
        src={current?.track.audioUrl ? encodeURI(current.track.audioUrl) : undefined}
        loop={repeat}
        preload="metadata"
        onPlay={onAudioPlay}
        onPause={() => setIsPlaying(false)}
        onTimeUpdate={(event) => setTime(event.currentTarget.currentTime)}
        onLoadedMetadata={(event) => setDuration(event.currentTarget.duration)}
        onEnded={() => moveNext(false)}
        onError={() => setAudioError(true)}
      />
    </>
  );
}
