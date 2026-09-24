import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface BlogPost {
  id: string;
  title: string;
  snippet: string;
  content: string;
  date: string;
  category: string;
  readTime: string;
  link: string;
}

export interface ChangelogEntry {
  id: string;
  version: string;
  title: string;
  date: string;
  changes: {
    category: string;
    items: string[];
  }[];
}

export interface Project {
  id: string;
  title: string;
  description: string;
  link: string;
  tags: string[];
}

export interface Photo {
  id: string;
  url: string;
  description?: string;
}



export const PROJECTS: Project[] = [
  {
    id: "demarkify",
    title: "Demarkify",
    description:
      "a fast, non-dependent tool/library to detect, decode, and remove hidden unicode-based ai tracking markers, steganography, invisible characters, homoglyphs, and even byte anomalies from any text.",
    link: "https://github.com/hnpf/demarkify",
    tags: ["typescript", "unicode"],
  },
  {
    id: "torr",
    title: "Torr",
    description:
      "Torr is a git-like bittorrent client, which prioritizes a no gui, bloat-free, porcelain command flow over a true wire protocol implementation.",
    link: "https://github.com/hnpf/torr",
    tags: ["Rust", "bittorrent"],
  },
  {
    id: "Cons blog",
    title: "Cons blog",
    description:
      "Simply stunning m3e-inspired react/tsx blog site. Follows Material 3 Expressive guidelines without being overly bloated and confusing.",
    link: "https://github.com/hnpf/conspiracy.blog",
    tags: ["react", "typescript"],
  },
  {
    id: "mixtapes",
    title: "Mixtapes",
    description: "A modern Linux LibAdwaita-themed YT Music player.",
    link: "https://github.com/hnpf/Mixtapes",
    tags: ["python", "yt-music"],
  },
  {
    id: "beetrap",
    title: "Beetrap",
    description:
      "Linux honeypot written in Go, mimics common network services (SSH, FTP, HTTP) and logs connection attempts in real-time with a clean TUI",
    link: "https://github.com/hnpf/beetrap",
    tags: ["GoLang", "honeypot"],
  },
  {
    id: "sniffcli",
    title: "SniffCLI",
    description:
      "Lightweight TUI packet sniffer and network sentry built in Go. Features live protocol visualization, SSH brute-force detection, and outbound device monitoring",
    link: "https://github.com/hnpf/sniffcli",
    tags: ["GoLang", "Terminal"],
  },
  {
    id: "sysdupd",
    title: "SYSDUPD",
    description:
      "A simple GUI manager for updating (primarily) Arch-based systems. Can be somewhat useful for new users who love the GUI, but would rather have something clean.",
    link: "https://github.com/hnpf/sysdupd",
    tags: ["Gtk4", "Python"],
  },
  {
    id: "automate",
    title: "Automate",
    description:
      "Cross-WM (built GNOME-first) Wayland autoclicker for Linux, made using Python, GTK4, and LibAdwaita. First of this kind that actually still works!",
    link: "https://github.com/hnpf/automate",
    tags: ["Gtk4", "Python"],
  },
  {
    id: "google-pixel-plymouth",
    title: "Pixel Boot Animation",
    description:
      "Pixel-accurate (no pun intended) Gemini boot animation for Linux (Plymouth). Comes primarily optimized and leaned more towards machines that boot faster.",
    link: "https://github.com/hnpf/google-pixel-plymouth-theme",
    tags: ["Linux", "Design"],
  },
  {
    id: "rust-projects",
    title: "Rust projects",
    description:
      "My personal collection of mid-level (mostly beginner stuff, be warned!) tools made for speed and reliability, you can find various projects on my GitHub!",
    link: "https://github.com/hnpf",
    tags: ["Rust", "Misc"],
  },
];

export const BLOG_POSTS: BlogPost[] = [
  {
      id: 'internet-useless-info',
      title: 'THE INTERNET IS MAKING ME ODDLY GOOD AT KNOWING RANDOM USELESS THINGS',
      snippet: 'how random yt videos and bullshit geography studying can quite literally build a highway of hyper specific trivia',
      content: `
  # ACCIDENTALLY MASTERING USELESS TRIVIA (yo omfg)
  
  yeah nobody SETS OUT to learn the difference between init unit types or how to ID a country by a cropped version of its flag. why does this even happen?! you'd simply open one tab for a definition for god knows WHAT and boom its like 2 am and you know too fucking much about mid-20th century proxy wars and why C lets you shoot yourself in the foot. lmao. lmaooo
  
  alsoo, modern internet doesnt even give you any true education. at BEST it gives you random hyperspecific facts and just no context attached.
  
  ## the result??
  
  your memory now contains..
  
  * **geography & flags, obviously:** you can tell two nearly identical flags apart at a glance, like romania and chad (WHICH I DO KNOW THE DIFFERENCE, chad is slighty darker or even indonesia/monaco.. and monaco is slightly shorter. don't ask). why. WHO CARES. seterra did this to meee 💔
  * **tech & linux:** dumb bash commands which can prolly fix a bug exactly 3 other people have EVER had. one of them being me. i didnt learn anything from it btw.
  * **random history & security:** proxy conflicts, writeups, threat actors. i could NOT tell you my own schedule tomorrow but damn, ask me about a 2014 cve and i will SPIT
  
  ## is it REALLY useless tho?? (yes. but also no. but mostly yes..)
  
  | category | value in practice | trivial value |
  |---|---|---|
  | geography | uhh.. finding the store/? | knowing which side of the road cars drive on in some countries i'll never visit |
  | tech | basic troubleshooting | this one's useful. until it's rewriting shell configs for 4 HOURS instead of sleeping |
  | history | general awareness idfk | knowing that ancient romans used stale urine as mouthwash because the high amounts of ammonia actually helped is very useful! |
  
  anyway. none of this was planned. not even on tests. nobody paying me for it. buuut i can talk for MINUTES straight about the most weird topic imaginable...
  `,
      date: 'Sep 20, 2026',
      category: 'reflecting',
      readTime: '2 min read',
      link: 'internet-useless-info'
  },
  {
    id: '2slimey-changed-how-i-listen',
    title: '2slimey changed the way I listen to music.',
    snippet: 'Yes, a genuine opinion of mine. If this title made you roll your eyes, you are exactly who this is for! :)',
    content: `
# 2slimey changed the way I listen to music.

i know, i know. "the shrimp guy?"

yes. that guy. just keep reading.

## the part where i lose half the audience

if you found 2slimey through a tiktok of someone laughing at a song called "shrimp," you were introduced to the meme before the music. and that's just a terrible way to encounter an artist LMFAO

social media has a habit of finding the strangest surface level detail about something and turning it into the entire identity of that thing. that's what happened here.

so let me go back.

## what he is actually doing

2slimey's music sits somewhere between rage, trap, and noise. his distortion is deliberate. the clipping is deliberate. the 808s are pushed into sounds that barely resemble conventional 808s, with strange pitch changes and patterns dropping ENTIRE OCTAVES.

that right there is where i think a lot of the criticism misses the point fully.

his influences aren't just carti and uzi. he's talked about bands like **minor threat, bad brains, and the sex pistols**, and thats where you can start clicking the patterns together.

hardcore punk was loud, fast, abrasive, and deliberately hostile to conventional ideas of what music was supposed to sound like. a lot of the music that eventually became influential was initially dismissed with some variation of "this shit isn't even music at this point."

2slimey takes that same refusal and pushes it through rage and trap production.

the distortion isn't there because he doesn't know how to make something cleaner. the discomfort *is part of the work.*

## music doesn't need to be comfortable

this is the part that actually changed how i listen to music.

i used to judge production mostly by whether something immediately sounded satisfying.

and to be fair.. there's nothing wrong with that!

but 2slimey made me realize that **music CAN be good because it refuses to give you that satisfaction.**

music can be abrasive on purpose. it can feel excessive. it can leave things unresolved. it can make you sit there and think "what the fuck am i listening to?" and still feel 100% fully intentional.

that's changed the decisions i make when i produce.

i'm less afraid of sounds that don't fit cleanly. i'm more interested in stuff that is harsh for an actual reason. i'm less convinced that "sounds good immediately" is the same thing as "sounds good."

## so, the shrimp guy

im not telling you to like 2slimey.

seriously.

BUT, you should know the difference between "this is talentless" from "this isn't really for me".

because once you understand what he's actually trying to do, his music becomes a lot more interesting. whether you enjoy the result is completely subjective. the artistic idea behind it is NOT.

that is what stuck with me

a meme/trend introduced me to an artist who completely changed the way i think about production.

so yeah.

the shrimp guy.
    `,
    date: 'Aug 12, 2026',
    category: 'music',
    readTime: '5 min read',
    link: '2slimey-changed-how-i-listen',
  },
  {
    id: 'more-old-blogs-restored',
    title: 'even more history! part 2 of restoring the early blogs',
    snippet: 'restored a few more gems from the early 2026 snapshots, including some of my favorite rants and the revamped markdown stress test.',
    content: `
# even more history! part 2 of restoring the early blogs

i'm on a roll again! after digging up the 2025 posts, i decided to go a bit further and bring back some of the early 2026 archives that i missed as well. these are from a time when the site's style and identity was really starting to solidify around the current aesthetic, but was still before this style.

## what's new in the feed, you might say?

here are the latest additions to the restored blogs:

*   **search bars are e-waste:** a take on why you probably don't need a search bar if your site is actually well-structured
*   **networking wiki:** my networking wiki stuff, restored. funny that that project has been stalled for months now, isnt it?
*   **de-sanitizing the site:** a devlog about gutting the old "safe" design and going for something more aggressive, or whatever.
*   **mobile magic & hardware:** the updates that brought the nav bar and hardware stuff.
*   **stop making it easy to pwn you:** a cybersecurity 101 guide for the average person, somewhat changed because things itself in the industry changed.
*   **markdown stress test (REVAMPED):** this one's special, i completely overhauled it and moved it to the top to test the new oklch-powered markdown stuff.

## the stress test revamp

the markdown stress test is now much more intense. it tests everything from nested lists and complex tables to dynamic syntax highlighting. if the site looks good there, it looks good everywhere!

more updates coming soon, but for now, enjoy the deeper addition to the blogs!
    `,
    date: 'Jul 7, 2026',
    category: 'update',
    readTime: '2 min read',
    link: 'more-old-blogs-restored',
  },

  {
    id: 'markdown-test',
    title: 'markdown stress test, testing the parser',
    snippet: 'checking if the new react-markdown setup can handle me.',
    content: `
# header 1 looks like this
## and header 2 looks like this
### and header 3 looks like this
#### and header 4 looks like this

this is a normal paragraph with some **bold text**, some *italics*, and a [**link to my github**](https://github.com/hnpf) just to see if it works.

## testing the code blocks

here is some simple python logic:

\`\`\`python
def add(a, b):
    return a + b

def subtract(a, b):
    return a - b
\`\`\`

and some typescript:

\`\`\`typescript
interface User {
  id: string;
  name: string;
  active: boolean;
}

const greet = (user: User) => {
  return \`Hello, \${user.name}!\`;
};
\`\`\`

## testing lists and formatting (*, *, *, etc)
* top level item
    * nested item (this would have broken before)
    * another nested one
        * double nested!
* back to basics

## ordered lists (1., 2., 3., etc)

1. Ordered list item 1
2. Ordered list item 2
    * Nested unordered item
    * Another nested unordered item
3. Back to ordered

## testing blockquotes

> "if it works on my machine, it's production ready." - basically me

## testing gfm (tables)

| feature | status | notes |
| :--- | :--- | :--- |
| headers | working | looks clean |
| tables | hopefully working | oklch colors! |
| sanity | gone? | permanently. |
| dynamic | yes | based on hue |

---

## horizontal rule above

### testing inline styles
this is \`inline code\`, this is **bold**, this is *italic*, and this is [a link](https://stabbed.wtf).

### testing images
![nekofetch official screenshot](https://raw.githubusercontent.com/hnpf/nekofetch/refs/heads/main/screenshot.png)

ok thats it bye
    `,
    date: 'Jul 7, 2026',
    category: 'devlog',
    readTime: '2 min read',
    link: 'markdown-test',
  },

  {
    id: 'return-of-the-old-blogs',
    title: 'the old blogs are back. all of them.',
    snippet: 'i dug up every old post from the old stabbed.wtf, going all the way back to the very beginning of the "project inception". they\'re all here again now, preserved exactly as they were back when i wrote them.',
    content: `
# the old blogs are back. all 14 of them.

soooo, i was poking around some old snapshots of stabbed.wtf recently, and found a bunch of my old blog posts sitting there! completely forgotten! some of them are from the very first version of this site, back when i was just figuring things out and writing about whatever.

i could have left them buried. but i felt way different, they're more of a part of this project's history, and i think that's now worth keeping to the public, as well.

## what's back?

everything from **june 2025** through **november 2025** is now restored and live in the blog feed. that also includes some of these titles:

* the very first "welcome to the blog!" post
* early project updates from when the site was barely a thing
* thoughts on open source, cybersecurity, and dev philosophy
* a GTA 6 rant that aged beautifully (it did get delayed again, by the way!)
* the original inception post from when this whole thing started as a material design playground

## why even bother?

i think it's quite cool to have a past available here. not just the posts from now, but the old, messy, slightly rushed ones from way back. the site has come a really long way since then and looking back at those early posts is kind of wild.

ps. they're posted here exactly as i wrote them! i've done zero edits, with no post polish bs. raw old virex lol posts from 2025.

enjoy reading back in time :)
    `,
    date: 'Jul 6, 2026',
    category: 'update',
    readTime: '2 min read',
    link: 'return-of-the-old-blogs',
  },
  {
    id: 'stop-moving-my-screen',
    title: 'stop moving my screen! this is why modern web design is a motion sickness hazard...',
    snippet: 'let\'s talk about how modern web designers went insane with motion, and why i finally finished my global toggle to turn off the damned thing!',
    content: `
# stop moving my screen! this is why modern web design is a motion sickness hazard...

hi there! if you've browsed the modern web lately, you probably know what i'm talking about.. you open a site, and before you can even read a single thing, three different animations fade in, the background rotates on a 3d tilt axis, and the header does a double twist thing with weird animations! 

i love pretty things, but at some point, we went completely off the deep end.

## the physics obsession

framer motion and other layout libraries made it incredibly easy to animate *everything*. and because we *can*, we *do*. and i'll admit; i do it too! 

but here's my thing:
* **it is very exhausting:** your eyes constantly have to track elements moving from off-screen just to focus on text.
* **battery drain:** recalculating complex layouts and painting frame changes at full 120hz is a fast way to drain any battery.
* **accessibility:** for a lot of people, intense motion is genuinely disorienting or triggers actual motion sickness. i've had friends that had motion sickness, so never again.

## finally adding global animation controls

i finally got around to finishing the \`disableAnimations\` option on this site, seen in the new changelog. if you open settings and turn it on, it now wraps the entire site in a global \`MotionConfig\` that overrides everything to instant transitions:

one toggle, no latency, none of that. have fun, my motion sick people :)
    `,
    date: 'Jul 5, 2026',
    category: 'dev',
    readTime: '2 min read',
    link: 'stop-moving-my-screen'
  },
  {
  id: 'leaving-vercel',
  title: 'leaving vercel; migrating my project to cloudflare!',
  snippet: 'here is why i finally dropped vercel\'s proprietary ecosystem, swapped to cloudflare pages, and built my own localized deployment helper.',
  content: `
# leaving vercel; migrating my project to cloudflare

hi! after dealing with constant config headaches and growing distrust over vercel's hosting infrastructure, i finally did it. **stabbed.wtf is officially 100% free from vercel.** i migrated the entire site infrastructure over to **cloudflare pages**, and i'll be honest, it is a flex!.

## why did i dump vercel?
vercel is great for getting a basic site up in two clicks, but they love vendor lock-in. their serverless wrappers are entirely proprietary, configuring non-standard routes is a nightmare, and quite frankly, the bandwidth billing traps are terrifying. i don't want dumb corpo constraints on my own stuff. 

## entering cloudflare pages
cloudflare **is** the network layer of the internet. by moving here, here's what the site now benefits from:
* **unmetered bandwidth:** literally no threat of surprise bills if a malicious actor decides to layer-7 ddos my endpoints LMAO
* **no cold starts:** running on raw v8 javascript isolates at the closest edge nodes instead of heavy serverless containers
* **total sovereignty:** zero hidden infrastructure layers masking what is actually happening to my traffic!

## about that localized deployment helper : dhelper
instead of using some bloated wrapper cli that tracks metrics in the background, i wrote a simple custom script called \`dhelper\` that ties right into wrangler and pnpm, with zero fucking headache.

now, when i want to compile and push code directly to cloudflare\'s global edge network, i just run:

\`\`\`bash
./dhelper -p
\`\`\`
... that simple!
it compiles via vite, verifies the build outputs, maps the custom apex domain records, and promotes the assets to the live main branch in under half a second if things are already cached. 

## simple migration stats
| platform | lock-in | bandwidth | billing risk | runtime |
| :--- | :--- | :--- | :--- | :--- |
| **vercel** | high | metered | terrifying | lambda containers |
| **cloudflare** | near zero | unlimited | zero | v8 edge isolates |

and the setup is incredibly fast, completely non-proprietary, and managed entirely within my terminal. look at it load.. oh wait, its too fast! :3
  `,
  date: 'May 25, 2026',
  category: 'cybersec',
  readTime: '3 min read',
  link: 'leaving-vercel'
},
   {
       id: 'data-sovereignty',
       title: 'Why i refuse to trust the majority of the cloud..',
       snippet: 'Hoarding data is a radical act of self-preservation in a world of corporate greed tech giants.',
       content: `
   
   I'll just get straight to it.. EVERYTHING is a subscription now. You don't own your games, you don't own your music, and you definitely don't own your OS environment if you're stuck on Windows or such. They want you to rent your life until you die.
   
   ### Again, this is why i hoard!
   
   * **Survival of the fittest:** If the internet cuts out or a company decides to "pivot" (or just goes bankrupt), my data is still there, as it should be!!! 
   * When you rely on music streaming, you are letting some faceless AI algorithm decide your taste and your history. Typically I prefer my own curated music, so no thank you.
   * **Local > Remote:** Life is better when your data is actually in your computer/close to you, not sitting in a server farm halfway across the world. 😭
   
   ## Even the political angle matters!
   
   Every time I copy a file to my local drive, I am (probably) committing a minor act of rebellion against the "rent/subscribe-everything" economy
   
   > "If I cant own it, I DONT WANT IT. If I cant control it, I will at least archive it."
   
   ## Build your bunker :)
   
   Anyone can start small. Get a cheap drive, back up your configs! You don't have to trust the backup options on your proprietary apps. Your data shouldn't constantly be scanned by AI. Why not protect it?
       `,
       date: 'May 24, 2026',
       category: 'research',
       readTime: '3 min read',
       link: 'data-sovereignty'
   },
  {
    id: "bladeandbath-shitpost",
    title: "brutal fantasies is literally the peak of human existence",
    snippet:
      "ok.. i'm coming back from the dead again to talk about the only album that matters right now, and i know its late talking about it. sorry not sorry.",
    content: `
## why im back (again)

it has been almost a week since i last posted but i literally dont care because i took like a month long break before that so i have energy again. the urge called and i answered with a blog post :)

i was gonna talk about sukkubys or blade and bath coming back to life because that whole scene is actually moving lately but i had a realization...

## the only thing that matters

**brutal fantasies** is literally the best album on this planet. no contest. its peak. its the absolute ceiling of the genre.

everyone else can stop recording now because this is it. the atmosphere is perfect. the production? exactly what it needs to be. the absolute dread and instrumental?? oh my god! this is modern beethoven! i have been looping this and honestly nothing else is hitting the same right now. WHAT ARE THEY FEEDING THESE ARTISTS?!

## this is kinda what i noticed on the album..

*   vocals that actually hurt to listen to (in a REALLY good way)
*   that specific raw energy that most dsbm bands try to fake but totally fail at
*   literally no skips!

| album | rating |
| :--- | :--- |
| Brutal Fantasies | 11/10 |
| Soundtrack for a Suicide: Opus II | 11/10 |
| Eternal Damnation | 11/10 |
| ..Of Mourning | 10/10 |
| and everything else | MID! |
---

<spacer height="30px" />

## anyways, happy wallowing!
    `,
    date: "Apr 30, 2026",
    category: "music",
    readTime: "2 min read",
    link: "bladeandbathpeak",
  },
  {
    id: "ricing-supremacy",
    title: "ricing supremacy and why ricing makes you an actually better dev",
    snippet:
      "PLEASE stop staring at ugly default themes. your environment is a reflection of your work.",
    content: `
# aesthetic is actual efficiency (dont @ me!)

if you're still on any default terminal theme, i'm praying for you. making things look good isn't just a "ricer on reddit" thing but more about building a comfortable space where you actually *want* to suffer through merge conflicts!

## why color palettes?

it's the total peak of human engineering. colors, decent contrast, and something that won't torch your retinas at midnight

## final thoughts

stop settling for defaults. start spending time actually configuring your colorscheme instead of shipping :). it's actually something called investment.

> "also, if your terminal is ugly, your logic is probably ugly too :3" - virex ong

  `,
    date: "Apr 26, 2026",
    category: "tech",
    readTime: "2 min read",
    link: "ewaste-supremacy",
  },

  {
    id: "idek-anymore",
    title: "turning ewaste into a small dev rig",
    snippet:
      "this is why I decided to torture myself by putting debian on a snappy chromebook and how it actually kinda works!",
    content: `
## why do i do this to myself?
honestly, there is something so satisfying about taking a "dead" chromebook and making it run a real OS. my old hp x360 (aka snappy) was basically a paperweight, but now it's a dedicated debian 13 box.

### okay, here's the setup..
it’s not just about flashing mrchromebox! it's about making sure the audio actually works and the trackpad actually responds.

* **OS:** debian 13. because I like living on the edge of "stable"
* **DE:** GNOME classic (obviously). it's heavy for these specs but it just feels like home.
* **vim:** the only editor that belongs on a screen this bad.

## moral of the story:

> "it's not ewaste if you can still run a terminal on it."

    `,
    date: "Mar 15, 2026",
    category: "linux",
    readTime: "4 min read",
    link: "ewaste-1-fr",
  },

  {
    id: 'more-hardware-updates-feb-2026',
    title: 'mobile magic & hardware redesign',
    snippet: 'the new mobile "more" menu and the revamped hardware section.',
    content: `
# touching up the mobile experience

wrapped up some updates that make navigating the site smoother, especially on mobile, and gave some love to the hardware display.

## ✦ mobile-first "more" menu

for the mobile crowd, i rolled out a new **pull-up "more" menu** from the bottom.

* **quick access:** get to settings, "the hardware" pane, github, and toggle light/dark mode super easily.
* **gestures:** you can now just **drag down** to dismiss it. smooth and fast.
* **the little things:** includes my profile for a personal touch!

## ✦ the hardware section got a glowup

the hardware tab got a visual overhaul.

* **categorized cards:** system specs are now organized into cards like "core system," "processing units," and "storage & memory."
* **visual progress:** memory and storage now have **progress bars**, showing usage at a glance.
* **clean layout:** overall typography and spacing refined for a more modern aesthetic that stays true to the site's theme.

small changes, big difference in how you interact with the site.
    `,
    date: 'Feb 11, 2026',
    category: 'devlog',
    readTime: '3 min read',
    link: 'more-hardware-updates-feb-2026',
  },

  {
    id: 'site-overhaul-feb-2026',
    title: 'de-sanitizing the site',
    snippet: 'a deep dive into why i gutted the old design, added new tweaks, and gave you keys to customization.',
    content: `
## de-sanitizing the site

my philosophy has always been "high specs, low standards :)".
after a solid run, it was time for another overhaul to push the boundaries again!

### + what's new?

the biggest change? a complete redo of the site's responsiveness and feel.

* **adaptive navigation:** the static sidebar was a pain on smaller screens. now a **dynamic bottom navigation bar** takes its place, complete with smooth **microanimations** and a material 3 expressive "pill" active state. it adapts whether you're on desktop or mobile.

* **better content ux:** addressed the awkward card scaling and density issues, mainly in the **active protocols** and **tracker** sections. cards now scale nicely, and the tracker has denser, more refined cards with revamped typography and progress bars.

* **responsive hovers:** the **"inspect element"** buttons now have bouncy hover animations.

### + your situation, your rules: the customizer

i've massively expanded the **customizer** to give *you* more control.

**desktop only tweaks:**
* **flip sidebar direction:**s
* **invert colors:**
* **monochrome mode:**
* **disable animations:**
* **gtk3 nostalgia mode:**

**your own accent:**
* **dynamic hue slider:** slide to shift the entire accent color hue of the site!

stay tuned for more unsolicited opinions!
    `,
    date: 'Feb 11, 2026',
    category: 'devlog',
    readTime: '3 min read',
    link: 'feb-11-update',
  },

  {
    id: 'search-is-mid',
    title: 'this is why search bars are e-waste',
    snippet: "let's be honest.. if you needed a search bar to find content on a site, you are trying too hard.",
    content: `
# search is for bad sites anyway

i recently removed the search engine on stabbed.wtf because... let's be real, nobody was using it. instead, i updated the whole site and added **the hardware** pane that actually shows my specs.

if you want to find something, just click the sidebar. it's not that insane.

## why the tracker?
i added a **protocols/tracker** page to track my progress in cybersecurity. it looks cool and makes me feel like i'm in a movie while i study. waiting for those progress bars to hit 87% on vulnerability analysis is the only dopamine i need right now.

> "if it works on my machine, it's production ready." - me, every time i push to stabbed.wtf >_<

anyways, stay tuned for more unsolicited opinions. bye, my zero viewers!
    `,
    date: 'Feb 10, 2026',
    category: 'opinions',
    readTime: '2 min read',
    link: 'search-is-mid',
  },

  {
    id: 'unw-upw-is-a-bible-lol',
    title: 'my networking wiki just got a full reinstallation',
    snippet: 'after a whole year of rotting, the wiki is finally a 300k character monster.',
    content: `
## the networking wiki update

it's been a **whole year**. the old wiki was basically brain dumps and it was mid at best.

today, that era ends. i completely rewrote the whole thing!

## the new stuff

* 3476 lines
* 278629 characters
* **zero** carpal tunnel. (thanks, python!)

## from near-zero context to a full bible

every protocol and tool now has structured sections for purpose, key features, and use cases. no more half-baked notes. it's basically a cheat code for my hobby grind now.

> "if it works on my machine, it's production ready." - again, basically me

## automation is king

check the repo: [ultimate-networking-wiki](https://github.com/hnpf/untimate-networking-wiki)
    `,
    date: 'Feb 03, 2026',
    category: 'devlog',
    readTime: '4 min read',
    link: 'unw-upw-is-a-bible-lol',
  },
{
    id: 'cybersec-101',
    title: 'stop making it easy to pwn you',
    snippet: 'the absolute bare minimum to not get wiped out online.',
    content: `
the internet is hostile, mostly because corporations treat your data like public property and security is treated as an afterthought. you don't need a degree to protect yourself, you just need to stop doing the dumbest things.

## credentials are broken by design
reusing passwords means one database leak opens every single account you own. stop it. 
* use a local or trusted password manager (keepassxc, bitwarden). generate random strings.
* turn on totp mfa (authenticator apps, hardware keys). sms mfa is vulnerable to sim swapping, but it's still better than nothing.

## stop ignoring patches
zero-days exist, but most malware exploits known vulnerabilities that people just refused to patch for six months. 
* when your system says update, do it. 
* automation is your friend here.

## your threat model probably isn't the nsa
you are likely to get hit by mass phishing, not a targeted nation-state attack.
* look at the url. if it says login-paypal-secure-server.com, it's fake.
* public wi-fi isn't inherently going to instant-infect you anymore thanks to ubiquitous https, but untrusted networks still expose your metadata. wireguard into a home server or trusted vpn if you're paranoid.

### the absolute minimum
| defense | vector blocked | status |
| :--- | :--- | :--- |
| unique keys | credential stuffing | mandatory |
| totp / yubikey | bypassed passwords | mandatory |
| rapid patching | automated exploits | mandatory |

---
if you're using password123, you aren't being targeted. you're just being harvested.
---
    `,
    date: 'Jul 07, 2026',
    category: 'cybersecurity',
    readTime: '1 min read',
    link: 'cybersec-101',
  },

  {
    id: "sysdupd",
    title: "sysdupd: arch updates without the headache",
    snippet:
      "i finally got tired of manual pacman runs, so i built a libadwaita manager for my personal use",
    content: `
# it finally works.
## i built a custom update manager using python, gtk4, and libadwaita.

* it handles systemd timers for background checks and even has a "dangerous" auto-update mode for when i'm lazy.

# some of the features it has:

  * a dynamic distro detection (no hardcoded arch linux distro lol)
  * background service via systemd
  * proper update history logs
  * a sleek adwaita interface

check the source on my github (hnpf) or install it via aur!
( yay -S sysdupd / yay -S sysdupd-git )
    `,
    date: "Jan 16, 2026",
    category: "dev",
    readTime: "3 min read",
    link: "sysdupd",
  },

  {
    id: "pixel-10-pro-honest-review",
    title: "long term pixel 10 pro use: my review of the tensor G5",
    snippet:
      "the 3nm transition, on device ai, and why the pixel 10 pro is finally a consistent daily driver.",
    content: `
## architectural maturity (the TSMC shift)
* the biggest update to the pixel 10 pro isnt really the outer chassis, but the silicon.

* with the G5 moving to TSMCs 3nm process, the efficiency increase over the previous samsung fabbed repitition slop is insantly noticable.

* thermals are still stable under sustained loads, and the nona-core CPU configuration (with the cortex-x4 at 3.78 ghz) got a much needed lift in single threaded performance

## the memory and multitasking
* paired with 16gb of lpddr5x ram, the os handles aggressive background processes without the typical aggressive killing of cached apps!

## best of all, the camera and computer vision

* the new ISP thrown onto the G5 allows for a literal 100x zoom, which obviously uses on device generative models to throw in some detail that was lost to noise!

* even more noticably, that reliance on cloud-based "video boost"? that's been reduced as well! with more of the heavy lifting for realtime relighting and audio focus AI happening, once again, locally on the TPU.
    `,
    date: "Jan 16, 2026",
    category: "research",
    readTime: "5 min read",
    link: "pixel-10-review",
  },

  {
    id: "cloud-is-someone-elses-computer",
    title: "your cloud is just someone elses computer.",
    snippet: "this is why i hoard data (and you probably should too)",
    content: `
# stop trusting corporations to keep your data safe.

i have massive amounts of storage for a reason. people think im crazy for archiving games, software, and gallery backups, but have you even seen the state of the internet lately?
people call me crazy until it actually comes useful and you lose stuff forever. the internet is made to have temporary-first data.

* if it's on my drive, no one can "un-license" it or edit the content after the fact.
* paying $15 a month for a library that changes every week is a joke.
* i keep games, movies, music, tools, and old software because once they're gone from the main web, they're gone forever!
    `,
    date: "Jan 14, 2026",
    category: "research",
    readTime: "3 min read",
    link: "cloud-is-someone-elses-computer",
  },

  {
    id: "why-i-actually-use-arch",
    title: "why I actually use arch.. (and it’s not a joke)",
    snippet:
      "everyone thinks arch users just want to flex their fastfetch, but i actually just want a system that doesnt hand bs over to me...",
    content: `
# why arch? (unironically)

honestly if i were to see one more person say "i use arch btw" as a joke i might actually lose it. on a serious note, i use it because i dont want some random distro maintainer deciding what packages i need to have installed.

* **no bloat:** i have exactly what i need and nothing else.
* **the wiki:** literally the holy grail of 'perfect' documentation. if it’s not in the wiki, it probably doesnt even exist.
    `,
    date: "Jan 14, 2026",
    category: "research",
    readTime: "2 min read",
    link: "why-i-actually-use-arch",
  },

  {
    id: "the-internet-is-dead",
    title: "the internet is dead.",
    snippet:
      "if you think youre still talking to real people on big platforms, i have a bridge to sell you.",
    content: `

i've been looking at the traffic patterns on the major socials and it's literally just bots talking to bots.
it's now just a loop of ai-generated slop being consumed by ai-generated scrapers. dystopian right?

* you post a thought, and three seconds later, five "blue checks" with generic ai names reply with something vaguely related.
* we're literally just being shown what keeps us scrolling for 0.5 seconds longer.
* you can't have a debate anymore because the "person" you are arguing with is probably a clanker running on a server in a basement somewhere.
    `,
    date: "Jan 12, 2026",
    category: "research",
    readTime: "2 min read",
    link: "the-internet-is-dead",
  },

  {
    id: "epstein-files-is-a-joke",
    title: 'the epstein "files" are a joke',
    snippet:
      "so the DOJ finally dropped the files and... surprise! it’s basically just 50 pages of blacked out text...",
    content: `
# the most transparent administration I guess?

the DOJ literally just dropped a bunch of documents that are so redacted they look like modern art.

apparently, they missed the deadline set by the transparency act and are now doing "rolling releases" or.. batches, which is just code for "we're still redacting."
    `,
    date: "Dec 21, 2025",
    category: "research",
    readTime: "3 min read",
    link: "epstein-files-is-a-joke",
  },

  {
    id: "why-love-open-source",
    title: "heres why i love open source - 2",
    snippet:
      "honestly, open source is just better. it’s all about the community and...",
    content: `
# why open source is absolutely goated

it's literally just people helping people for learning (and overall better code because contributors duh).

* you get to check under the hood of massive projects.
* see how the experienced developers actually make big things.
* contributing feels way better than just gatekeeping.
* community feedback makes everything 10x more secure and efficient.
    `,
    date: "Nov 12, 2025",
    category: "dev",
    readTime: "1 min read",
    link: "why-love-open-source",
  },
  {
    id: "my-take-on-ai",
    title: "My take on ai",
    date: "Nov 16, 2025",
    snippet: "My take on ai; ai is a companion, not a replacement. an assistant, and nothing more",
    content: `AI is perfect as a LOCAL ONLY dev companion for spotting bugs, refactoring, and testing in your environment, but never let it touch security and never let it run your project. its a helper, nothing more. dont ever use ai to build your codebase. at that point, youre the consumer. not the creator. use it to see, to catch, to polish. not to replace, not to take control. AI is your TOOL, its *not your brain*. you are. so go learn new things, devs! ai is not replacing you any time soon. dont let it take your crown!`,
    category: "ai",
    readTime: "3 min read",
    link: "my-take-on-ai",
  },
  {
    id: "keeping-it-live",
    title: "The VIREX portfolio is UPDATED",
    date: "Nov 16, 2025",
    snippet: "I've completely revamped and fixed + polished the code on ALL pages",
    content: "Hello world! The VIREX portfolio is UPDATED!  I've completely revamped and fixed + polished the code on ALL pages!  I've optimized everything to oblivion, and added 2 new pages: FAQ and tutorials. Wordly has been revamped as well! Have fun, VIREX world! Love u all.",
    category: "dev",
    readTime: "2 min read",
    link: "keeping-it-live",
  },
  {
    id: "project-update-2025-11-12",
    title: "Project Update 2025-11-12",
    date: "Nov 12, 2025",
    snippet: "Major fixes and improvements across the site.",
    content: "Major fixes and improvements across the site. Improved SEO, fixed broken links, and MUCH BETTER performance. Always striving to make the site better for you and me!",
    category: "dev",
    readTime: "1 min read",
    link: "project-update-2025-11-12",
  },
  {
    id: "project-update-2025-11-08",
    title: "Project Update 2025-11-08",
    date: "Nov 8, 2025",
    snippet: "Updated multiple things on the site for better UX...",
    content: "Yep, it's that time again! I've updated multiple things on the site for better UX, including blog fixes, portfolio stuff, and a new photography section! this update also brings things like privacy info, sitemap, and other elements like robots.txt and llms.txt. I hope to bring more fixes and improvements over time. thanks for being along with this project!",
    category: "dev",
    readTime: "3 min read",
    link: "project-update-2025-11-08",
  },
  {
    id: "ah-shi-here-we-go-again",
    title: "Ah shi, here we go again.",
    date: "Nov 6, 2025",
    snippet: "Rockstar has JUST announced that GTA 6 will be delayed to November 19th, 2026",
    content: "Rockstar has JUST announced that GTA 6 will be delayed to November 19th, 2026. I personally don't even want the game anymore, Rockstar can KEEP it 😭",
    category: "gaming",
    readTime: "1 min read",
    link: "ah-shi-here-we-go-again",
  },
  {
    id: "future-plans-and-goals",
    title: "Future Plans and Goals",
    date: "Nov 7, 2025",
    snippet: "I'm really looking forward to new projects and even more learning opportunities",
    content: "Looking ahead, I'm really looking forward to new projects and even more learning opportunities. I wish to contribute to more open source projects, expand my photography skills, and even cybersecurity studying. My way of continuous learning never ends! :)",
    category: "goals",
    readTime: "2 min read",
    link: "future-plans-and-goals",
  },
  {
    id: "importance-of-cybersecurity",
    title: "The Importance of Cybersecurity, especially in Development",
    date: "Nov 6, 2025",
    snippet: "understanding cybersecurity is a no brainer",
    content: "As a developer, understanding cybersecurity is a no brainer. Having secure authentication or protecting user data, security should be a MUST have consideration in every single project, especially on the web. My search engine project emphasizes privacy and security at its core.",
    category: "security",
    readTime: "2 min read",
    link: "importance-of-cybersecurity",
  },
  {
    id: "why-i-love-open-source-og",
    title: "Why I Love Open Source",
    date: "Nov 5, 2025",
    snippet: "Open source software has always been so important in my development journey",
    content: "Open source software has always been so important in my development journey. Especially learning from others' code to contributing back to the community, it's a cycle of knowledge sharing that benefits literally anyone and everyone. My projects like NekoFetch and MTCLI are open source because I heavily believe in collaborative development!",
    category: "dev",
    readTime: "3 min read",
    link: "why-i-love-open-source-og",
  },
  {
    id: "welcome-to-the-blog",
    title: "Welcome to the Blog!",
    date: "Nov 4, 2025",
    snippet: "This is the first blog post!",
    content: "This is the first blog post! I'm happy to share updates on my projects and thoughts on development and other topics! As a self-taught full-stack developer, I believe in sharing knowledge and experiences. This blog will cover everything from coding tutorials to personal insights on the tech industry. Stay tuned for more content!",
    category: "blog",
    readTime: "2 min read",
    link: "welcome-to-the-blog",
  },
  {
    id: "project-update-2025-11-04",
    title: "Project Update 2025-11-04",
    date: "Nov 4, 2025",
    snippet: "I've been working on a LOT of updates and features for my portfolio.",
    content: "I've been working on a LOT of updates and features for my portfolio! I'll post updates here as I go! The latest changes include improved navigation, better SEO optimization, and enhanced user experience. I'm constantly iterating on my work to make it better for visitors.",
    category: "dev",
    readTime: "2 min read",
    link: "project-update-2025-11-04",
  },
  {
    id: "project-update-2025-11-03",
    title: "Project Update 2025-11-03",
    date: "Nov 3, 2025",
    snippet: "Fully overhauled and recoded search wrapper & portfolio from scratch",
    content: "Fully overhauled and recoded search wrapper & portfolio from scratch. Made my own design. This complete redesign focuses on clean code, modern aesthetics, and improved performance. The new design emphasizes my skills in both frontend and backend development.",
    category: "dev",
    readTime: "2 min read",
    link: "project-update-2025-11-03",
  },
  {
    id: "project-update-2025-10-20",
    title: "Project Update 2025-10-20",
    date: "Oct 20, 2025",
    snippet: "Changed fonts & added transparency/glassy effects across the site.",
    content: "Changed fonts & added transparency/glassy effects across the site. Typography plays a crucial role in user experience, and these changes make the content more readable and visually appealing. The glassy effects add a modern touch to the interface.",
    category: "dev",
    readTime: "1 min read",
    link: "project-update-2025-10-20",
  },
  {
    id: "project-update-2025-10-19",
    title: "Project Update 2025-10-19",
    date: "Oct 19, 2025",
    snippet: "Fixed and revamped various parts of the UI",
    content: "Fixed and revamped various parts of the UI. User interface design is iterative, and these improvements address usability issues and enhance the overall user experience. Every detail matters when creating a professional portfolio.",
    category: "dev",
    readTime: "1 min read",
    link: "project-update-2025-10-19",
  },
  {
    id: "project-update-2025-6-12",
    title: "Project Inception 2025-6-12",
    date: "Jun 12, 2025",
    snippet: "Started with the idea of creating a Material Design testing playground as a hobby.",
    content: "Started with the idea of creating a Material Design testing playground as a hobby. The initial project sparked my passion for web development and led to the creation of my current portfolio. It's amazing how a simple hobby project can evolve into something meaningful.",
    category: "beginning",
    readTime: "2 min read",
    link: "project-update-2025-6-12",
  },


  /*
  
  {
    id: "",
    title: "",
    date: "",
    snippet: "",
    content: "",
    category: "",
    readTime: "",
    link: "",
  },

  */
];

export const CHANGELOGS: ChangelogEntry[] = [
  {
    id: "stabbedwtf-mobile-update",
    version: "2026.09.23",
    title: "stabbed.wtf + mobile update",
    date: "Sep 23, 2026",
    changes: [
      {
        category: "New 🫪🫪",
        items: [
          "🫪🫪🫪🫪🫪",
          "66 69 6e 64 20 69 74 20 69 6e 20 73 65 74 74 69 6e 67 73 20 28 64 6f 6e 74 20 70 72 65 73 73 20 68 65 6c 6c 6f 20 61 6e 69 6d 61 74 69 6f 6e 20 74 6f 67 67 6c 65 20 36 20 74 69 6d 65 73 21 29",
        ],
      },
      {
        category: "New settings options",
        items: [
          "Toggle for ripple",
          "Toggle for haptics",
        ],
      },
      {
        category: "New for mobile",
        items: [
          "visible title + desc and pin preview for /lens page on mobile",
          "accurate M3E Mobile navbar proportions (PILL_H, isActive py-3)",
        ],
      },
      {
        category: "/info Page changes",
        items: [
          "added shared InfoCardHeading for readmepage title consistency + rephrase texts and some titles",
          "spaned 'explore releases' button across whole card for mobile",
        ],
      },
      {
        category: "Polishing and other fixes",
        items: [
          "made separator in home page thicker and rounded + reused it in /info",
          "centered mini-blog preview title + date not being aligned",
          "rephrased settings menu page descriptions",
          "hid 'share' button on guestbook page in mobile",
          "added a gap at the bottom of the signing guestbook footer on mobile devices",
          "renamed the majority of the site to go along with stabbed.wtf rather than now deprecated virex.lol",
          "fixed refresh icon in /now for mobile mode",
          "centered GFM tables on mobile",
          "centered 'To Top' button for mobile",
          "fixed spacing for /music and made <a> tag undraggable as it was before",
          "symmetrical rounding for /music page",
        ],
      },
      {
        category: "Bug fixes",
        items: [
          "fixed text-cutoff mobile navbar bug",
          "fix haptic ripple bug",
          "(MOBILE) fixed mobile scrollbar interaction (blog filters)",
          "fixed ripple scrolling issue (fix: timed touch press)",
          "fixed border for curl terminal",
        ],
      },
    ],
  },
  {
    id: "saverestore-touches-and-bug-fixes",
    version: "2026.09.20",
    title: "Save/restore touches and bug fixes",
    date: "Sep 20, 2026",
    changes: [
      {
        category: "Input field component",
        items: [
          "implemented new m3-inspired input field component",
        ],
      },
      {
        category: "Restore config",
        items: [
          "overhauled layout, styling, and made the whole restoring config section more intuitive and expected",
        ],
      },
      {
        category: "Copy config link + Export as JSON buttons touches",
        items: [
          "(copied from copylink used in blog) now has hover animations, checkmarks, and text variety.",
        ],
      },
      {
        category: "Technical",
        items: [
          "fixed blog filter items exploding",
          "fixed command palette search ripple",
        ],
      },
    ],
  },
  {
    id: "site-m3e-accurate-overhaul",
    version: "2026.09.19",
    title: "site m3e-accurate overhaul",
    date: "Sep 19, 2026",
    changes: [
      {
        category: "sidebar",
        items: [
          "got rid of inaccurate borders, and replaced sidebar styling with borderless sideitem m3e-accurate styling.",
          "improved footer actions, added more microanimations (virex sidebar hero text fadein/out)",
          "socials now show in collapsed sidebar which animates really fluently",
          "introduced expressive tooltip for collapsed sidebar mode",
          "completely re-styled the collapse button",
          "introduced much cleaner active indicator pill switch animations",
          "wrapped paletteHotkeyLabel sidebar hint into kbd keycap style",
        ],
      },
      {
        category: "features",
        items: [
          "global user-configurated font scaling slider!",
          "removed highhz (since it's already baked in and no longer needed as an option)",
          "drastically improved focusmode for actual use",
        ],
      },
      {
        category: "settings",
        items: [
          "completely overhauled settings (sorting, naming, context, etc.)",
          "improved styling and put everything into containers.",
          "[mobile] add a rubber band curve for a more native feel of overdragging",
        ],
      },
      {
        category: "command palette",
        items: [
          "overhauled most of it's stling with better typography, dynamic spanning, positioning, improved animations, and much more.",
        ],
      },
      {
        category: "ripple",
        items: [
          "added a ripple component (which is now used throughout most of the site) which expands a circle throughout a whole button depending where you click (directly inspired from m3)",
          "applied ripple throughout almost every button on the site",
        ],
      },
      {
        category: "technical",
        items: [
          "improved material icon rendering",
          "fixed collapsed sideitems hovering bug",
          "fixed inheritance issues",
          "fixed font stretch icon issues",
          "fixed reverse overshoot curves",
          "fixed sibling layout projections",
          "reduced ~927 lines of dead/useless code throughout the codebase",
          "fixed firefox-exclusive rendering/artifacting issues using more corner clipping and mask properties",
        ],
      },
    ],
  },
  {
    id: "small-touches-update",
    version: "2026.08.14",
    title: "small touches update",
    date: "Sep 14, 2026",
    changes: [
      {
        category: "New projects",
        items: [
          "added `torr` and `demarkify` projects to the projects section of the homepage.",
        ],
      },
      {
        category: "(Major changes) Weather Widget",
        items: [
          "redefined condition mapping",
          "fixed units mismatch",
          "added a toggle for metric units",
          "added an automatic background refresh interval (15 min auto-refreshing)",
          "added switching from virex (my) location, to user local location, along with preferences in settings",
        ],
      },
      {
        category: "Command Palette changes",
        items: [
          "made the search bar more expressive (animations, clear, etc.)",
        ],
      },
      {
        category: "Mobile mode changes",
        items: [
          "imrpoved music-related components and scaling for mobile devices",
        ],
      },
      {
        category: "Curling stabbed.wtf",
        items: [
          "running `curl https://stabbed.wtf` will now output a card in which essentially lets you navigate the site in your terminal. have fun!",
        ],
      },
      {
        category: "Other changes",
        items: [
          "fixed scrollbar positioning",
          "fixed env issues and fallbacks for LASTFM_CONFIG if runtime env object doesnt have keys set explicitly",
          "fixed env parsing",
          "improved bot ssr handling",
        ],
      },
    ],
  },
  {
    id: "memory-reduction-overhaul",
    version: "2026.08.17",
    title: "memory reduction overhaul",
    date: "Aug 17, 2026",
    changes: [
      {
        category: "font trim",
        items: [
          "stripped 11 unused google font families from the global stylesheet, including noto sans JP, KR, SC, arabic, and hebrew. CJK font tables alone were inflating memory usage by 150MB+ on EACH page load..",
          "removed redundant roboto flex google import since the site already loads google sans flex locally",
          "removed outfit, space grotesk, syne, bricolage grotesque, unbounded, and inter, none are used anymore.",
          "kept jetbrains mono (for code blocks) as the sole external font import. everything else is self-hosted. :)",
        ],
      },
      {
        category: "asset optimization",
        items: [
          "converted sidebar pfp from a 1254x1254 PNG (1.8MB) to a 256x256 WebP (11KB). that's a 99.4% file size reduction!",
          "updated app.tsx to load main.webp instead of main.png, decoded bitmap memory drops from ~8MB to a fraction of that.",
        ],
      },
      {
        category: "build & bundle",
        items: [
          "configured clean rollup vendor chunking: vendor-react, vendor-motion, and the blog page syntax highlighter are now properly isolated chunks.",
          "eliminated the 25 micro-chunk dynamic import wrappers that were adding V8 module record overhead.",
        ],
      },
      {
        category: "debug view",
        items: [
          "gated DebugView behind settings.debugMode so the console hijack and overlay never mount in a normal session.",
          "moved global console.log/warn/error intercept into a lazy initConsoleHijack() that only runs when the debug panel actually mounts.",
        ],
      },
    ],
  },
{
    id: "now-playing-finally",
    version: "2026.08.09_2",
    title: "Now playing (finally!)",
    date: "Aug 9, 2026",
    changes: [
      {
        category: "now playing",
        items: [
          "added a live last.fm widget to /now showing currently playing tracks.",
          "implemented backend edge function handling for last.fm api data.",
          "cleaned up hardcoded fallback strings and strictly enforced environment secrets.",
          "survived an ai agent attempting to commit API keys across four different files.",
        ],
      },
      {
        category: "other site updates",
        items: [
          "updated rss feed generation and static asset builds",
          "refactored component state tracking for live player updates",
        ],
      },
    ],
  },
  {
    id: "command-palette-ui-overhaul",
    version: "2026.08.09",
    title: "command palette + ui overhaul",
    date: "Aug 9, 2026",
    changes: [
      {
        category: "command palette",
        items: [
          "added a keyboard-driven command palette activated with ⌘K, Ctrl+K, or Ctrl+Shift+P. all shortcuts are optional.",
          "added cards and lists views. lists use a classic stacked command layout, while cards use double-stacked left/right navigable cards.",
          "added search scopes for everything, pages, commands, and blog posts.",
          "added configurable result limits to control how many results appear before scrolling/searching.",
          "added recent actions, showing recently selected commands when the palette opens with no search.",
          "added keyboard navigation modes: standard, wrap, and 2d grid.",
          "added hover suppression, allowing keyboard selection without mouse hover movement.",
        ],
      },
      {
        category: "functionality",
        items: [
          "fixed `vire.config.ts` so the local server actually works.",
          "fixed the `api/index.ts` express server.",
          "fixed guestbook right-side offset when usernames are too long by truncating them.",
          "fixed wrapping on the upload file button when importing config.",
          "fixed abrupt cutoff on `Paste sharing link/code here` on smaller screens.",
          "fixed the sidebar collapse animation being too liquidy.",
          "fixed duplicate transitions causing inconsistent animations.",
          "fixed weather icon positioning.",
          "fixed the inverted rounded hover logic on BugReportDialog footer actions.",
          "fixed floating sidebar sideitems being too small.",
          "fixed guestbook right-side offset for long usernames.",
          "fixed mobile popup gaps when overdragging guestbook, settings, known issues, bug report, and other dialogs.",
        ],
      },
      {
        category: "mobile",
        items: [
          "hidden desktop-only options on mobile and added disclaimers to affected pages.",
          "made the mobile debug view more compact.",
          "fixed the date alignment on the ancbar for mobile layouts.",
          "adjusted Readme page footer buttons to avoid a cramped triple-button layout.",
          "fixed KnownIssuesDialog spacing on mobile.",
          "fixed popup overdrag gaps across mobile dialogs.",
          "fixed the featured row from wrapping unexpectedly.",
          "improved truncation and sizing across several mobile-sensitive elements.",
        ],
      },
      {
        category: "ui",
        items: [
          "added more consistent borders and spacing throughout the blog page.",
          "adjusted rounded elements across the interface and added larger borders to the top-to-bottom control.",
          "added larger borders to the copy link capsule.",
          "lowered the `--outline-variant` ring opacity on the sidebar collapse button.",
          "made BugReportDialog borders more consistent.",
          "added consistent borders and spacing to debug window controls.",
          "added padding to debug window items to prevent content from clipping into the scrollbar.",
          "made the guestbook preview border more consistent.",
          "adjusted Guestbook and other popup spacing for better visual consistency.",
          "improved card metadata spacing so dates and icons do not wrap awkwardly.",
          "made the featured date wrapper `min-w-0` and truncated its inner span.",
          "removed `hover:border-[var(--surface-variant)]` from non-clickable cards.",
          "reduced hover animations on non-clickable cards.",
          "modified BounceButton to use less exaggerated animations and support full-width card layouts.",
          "added BounceButton to project cards.",
          "removed the blur and `gradient-to-br` effect from the Readme page.",
          "adjusted the guestbook chevron-right icon size.",
        ],
      },
      {
        category: "content",
        items: [
          "renamed the Readme page section from `a mission` to `philosophy` and adjusted its sizing.",
          "rephrased `i don't design things i wouldn't use.` to `i never ship what i don't use.`",
          "removed the extra read checkmark icon from the opened blog view when a post is already read.",
        ],
      },
      {
        category: "cleanup",
        items: [
          "removed unnecessary project files and leftover Vercel configuration.",
          "renamed `2.svg` to `favicon.svg` for clarity.",
        ],
      },
    ],
  },
  {
    id: "accessibility-update-dash-page-drop",
    version: "2026.08.07",
    title: "Accessibility update & /dash page drop",
    date: "Aug 7, 2026",
    changes: [
      {
        category: "Accessibility",
        items: [
          "Added keyboard accessibility to the site",
          "Added proper ARIA semantics",
          "Added meaningful labels on close/back buttons",
          "Improved accessibility globally including settings modal so overlay blocks background interaction and screen readers get a clear dialog context",
        ],
      },
      {
        category: "Routing",
        items: [
          "Removed /dash and cleaned up its sidebar/navigation references.",
          "Marked /now as the last sidebar item so the nav end state behaves right",
        ],
      },
    ],
  },
  {
    id: "floating-navbar-for-mobile-mode",
    version: "2026.08.06",
    title: "Floating navbar for mobile mode!",
    date: "Aug 6, 2026",
    changes: [
      {
        category: "Navbar changes",
        items: [
          "completely dropped the old navbar, replaced it with a floating capsule + squircle styled floating navbar",
        ],
      },
    ],
  },
  {
    id: "typography-and-text-cleanup-update",
    version: "2026.08.05",
    title: "Typography and Text Cleanup Update",
    date: "Aug 5, 2026",
    changes: [
      {
        category: "Update info",
        items: [
          "Hi! This isn't really normal for me to put a info section, but I have to warn; this update is HUGE. stabbed.wtf 3.0.0 is here and it's brining quite a bit to the site :)",
        ],
      },
      {
        category: "Typography changes",
        items: [
          "This is the big one, the site now uses Google Sans Flex which is self-hosted. (variable font, GRAD,ROND,opsz,slnt,wdth,wght all of it.)",
          "This also comes with changes like dropping non-latin names for HelloVirex and using other extended-latin language/pronounciation instead.",
        ],
      },
      {
        category: "Text changes",
        items: [
          "The site now uses generally proper grammar, since I had some time to work on the polishing there.",
        ],
      },
      {
        category: "/No page drop",
        items: [
          "Retired the /No page, as it never really served much of a purpose to the site.",
        ],
      },
      {
        category: "Other changes",
        items: [
          "Refactored 404 page (now uses a proper icon, better animation logic, and better cases that actually makes sense instead of duplicates)",
          "Rephrased all /home page project descriptions",
          "Added borders for /dash recent links view",
          "Added sidewheel scrolling to the Lens page expanded view",
          "Fixed Pin icon container not being sized correctly",
          "Fixed sidebar collapse button and revamped it's animation logic",
          "Full M3Scrollbar overhaul (overdrag, track logic, all revamped 300+ lines changed alone)",
        ],
      },
    ],
  },
  {
    id: "hello-haptics-and-variable-dash-font-better-recent-links-view-back-gestures-and-more",
    version: "2026.07.31",
    title: "hello, haptics! (..and variable /dash font, better recent links view, back gestures, and more!)",
    date: "Jul 31, 2026",
    changes: [
      {
        category: "complete haptics system!",
        items: [
          "finalized the haptics system and added tons of haptics across the whole site!",
        ],
      },
      {
        category: "/dash changes",
        items: [
          "added a variable font that grows/bolds as you type!",
          "fixed blur container not being on the correct card",
        ],
      },
      {
        category: "other changes",
        items: [
          "made 'to top' even better: it is now bigger on desktop and the circular container around the shape on mobile is gone as well.",
          "better back gestures: added a better back gesturing system to prevent accidental site closing (based on window.history and modal states.)",
        ],
      },
    ],
  },
/* 
  {
    id: "",
    version: "",
    title: "",
    date: "",
    changes: [
      {
        category: "",
        items: [
          "",
        ],
      },
    ],
  }, 
*/
  {
    id: "icon-overhaul-with-palettes-and-working-weather-update",
    version: "2026.07.24",
    title: "Icon Overhaul and Working Weather Update!",
    date: "Jul 24, 2026",
    changes: [
      {
        category: "icon update",
        items: [
          "Now using modified material symbols rounded, which are tweaked for the site.",
        ],
      },
      {
        category: "weather",
        items: [
          "The weather widget now works correctly, finally removing the placeholders and using openmeteo API, after some years.",
        ],
      },
      {
        category: "palettes",
        items: [
          "added color palletes (such as tonal spot, fidelity, content, neutral, expressive, and fruit salad) and options to switch between them. things are much lighter on dark mode, as well.",
        ],
      },
      {
        category: "lens dynamic theming",
        items: [
          "added fully-local lens dynamic theming, which expanding or browsing Lens photos dynamically recolors the theme from the images vivid dominant color."
        ],
      },
      {
        category: "other changes",
        items: [
          "added reading progress indicator into blog and fixed other site-crashing bugs"
        ],
      },
    ],
  },
  {
    id: "many-revamps-update",
    version: "2026.07.22",
    title: "'Many revamps!' Update",
    date: "Jul 22, 2026",
    changes: [
      {
        category: "To Top button overhaul",
        items: [
          "completely redesigned the button for mobile and desktop and added 3 cycling icon options to choose from!",
        ],
      },
      {
        category: "Announcement bar refresh",
        items: [
          "basically a whole overhaul. literally everything here changed for the better.",
        ],
      },
      {
        category: "other tweaks",
        items: [
          "added subtly contrasted button and modal icons and added spin microanimation for all modal close button hover interactions.",
        ],
      },
      {
        category: "Mobile fixes",
        items: [
          "added dynamic edge-detection scaling for mobile hero headers",
          "made report + known issues pages use same settings 5% gap from top logic",
        ],
      },
    ],
  },
  {
    id: "typography-and-info-rework",
    version: "2026.07.16_2",
    title: "Typography and info rework",
    date: "Jul 16, 2026",
    changes: [
      {
        category: "new readme text rework",
        items: [
          "revamped bio text",
          "fully rewrore the backstory and sizing",
          "fixed mission sizing and text size + rewrote main content",
          "overhauled terminal typography and sizing for mobile and desktop",
          "renamed 'the stack' to 'my stack' for clarity + fixed some typography",
          "updated fingerprint and revamped archival text",
        ],
      },
      {
        category: "home changes",
        items: [
          "made virex show first again instead of вирекс",
          "fixed hero sizing on mobile",
          "improved RoleTicker animations and typography + capitalize instead of uppercase",
          "rewrite 'I make stuff that works the way it's supposed to. simple, efficient, and intentional.' to a friendlier slogan 'i like simple, non-stressful setups and code that doesn't need a manual :)'",
        ],
      },
      {
        category: "sidebar changes",
        items: [
          "fixed independent dev sizing",
          "improved virex user typography",
          "renamed 'Directory navigation' to 'Endpoint navigation' and revamped both of their sizing and fonts",
        ],
      },
    ],
  },
  {
    id: "settings-pages-sorting-and-more-user-experience",
    version: "2026.07.16",
    title: "Settings pages, sorting, and more user experience.",
    date: "Jul 16, 2026",
    changes: [
      {
        category: "mobile settings",
        items: [
          "grouped everything into clean pages, and added nice transitions.",
        ],
      },
      {
        category: "desktop settings",
        items: [
          "added a sidebar for pages, with all buttons being motion.buttons.",
        ],
      },
      {
        category: "general settings changes",
        items: [
          "renamed titles, sorted everything into different categories, added clean transitions globally.",
        ],
      },
      {
        category: "other changes",
        items: [
          "fixed debug mode exit on close",
        ],
      },
    ],
  },
  {
    id: "guestbook-addition-and-shorten-page-ux-fixes",
    version: "2026.07.14",
    title: "guestbook addition and shorten page ux fixes",
    date: "Jul 14, 2026",
    changes: [
      {
        category: "guestbook addition",
        items: [
          "added a page at the bottom of the home to leave a message about the site or even communicate with eachother!",
        ],
      },
      {
        category: "shorten/dash page ux fixes",
        items: [
          "fixed the containers, and revamped open animations.",
        ],
      },
    ],
  },
  {
    id: "info-page-fresh-air-update",
    version: "2026.07.11",
    title: "Info page fresh air update",
    date: "Jul 11, 2026",
    changes: [
      {
        category: "settings",
        items: [
          "added a toggle for info page fullscreen",
        ],
      },
      {
        category: "github heatmap",
        items: [
          "added contribution heatmap at the bottom of the info page",
        ],
      },
    ],
  },
  {
    id: "retire-loom-and-tracker",
    version: "2026.07.10",
    title: "Retire Loom and Tracker",
    date: "Jul 10, 2026",
    changes: [
      {
        category: "loom",
        items: [
          "Completely scraped loom from the codebase as I'm currently not focused on it. :(",
        ],
      },
      {
        category: "tracker",
        items: [
          "Removed tracker, like loom, as I wasn't updating it, and it seemed too confusing/random for viewers.",
        ],
      },
      {
        category: "what's actually new?",
        items: [
          "Dash: Fully overhauled the URL shortener/dash page. It's now aimed for an input-first style, and has a floating input-bar now! It's also better for mobile than ever before!",
          "Now page: A page that actually has more info about me, and what I'm learning. Such as: What I'm building, learning, reading, and listening to right now.",
          "Lens pinning: Added pins to the Lens gallery, for my curated/favorite images :)",
          "Photo dates: added dates to all photos in Lens.",
          "Date sorting in Lens: Lens page photos are finally sorted by date properly.",
        ],
      },
    ],
  },
  {
    id: "completely-overhauled-debug-view",
    version: "2026.07.08_3",
    title: "completely overhauled debug view",
    date: "Jul 8, 2026",
    changes: [
      {
        category: "debug view",
        items: [
          "overhauled the menu and completely rewrote it",
          "added new features exclusive to the menu (e.g. slow animations, vinyl mode)",
          "separated component",
        ],
      },
      {
        category: "other changes",
        items: [
          "rewrote the text for warn turning on debug mode",
          "renamed FoolsPopup for better clarity",
          "recolored lots of stuff for ux",
        ],
      },
    ],
  },
  {
    id: "fix-the-bento-lag-once-and-for-all",
    version: "2026.07.08_2",
    title: "fix the bento lag once and for all",
    date: "Jul 8, 2026",
    changes: [
      {
        category: "fix desktop bento grid",
        items: [
          "optimized image assets",
          "added view-based deferred rendering (lazy loading)",
          "added gpu compositor friendly overlay borders",
          "better card and image hover scaling to fix anim stutters",
          "fixed webkit border-rad aliasing and jagged edges",
          "removed static will-change overrides for actually usable window resizing",
        ],
      },
    ],
  },
  {
    id: "overhauled-to-top-and-fix-mobile-focus-mode",
    version: "2026.07.08_2",
    title: "Overhauled to top and fix mobile focus mode",
    date: "Jul 8, 2026",
    changes: [
      {
        category: "focus mode",
        items: [
          "fixed view for mobile, so it unblurs as you scroll, rather than needing to tap every card and piece of content as you go.",
        ],
      },
      {
        category: "to top redesign",
        items: [
          "made the chip shorter, which looks significantly better.",
          "made it expand when scrolling down and slightly up on mobile.",
          "more expressive animations for both",
        ],
      },
      {
        category: "exit focus mode logic for mobile",
        items: [
          "mobile and desktop now shows different text, without showing the `esc` hint",
        ],
      },
    ],
  },
  {
    id: "markdown-overhaul-and-archives",
    version: "2026.07.07_2",
    title: "markdown overhaul & archives",
    date: "Jul 7, 2026",
    changes: [
      {
        category: "markdown",
        items: [
          "overhauled markdown components with full dynamic oklch theming support",
          "refactored code blocks to adapt syntax colors based on the primary hue",
          "fixed blockquote vertical alignment and added premium styling with 120px min-height",
          "removed static highlight.js theme dependencies for a more cohesive UI",
        ],
      },
      {
        category: "archives",
        items: [
          "restored 6 additional legacy posts from early 2026",
          "revamped the markdown stress test post with comprehensive technical examples",
        ],
      },
    ],
  },
  {
    id: "home-page-announcement-bar-addition",
    version: "2026.07.07",
    title: "Home page announcement bar addition!",
    date: "2026.07.07",
    changes: [
      {
        category: "announcement bar addition",
        items: [
          "added a new announcement bar as a full-width card under the philosophy card, fixing the multi-focal-point conflict for ux on the homepage.",
          "smooth scroll integration: linked the explore CTA directly down to the projects section, passing secondary widgets.",
        ],
      },
    ],
  },

  {
    id: "blog-ux-polish-scrollbar-makeover",
    version: "2026.07.06",
    title: "Blog UX Polish & Scrollbar Makeover",
    date: "2026.07.06",
    changes: [
      {
        category: "bug fixes",
        items: [
          "back to feed: fixed a weird bug where the 'back to feed' button did nothing after reading a post, it was using window.history.back() which breaks on direct URL visits and refreshes. now, it uses the internal SPA router so it SHOULD always work.",
        ],
      },
      {
        category: "micro-animations",
        items: [
          "back to feed button: upgraded from plain CSS hover to a motion.button with spring variants. the whole button springs left and scales up on hover, and the icon independently bounces further left, now giving it a pulling feel.",
          "copy link button: added a spring hover lift (y: -4) with a growing shadow, a 'press down' on tap, and a proper bouncy scale on click instead of the old flat pulse.",
          "copy link icon swap: the link/check icons now spin in and out with spring physics instead of a plain opacity fade, link exits rotating -45* and check enters spinning from -90*.",
          "copy link text swap: 'copy link' / 'link copied!' now slides up/out and down/in with Animate Presence instead of just a static text swap.",
        ],
      },
      {
        category: "m3 scrollbar refinements",
        items: [
          "new scrollbar: added new m3e scrollbar in replacement of the old native-like scrollbar.",
          "removed scrollbar for mobile: entirely removed the scrollbar for mobile for a cleaner interface on mobile screens",
          "cat cat meow"
        ],
      },
    ],
  },

  {
    id: "settings-ux-theme-switcher-overhaul",
    version: "2026.07.05_4",
    title: "Settings UX & Theme Switcher Overhaul",
    date: "2026.07.05",
    changes: [
      {
        category: "theme switcher redesign",
        items: [
          "pill / pills: replaced the single long capsule with three individual m3e buttons, all with better in/out corners logic.",
          "bouncy scale: each button now scales up with a physics pop when active and squishes on tap :)",
          "fill animation: the active background fades and scales in/out independently per button instead of sliding across the gap, which fixed clipping.",
        ],
      },
      {
        category: "mobile settings sheet",
        items: [
          "rounded top: the mobile settings sheet now has rounded top corners (2rem) in both peeking and fullscreen states.",
          "removed back button: replaced the clutter-y back button with a clean SettingsIcon on the left and an X button on the right, now matching the desktop layout better",
        ],
      },
      {
        category: "better 120hz gestures",
        items: [
          "native touch events: added custom touch handlers to bypass framer-motion overhead for no janky GPU dragging",
          "useMotionValue: added motion values to update position directly in touch handlers, bypassing react renders for 120fps dragging",
          "velocity tracking: 5-sample moving window tracks px/s velocity for a snappy drag-to-dismiss calculation.",
        ],
      },
      {
        category: "peeking default state",
        items: [
          "12% gap: added a 12% top viewport gap at the top of the settings menu to get near-native android backdrop sheets.",
          "scroll-to-fullscreen: new scrolling-to-drag handover now enables easy fullscreen-to-peek snapping.",
          "snap physics: custom spring physics snap sheet for precise 12% peek or 0% fullscreen anchor thing.",
          "drag anywhere: edge-to-edge dragging works globally whenever internal content is at scroll-top!",
        ],
      },
    ],
  },
  {
    id: "bug-reporting-and-known-issues",
    version: "2026.07.05_2",
    title: "Bug Reporting & Known Issues",
    date: "2026.07.05",
    changes: [
      {
        category: "new features",
        items: [
          "added a server-secure bug reporting program with title, description, and screenshot capability.",
          "added drag and drop, file upload, and clipboard paste (Ctrl+V) support for screenshots.",
          "added a known issues viewer so users can check addressed bugs directly from the feedback panel.",
        ],
      },
      {
        category: "security",
        items: [
          "routed all bug reports through a server sided proxy endpoint, keeping the webhook url's safely hidden to stop spam.",
        ]
      },
    ],
  },
  {
    id: "global-animation-controls",
    version: "2026.07.05",
    title: "Global Animation Controls",
    date: "2026.07.05",
    changes: [
      {
        category: "new settings",
        items: [
          "finally added the diable animations option to settings to turn off motion and transition effects.",
          "added a custom confirmation dialog to prompt the user to reload the page to apply the settings cleanly.",
        ],
      },
      {
        category: "other",
        items: [
          "fix card hover globally (caused from conflict with disableAnimations, now fixed since full implementation)"
        ]
      },
    ],
  },
  {
    id: "mobile-consistency-rework",
    version: "2026.06.09_2",
    title: "Mobile Consistency Rework",
    date: "2026.06.09",
    changes: [
      {
        category: "Settings changes",
        items: [
          "moved settings to a more immersive, true-to-design page that doesnt look like a copy-paste of desktop's settings modal.",
          "introduced a gesture to close settings menu",
          "added a better blur background behind the menu",
        ],
      },
      {
        category: "Dash page overhaul",
        items: [
          "reduced the massive 100px and 9xl headers to a clean 6xl on mobile, FUCK the cut-offs.",
          "got rid of extra useless padding and font size of fields on mobile so they actually fit on your phone",
          "adjusted the link creation button to a better height and padding on mobile",
          "tightened up the padding in the bento cards and sections which also got rid of some extra whitespace"
        ],
      },
      {
        category: "Other changes",
        items: [
          "fixed the /tracker header sizing on mobile",
          "made the read entry button in /blog actually look decent"
        ],
      },
    ],
  }, 
  {
    id: "even-more-consistency",
    version: "2026.06.09",
    title: "Even More Consistency",
    date: "2026.06.09",
    changes: [
      {
        category: "Bug fixes (Bento crash)",
        items: [
          "fixed bento crash (updateSettings was being recreated on every render because it wasn't wrapped in useCallback, so any component using updateSettings in a useEffect dependency array would trigger the effect again whenever the theme changed, causing a chain reaction and resulting in a crash)",
        ],
      },
      {
        category: "Fixes added",
        items: [
          "removed unused/undeclared glareRef (+ the glare is already controlled via CSS variables anyway)",
          "optimized updateSettings and cycleTheme with useCallback to stop the re-render loops",
        ],
      },
      {
        category: "Cleaned some lint errors",
        items: [
          "fixed invalid ease: \"spring\" changed to \"linear\" for background rotation)",
          "fixed SettingsDialog transition types using as const",
          "fixed missing type import in Example"
        ],
      },
    ],

  },
  {
    id: "qol-update",
    version: "2026.06.06",
    title: "Quality of Life and Consistency Update",
    date: "June 06, 2026",
    changes: [
      {
        category: "Lens Changes",
        items: [
          "Lag: Resolved some issues with hover lag, i'm still trying to pinpoint the issue.",
          "Bento changes: Fixed gaps in bento, looks a LOT cleaner.",
        ],
      },
      {
        category: "Typography changes!",
        items: [
          "different sizes, types, defaults, too much to really mention",
          "Commit 3cb65c1, for more info",
        ],
      },
      {
        category: "widgets",
        items: [
          "new widget: a new, minimal, material expressive weather widget!",
          "overhauled widgets: completely recoded the \"software should be readable...\", \"yearprog\", and \"I don't ship things i wouldnt use...\" widgets to match the new weather widget!",
        ],
      },
      {
        category: "sidebar consistency v2",
        items: [
          "added a thicker bottom border, overhauled page typeface, profile card fonts, and redid the \"pages\" header.",
        ],
      },
    ],
  },
  {
    id: "expressive-consistency-overhaul",
    version: "2026.06.05",
    title: "Expressive and Consistency Overhaul Update!",
    date: "June 05, 2026",
    changes: [
      {
        category: "fonts",
        items: [
          "font types: added new font types such as font-expressive, and font-expressive-bold",
          "site revamp: revamped pages such as the readme, which uses new font types and other sizing changes. home also gets these new changes, and so does every header.",
          "sidebar/navigation: used new font types on every navigation type.",
        ],
      },
      {
        category: "other changes",
        items: [
          "codebase: separated the codebase into many multiple files, finding and managing code is way cleaner.",
          "lens: fixed some lag that occured when scrolling on lag. - note, this bug is still happening BUT i managed to trim it down.",
          "redirects: fixed readme page from showing background hue saturation insanely bright when jumping stright to stabbed.wtf/readme",
          "favicon: added fallback for crawlers that don't like the dynamic favicon.",
        ],
      },
      {
        category: "other notes",
        items: [
          "one of my most complicated updates yet.",
          "this was made with much love <3"
        ],
      },
    ],
  },
  {
    id: "pride-month-update",
    version: "2026.06.01",
    title: "pride month update",
    date: "June 01, 2026",
    changes: [
      {
        category: "pride month special",
        items: [
          "rainbow wavy progress: implemented a liquid rainbow effect for all wavy progress bars.",
          "cycling pride flags: progress bars now dynamically cycle through Rainbow, Trans, Bi, Pan, Non-binary, and Lesbian flags every few seconds.",
          "saturation-proof: pride colors are rendered with raw hex palettes, ensuring they stay vibrant even when the rest of the site is desaturated.",
        ],
      },
      {
        category: "site integrity",
        items: [
          "maintenance: beefed up the .gitignore to keep the repo clean of build artifacts and environment secrets.",
          "gpush: another simple helper script i wrote for pushing quickly"
        ],
      },
    ],
  },
  {
    id: "mobile-performance-and-ui-visibility",
    version: "2026.05.26",
    title: "mobile performance & UI visibility",
    date: "May 26, 2026",
    changes: [
      {
        category: "mobile optimization",
        items: [
          "performance: disabled expensive SVG filters and backdrop blurs on mobile for actually smooth 60fps scrolling!",
          "battery saver: throttled background star, dots, and hero flickering animations on mobile devices.",
          "3D bento: disabled high-overhead 3D perspective and transforms for mobile screens.",
        ],
      },
      {
        category: "UI refinement",
        items: [
          "contrast: increased bento card background opacity to 60% for better readability against animated backgrounds.",
          "visibility: fixed invisible read entry text in blog on light theme by adding proper color overrides",
          "polish: increased footer separator opacity and fixed missing gap in terminal specs card title.",
        ],
      },
    ],
  },
  {
    id: "bento-hit-detection-and-aa",
    version: "2026.05.25",
    title: "3D Bento hit detection & anti-aliasing",
    date: "May 25, 2026",
    changes: [
      {
        category: "performance & stability",
        items: [
          "latency kill: removed the performance-intensive blur filters from hero animations to resolve FPS drops during initial load.",
          "svg optimization: reduced path segment density in wavy progress elements by 4x for smooth native-refresh rendering.",
        ],
      },
      {
        category: "3D bento & interactivity",
        items: [
          "unified logic: refactored all cards across Home, Blog, and Readme to share a single high-fidelity 3D tilt and glare system.",
          "sink effect: switched to a natural sink tilt behavior (tilting away from cursor) for a more premium, responsive bento feel.",
        ],
      },
      {
        category: "rendering & anti-aliasing",
        items: [
          "edge polish: removed black lines and stupid aliasing artifacts using GPU isolation and hardware backface-visibility stuff.",
          "dynamic context: made sure 3D perspective only activates when needed, keeping standard 2D hovers perfectly perfect.",
        ],
      },
    ],
  },
  {
    id: "lens-overhaul-and-telemetry",
    version: "2026.05.24",
    title: "lens lightbox fix & debug telemetry",
    date: "May 24, 2026",
    changes: [
      {
        category: "lens photography",
        items: [
          "lightbox recovery: fixed the expanded image lightbox layout, allowing borders and shadows to hug the photo aspect ratio.",
          "clipping correction: correctly routed anti-bleeding fixes (rounded-inherit and webkit-masking) to the grid preview items instead of the lightbox container.",
        ],
      },
      {
        category: "ui & styling",
        items: [
          "sidebar spacing: hid the 'Pages' label header on short windows and expanded navigation item gaps to stop outline rings from overlapping.",
          "pages icon: updated the sidebar 'Pages' icon to use a soft, muted surface background and a smooth 32% squircle border-radius.",
          "spring tuning: refined navigation spring solvers to settle with a smooth, premium feel and no excessive wiggling.",
          "scroll shadows: fixed scroll shadows/masks to load instantly on page refresh without needing a manual scroll trigger.",
        ],
      },
      {
        category: "developer telemetry",
        items: [
          "debug logging: integrated dry, lowercase console telemetry across page routing, image preloads, copy actions, and error catch events.",
        ],
      },
    ],
  },
  {
    id: "blog-filters-and-readme-polish",
    version: "2026.05.21_hotfix",
    title: "blog filters & readme consistency polish",
    date: "May 21, 2026",
    changes: [
      {
        category: "blog immersive UI",
        items: [
          "FILTERS ARE HERE! added a bounce filter system for the blog page with unique capsule state styling.",
          "better scaling: fixed 'read entry' button text stacking on mobile by adding dynamic padding and font-size scaling.",
          "tech: redesigned blog category tags to match the chip styling of the readme page.",
          "better motion: removed more CSS transition conflicts to enable zero latency spring physics on all blog interactions.",
        ],
      },
      {
        category: "readme refinement",
        items: [
          "better bento: added a 2-1-1-2-2 mobile grid pattern for the bio page.",
          "marker highlights: replaced generic bio highlighted text with a custom-styled, rotated 'marker' highlight effect.",
          "header scaling: added better icon and typography scaling to stop card headers from crowding borders on mobile.",
        ],
      },
      {
        category: "footer & global polish",
        items: [
          "footer stability: fixed footer buttons to keep consistent widths on mobile, preventing awkward line stacking layouts.",
          "spring tuning: refined global spring solvers for a smoother, less jittery interaction feel across all bento components. trust me, you'll feel the difference :)",
        ],
      },
    ],
  },
  {
    id: "readme-overhaul-and-motion",
    version: "2026.05.21",
    title: "the readme makeover & more motion",
    date: "May 21, 2026",
    changes: [
      {
        category: "new immersive UI",
        items: [
          "matrix hero: completely overhauled the Readme page into an immersive bio that slides the sidebar away for total focus.",
          "solar composition: redesigned the background into a static diagonal solar arrangement with a pulsing primary-colored core.",
          "virex flicker: added a persistent and fluent character-flickering effect to the hero header.",
        ],
      },
      {
        category: "bento physics & polish",
        items: [
          "universal shift: synchronized all bento cards with high-stiffness spring physics (stiffness 400), enabling instant 'shift-up' hover feedback.",
          "identity section: added a high-impact bio section with a bold sans-serif font to replace the previous 'corporate' sharp look.",
          "rounded aesthetics: swapped hero font to font-bold-sans.",
        ],
      },
    ],
  },
  {
    id: "performance-stability-overhaul",
    version: "2026.05.18",
    title: "performance & stability changes",
    date: "May 18, 2026",
    changes: [
      {
        category: "core optimization",
        items: [
          "April Fools logic: centralized IS_APR logic to a global constant, finally getting rid of hundreds of potential redundant Date object creations per second.",
          "memory management: fixed potential leaks and re-render loops in sidebar navigation and theme provider.",
        ],
      },
      {
        category: "rendering performance",
        items: [
          "component memoization: memoized all major page components (Home, Blog, Lens, etc.) and core building blocks (Card, SideItem, BotNav) to minimize main-thread load.",
          "WavyProgress SVG: optimized background SVGgen by reducing segment density and lowering fps for smoother wavyprogress animations.",
          "stable identity: now using useCallback for the global 'goto' function to prevent unnecessary child re-renders.",
        ],
      },
      {
        category: "UX & animation refinement",
        items: [
          "settings animation: resimplified the settings modal transition to a more performant fade/scale effect, getting rid of more lag issues on mobile and low-end devices.",
          "modal stability: improved touch-target feedback and removed heavy layout-morphing logic for a more responsive feel.",
        ],
      },
    ],
  },
  {
    id: "desktop-mode-overhaul",
    version: "2026.05.13",
    title: "settings & animation overhaul",
    date: "May 13, 2026",
    changes: [
      {
        category: "sidebar & navigation",
        items: [
          "page menu effects: added lots of effects to the sideitem's container in the sidebar (shadows, animations, etc)",
          "scrolling buttons: since pages now collapse when the window is too short, you can now press a button to scroll for you!",
          "collapsed sidebar state: fixed pills and centered them correctly this time",
          "centered side items: balanced the navigation rail items by horizontally centering them in the sidebar on desktop.",
          "squish: added bouncy, rotating spring animations to the scroll buttons. they squish when you click and pop in with some flair.",
        ],
      },
      {
        category: "settings modal & animation polish",
        items: [
          "settings expansion: completely overhauled the settings modal opening animation with a premium, squishy spring feel.",
          "precision morphing: moved the shared layout target to the icon container, eliminating text stretching during settings expansion/collapse.",
          "southeast bounce: added a dynamic southeast-drifting exit animation for the settings modal, providing a more fluid 'falling away' feel.",
          "markdown overhaul: completely redesigned the blog renderer with custom styles for headers, lists, and inline code. added a <spacer /> component for better vertical rhythm.",
          "changelog masonry: refactored the changelog layout to use a column-based flow, eliminating large vertical gaps between unevenly sized change groups.",
          "AMOLED mode: added a new toggle for pure black backgrounds, perfect for saving battery on OLED screens.",
          "physics locking: harmonized the spring math across the sidebar, mobile nav, and the modal itself so icons stay perfectly synchronized during expansion.",
          "theme pre-loading: pre-calculated HSL variables and disabled mount animations for custom sliders to ensure instant theme application without layout shift.",
          "stability: fixed a first-open shake bug on both mobile and desktop by stabilizing initial layout states.",
          "toggle refinement: synchronized the appearance mode toggle pill with the modal's physics, ensuring it doesn't drift during transitions.",
          "stability: fixed event bubbling and layout conflicts that caused the settings to force close when toggling focus mode.",
          "immersive sliders: implemented Material 3 Expressive style sliders for hue and saturation. ticks and handles are now vertical lines that stick out slightly beyond the track borders.",
          "bounce/squish sliders: added a juicy spring-loaded overshoot animation when dragging sliders past their boundaries, with dynamic transform origins for realistic stretching.",
          "modal stability: implemented scroll locking to prevent background displacement during quick scrolls.",
          "focus mode fixes: conditionalized layout synchronization to prevent modals from disappearing when toggling focus mode while they are open.",
        ],
      },
      {
        category: "logic changes",
        items: [
          "split the logic: actually separated the expanded and collapsed states inside SideItem.",
          "smart masking: added a CSS mask (nav-mask) that fades items out at the top and bottom.",
          "unique layout IDs: the expanded background now uses sidebar-expanded-bg and the collapsed capsule uses sidebar-mini-pill.",
          "clean transitions: since they're separate now, the expanded mode will properly fill the whole button background again without trying to follow the icon.",
        ],
      },
    ],
  },
  {
    id: "sidebar-styling-polish",
    version: "2026.05.08-B",
    title: "sidebar styling & extra polish",
    date: "May 08, 2026",
    changes: [
      {
        category: "sidebar & navigation",
        items: [
          "collapsed sidebar revamp: completely overhauled the sidebar collapsed state. featuring m3e style pills-on-icons + text below for an immersive touch!",
          "pixel-perfect centering: made sure collapsed pills to top-3px for exact vertical alignment with icons.",
          "m3 grouping: restored isFirst logic to the settings button due to a bug.",
          "visual separation: added a subtle side border to the non-floating sidebar and increased separator visibility.",
          "ux spacing: increased vertical gap between settings and expand controls in collapsed state for better ergonomics.",
        ],
      },
    ],
  },
  {
    id: "lens-overhaul-m3e",
    version: "2026.05.08",
    title: "the lens overhaul (m3 expressive!)",
    date: "May 08, 2026",
    changes: [
      {
        category: "photography overhaul",
        items: [
          "m3e ui: completely redesigned the expanded view into a sleek, floating island structure inspired by google's recent \"floating pill\" nav design.",
          "the floating islands themselves: metadata and controls are now condensed into highly-rounded capsules, providing more breathing room for the photography itself.",
          "better and more tactile feedback: added ultra snappy spring animations to navigation and close buttons, including a physical squeeze/rotate effect on click.",
          "performance and preloading: added background preloading for the carousel, making sure the next and previous pixels are ready before you even click.",
          "raw view: added a 'view raw photo' action to the info hub for one-click access to full-resolution images, without the UI getting in the way.",
          "scroll isolation: fixed a long-standing bug where the background page would scroll while an image was expanded.",
        ],
      },
      {
        category: "other changes",
        items: [
          "geometricPrecision: forced the SVG to use the highest quality rendering hints, so no more jagged steps on the curves.",
          "double segment density: doubled path resolution to keep curves looking smooth and fluid, even at high zoom levels.",
          "overflow & joins: added `overflow: visible` and `stroke-linejoin: round` to prevent tiny pixel-gaps and sharp edgs that appers on the waves."
        ],
      },
    ],
  },
  {
    id: "m3-home-overhaul",
    version: "2026.05.02",
    title: "home and consistency update",
    date: "May 02, 2026",
    changes: [
      {
        category: "home & blog fixes",
        items: [
          "Year Prog Chip: completely overhauled the year progress chip and added a WavyProgress component.",
          "Fonts: re-formatted lots of text to use the font-black instead of font-display. also reworked some of the project section including projects & research, and view project fonts.",
          "Expressive Buttons: updated the blog's 'read full entry' button to match the 'explore more' styling, including a 24px to 40px morphing border radius on hover.",
        ],
      },
      {
        category: "sidebar fixes",
        items: [
          "Overhauled PFP section: completely changed the pfp container styling itself, as well as the animations.",
          "Fixed PFP centering: resolved an alignment bug where the profile picture was off-center when the sidebar was collapsed without the profile container.",
          "Auto-hide profile container: implemented a height-based guard (720px) that automatically enforces no-container mode in compact views to prevent layout squishing.",
          "profile section: moved the profile section further left since there was indeed room to do so.",
        ],
      },
      {
        category: "settings performance",
        items: ["fixed sidebar lag upon open"],
      },
    ],
  },
  {
    id: "m3-consistency-revamp",
    version: "2026.05.01",
    title: "m3 consistency revamp",
    date: "May 01, 2026",
    changes: [
      {
        category: "material 3 expressive component overhaul",
        items: [
          "slider redesign: using vanilla material 3 expressive slider (!almost! direct port from android 16) to the settings for new saturation and overhauled hue shift.",
          "switch redesign: same as slider, now uses android 16 expressive 2-icon style switch",
          "saturation: a new customization option has arrived! saturation! you can now express your vibrancy depending on the mood or the setup, just how i like it :) - amoled potentially coming soon <3",
          "toggle grouping: added settings toggle grouping so things don't get cluttered. introduced in v1.5.7-stable (m3-revamp-patches)",
          "profile container toggle: in the *sidebar* settings, there's a new toggle! profile container switch; which just toggles the profile container. introduced in v1.5.7-stable (m3-revamp-patches)",
        ],
      },
      {
        category: "component overhaul pre-deployment fixes",
        items: [
          "switch overhaul: rewritten with pixel-perfect dimensions (52x32) and symmetric 6px handle gaps for better visuals",
          "switch stability: fixed inconsistent Y-axis positioning by standardizing centering with top: 50% and margin-top: -8px",
          "slider refinement: moved icon color transitions to CSS to prevent oklch interpolation artifacts during saturation shifts",
        ],
      },
      {
        category: "global & theme fixes",
        items: [
          'saturation fix: transitioned all variable-based color animations from MotionValue to CSS transitions to stop "random" color cycling',
          "flicker bug prevention: implemented a blocking theme-initialization script in index.html and switched to useLayoutEffect in ThemeProvider to eliminate a purple flash on reload",
          "sidebar fixes: moved sidebar background animations to style/CSS to ensure stability during rapid navigation or theme changes",
        ],
      },
    ],
  },
  {
    id: "md3-liquid-sidebar-fix",
    version: "2026.04.30-B",
    title: "liquid physics, fixes, and stability update!",
    date: "Apr 30, 2026",
    changes: [
      {
        category: "sidebar fixes & changes",
        items: [
          "profile makeover: wrapped the sidebar header in a nice rounded material container with expressive padding",
          "pfp edge fix: squashed the bleed-through bug on pfp edges by switching to ring offsets and nested clipping",
          'liquid physics: implemented "ultra-low" mass spring physics for sidebar navigation, creating a "mercury-drop" flow effect',
          "md3 update refinements: added variable stroke weights and tonal containers for navigation items, aligning with android 16/m3e design cues",
          "bug fix: squashed a hyperspecific rendering bug that caused corners to sharpen during rapid hovering",
          "performance: removed heavy filters and blurs to ensure locked 60fps during complex sidebar transitions",
        ],
      },
    ],
  },
  {
    id: "md3-tactile-vibe-shift",
    version: "2026.04.26",
    title: "MD3 makeover and tactile shift",
    date: "Apr 26, 2026",
    changes: [
      {
        category: "material design 3 makeover",
        items: [
          "sidebar overhaul: better use of vertical space and refined page section with proper M3 navigation standards",
          "sidebar cleanup: removed redundant hardware specs and quick theme toggles to focus on navigation",
          "floating sidebar: undock the sidebar with rounded corners for a modern, airy feel",
          "visual depth: added a subtle noise/grain overlay to containers for a more tactile, organic texture",
        ],
      },
      {
        category: "animations and feedback",
        items: [
          "120Hz mode: added high-refresh animation toggle for snappier, low-latency spring physics",
          'signature borders: standardized 6px "signature" borders across all cards, chips, and interactive elements',
          "hover feedback: refined hover animations for cards and chips with scale-up and border-accent effects",
        ],
      },
      {
        category: "performance and stability",
        items: [
          "lens recovery: fixed ReferenceError that caused the gallery to blank out (oops)",
          'sidebar contrast: fixed "darkened" active pill by correcting background layering',
          "lens architecture: moved border hover to ::after pseudo-elements for better paint performance",
          "GPU optimization: swapped backdrop-blur-xl for backdrop-blur-md and added will-change: transform to gallery images",
          "motion refinement: simplified gallery reveal animations to reduce simultaneous compositor work",
          "grain engine: replaced live SVG filters with a high-performance tiled background noise engine",
          "focus mode fix: optimized blur logic to skip heavy image grids, saving massive GPU cycles",
          "layer management: removed excessive will-change hints to prevent browser layer explosion",
        ],
      },
      {
        category: "debug and security",
        items: [
          "debug overhaul: added layout grid lines and technical build metrics (CPU/GPU/OS) inside the debug view",
          "safety first: implemented a confirmation modal for debug mode to prevent accidental layout confusion",
          "terminal refinement: added hover states and standardized 6px borders to the lore terminal",
        ],
      },
    ],
  },
  {
    id: "virex-shorten-launch",
    version: "2026.03.16-C",
    title: "launch: virex shorten!",
    date: "Mar 16, 2026",
    changes: [
      {
        category: "backend progress",
        items: [
          "core: a high-performance URL shortening engine using Express.js and SQLite with better-sqlite3",
          "persistence strategy: used Vercel-optimized SQLite storage using temp link state (not sorry)",
          "vanity and security: added route shadowing protection (dash, api, static, r, etc.) to prevent link hijacking of routes",
          "smart slug gen: custom 6-character hex slug generator with collision-avoidance do-while logic etc etc",
        ],
      },
      {
        category: "post fixes",
        items: [
          "source tracking: `src` tagging for analytics across web/mobile entry points",
          "responsive fash: designed the shortener dashboard with mobile first card layouts and desktop optimized tables",
          "protocol strictness: deep URL validation to make sure theres only valid http/https protocols and 2048-char length limits",
          "better vercel integration: optimized vercel.json with rewrites and serverless function routing for high density performance",
        ],
      },
    ],
  },
  {
    id: "polish-performance-patch-2",
    version: "2026.03.16",
    title: "polish and performance II",
    date: "Mar 16, 2026",
    changes: [
      {
        category: "ux and motion",
        items: [
          'FAB positioning: fixed "scroll to top" button overlapping the sidebar when flipped',
          "mobile performance: added hardware acceleration (GPU) to the mobile navbar for 120fps fluid motion",
          "card responsiveness: eliminated useless hover delays and transition conflicts across all pages",
          "spring physics: some refined card animations with high stiffness springs for better instant feedback",
        ],
      },
      {
        category: "lens and performance",
        items: [
          "proactive loading: increased lens viewport margin to 200px to trigger animations before entry",
          "priority assets: added eager loading for initial lens gallery rows to remove white flashes",
          "scroll smoothness: refined the gallery entry logic for more consistent performance during more rapid scrolling",
        ],
      },
    ],
  },
  {
    id: "the-polish-performance-patch",
    version: "2026.03.15-B",
    title: "polish and performance",
    date: "Mar 15, 2026",
    changes: [
      {
        category: "ux and motion",
        items: [
          "animation lag: fixed card hover animations to be instant and responsive, removing the exit delay",
          "fluid transitions: page transitions should now use spring physics and custom bezier curves for a bouncier feel",
          "navigation refinement: fixed active pill centering and disabled distracting tilt animations on mobile",
          "m3 compliance: removed bottom nav rounding to align with m3 standards",
          "motion GPU: optimized all major animations to run on hardware acceleration",
        ],
      },
      {
        category: "readme and identity",
        items: [
          'immersion mode: added "expand" modal functionality for technical cards, improving readability on narrow screens',
          "mobile scaling: optimized PGP fingerprint, chip text, and stack grids for better information density on mobile",
          "stack cleanup: pruned standard tech from stacks to focus on core specialties (Rust, RE, Security)",
        ],
      },
      {
        category: "settings and ui",
        items: [
          "appearance Sliding: theme mode selector now uses a smooth sliding indicator instead of abrupt switching",
          "themed hue shift: added a vibrant gradient track and live feedback to the custom color slider",
          "visual balance: fixed toggle switch padding symmetry and improved 404 page layout/spacing",
          "theme-aware lens: expanded image view now respects system theme (no longer hardcoded to dark)",
        ],
      },
    ],
  },
  {
    id: "scaling-and-changelog-migration",
    version: "2026.03.15",
    title: "visual balance",
    date: "Mar 15, 2026",
    changes: [
      {
        category: "architecture",
        items: [
          "changelog migration: decoupled devlogs from the blog feed into a dedicated system-level view",
          "routing overhaul: added support for deep linked changelog entries",
          "data schema: structured ChangelogEntry interface for better integrity",
        ],
      },
      {
        category: "UX/UI",
        items: [
          "global scaling: changed root font-size to 90% for optimized information density, things now look much better on desktop and mobile.",
          'settings integration: added "other info" section to settings for easy access to version history, instead of cluttering blog',
          "sidebar refinement: fixed sidebar height and positioning for the new global scale. stuff fits now!",
        ],
      },
    ],
  },
  {
    id: "immersion-integrity-overhaul",
    version: "2026.03.06",
    title: "immersion & integrity overhaul",
    date: "Mar 06, 2026",
    changes: [
      {
        category: "new in readme",
        items: [
          "bio overhaul: replaced filler cards with biography and mission sections",
          "PGP integration: added official PGP Fingerprint to header",
        ],
      },
      {
        category: "new in lens",
        items: [
          "navigation overhaul: new structured layout with centered controls",
          "typography sync: swapped dev mono for site wide display typography",
          "optimized lightbox: removed aggressive blurs and fixed description cutoffs",
          "bento layout: dynamic layout with better performance",
        ],
      },
      {
        category: "tweaks and immersion",
        items: [
          "dynamic theme favicon: favicon now updates based on theme accent color",
          "focus mode (Zen): full-immersion mode with DOF blurs",
          "brutalist mode: option to remove all border radiuses",
          "developer font: global override to JetBrains Mono",
        ],
      },
      {
        category: "performance and utility",
        items: [
          "lens optimization: reduced image assets from ~200MB to ~40MB (WebP conversion)",
          "PWA support: fully installable via custom manifest",
          "RSS feed: official support (https://stabbed.wtf/rss.xml)",
          "deep SEO: added OpenGraph and JSON-LD structured data",
        ],
      },
    ],
  },
];



export const TECH_STACK = {
  web: ["React", "TS", "Tailwind", "Next.js", "SQLite", "Framer Motion", "Svelte"],
  technical: ["Rust", "Golang", "Java", "Python", "C", "Kotlin", "C++", "Bash"],
  audio: ["FL Studio", "PipeWire / ALSA", "Sound Design", "Mixing & Mastering"],
};

export interface MusicRelease {
  id: string;
  title: string;
  type: "Single" | "EP" | "Album" | "Remix" | "Beat Tape";
  releaseDate: string;
  coverUrl?: string;
  description: string;
  genre: string;
  duration?: string;
  tags: string[];
  featured?: boolean;
  links: {
    spotify?: string;
    bandcamp?: string;
    youtubeMusic?: string;
    youtube?: string;
    tiktok?: string;
    appleMusic?: string;
  };
}

export const MUSIC_RELEASES: MusicRelease[] = [
  {
    id: "HATEWARE",
    title: "HATEWARE",
    type: "Single",
    releaseDate: "2026",
    description: "HATEWARE consists of three radio eq dropouts, harsh 808s, and zero breathing room. single dropped aug 13, 2026. written, produced, and mixed by rxvirex",
    genre: "Rage/Trap",
    duration: "2 min 5 sec",
    tags: ["rage", "experimental"],
    featured: true,
    links: {
      spotify: "https://open.spotify.com/album/4igWVMnc4K292BEFdvkdVl?si=Q3ochhl8SW2NpHfCbUMC_g",
      bandcamp: "https://rxvirex.bandcamp.com/track/hateware",
      youtubeMusic: "https://music.youtube.com/watch?v=54tDMgTe1xY&si=EIsjlKhiKTxgOlTZ",
      tiktok: "https://www.tiktok.com/@hahavrx",
    },
  },
  {
    id: "FIRSTATTEMPT",
    title: "FIRST ATTEMPT",
    type: "Album",
    releaseDate: "2026",
    description: "FIRST ATTEMPT is a debut full length release album. loud and grainy 808s, blown out distortion, seriously fucked up sound design, along with whatever else ended up in the mix. written, produced, and mixed by rxvirex (virex).",
    genre: "Rage/Trap",
    duration: "26 min 2 sec",
    tags: ["Debut", "Experimental", "Rage"],
    featured: true,
    links: {
      spotify: "https://open.spotify.com/album/1UHT94oL84kULqpRq2Gr30?si=eLP2rfnbSSmOHjz2Y-d-FAom",
      bandcamp: "https://rxvirex.bandcamp.com/album/first-attempt",
      youtubeMusic: "https://music.youtube.com/playlist?list=OLAK5uy_mc83OEAbnl5vmiFUEsxl_iYmVeUHO9I9Y&si=cULZYKZynsn3FkHr",
      tiktok: "https://www.tiktok.com/@hahavrx",
    },
  },
];

export interface KnownIssues {
  id: string;
  title: string;
  description: string;
  status: "investigating" | "identified" | "fixing" | "resolved" | "wontfix";
  date: string;
  severity: "low" | "medium" | "high";
}

export const KNOWN_ISSUES: KnownIssues[] = [
  {
    id: "desktop-photo-bento-lag",
    title: "Desktop Photo Bento Lag",
    description: "Scrolling down on the bento and hovering over other photos causes immense lag. Not sure how to exactly fix, but it's been an issue for about a month now.",
    status: "resolved",
    date: "2026-07-05",
    severity: "medium",
  }
];


