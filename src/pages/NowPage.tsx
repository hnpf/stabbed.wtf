// @ts-nocheck
import React, { memo, useEffect, useRef, useState, useCallback } from "react";
import { Card } from "../components/Card";
import WavyProgress from "../components/WavyProgress";
import { materialIcon } from "../components/MaterialIcon";
import { BounceButton } from "../components/TechStack";

const BuildIcon = materialIcon("terminal");
const LearnIcon = materialIcon("school");
const ListenIcon = materialIcon("headphones");
const MusicIcon = materialIcon("music_note");
const ListIcon = materialIcon("chevron_right");
const RefreshIcon = materialIcon("refresh");
const ScheduleIcon = materialIcon("schedule");
const RadioIcon = materialIcon("radio");

interface TrackData {
  artist: string;
  name: string;
  album: string;
  url: string;
  image?: string;
  isNowPlaying: boolean;
  timestamp?: number | null;
  durationMs?: number | null;
  fetchedAt: number;
  prevScrobbleAt?: number | null;
}

const formatTime = (ms: number = 0) => {
  if (!ms || isNaN(ms) || ms < 0) return "0:00";
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
};

const getRelativeTime = (timestampMs?: number | null) => {
  if (!timestampMs) return "Recently";
  const diffMs = Date.now() - timestampMs;
  const diffSec = Math.floor(diffMs / 1000);
  if (diffSec < 60) return "Just now";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour}h ago`;
  const diffDay = Math.floor(diffHour / 24);
  return `${diffDay}d ago`;
};

const buildTrackKey = (track?: Partial<TrackData> | null) => {
  if (!track) return "";
  return `${(track.artist || "").trim().toLowerCase()}:::${(track.name || "").trim().toLowerCase()}`;
};

export const NowPage = memo(() => {
  return (
    <div className="max-w-6xl mx-auto space-y-10 md:space-y-16 pb-24">
      <header className="page-header flex flex-col md:flex-row md:items-end justify-between gap-4 sm:gap-6 px-4 md:px-0">
        <div className="space-y-3 sm:space-y-4">
          <h2 className="page-title !text-5xl sm:!text-7xl md:!text-9xl font-expressive-bold italic">Now</h2>
          <p className="text-lg sm:text-xl md:text-2xl font-display font-medium text-[var(--on-surface-variant)] opacity-60 max-w-2xl leading-tight">
            What I'm currently building, learning, and listening to right now.
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 px-4 md:px-0">
        <Card
          delay={0.1}
          innerClassName="p-5 sm:p-8 md:p-12 border-4 sm:border-6 border-[var(--outline-variant)]/90 transition-colors flex flex-col justify-between min-h-[280px] sm:min-h-[360px] md:min-h-[450px] group/now rounded-[2rem] sm:rounded-[2.5rem]"
        >
          <div className="space-y-6 sm:space-y-10">
            <div className="space-y-4 sm:space-y-6">
              <h3 className="flex items-center gap-3 sm:gap-4 text-2xl sm:text-4xl md:text-5xl font-display font-black tracking-tighter italic group-hover/now:translate-x-1 transition-transform duration-300">
                <BuildIcon size={34} fill className="text-[var(--primary)] shrink-0 sm:w-10 sm:h-10" />
                Now Building
              </h3>
            </div>
            <div className="space-y-4 sm:space-y-6 border-t-2 sm:border-t-3 border-[var(--outline-variant)]/90 pt-6 sm:pt-10">
              <ul className="space-y-3 sm:space-y-4">
                <li className="flex gap-2.5 sm:gap-3 text-sm sm:text-[17px] opacity-80 leading-relaxed group/tip">
                  <ListIcon size={16} fill className="text-[var(--primary)] mt-1 shrink-0 group-hover/tip:translate-x-1 transition-transform duration-200" />
                  Helping the community and becoming more open to PR's and contributions
                </li>
                <li className="flex gap-2.5 sm:gap-3 text-sm sm:text-[17px] opacity-80 leading-relaxed group/tip">
                  <ListIcon size={16} fill className="text-[var(--primary)] mt-1 shrink-0 group-hover/tip:translate-x-1 transition-transform duration-200" />
                  Tinkering with personal base workflows and tools/scripts.
                </li>
                <li className="flex gap-2.5 sm:gap-3 text-sm sm:text-[17px] opacity-80 leading-relaxed group/tip">
                  <ListIcon size={16} fill className="text-[var(--primary)] mt-1 shrink-0 group-hover/tip:translate-x-1 transition-transform duration-200" />
                  Frequently updating and reworking stabbed.wtf for the best user experience i can possibly make
                </li>
              </ul>
            </div>
          </div>
        </Card>
        <Card
          delay={0.2}
          innerClassName="p-5 sm:p-8 md:p-12 border-4 sm:border-6 border-[var(--outline-variant)]/90 transition-colors flex flex-col justify-between min-h-[280px] sm:min-h-[360px] md:min-h-[450px] group/now rounded-[2rem] sm:rounded-[2.5rem]"
        >
          <div className="space-y-6 sm:space-y-10">
            <div className="space-y-4 sm:space-y-6">
              <h3 className="flex items-center gap-3 sm:gap-4 text-2xl sm:text-4xl md:text-5xl font-display font-black tracking-tighter italic group-hover/now:translate-x-1 transition-transform duration-300">
                <LearnIcon size={34} fill className="text-[var(--primary)] shrink-0 sm:w-10 sm:h-10" />
                Now Learning
              </h3>
            </div>
            <div className="space-y-4 sm:space-y-6 border-t-2 sm:border-t-3 border-[var(--outline-variant)]/90 pt-6 sm:pt-10">
              <ul className="space-y-3 sm:space-y-4">
                <li className="flex gap-2.5 sm:gap-3 text-sm sm:text-[17px] opacity-80 leading-relaxed group/tip">
                  <ListIcon size={16} fill className="text-[var(--primary)] mt-1 shrink-0 group-hover/tip:translate-x-1 transition-transform duration-200" />
                  Sound design & synthesis: wave architectures, fm synthesis basics, etc.
                </li>
                <li className="flex gap-2.5 sm:gap-3 text-sm sm:text-[17px] opacity-80 leading-relaxed group/tip">
                  <ListIcon size={16} fill className="text-[var(--primary)] mt-1 shrink-0 group-hover/tip:translate-x-1 transition-transform duration-200" />
                  Hardware interfaces: managing low latency audio pipelines
                </li>
                <li className="flex gap-2.5 sm:gap-3 text-sm sm:text-[17px] opacity-80 leading-relaxed group/tip">
                  <ListIcon size={16} fill className="text-[var(--primary)] mt-1 shrink-0 group-hover/tip:translate-x-1 transition-transform duration-200" />
                  Hyprland plug-ins: experimenting with plugins like "Infinite canvas" and Gloview in my primary configs along with quickshell.
                </li>
              </ul>
            </div>
          </div>
        </Card>
        <Card
          delay={0.4}
          className="md:col-span-2"
          innerClassName="bg-[var(--primary)] text-[var(--on-primary)] p-5 sm:p-8 md:p-12 border-4 sm:border-6 border-[var(--outline-variant)]/40 transition-colors flex flex-col justify-between min-h-[300px] sm:min-h-[360px] md:min-h-[450px] group/now rounded-[2rem] sm:rounded-[2.5rem]"
        >
          <LastFmNowPlayingCard />
        </Card>
      </div>
    </div>
  );
});

const SESSION_KEY = "virex-now-playing-session-v4";

const isSameTrack = (a: TrackData | null, b: TrackData | null) => {
  if (!a || !b) return false;
  return (
    a.artist === b.artist &&
    a.name === b.name &&
    a.album === b.album &&
    a.image === b.image &&
    a.isNowPlaying === b.isNowPlaying &&
    a.durationMs === b.durationMs &&
    a.timestamp === b.timestamp
  );
};

const LastFmNowPlayingCard = () => {
  const [track, setTrack] = useState<TrackData | null>(null);
  const trackRef = useRef<TrackData | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [errorMsg, setErrorMsg] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const [imageError, setImageError] = useState(false);

  const sessionRef = useRef<{ trackKey: string; startedAt: number } | null>(null);

  if (sessionRef.current === null && typeof window !== "undefined") {
    try {
      const saved = localStorage.getItem(SESSION_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.trackKey && typeof parsed?.startedAt === "number") {
          sessionRef.current = parsed;
        }
      }
    } catch {}
  }

  const updateSessionStart = (newStartedAt: number, key: string) => {
    sessionRef.current = { trackKey: key, startedAt: newStartedAt };
    try {
      localStorage.setItem(SESSION_KEY, JSON.stringify(sessionRef.current));
    } catch {}
    setNow(Date.now());
  };

  const handleProgressBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!track?.isNowPlaying || !track.durationMs) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const ratio = Math.min(1, Math.max(0, clickX / rect.width));
    const targetElapsed = ratio * track.durationMs;
    const newStart = Date.now() - targetElapsed;
    const key = buildTrackKey(track);
    updateSessionStart(newStart, key);
  };

  const setTrackState = useCallback((newTrack: TrackData | null) => {
    if (!isSameTrack(trackRef.current, newTrack)) {
      trackRef.current = newTrack;
      setTrack(newTrack);
      setImageError(false);
    }
  }, []);

  const fetchDirectFromLastFm = async (): Promise<TrackData> => {
    const apiKey = (import.meta as any).env?.VITE_LASTFM_API_KEY || (import.meta as any).env?.LASTFM_API_KEY || "";
    const username = (import.meta as any).env?.VITE_LASTFM_USERNAME || (import.meta as any).env?.LASTFM_USERNAME || "";

    if (!apiKey || !username) {
      throw new Error("Last.fm client credentials not configured.");
    }

    const url = new URL("https://ws.audioscrobbler.com/2.0/");
    url.searchParams.set("method", "user.getrecenttracks");
    url.searchParams.set("user", username);
    url.searchParams.set("api_key", apiKey);
    url.searchParams.set("format", "json");
    url.searchParams.set("limit", "1");

    const res = await fetch(url.toString());
    if (!res.ok) throw new Error(`Last.fm API HTTP ${res.status}`);
    const text = await res.text();
    const json = text ? JSON.parse(text) : null;

    const tracks = Array.isArray(json?.recenttracks?.track)
      ? json.recenttracks.track
      : json?.recenttracks?.track
      ? [json.recenttracks.track]
      : [];

    const trackItem = tracks.find((item: any) => item?.["@attr"]?.nowplaying === "true") || tracks[0];
    if (!trackItem) throw new Error("No recent tracks found.");

    const fetchedAt = Date.now();
    const nowPlaying = trackItem?.["@attr"]?.nowplaying === "true";
    const artist = typeof trackItem?.artist === "object"
      ? trackItem.artist?.["#text"] || "Unknown Artist"
      : trackItem?.artist || "Unknown Artist";
    const name = typeof trackItem?.name === "string" ? trackItem.name : "Unknown Track";
    const album = typeof trackItem?.album === "object"
      ? trackItem.album?.["#text"] || ""
      : trackItem?.album || "";
    const trackUrl = typeof trackItem?.url === "string" ? trackItem.url : "";

    let image: string | undefined = undefined;
    if (Array.isArray(trackItem?.image)) {
      const reversed = trackItem.image.slice().reverse();
      const validImg = reversed.find((item: any) => item?.["#text"] && item["#text"].trim().length > 0);
      if (validImg && !validImg["#text"].includes("2a96cbd8b46e442fc41c2b86b821562f")) {
        image = validImg["#text"];
      }
    }

    const timestamp = trackItem?.date?.uts ? Number(trackItem.date.uts) * 1000 : null;

    let durationMs: number | null = null;
    try {
      const infoUrl = new URL("https://ws.audioscrobbler.com/2.0/");
      infoUrl.searchParams.set("method", "track.getInfo");
      infoUrl.searchParams.set("api_key", apiKey);
      infoUrl.searchParams.set("format", "json");

      if (trackItem?.mbid) {
        infoUrl.searchParams.set("mbid", trackItem.mbid);
      } else {
        infoUrl.searchParams.set("artist", artist);
        infoUrl.searchParams.set("track", name);
        infoUrl.searchParams.set("autocorrect", "1");
      }

      const infoRes = await fetch(infoUrl.toString());
      if (infoRes.ok) {
        const infoText = await infoRes.text();
        const infoJson = infoText ? JSON.parse(infoText) : null;
        const rawDur = Number(infoJson?.track?.duration);
        if (!isNaN(rawDur) && rawDur > 0) {
          durationMs = rawDur;
        }
      }
    } catch {}

    return {
      artist,
      name,
      album,
      url: trackUrl,
      image,
      isNowPlaying: nowPlaying,
      timestamp,
      durationMs,
      fetchedAt,
    };
  };

  const fetchTrack = useCallback(async (isManual = false) => {
    if (isManual) setIsRefreshing(true);
    let fetchedTrack: TrackData | null = null;

    try {
      const res = await fetch("/api/lastfm/now-playing");
      if (res.ok) {
        const text = await res.text();
        if (text) {
          const data = JSON.parse(text);
          if (data?.track) {
            fetchedTrack = data.track;
          }
        }
      }
    } catch {}

    if (!fetchedTrack) {
      try {
        fetchedTrack = await fetchDirectFromLastFm();
      } catch (directErr: any) {
        if (!trackRef.current) {
          setStatus("error");
          setErrorMsg(directErr?.message || "Failed to fetch music playback.");
        }
        if (isManual) setTimeout(() => setIsRefreshing(false), 500);
        return;
      }
    }

    const key = buildTrackKey(fetchedTrack);

    if (fetchedTrack.isNowPlaying) {
      if (sessionRef.current && sessionRef.current.trackKey === key) {
        // keep active track start timestamp untouched
      } else {
        updateSessionStart(Date.now(), key);
      }
    } else {
      sessionRef.current = null;
      try {
        localStorage.removeItem(SESSION_KEY);
      } catch {}
    }

    setTrackState(fetchedTrack);
    setStatus("ready");
    setErrorMsg("");

    if (isManual) {
      setTimeout(() => setIsRefreshing(false), 500);
    }
  }, [setTrackState]);

  useEffect(() => {
    let active = true;
    const poll = async () => {
      if (active) await fetchTrack();
    };

    poll();
    const timer = setInterval(poll, 3000);

    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [fetchTrack]);

  // timer for every 100ms when track is actively playing
  useEffect(() => {
    if (!track?.isNowPlaying) return;

    const timer = setInterval(() => {
      setNow(Date.now());
    }, 100);

    return () => clearInterval(timer);
  }, [track?.isNowPlaying]);

  const isLoading = status === "loading";
  const isError = status === "error";

  const trackKey = buildTrackKey(track);
  const startedAt = (sessionRef.current && sessionRef.current.trackKey === trackKey)
    ? sessionRef.current.startedAt
    : (track?.fetchedAt || now);

  const isCurrentlyPlaying = track?.isNowPlaying ?? false;
  const durationMs = track?.durationMs && track.durationMs > 0 ? track.durationMs : null;

  let elapsedMs = 0;
  let percent = 0;

  if (isCurrentlyPlaying) {
    const rawElapsed = Math.max(0, now - startedAt);
    if (durationMs) {
      if (rawElapsed >= durationMs) {
        elapsedMs = durationMs;
        percent = 100;
      } else {
        elapsedMs = rawElapsed;
        percent = Math.min(100, Math.max(0, (elapsedMs / durationMs) * 100));
      }
    } else {
      elapsedMs = rawElapsed;
      percent = 100;
    }
  } else {
    percent = 100;
    elapsedMs = durationMs || 0;
  }

  return (
    <div className="space-y-5 sm:space-y-8">
      {/* header + refresh button */}
      <div className="flex items-center justify-between gap-3">
        <h3 className="flex items-center gap-2.5 sm:gap-4 text-2xl sm:text-4xl md:text-5xl font-display font-black tracking-tighter italic group-hover/now:translate-x-1 transition-transform duration-300">
          <ListenIcon size={32} fill className="text-[var(--on-primary)] shrink-0 sm:w-9 sm:h-9" />
          Now Listening
        </h3>

        <BounceButton
          onClick={() => fetchTrack(true)}
          disabled={isRefreshing || isLoading}
          loading={isRefreshing}
          title="Refresh Last.fm status"
          icon={RefreshIcon}
          iconClassName={isRefreshing ? "animate-spin" : ""}
          label={<span className="hidden sm:inline sm:ml-2">Force sync</span>}
          className="inline-flex items-center justify-center rounded-full border-2 sm:border-4 border-[var(--on-primary)]/30 bg-[rgba(255,255,255,0.12)] p-2 sm:px-4 sm:py-2 text-xs sm:text-sm pl-3 font-bold tracking-wider text-[var(--on-primary)] hover:bg-[rgba(255,255,255,0.22)] shrink-0 cursor-pointer"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_0.9fr] items-stretch gap-5 sm:gap-6 md:gap-10 border-t-2 sm:border-t-3 border-[var(--on-primary)]/20 pt-5 sm:pt-6 md:pt-8">
        {track && (
          <div className="order-first lg:order-last relative overflow-hidden rounded-2xl sm:rounded-[2.5rem] lg:rounded-[3rem] border-3 sm:border-6 border-[var(--on-primary)]/20 bg-[var(--on-primary)]/10 shadow-xl group/cover w-full max-w-[200px] sm:max-w-[280px] lg:max-w-none mx-auto lg:mx-0 aspect-square lg:aspect-auto min-h-[180px] sm:min-h-[260px] lg:min-h-[320px] max-h-[220px] sm:max-h-[320px] lg:max-h-[440px] flex items-center justify-center">
            {track.image && !imageError ? (
              <>
                <img
                  src={track.image}
                  alt={`${track.name} album cover`}
                  onError={() => setImageError(true)}
                  className="h-full w-full object-cover aspect-square lg:aspect-auto transition-transform duration-700 group-hover/cover:scale-105"
                />
                <div className="hidden lg:flex absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent p-8 flex-col justify-end">
                  <p className="text-xs font-bold uppercase tracking-[0.1em] text-white/70">{track.artist}</p>
                  <h4 className="mt-1 text-2xl font-display font-black tracking-tight text-white drop-shadow-md">{track.name}</h4>
                  {track.album && <p className="mt-1 text-sm text-white/80 font-medium">{track.album}</p>}
                </div>
              </>
            ) : (
              <div className="relative flex flex-col items-center justify-center w-full h-full p-4 sm:p-8 text-center shadow-inner overflow-hidden">
                {/* disc, needs reworked. */}
                <div className="relative w-28 h-28 sm:w-44 sm:h-44 md:w-56 md:h-56 rounded-full shadow-[0_15px_35px_rgba(0,0,0,0.5)]">
                  <div
                    className={`w-full h-full rounded-full bg-neutral-950 border-3 sm:border-4 border-neutral-800/80 flex items-center justify-center transition-transform duration-1000 ${
                      isCurrentlyPlaying ? "animate-[spin_10s_linear_infinite]" : ""
                    }`}
                  >
                    <div className="absolute inset-0 rounded-full pointer-events-none" />
                    <div className="absolute inset-2 sm:inset-3 rounded-full border border-white/10" />
                    <div className="absolute inset-4 sm:inset-6 rounded-full border border-white/5" />
                    <div className="absolute inset-6 sm:inset-9 rounded-full border border-white/10" />
                    <div className="absolute inset-8 sm:inset-12 rounded-full border border-white/5" />

                    <div className="relative w-10 h-10 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-full bg-[var(--primary)]/60 border-2 sm:border-4 border-neutral-950 flex flex-col items-center justify-center shadow-md">
                      <MusicIcon size={16} fill className="text-[var(--on-primary-container)] opacity-90 sm:w-5 sm:h-5" />
                      <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-neutral-950 border border-white/30 shadow-inner mt-0.5 sm:mt-1" />
                    </div>
                  </div>
                </div>

                <div className="mt-4 sm:mt-6 space-y-1 hidden lg:block">
                  <h4 className="text-xl font-display font-black tracking-tight text-[var(--on-primary)] drop-shadow-sm">{track.name}</h4>
                  <p className="text-xs font-bold uppercase tracking-widest text-[var(--on-primary)] opacity-75">{track.artist}</p>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="flex h-full flex-col justify-between space-y-4 sm:space-y-6">
          {isLoading && (
            <div className="flex h-full flex-col justify-center items-center py-10 sm:py-16 space-y-3 sm:space-y-4 text-center">
              <RadioIcon size={40} fill className="animate-bounce opacity-80 sm:w-12 sm:h-12" />
              <p className="text-base sm:text-lg font-medium opacity-90">Connecting to Last.fm stream…</p>
            </div>
          )}

          {isError && (
            <div className="flex h-full flex-col justify-center py-8 sm:py-12 space-y-4 sm:space-y-6">
              <p className="text-base sm:text-lg font-semibold text-[var(--on-primary)] opacity-90">
                {errorMsg || "Unable to retrieve playback status."}
              </p>
              <BounceButton
                onClick={() => fetchTrack(true)}
                icon={RefreshIcon}
                label="Retry Connection"
                className="self-start inline-flex items-center gap-2 rounded-2xl border-3 sm:border-4 border-[var(--on-primary)]/30 bg-white/20 px-5 sm:px-6 py-2.5 sm:py-3 text-xs sm:text-sm font-bold text-[var(--on-primary)] hover:bg-white/30 cursor-pointer"
              />
            </div>
          )}

          {!isLoading && !isError && track && (
            <div className="flex h-full flex-col justify-between space-y-4 sm:space-y-6">
              <div className="space-y-3 sm:space-y-6">
                {/* status */}
                <div className="flex items-center justify-between gap-3">
                  {isCurrentlyPlaying ? (
                    <div className="inline-flex items-center gap-2 sm:gap-2.5 rounded-full border-2 sm:border-3 border-[var(--on-primary)]/20 bg-[var(--on-primary)]/10 px-3 sm:px-4 py-1 sm:py-1.5 text-xs sm:text-sm font-extrabold tracking-widest text-[var(--on-primary)]/90">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
                      </span>
                      <span>Now playing</span>
                    </div>
                  ) : (
                    <div className="inline-flex items-center gap-2 rounded-full border-2 sm:border-3 border-[var(--on-primary)]/20 bg-[var(--on-primary)]/10 px-3 sm:px-4 py-1 sm:py-1.5 text-xs sm:text-sm font-bold tracking-widest text-[var(--on-primary)]/80">
                      <ScheduleIcon size={14} fill className="shrink-0 opacity-75" />
                      <span>Recently played - {getRelativeTime(track.timestamp)}</span>
                    </div>
                  )}
                </div>

                {/* details */}
                <div className="space-y-1 sm:space-y-2">
                  <h4 className="text-xl sm:text-3xl md:text-4xl lg:text-5xl font-display font-black tracking-tight leading-tight text-[var(--on-primary)] drop-shadow-sm line-clamp-2">
                    {track.name}
                  </h4>
                  <p className="text-sm sm:text-base md:text-lg lg:text-xl font-medium opacity-90 text-[var(--on-primary)] leading-relaxed">
                    <span className="font-bold">{track.artist}</span>
                    {track.album ? (
                      <span className="opacity-75"> on {track.album}</span>
                    ) : null}
                  </p>
                </div>
              </div>

              {/* actions/progress */}
              <div className="mt-3 sm:mt-6 space-y-4 sm:space-y-6">
                <div className="space-y-2 sm:space-y-3">
                  <div
                    onClick={handleProgressBarClick}
                    className={`overflow-hidden rounded-2xl sm:rounded-[1.75rem] border-2 sm:border-4 border-[var(--on-primary)]/30 bg-[var(--on-primary)]/10 p-2 sm:p-3 shadow-inner hover:border-[var(--on-primary)]/50 transition-colors group/seek ${
                      isCurrentlyPlaying ? "cursor-pointer" : "cursor-default"
                    }`}
                    title={isCurrentlyPlaying ? "Click anywhere to sync / seek track progress" : undefined}
                  >
                    <WavyProgress percent={percent} className="h-6 sm:h-8 pointer-events-none" />
                  </div>

                  <div className="flex items-center justify-between text-[11px] sm:text-xs font-mono font-bold tracking-wider text-[var(--on-primary)] opacity-85 px-1">
                    <div className="flex items-center gap-2">
                      <span>{formatTime(elapsedMs)}</span>
                    </div>
                    <span>
                      {durationMs
                        ? isCurrentlyPlaying
                          ? `-${formatTime(Math.max(0, durationMs - elapsedMs))}`
                          : formatTime(durationMs)
                        : ""}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2.5 sm:gap-4 pt-1">
                  {track.url && (
                    <BounceButton
                      url={track.url}
                      icon={MusicIcon}
                      label="View on Last.fm"
                      className="inline-flex items-center gap-2 rounded-full border-2 sm:border-4 border-[var(--on-primary)]/30 bg-[rgba(255,255,255,0.14)] px-4 sm:px-6 py-2 sm:py-3 text-xs sm:text-sm font-bold text-[var(--on-primary)] hover:bg-[rgba(255,255,255,0.25)] hover:border-[var(--on-primary)]/60 cursor-pointer"
                    />
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
