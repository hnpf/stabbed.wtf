// @ts-nocheck
import React, { useState, useEffect, memo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Card } from "../components/Card";
import { MUSIC_RELEASES, type MusicRelease } from "../constants";
import { useTheme } from "../ThemeContext";
import { haptic } from "../haptics";
import { Ripple } from "../components/Ripple";
import { 
  Disc, 
  Play, 
  X, 
  Share2, 
  Check,
  ExternalLink
} from "lucide-react";

/* platofrm icons modded for our m3e */
const SpotifyIcon = ({ size = 20, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.02 8.52-.6 11.64 1.32.42.18.48.66.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141 4.38-1.38 9.841-.72 13.56 1.56.36.18.54.78.181 1.261zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.18-1.2-.18-1.38-.72-.18-.6.18-1.2.72-1.38 4.26-1.26 11.28-1.02 15.72 1.62.54.3.72 1.02.42 1.56-.3.42-1.02.6-1.56.3z"/>
  </svg>
);

const BandcampIcon = ({ size = 20, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M0 18.75l7.437-13.5H24l-7.438 13.5H0z"/>
  </svg>
);

const YouTubeMusicIcon = ({ size = 20, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 0C5.376 0 0 5.376 0 12s5.376 12 12 12 12-5.376 12-12S18.624 0 12 0zm0 19.2c-3.972 0-7.2-3.228-7.2-7.2s3.228-7.2 7.2-7.2 7.2 3.228 7.2 7.2-3.228 7.2-7.2 7.2zm-2.4-10.8v7.2l6-3.6-6-3.6z"/>
  </svg>
);

const TikTokIcon = ({ size = 20, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-1-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.29 1.76-.23.86-.06 1.8.44 2.52.5.76 1.34 1.25 2.24 1.36.96.12 1.95-.14 2.71-.75.76-.6 1.21-1.53 1.25-2.51.05-3.61.02-7.22.03-10.83z"/>
  </svg>
);

const PLATFORM_CONFIG: Record<string, { label: string; icon: React.ComponentType<{ size?: number; className?: string }> }> = {
  spotify: { label: "Spotify", icon: SpotifyIcon },
  bandcamp: { label: "Bandcamp", icon: BandcampIcon },
  youtubeMusic: { label: "YouTube Music", icon: YouTubeMusicIcon },
  tiktok: { label: "TikTok", icon: TikTokIcon },
};

/* cover image resolving (checks /albums/[release-id].* or falls back to card) */
const AlbumCover = ({ release, className = "", iconSize = 40 }: { release: MusicRelease; className?: string; iconSize?: number }) => {
  const [imgSrc, setImgSrc] = useState<string | null>(
    release.coverUrl || `/albums/${release.id}.webp`
  );
  const [failedCount, setFailedCount] = useState(0);

  const handleError = () => {
    if (failedCount === 0) {
      setImgSrc(`/albums/${release.id}.png`);
      setFailedCount(1);
    } else if (failedCount === 1) {
      setImgSrc(`/albums/${release.id}.jpg`);
      setFailedCount(2);
    } else {
      setImgSrc(null);
    }
  };

  if (!imgSrc) {
    return (
      <div className={`bg-[var(--surface-variant)] text-[var(--on-surface-variant)] border-4 border-[var(--outline-variant)]/60 flex items-center justify-center shrink-0 relative overflow-hidden ${className}`}>
        <Disc size={iconSize} className="text-[var(--primary)] opacity-80" />
      </div>
    );
  }

  return (
    <div className={`bg-[var(--surface-variant)] border-4 border-[var(--outline-variant)]/60 flex items-center justify-center shrink-0 relative overflow-hidden ${className}`}>
      <img
        src={imgSrc}
        alt={release.title}
        onError={handleError}
        className="w-full h-full object-cover"
      />
    </div>
  );
};

/* release expanded view */
const ReleaseModal = ({ release, onClose }: { release: MusicRelease | null; onClose: () => void }) => {
  const [copied, setCopied] = useState(false);
  const { settings } = useTheme();

  useEffect(() => {
    if (!release) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [release, onClose]);

  if (!release) return null;

  const handleShare = () => {
    haptic.light();
    const shareUrl = `${window.location.origin}/music?release=${encodeURIComponent(release.id)}`;
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[1000] flex items-center justify-center p-3.5 sm:p-6 overflow-hidden">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/75 backdrop-blur-md"
        />

        <motion.div
          initial={settings.disableAnimations ? false : { opacity: 0, scale: 0.94, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 20 }}
          transition={{ type: "spring", stiffness: 450, damping: 30 }}
          data-ripple-skip
          className="relative z-10 w-full max-w-2xl bg-[var(--surface)] text-[var(--on-surface)] rounded-[2rem] sm:rounded-[2.5rem] md:rounded-[3.5rem] border-4 sm:border-6 border-[var(--outline-variant)] shadow-2xl overflow-hidden max-h-[85dvh] sm:max-h-[90vh] flex flex-col my-auto"
        >
          <button
            onClick={() => {
              haptic.light();
              onClose();
            }}
            className="group absolute top-3.5 right-3.5 sm:top-6 sm:right-6 p-2 sm:p-3 rounded-full bg-[var(--surface-variant)] text-[var(--on-surface-variant)] hover:bg-[var(--primary)] hover:text-[var(--on-primary)] transition-colors cursor-pointer shadow-md z-20 overflow-hidden"
            aria-label="Close"
          >
            <Ripple enableHaptics={false} />
            <X size={18} className="relative z-[1] sm:w-5 sm:h-5 transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:rotate-180 group-hover:scale-110" />
          </button>

          {/* scrollable modal content */}
          <div className="overflow-y-auto p-5 sm:p-8 md:p-10 space-y-6 sm:space-y-8 scrollbar-hide">
            {/* top release info header */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
              <AlbumCover release={release} className="w-24 h-24 sm:w-36 sm:h-36 rounded-2xl sm:rounded-3xl shadow-xl shrink-0" iconSize={44} />

              <div className="flex-1 text-center sm:text-left space-y-2 min-w-0 pr-0 sm:pr-8">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5 sm:gap-2">
                  <span className="px-2.5 py-0.5 sm:px-3 sm:py-1 bg-[var(--primary-container)] text-[var(--on-primary-container)] text-[10px] sm:text-xs font-black uppercase tracking-widest rounded-full italic border border-[var(--primary)]/30">
                    {release.type}
                  </span>
                  <span className="px-2.5 py-0.5 sm:px-3 sm:py-1 bg-[var(--surface-variant)] text-[var(--on-surface-variant)] text-[10px] sm:text-xs font-black uppercase tracking-widest rounded-full italic border border-[var(--outline-variant)]">
                    {release.releaseDate}
                  </span>
                  {release.duration && (
                    <span className="text-[11px] sm:text-xs font-display font-black opacity-50">
                      • {release.duration}
                    </span>
                  )}
                </div>

                <h3 className="text-2xl sm:text-3xl md:text-4xl font-display font-black italic tracking-tight leading-tight">
                  {release.title}
                </h3>

                <p className="text-xs sm:text-sm font-expressive font-bold italic text-[var(--primary)]">
                  {release.genre}
                </p>

                <p className="text-xs sm:text-sm opacity-70 font-sans leading-relaxed pt-0.5">
                  {release.description}
                </p>
              </div>
            </div>

            {/* streaming options header */}
            <div className="space-y-3 sm:space-y-4 pt-4 sm:pt-5 border-t-2 sm:border-t-3 border-[var(--outline-variant)]/40">
              <div className="flex items-center justify-between">
                <span className="text-[11px] sm:text-[12px] font-black tracking-[0.1em] opacity-85 uppercase">
                  Streaming Platforms
                </span>
                <motion.button
                  onClick={handleShare}
                  whileHover={{ scale: 1.04, y: -1 }}
                  whileTap={{ scale: 0.96 }}
                  transition={{ type: "spring", stiffness: 500, damping: 22, mass: 0.55 }}
                  className="relative overflow-hidden flex items-center gap-1.5 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] text-[11px] sm:text-xs font-expressive-bold italic font-black uppercase tracking-wider hover:bg-[var(--primary)] hover:text-[var(--on-primary)] transition-colors cursor-pointer"
                >
                  <Ripple enableHaptics={false} />
                  {copied ? <Check size={13} className="relative z-[1]" /> : <Share2 size={13} className="relative z-[1]" />}
                  <span className="relative z-[1]">{copied ? "Link Copied!" : "Share Release"}</span>
                </motion.button>
              </div>

              {/* platform grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                {Object.entries(release.links).map(([key, url]) => {
                  if (!url) return null;
                  const platform = PLATFORM_CONFIG[key] || { label: key, icon: Disc };
                  const IconComp = platform.icon;

                  return (
                    <a
                      key={key}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => haptic.light()}
                      className="relative overflow-hidden flex items-center justify-between p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-[var(--surface-variant)]/60 hover:bg-[var(--primary-container)] hover:text-[var(--on-primary-container)] border-2 sm:border-3 border-[var(--outline-variant)]/60 transition-all group font-expressive font-black italic tracking-wide cursor-pointer text-xs sm:text-sm"
                    >
                      <Ripple enableHaptics={false} />
                      <div className="relative z-[1] flex items-center gap-2.5 sm:gap-3 min-w-0">
                        <IconComp size={20} className="text-[var(--primary)] group-hover:text-[var(--on-primary-container)] shrink-0" />
                        <span className="truncate">{platform.label}</span>
                      </div>
                      <ExternalLink size={14} className="relative z-[1] opacity-40 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all shrink-0" />
                    </a>
                  );
                })}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export const MusicPage = memo(({ setPage }: { setPage: (p: string) => void }) => {
  const [selectedRelease, setSelectedRelease] = useState<MusicRelease | null>(null);

  // check url query param ?release=id on mount to support deep linking
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const releaseId = params.get("release") || window.location.hash.replace("#", "");
    if (releaseId) {
      const match = MUSIC_RELEASES.find((r) => r.id.toLowerCase() === releaseId.toLowerCase());
      if (match) {
        setSelectedRelease(match);
      }
    }
  }, []);

  const openReleaseModal = (release: MusicRelease) => {
    setSelectedRelease(release);
    const newUrl = `${window.location.pathname}?release=${encodeURIComponent(release.id)}`;
    window.history.pushState({ modal: true }, "", newUrl);
  };

  const closeReleaseModal = () => {
    setSelectedRelease(null);
    window.history.pushState({}, "", window.location.pathname);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-10 sm:space-y-16 pb-24 px-4 md:px-0">
      <header className="page-header space-y-4 sm:space-y-6">
        <div className="space-y-3 sm:space-y-4">
          <div className="flex items-center gap-3">
          </div>

          <h1 className="page-title !text-5xl sm:!text-8xl md:!text-9xl font-expressive-bold italic leading-none tracking-[-0.07em]">
            Music
          </h1>

          <p className="text-lg sm:text-2xl font-display font-medium opacity-70 max-w-3xl leading-relaxed italic">
            I program. I produce. Here are my music releases...
          </p>
        </div>
      </header>

      {/* tracked release section */}
      <section className="space-y-4 sm:space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl sm:text-4xl font-expressive-bold italic font-black tracking-tight">
            Releases and Tracks
          </h2>
          <span className="text-xs sm:text-md font-black tracking-widest opacity-40">
            {MUSIC_RELEASES.length} Release(s)
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-8">
          {MUSIC_RELEASES.map((release, i) => (
            <Card
              key={release.id}
              delay={0.1 * (i + 1)}
              onClick={() => {
                haptic.light();
                openReleaseModal(release);
              }}
              className="cursor-pointer group"
              innerClassName="p-5 sm:p-8 border-4 sm:border-6 border-[var(--outline-variant)]/60 hover:border-[var(--primary)] hover:shadow-2xl transition-[border-color,box-shadow] duration-200 flex flex-col justify-between min-h-[260px] sm:min-h-[320px] rounded-[2rem] sm:rounded-[2.5rem] relative overflow-hidden"
            >
              <div className="space-y-4 sm:space-y-6 relative z-10">
                {/* header info pills */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 sm:px-3 sm:py-1 bg-[var(--primary-container)] text-[var(--on-primary-container)] text-[10px] sm:text-xs font-black uppercase tracking-widest rounded-full italic border-2 border-[var(--primary)]/30">
                      {release.type}
                    </span>
                    <span className="text-[11px] sm:text-xs font-display font-black opacity-50">
                      {release.releaseDate}
                    </span>
                  </div>

                  {/* m3 play Container */}
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[var(--primary)] text-[var(--on-primary)] flex items-center justify-center shadow-lg group-hover:scale-110 active:scale-95 transition-all shrink-0">
                    <Play size={16} fill="currentColor" className="translate-x-0.5 sm:w-5 sm:h-5" />
                  </div>
                </div>

                {/* cover art preview & title */}
                <div className="flex items-start gap-3.5 sm:gap-5">
                  <AlbumCover release={release} className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl sm:rounded-2xl shadow-md group-hover:scale-105 transition-transform duration-300 shrink-0" iconSize={32} />

                  <div className="space-y-1 sm:space-y-1.5 min-w-0 flex-1">
                    <h3 className="text-xl sm:text-3xl font-display font-black italic tracking-tight group-hover:text-[var(--primary)] transition-colors leading-tight">
                      {release.title}
                    </h3>
                    <p className="text-xs font-expressive font-bold italic text-[var(--primary)]">
                      {release.genre} {release.duration && `• ${release.duration}`}
                    </p>
                  </div>
                </div>

                <p className="text-xs sm:text-base opacity-70 font-medium italic leading-relaxed md:pb-1.5 pb-0.5 line-clamp-3">
                  "{release.description}"
                </p>
              </div>

              {/* action bar */}
              <div className="pt-3.5 sm:pt-5 border-t-2 border-[var(--outline-variant)]/30 flex items-center justify-between relative z-10">
                <span className="text-[11px] sm:text-xs font-expressive-bold italic font-black text-[var(--primary)] flex items-center  group-hover:translate-x-1 transition-transform">
                  Listen / Stream
                </span>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* direct platofrm cards */}
      <section className="space-y-4 sm:space-y-6">
        <div className="flex flex-col gap-1.5 sm:gap-2">
          <h2 className="text-2xl sm:text-4xl font-expressive-bold italic font-black tracking-tight">
            Stream my music
          </h2>
          <p className="text-sm sm:text-base opacity-60 italic font-medium">
            Listen, save to your library, or download high-quality audio across streaming platforms:
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          {[
            {
              name: "Spotify",
              tagline: "Artist Profile",
              desc: "Listen to all my official releases, save to your library, and follow for new releases. :)",
              url: "https://open.spotify.com/artist/6jSoE5iR3LKc7bY6Dzh7Sx?si=zD6MLELQRGOpaX8h2bQOHA",
              icon: SpotifyIcon,
              btnLabel: "Go to Spotify Profile",
            },
            {
              name: "Bandcamp",
              tagline: "Lossless support",
              desc: "Get high-res FLAC & WAV audio directly and support independent production.",
              url: "https://rxvirex.bandcamp.com",
              icon: BandcampIcon,
              btnLabel: "Go to Bandcamp Profile",
            },
            {
              name: "TikTok",
              tagline: "Official Music",
              desc: "Use official sound clips and use my released tracks directly in your videos/content.",
              url: "https://tiktok.com/@hahavrx",
              icon: TikTokIcon,
              btnLabel: "View on Tiktok",
            },
          ].map((platform) => {
            const IconComp = platform.icon;
            return (
            <a
              key={platform.name}
              href={platform.url}
              target="_blank"
              rel="noopener noreferrer"
              draggable={false}
              onClick={() => haptic.light()}
              className="select-none p-5 sm:p-7 bg-[var(--surface-variant)]/60 hover:bg-[var(--primary-container)] hover:text-[var(--on-primary-container)] border-3 sm:border-4 border-[var(--outline-variant)]/40 rounded-[2rem] sm:rounded-[2.5rem] flex flex-col justify-between gap-4 sm:gap-5 transition-all duration-300 group cursor-pointer hover:shadow-xl hover:border-[var(--primary)]/60 active:scale-[0.99] relative overflow-hidden"
            >
                <div className="space-y-2.5 sm:space-y-3 relative z-10">
                  <div className="flex items-start gap-3 sm:gap-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-[var(--surface)] text-[var(--primary)] group-hover:bg-[var(--primary)] group-hover:text-[var(--on-primary)] flex items-center justify-center shadow-sm transition-colors duration-300 shrink-0">
                      <IconComp size={22} className="sm:w-6 sm:h-6" />
                    </div>
                    <div className="min-w-0 flex-1 pt-0.5">
                      <h3 className="text-lg sm:text-xl font-display font-black italic tracking-tight group-hover:text-[var(--primary)] transition-colors leading-tight">
                        {platform.name}
                      </h3>
                      <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-widest opacity-50 italic">
                        {platform.tagline}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs ml-1 sm:text-sm opacity-60 font-sans leading-relaxed">
                    {platform.desc}
                  </p>
                </div>

                <div className="pt-3.5 sm:pt-4 border-t border-[var(--outline-variant)]/30 flex items-center justify-between relative z-10">
                  <span className="text-[11px] sm:text-xs ml-1 font-expressive-bold italic font-black uppercase tracking-wider text-[var(--primary)] group-hover:text-[var(--on-primary-container)]">
                    {platform.btnLabel}
                  </span>
                  <ExternalLink size={16} className="text-[var(--primary)] mr-2 group-hover:text-[var(--on-primary-container)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform shrink-0" />
                </div>
              </a>
            );
          })}
        </div>
      </section>

      {/* release popup */}
      {selectedRelease && (
        <ReleaseModal release={selectedRelease} onClose={closeReleaseModal} />
      )}
    </div>
  );
});
