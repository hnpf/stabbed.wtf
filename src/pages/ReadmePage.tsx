// @ts-nocheck
import React, { useState, useEffect, memo } from "react";
import { motion } from "motion/react";
import { Activity, MapPin, History, Target, SquareTerminal, Code2, Archive, MessageSquare, Home } from "../components/MaterialIcon";
import { Github, Headphones, Disc, Music } from "lucide-react";
import { GitHubCalendar } from 'react-github-calendar';
import { cn, TECH_STACK } from "../constants";
import { useTheme } from "../ThemeContext";
import { Card } from "../components/Card";
import { BounceButton, TechChip } from "../components/TechStack";
import { haptic } from "../haptics";
import { Ripple } from "../components/Ripple";

const Badge = ({ icon: Icon, children, className }: any) => (
  <span className={cn(
    "px-4 sm:px-6 py-2 sm:py-3 bg-[var(--surface-variant)]/40 text-[var(--on-surface-variant)] rounded-2xl text-[10px] sm:text-[11px] font-black uppercase tracking-[0.2em] flex items-center gap-2 sm:gap-3 border-4 border-[var(--outline-variant)]/40 italic whitespace-nowrap",
    className
  )}>
    {Icon && <Icon size={14} />}
    {children}
  </span>
);

const InfoCardHeading = ({ icon: Icon, children, className }: any) => (
  <div className={cn("flex items-center gap-3", className)}>
    <Icon aria-hidden="true" className="size-6 shrink-0 text-[var(--primary)] md:size-7" strokeWidth={2.25} />
    <h3 className="min-w-0 text-xl leading-tight font-display font-black tracking-tight italic transition-colors md:text-2xl">
      {children}
    </h3>
  </div>
);

const BullshitMatrix = ({ onBack, setPage, is_mobile }: { onBack: () => void; setPage: (p: string) => void, is_mobile: boolean }) => {
  const letters = "virex".split("");
  const [flickering, setFlick] = useState<number[]>([]);
  const [swoopDone, setSwoopDone] = useState(false);
  const { settings, actualTheme } = useTheme();

  const glass_class = "backdrop-blur-sm md:backdrop-blur-md";

  useEffect(() => {
    if (!swoopDone || is_mobile) return;
    const itv = setInterval(() => {
      if (Math.random() > 0.7) return;
      const count = Math.floor(Math.random() * 2) + 1;
      const indices = Array.from({ length: count }, () => Math.floor(Math.random() * letters.length));
      setFlick(indices);
      setTimeout(() => setFlick([]), 60 + Math.random() * 120);
    }, 800 + Math.random() * 1000);
    return () => clearInterval(itv);
  }, [swoopDone, is_mobile, letters.length]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={cn(
        "flex flex-col selection:bg-[var(--primary)] selection:text-[var(--on-primary)] transition-all duration-300",
        settings.infoFullscreen 
          ? "fixed inset-0 z-[500] bg-[var(--surface)] overflow-y-auto custom-scrollbar overflow-x-hidden" 
          : "relative w-full overflow-x-hidden z-10"
      )}
    >
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {/* for now removed bg blur - was pretty unpleasing to view on mobile */}

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,transparent_0%,var(--surface)_92%)]" />
      </div>

      <div className="relative z-10 w-full max-w-6xl mx-auto px-6 py-20 flex flex-col items-center">
        {/* hero */}
        <div className="flex flex-col items-center mb-32 w-full">
          <div className="flex gap-0.5 md:gap-2 mb-8 flex-wrap justify-center">
            {letters.map((char, i) => (
              <motion.span
                key={i}
                initial={{ y: -150, opacity: 0, scale: 0.8, filter: "blur(12px)" }}
                animate={{ y: 0, opacity: 1, scale: 1, filter: "blur(0px)" }}
                onAnimationComplete={() => {
                  if (i === letters.length - 1) setSwoopDone(true);
                }}
                transition={{
                  delay: i * 0.1,
                  type: "spring",
                  stiffness: settings.highHz ? 180 : 150,
                  damping: settings.highHz ? 25 : 22,
                  mass: 0.8
                }}
                className={cn(
                  "text-8xl sm:text-8xl md:text-9xl lg:text-[11rem] transition-all duration-150 select-none font-expressive font-black",
                  flickering.includes(i) ? "text-[var(--primary)] scale-105" : "text-[var(--on-surface)]",
                )}
              >
                {flickering.includes(i) ? String.fromCharCode(33 + Math.floor(Math.random() * 94)) : char}
              </motion.span>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="flex flex-col items-center gap-3 mt-12 md:mt-4"
          >
            <Badge icon={Activity} className="bg-[var(--primary-container)]/60 text-[var(--on-primary-container)] border-[var(--primary)]/20 shadow-lg">
              Researching
            </Badge>
            <div className="flex flex-row gap-3 justify-center">
              <Badge icon={MapPin}>Nederland</Badge>
              <Badge>He / They</Badge>
            </div>
          </motion.div>
        </div>

        {/* bio */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="w-full mb-32 text-center space-y-8"
        >
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="h-px w-22 bg-[var(--primary)] opacity-30" />
            <span className="text-2xl font-black tracking-[0.2em] text-[var(--primary)] italic">Bio</span>
            <div className="-ml-2 h-px w-22 bg-[var(--primary)] opacity-30" />
          </div>
          <h2 className="text-4xl md:text-6xl font-display font-black tracking-tighter leading-[1.05] max-w-4xl mx-auto italic">
            I am a <span className="text-[var(--primary)]">full-stack developer</span>, <span className="text-[var(--primary)]">cybersecurity student</span>, and <span className="text-[var(--primary)]">music producer.</span> <br></br> <br></br> <span className="text-[var(--primary)]">I design</span> pleasing, straightforward, and beautiful <span className="text-[var(--primary)]">user experiences.</span>
          </h2>
          <p className="text-xl md:text-2xl opacity-60 font-medium max-w-4xl mx-auto leading-relaxed">
            Running on Arch + GNOME (or Hyprland + Quickshell), and lots of caffeine! <br></br>

            <span className="relative inline-block mt-4 md:mt-0">
              <span className="text-[var(--primary)] font-bold relative z-10">
                writing code today,
              </span>
              <span className="absolute bottom-1 left-0 w-full h-1.5 bg-[var(--primary)]/20 -rotate-1" />
            </span>{" "}
            <span className="relative inline-block">
              <span className="text-[var(--primary)] font-bold relative z-10">
                to rewrite it all tomorrow.
              </span>
              <span className="absolute bottom-1 left-0 w-full h-1.5 bg-[var(--primary)]/20 rotate-1" />
            </span>{" "}
            &lt;3
          </p>
        </motion.section>

        {/* bento grid */}
        <div className="grid grid-cols-2 md:grid-cols-12 gap-6 w-full mb-32">
          {/* lore */}
          <Card noDefaultStyles
            delay={1.1}
            className="col-span-2 md:col-span-8"
            innerClassName={cn("px-6 py-8 md:p-12 bg-[var(--surface-variant)]/60 rounded-[3.5rem] border-6 border-[var(--outline-variant)]/40 relative overflow-hidden group transition-colors duration-200", glass_class)}
          >
            <InfoCardHeading className="mb-8 md:mb-10 group-hover:text-[var(--primary)]" icon={History}>
              Stabbed.wtf backstory...
            </InfoCardHeading>
            <div className="space-y-6 text-[15px] md:text-xl opacity-80 leading-relaxed font-medium">
              <p>
                I started my journey with <span className="text-[var(--primary)] font-black">scripting</span>. around 2023, I was hooked on windows batch scripting. I would spend hours making stupid multitools and that's when I hit a barrier.
              </p>
              <p>
                batch just didn't give me enough control, and trying to scale anything in it would turn into a nightmare. I kept forgetting how my own code worked, looping back to fix things, and getting nowhere. 
              </p>
              <p>
                so, I skipped the easy stuff and went straight to <span className="text-[var(--primary)] font-black">C and Visual Studio</span>. from there, I moved into <span className="text-[var(--primary)] font-black">rust</span>, and eventually found my way to web development and <span className="text-[var(--primary)] font-black">UI design</span>.
              </p>
              <p>
              that's when stabbed.wtf became my focus. it started as a basic light/dark material 3 test in <span className="text-[var(--primary)] font-black">HTML/CSS</span>, went through a neobrutalist phase, stripped back into a colorful adwaita-inspired theme and finally experimented with <span className="text-[var(--primary)] font-black">react</span>, and that's when I landed on the material 3 expressive style you're looking at right now.
              </p>
            </div>
            <div className="absolute -right-8 -bottom-8 opacity-[0.03] group-hover:scale-110 group-hover:opacity-[0.05] transition-all duration-700">
              <Activity size={240} />
            </div>
          </Card>

          {/* mission */}
          <Card noDefaultStyles
            delay={1.2}
            className="col-span-2 md:col-span-4"
            innerClassName={cn("px-8 py-10 bg-[var(--primary-container)]/90 text-[var(--on-primary-container)] rounded-[3.5rem] border-6 border-[var(--primary)]/30 flex flex-col justify-between gap-8 group transition-colors duration-200 relative overflow-hidden", glass_class)}
          >
            <div className="space-y-6 relative z-10">
              <InfoCardHeading className="group-hover:text-[var(--primary)]" icon={Target}>
                Philosophy
              </InfoCardHeading>
              <p className="text-2xl md:text-4xl leading-[0.95] tracking-tighter font-expressive font-black italic text-balance">
                "Code can be used as a form of <span className="text-[var(--primary)]">protest.</span>"
              </p>
            </div>
            <p className="text-md md:text-2xl opacity-80 font-bold leading-tight relative z-10">
              Modern tech uses complexity in order to lock you in.<br></br><br></br>Fighting against that can be writing code that is lightweight, transparent, and written to last.
            </p>
            <div className="absolute -right-8 -top-8 opacity-10 group-hover:scale-125 transition-transform duration-700 pointer-events-none">
              <Target size={180} />
            </div>
          </Card>

          {/* music card */}
          <Card noDefaultStyles
            delay={1.25}
            className="col-span-2 md:col-span-12"
            innerClassName={cn("rounded-[3.5rem] border-4 border-[var(--outline-variant)]/40 bg-[var(--surface-variant)]/60 relative overflow-hidden group transition-colors duration-300 hover:border-[var(--primary)]/50", glass_class)}
          >
            <div className="absolute -right-10 -bottom-10 opacity-[0.07] group-hover:opacity-[0.12] group-hover:scale-110 group-hover:rotate-6 transition-all duration-700 pointer-events-none text-[var(--primary)]">
              <Disc size={240} />
            </div>

            <div className="relative z-10 px-6 py-8 md:p-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
              <div className="space-y-4 flex-1 min-w-0">
                <InfoCardHeading className="group-hover:text-[var(--primary)]" icon={Headphones}>
                  Music Production
                </InfoCardHeading>
                <h4 className="text-3xl md:text-4xl font-display font-black tracking-tight italic leading-tight">
                  Rage, trap & aggressive sound design
                </h4>
                <p className="text-base md:text-lg opacity-70 font-medium max-w-2xl leading-relaxed">
                  I am rxvirex. An independent producer & artist. Over-tuning 808s, fast distortion, and lots of layered sound design. I mix rage, trap, and hip-hop into music that's loud and feels different.
                </p>
              </div>
              <BounceButton
                icon={Music}
                label="Explore Releases"
                onClick={() => { setPage("music"); haptic.light(); }}
                className="m3-button-filled w-full shrink-0 justify-center md:w-auto h-14 px-8 rounded-4xl font-black italic ring-6 ring-[var(--outline-variant)]/70 text-sm uppercase tracking-wider"
              />
            </div>
          </Card>

          {/* terminal specs card */}
          <Card noDefaultStyles
            delay={1.3}
            className="col-span-2 md:col-span-12 lg:col-span-6"
            innerClassName="bg-[#0a0a0a] text-white/90 px-5 py-8 md:p-10 rounded-[3.5rem] border-6 border-white/5 font-mono relative group overflow-hidden transition-colors duration-200 flex flex-col gap-6"
          >
            <div className="flex items-center ml-2 gap-3 transition-opacity group-hover:opacity-100 mb-4">
              <SquareTerminal className="text-[var(--primary)] w-5 h-5 md:w-6 md:h-6" />
              <span className="text-sm md:text-base font-mono font-bold tracking-[0.1em] opacity-80"><span className="text-[var(--primary)]">virex</span>@<span className="text-[var(--primary)]">virex-arch-linux</span></span>
            </div>
            <div className="md:space-y-4 space-y-3 ml-3 md:ml-2">
              {[
                { k: "OS:", v: "Arch Linux" },
                { k: "Shell:", v: "fish 4.8.1" },
                { k: "Kernel:", v: "Linux 7.1.7-zen" },
                { k: "Audio:", v: "PipeWire / ALSA 96kHz" },
                { k: "CPU:", v: "i5-14600K" },
                { k: "GPU:", v: "RX 6800 XT" },
              ].map(s => (
                <div key={s.k} className="flex gap-2 text-[13px] md:text-xl">
                  <span className="text-[var(--primary)] font-bold min-w-[60px] md:min-w-[80px] italic">{s.k}</span>
                  <span className="opacity-60 group-hover:opacity-100 transition-opacity font-expressive tracking-[0.03em] truncate">{s.v}</span>
                </div>
              ))}
            </div>
            <div className="absolute inset-0 pointer-events-none opacity-[0.03] group-hover:opacity-[0.06] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,4px_100%] transition-opacity" />
          </Card>

          {/* tech stack */}
          <Card noDefaultStyles
            delay={1.4}
            className="col-span-2 md:col-span-12 lg:col-span-6"
            innerClassName={cn("px-6 py-8 md:p-12 bg-[var(--surface-variant)]/60 rounded-[3.5rem] border-6 border-[var(--outline-variant)]/40 transition-colors duration-200 group flex flex-col gap-8", glass_class)}
          >
            <InfoCardHeading className="group-hover:text-[var(--primary)]" icon={Code2}>
              Tech stack
            </InfoCardHeading>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
              <div className="space-y-4">
                <div className="text-[14px] font-black tracking-[0.1em] opacity-70">Web & Programming</div>
                <div className="flex flex-wrap gap-2.5">
                  {[...TECH_STACK.web, ...TECH_STACK.technical].slice(0, 10).sort().map(t => (
                    <TechChip key={t} label={t} />
                  ))}
                </div>
              </div>
              <div className="space-y-4">
                <div className="text-[14px] font-black tracking-[0.1em] opacity-70">Audio & Sound</div>
                <div className="flex flex-wrap gap-2.5">
                  {TECH_STACK.audio.sort().map(t => (
                    <TechChip key={t} label={t} />
                  ))}
                </div>
              </div>
            </div>
          </Card>

          {/* archive */}
          <Card noDefaultStyles
            delay={1.5}
            className="col-span-2 md:col-span-12"
            innerClassName={cn("px-6 py-8 md:p-12 bg-[var(--surface-variant)]/60 rounded-[3.5rem] border-6 border-[var(--outline-variant)]/40 border-dashed flex flex-col md:flex-row justify-between items-center gap-8 group hover:border-[var(--primary)]/50 transition-colors duration-200", glass_class)}
          >
            <div className="space-y-4 text-center md:text-left">
              <InfoCardHeading className="justify-center md:justify-start group-hover:text-[var(--primary)]" icon={Archive}>
                Archival
              </InfoCardHeading>
              <p className="text-xl opacity-50 font-medium max-w-2xl group-hover:opacity-100 transition-opacity italic">
                Hands down one of my most peculiar hobbies. I enjoy archiving old software, audio plug-ins, old manuals and docs, and keeping backups of everything of interest that I find.
              </p>
            </div>
            <div className="flex flex-col items-center md:items-end gap-2 shrink-0">
              <div className="text-[16px] font-black tracking-[0.2em] opacity-40 mb-2">Fingerprint!</div>
              <div className="text-[11px] md:text-sm font-mono opacity-100 select-all p-4 bg-[var(--surface-variant)] rounded-2xl border-2 border-[var(--outline-variant)]/40 leading-relaxed text-center md:text-right group-hover:border-[var(--primary)]/30 transition-all">
                77CBF94F4D2A99FEBC5C<br></br>EB4F283C191C49B2A76C
              </div>
            </div>
          </Card>

          {/* contrib gh heatmap */}
          <Card noDefaultStyles
            delay={1.6}
            className="col-span-2 md:col-span-12"
            innerClassName={cn("px-6 py-8 md:p-12 bg-[var(--surface-variant)]/60 rounded-[3.5rem] border-6 border-[var(--outline-variant)]/40 flex flex-col gap-8 group transition-colors duration-200 overflow-hidden", glass_class)}
          >
            <InfoCardHeading className="group-hover:text-[var(--primary)]" icon={Github}>
              GitHub activity
            </InfoCardHeading>
            <div className="w-full font-display text-sm opacity-80 mt-2">
              <GitHubCalendar 
                username="hnpf" 
                colorScheme={actualTheme}
                theme={{
                  light: [
                    'rgba(0, 0, 0, 0.05)', 
                    'color-mix(in oklch, var(--primary) 30%, transparent)', 
                    'color-mix(in oklch, var(--primary) 55%, transparent)', 
                    'color-mix(in oklch, var(--primary) 80%, transparent)', 
                    'var(--primary)'
                  ],
                  dark: [
                    'rgba(255, 255, 255, 0.05)', 
                    'color-mix(in oklch, var(--primary) 30%, transparent)', 
                    'color-mix(in oklch, var(--primary) 55%, transparent)', 
                    'color-mix(in oklch, var(--primary) 80%, transparent)', 
                    'var(--primary)'
                  ]
                }}
                labels={{
                  totalCount: '{{count}} contributions in the last year',
                }}
              />
            </div>
          </Card>
        </div>


        {/* foooootters */}
        <div className="flex flex-col items-center gap-12 w-full max-w-2xl">
          <div className="h-1.5 w-48 opacity-60 bg-[var(--primary)] mt-2 mb-4 rounded-full" />
          <div 
            onClick={(e) => { 
              if ((e.target as HTMLElement).closest('button, a')) {
                haptic.light(); 
              }
            }} 
            className="grid w-full max-w-[460px] grid-cols-2 gap-6 md:gap-8 mx-auto"
          > { /* ok ok no parent delegation jank shortcuts, found out the hard way */ }
            <BounceButton
              icon={Github}
              label="GitHub"
              url="https://github.com/hnpf"
              className="m3-button-tonal ring-8 ring-[var(--outline-variant)]/30 w-full max-w-[220px] h-16 rounded-3xl font-black tracking-[0.01em] text-md active:scale-95 uppercase italic"
            />
            <BounceButton
              icon={MessageSquare} 
              label="Discord"
              url="https://discord.gg/TSZNYbjzF7"
              className="m3-button-tonal ring-8 ring-[var(--outline-variant)]/30 w-full max-w-[220px] h-16 rounded-3xl font-black tracking-[0.01em] text-md active:scale-95 uppercase italic"
            />
          </div>

          <motion.button
            whileHover={{
              scale: 1.05,
              y: -4,
              borderRadius: "40px",
            }}
            whileTap={{ scale: 0.96 }}
            transition={{
              type: "spring",
              stiffness: 400,
              damping: 15,
              mass: 1
            }}
            onClick={() => {
              onBack();
              haptic.light();
            }}
            className="m3-button-filled ring-6 ring-[var(--primary)]/10 !bg-[var(--on-surface)] !text-[var(--surface)] h-18 px-12 rounded-[28px] tracking-[0.12em] text-2xl font-expressive font-sans font-black flex items-center gap-4 transition-colors relative overflow-hidden"
          >
            <Ripple />
            <Home size={28} className="relative z-[1]" />
            <span className="relative z-[1]">Go home</span>
          </motion.button>
          
          {/* spacer for when not fullscreen */}
          {!settings.infoFullscreen && (
             <div className="h-16" />
          )}
        </div>
      </div>
    </motion.div>
  );
};

export const ReadmePage = memo(({ setPage, is_mobile }: { setPage: (page: string) => void, is_mobile: boolean }) => {
  return (
    <BullshitMatrix
      onBack={() => setPage("home")}
      setPage={setPage}
      is_mobile={is_mobile}
    />
  );
});
