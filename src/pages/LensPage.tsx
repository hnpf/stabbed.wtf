// @ts-nocheck
import React, { useState, useEffect, memo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, ChevronLeft, ChevronRight, ExternalLink, Pin } from "../components/MaterialIcon";
import { cn } from "../constants";
import { useTheme } from "../ThemeContext";
import { TiltContainer } from "../components/TiltContainer";
import { haptic } from "../haptics";

export const LENS_PHOTOS = [
  {
    id: "24",
    url: "/photography/7062_1783717766914_optimized.webp",
    description: "fourth of july weirdly edited photo",
    date: "Jul 4, 2026",
    orientation: "landscape",
    blur: "data:image/webp;base64,UklGRmYAAABXRUJQVlA4IFoAAABwBACdASoUABQAPyV6slOuJ6Sit/qoAcAkiWNpzlClbqIh7/S+ElIs0roziAD+7hwfQotekKxG6zrTa2QHdmahwyj9zV8NUwcYIpLoIXcA/IRXvh4q9gAAAAA=",
    pinned: true
  },
  {
    id: "37",
    url: "/photography/PXL_20260709_0508034562_1783718361121_optimized.webp",
    description: "the setup",
    date: "Jul 9, 2026",
    orientation: "landscape",
    blur: "data:image/webp;base64,UklGRlwAAABXRUJQVlA4IFAAAACQAwCdASoUAA0APzmGuVOvKSWisAgB4CcJYwDImApsFr3mSEAAAP4WcQowGvS+J86eQnfIDzXewtA83t0G5C3nIVdMsSzk6yOaHIfvqZoAAA==",
    pinned: true
  },
  {
    id: "36",
    url: "/photography/PXL_20260705_1526255632_1783718350483_optimized.webp",
    description: "wide shot pelican and little gull aura",
    date: "Jul 5, 2026",
    orientation: "landscape",
    blur: "data:image/webp;base64,UklGRmAAAABXRUJQVlA4IFQAAADwAwCdASoUAA8APzmGuVOvKSWisAgB4CcJQBOkJABXukaVuF6q6BwAAP3SA9E8ANB58wSvN/Xq48Vtap8cGcP2IsHGUo0y7ri6Jt6W8D9owiNAAAA="
  },
  {
    id: "35",
    url: "/photography/PXL_20260705_1526196952_1783718331804_optimized.webp",
    description: "pelican and little gull aura",
    date: "Jul 5, 2026",
    orientation: "portrait",
    blur: "data:image/webp;base64,UklGRmIAAABXRUJQVlA4IFYAAADwAwCdASoPABQAPzmKulOvKaWisAgB4CcJZAC06CHEyFs1Hpv7jxgQAP5Rpga29vfubifH15t5SMKW67oqVdwRhD6wJ+TIC7SaocZMPy1wx7gDLQAAAA=="
  },
  {
    id: "34",
    url: "/photography/PXL_20260705_152634614_1783718273422_optimized.webp",
    description: "laughing gull aura",
    date: "Jul 5, 2026",
    orientation: "portrait",
    blur: "data:image/webp;base64,UklGRlgAAABXRUJQVlA4IEwAAABwAwCdASoPABQAPzmGuVOvKSWisAgB4CcJZgAAGydaB8eSM+wAt8BSZOwGlEiOt3cIJJ93M8yHK/52rSUtE/vcqTr/RP2caKT4tAAA"
  },
  {
    id: "33",
    url: "/photography/PXL_20260704_221110626_1783718247324_optimized.webp",
    description: "unique building shot",
    date: "Jul 4, 2026",
    orientation: "portrait",
    blur: "data:image/webp;base64,UklGRmwAAABXRUJQVlA4IGAAAAAQBACdASoPABQAPzmEuVOvKKWisAgB4CcJZACdACF5FJj2InP6wyx7AAD+UcdJ1E/bsqjXslWDhymWzPjPX1wm/FcpU8dmK1vF+Hfa4p9RBkW2MOgKlORDxdR0xiUAAAA="
  },
  {
    id: "32",
    url: "/photography/PXL_20260703_020814005_PORTRAIT_ORIGINAL_1783718214601_optimized.webp",
    description: "galveston tuff high-rise at night",
    date: "Jul 3, 2026",
    orientation: "portrait",
    blur: "data:image/webp;base64,UklGRmQAAABXRUJQVlA4IFgAAADwAwCdASoPABQAPzmEuVOvKKWisAgB4CcJQBYdhDvpkWOF1LnA6YcAAP7itwzfvuKixUd3bZb89To/FmONUqfU6oJqEPo83R83OUpxtoCHZQRFGRg8MAAA"
  },
  {
    id: "31",
    url: "/photography/PXL_20260621_040027162_1783718186632_optimized.webp",
    description: "textured leather",
    date: "Jun 21, 2026",
    orientation: "landscape",
    blur: "data:image/webp;base64,UklGRmQAAABXRUJQVlA4IFgAAACwAwCdASoUABQAPzmMulavKSUkqA1R4CcJaQAAI8VaKhj1Q1L1AAD90/dLlzmn/keIw9mP264fE+qEMONksH5XlHCNKq1uRRnUOqXzUWcEUCU+xK7Q5gAA"
  },
  {
    id: "30",
    url: "/photography/PXL_20260517_0115338203_1783718173036_optimized.webp",
    description: "palm tree against the sky",
    date: "May 17, 2026",
    orientation: "portrait",
    blur: "data:image/webp;base64,UklGRooAAABXRUJQVlA4IH4AAACQBACdASoUABQAPzmUwVmvKicjqAgB4CcJZwC90A2MpZpJ+oGwoua09A0pCgAA/Hkr15XUhaMYBjAdFww5AT4t+oOjMOoQZeEy++ufN0+ND77Wp6Jw9MnjUqjbHW3h/xvi0A2Q8G2oS2zO+q8xAjnr8I9ItPclAk39crEAAAA="
  },
  {
    id: "29",
    url: "/photography/PXL_20260420_183931363_1783718153333_optimized.webp",
    description: "walrus thing",
    date: "Apr 20, 2026",
    orientation: "landscape",
    blur: "data:image/webp;base64,UklGRloAAABXRUJQVlA4IE4AAACwAwCdASoUAA8APzmGulOvKSWisAgB4CcJbACdACHZsjPYNl+kwAD+w0/LOlUML+tmioOYSHtni6E9938HcbUrJAR0tUu5fJIJuoRHQAA="
  },
  {
    id: "28",
    url: "/photography/PXL_20260412_164451895_1783718101595_optimized.webp",
    description: "crocs",
    date: "Apr 12, 2026",
    orientation: "landscape",
    blur: "data:image/webp;base64,UklGRlYAAABXRUJQVlA4IEoAAAAwAwCdASoUAA8APzmGuVOvKSWisAgB4CcJQAAG4OVwahYIAP2zMjQx4QDCMfC590EcXTa88lQSfO2MlH4O2lz0gNnMNnJJy8AAAA=="
  },
  {
    id: "27",
    url: "/photography/PXL_20260404_1835532162_1783718089310_optimized.webp",
    description: "kites shot in galveston",
    date: "Apr 4, 2026",
    orientation: "portrait",
    blur: "data:image/webp;base64,UklGRlQAAABXRUJQVlA4IEgAAACwBACdASoUABQAPzmKu1WvKSYjKA1R4CcJZwAAMX/frzq12a2VKHajosNqjBpwAP6xYOOBo2Cb4KzvysttiWGq0EELqwgAAAA="
  },
  {
    id: "26",
    url: "/photography/PXL_20260403_201643763_1783718068597_optimized.webp",
    description: "galveston tuff high-rise",
    date: "Apr 3, 2026",
    orientation: "portrait",
    blur: "data:image/webp;base64,UklGRlIAAABXRUJQVlA4IEYAAACwAwCdASoPABQAPzmGu1QvKSYjMAgB4CcJQBYdhDnu+FMWrt34dAD8U8HGNMwVcKQmaPOgNT7cxFSIVLjjDKvYHKxiGUAA",
    pinned: true
  },
  {
    id: "25",
    url: "/photography/PXL_20260324_225858957_1783717935425_optimized.webp",
    description: "a close up shot of my tarantula",
    date: "Mar 24, 2026",
    orientation: "portrait",
    blur: "data:image/webp;base64,UklGRoIAAABXRUJQVlA4IHYAAAAQBACdASoPABQAPzmEuVOvKKWisAgB4CcJaACdMoADTnyTEnlxrb8rgAD7IW2QhBhNhoUSulh9qT2dyyZX8Tyof9JymsdDMHBBkqwTz9c1mNUUu6Tz7o+cFb+ggxoKYcXlMp/Emhcp4DrtYhWomiybpsg0vNAA"
  },
  {
    id: "21",
    url: "/photography/PXL_20260301_211813696.webp",
    description: "A cute wild Tan jumping spider!",
    date: "Mar 1, 2026",
    orientation: "landscape",
    blur: "data:image/webp;base64,UklGRjgAAABXRUJQVlA4ICwAAADQAQCdASoKAA0AAUAmJZwAAueHty3OAAD+/jvso/q3pAc+oLpQf29h8wgAAA=="
  },
  {
    id: "22",
    url: "/photography/PXL_20260208_0319125062_1783717642816_optimized.webp",
    description: "weird abandoned mall scenery",
    date: "Feb 8, 2026",
    orientation: "landscape",
    blur: "data:image/webp;base64,UklGRlIAAABXRUJQVlA4IEYAAADQAwCdASoUAA8APzmEuVOvKKWisAgB4CcJYwCsAB6XKtgI+JTH8xAA+fXGwzdSso7WoK6HMEl+LCKxzQTnkYzXyXTngAAA"
  },
  {
    id: "18",
    url: "/photography/PXL_20260131_233605673.BURST-01.webp",
    description: "the moon in broad daylight",
    date: "Jan 31, 2026",
    orientation: "landscape",
    blur: "data:image/webp;base64,UklGRjwAAABXRUJQVlA4IDAAAABwAQCdASoKAA0AAUAmJQBOgCHAgAD24InRNrLBp+RClDe2prOn9sfZfdi5SPuAAAA="
  },
  {
    id: "17",
    url: "/photography/PXL_20260129_045632703.PORTRAIT~2.webp",
    description: "silly silly / pure chaos..",
    date: "Jan 29, 2026",
    orientation: "portrait",
    blur: "data:image/webp;base64,UklGRkYAAABXRUJQVlA4IDoAAAAwAgCdASoKAAgAAUAmJaACdLoAAwj5sdxkAAD++gyXVUt//ft38XKp7+OdpsUu5HGn9w5fxjToeAAA"
  },
  {
    id: "16",
    url: "/photography/PXL_20260115_062158733.PORTRAIT.webp",
    description: "tarantula at the watering hole",
    date: "Jan 15, 2026",
    orientation: "portrait",
    blur: "data:image/webp;base64,UklGRkQAAABXRUJQVlA4IDgAAADwAQCdASoKAAgAAUAmJYgCdAEObiD8oAAA/uUcffQj6uPkHzRC//FNCLfcNBq1Y/uvuvA3wtSgAA=="
  },
  {
    id: "14",
    url: "/photography/PXL_20260108_040856251.webp",
    description: "p. audax carrying a droplet",
    date: "Jan 8, 2026",
    orientation: "landscape",
    blur: "data:image/webp;base64,UklGRjwAAABXRUJQVlA4IDAAAADQAQCdASoKAAgAAUAmJYwC7ADdDSGAAAD+2HmZiv6NWI+iVP00jEpvNmK4wF8AAAA="
  },
  {
    id: "15",
    url: "/photography/PXL_20260108_042253119.webp",
    description: "tarantula being a menace",
    date: "Jan 8, 2026",
    orientation: "landscape",
    blur: "data:image/webp;base64,UklGRkAAAABXRUJQVlA4IDQAAADQAQCdASoKAA0AAUAmJYwCdAD0KkCjAAD2tfsBwgi6zffyYr+TZyGy/+qir515wasHAAAA"
  },
  {
    id: "12",
    url: "/photography/PXL_20251231_013358426.PORTRAIT~2.webp",
    description: "feline toes",
    date: "Dec 31, 2025",
    orientation: "portrait",
    blur: "data:image/webp;base64,UklGRkgAAABXRUJQVlA4IDwAAADwAQCdASoKAA0AAUAmJQBOgCHaSdkecmAA/v3q1N18FJpLbCm4lLtzSZJRUNV/2sax0tNyKCwsvYDVgAA="
  },
  {
    id: "13",
    url: "/photography/PXL_20251231_235312192.webp",
    description: "fiery red sky behind the treeline",
    date: "Dec 31, 2025",
    orientation: "landscape",
    blur: "data:image/webp;base64,UklGRkAAAABXRUJQVlA4IDQAAACwAQCdASoKAAgAAUAmJQBOgCHXXDDgAP0rAkNfVA+1CPmcr6MZM5n9Xrb4+e47BxSQAAAA"
  },
  {
    id: "11",
    url: "/photography/PXL_20251230_074304887.PORTRAIT.webp",
    description: "the workstation aesthetic",
    date: "Dec 30, 2025",
    orientation: "portrait",
    blur: "data:image/webp;base64,UklGRjQAAABXRUJQVlA4ICgAAADwAQCdASoKAAgAAUAmJZwC7AEPC80zZgAA/v4shjdN3hAA/66ZgAAA"
  },
  {
    id: "10",
    url: "/photography/PXL_20251225_142558068~2.webp",
    description: "dewy webs on the rocks",
    date: "Dec 25, 2025",
    orientation: "landscape",
    blur: "data:image/webp;base64,UklGRkgAAABXRUJQVlA4IDwAAADQAQCdASoKAA0AAUAmJZACdAD0eq6CgAD+6f0/2/keaZso+L2Q8dAeSurb+P98BfZftDHxdWzflX8AAAA="
  },
  {
    id: "8",
    url: "/photography/20251221_035746.webp",
    description: "a. seemanni face-to-face",
    date: "Dec 21, 2025",
    orientation: "landscape",
    blur: "data:image/webp;base64,UklGRjwAAABXRUJQVlA4IDAAAADQAQCdASoKAAcAAUAmJQBOgCHgSD2CYAD+/nFNvDDp4uXVgTBLtD0RD5kArHDpAAA="
  },
  {
    id: "19",
    url: "/photography/SGCAM_20251127_134227019.webp",
    description: "cat on patrol",
    date: "Nov 27, 2025",
    orientation: "landscape",
    blur: "data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAADwAQCdASoKAAcAAUAmJZQCdAEQFSLLIgAA/mtiRXs6w0GcArxuOKgJhv0UkQAA"
  },
  {
    id: "20",
    url: "/photography/SGCAM_20251127_134233696.webp",
    description: "morning stretches on the hood",
    date: "Nov 27, 2025",
    orientation: "landscape",
    blur: "data:image/webp;base64,UklGRjgAAABXRUJQVlA4ICwAAADwAQCdASoKAAcAAUAmJZwCdAEPDGj2hwAA/uRrytlsUi9RyFwESfCz0yYAAA=="
  },
  {
    id: "9",
    url: "/photography/IMG_20251101_1654442.webp",
    description: "palm tree against the vibrant sun",
    date: "Nov 1, 2025",
    orientation: "landscape",
    blur: "data:image/webp;base64,UklGRjwAAABXRUJQVlA4IDAAAADQAQCdASoKAAYAAUAmJQBOgB6RqHuwAAD+0kIa5Rovre4qzC6j+C7+fCBr7H6uIAA="
  },
  {
    id: "6",
    url: "/photography/20250705_091012_optimized.webp",
    description: "ducks drifting on the water",
    date: "Jul 5, 2025",
    orientation: "landscape",
    blur: "data:image/webp;base64,UklGRj4AAABXRUJQVlA4IDIAAAAQAgCdASoKAAgAAUAmJYgCdLoAAwi4roQAAP7tsZhlLc85SG0d7djBqwv9CbJZReAAAA=="
  },
  {
    id: "4",
    url: "/photography/20250704_194559_optimized.webp",
    description: "sunset framed by summer leaves",
    date: "Jul 4, 2025",
    orientation: "landscape",
    blur: "data:image/webp;base64,UklGRjwAAABXRUJQVlA4IDAAAADQAQCdASoKAAgAAUAmJQBOgCHf6jrwAAD+/tSYC3P4yoe7S1bnvvvp5pKR+OWwAAA="
  },
  {
    id: "5",
    url: "/photography/20250704_203117_optimized.webp",
    description: "fourth of july sparks",
    date: "Jul 4, 2025",
    orientation: "landscape",
    blur: "data:image/webp;base64,UklGRjYAAABXRUJQVlA4ICoAAADQAQCdASoKAAgAAUAmJZwCdAEPAUHMgAD+/x+wlJMPl5iPiMzf4gkjIAA="
  },
  {
    id: "3",
    url: "/photography/20250628_124853_optimized_optimized.webp",
    description: "solitary boat with shallow depth of field",
    date: "Jun 28, 2025",
    orientation: "landscape",
    blur: "data:image/webp;base64,UklGRkAAAABXRUJQVlA4IDQAAADQAQCdASoKAAYAAUAmJQBOgCHo69/XSAD+vGfdeNdk4HxVogXDW+pnjbdcnR/7yuMeBgAA"
  },
  {
    id: "7",
    url: "/photography/20251106_151437.webp",
    description: "random street sign in the lake",
    date: "Jun 11, 2025",
    orientation: "landscape",
    blur: "data:image/webp;base64,UklGRkAAAABXRUJQVlA4IDQAAACwAQCdASoKAAUAAUAmJQBOgB6Q/22AAP6tgjOds+Xe1nCw8RdPnTh8Z1Lj1HJky0PuAAAA"
  },
  {
    id: "2",
    url: "/photography/20250526_104032_optimized_optimized_optimized.webp",
    description: "aerial smoke trails in formation",
    date: "May 26, 2025",
    orientation: "landscape",
    blur: "data:image/webp;base64,UklGRjAAAABXRUJQVlA4ICQAAACQAQCdASoKAAUAAUAmJZwAAtz5SiwA/vU/YVbI62ukrk+AAAA="
  },
  {
    id: "1",
    url: "/photography/20250524_125754_optimized_optimized_optimized.webp",
    description: "light at the end of the brick tunnel",
    date: "May 24, 2025",
    orientation: "landscape",
    blur: "data:image/webp;base64,UklGRkIAAABXRUJQVlA4IDYAAADwAQCdASoKAAYAAUAmJZwCdAELX9KGTAAA/vfhlJaIa8/+BI2i/xfz0mMokO0SJTFw7phOwAA="
  },
];

// weighted canvas gives us an images most expressive color!
// also without sending the photo anywhere or adding a color analysis dependency or whatever.
const getImageThemeSeed = (url: string): Promise<{ hue: number; saturation: number } | null> =>
  new Promise((resolve) => {
    const image = new window.Image();
    image.decoding = "async";
    image.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = 48;
        canvas.height = 48;
        const context = canvas.getContext("2d", { willReadFrequently: true });
        if (!context) return resolve(null);

        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
        let weightTotal = 0;
        let sinSum = 0;
        let cosSum = 0;
        let maxSum = 0; // for avg saturation
        
        for (let i = 0; i < pixels.length; i += 4) {
          const r = pixels[i] / 255;
          const g = pixels[i + 1] / 255;
          const b = pixels[i + 2] / 255;
          const max = Math.max(r, g, b);
          const min = Math.min(r, g, b);
          const delta = max - min;
          const saturation = max === 0 ? 0 : delta / max;
          const weight = saturation * (0.15 + max * 0.85) * (pixels[i + 3] / 255);
        
          if (weight < 0.001) continue; // skip near-black/gray pixels, they have no reliable hue
        
          let hue = 0;
          if (delta > 0) {
            if (max === r) hue = 60 * (((g - b) / delta) % 6);
            else if (max === g) hue = 60 * ((b - r) / delta + 2);
            else hue = 60 * ((r - g) / delta + 4);
          }
          const rad = (hue * Math.PI) / 180;
          sinSum += Math.sin(rad) * weight;
          cosSum += Math.cos(rad) * weight;
          maxSum += saturation * weight;
          weightTotal += weight;
        }
        
        if (weightTotal < 0.01) return resolve(null);
        const hue = (Math.atan2(sinSum, cosSum) * 180) / Math.PI;
        const avgSat = maxSum / weightTotal;
        resolve({
          hue: (hue + 360) % 360,
          saturation: Math.round(Math.min(96, Math.max(48, avgSat * 100))),
        });
      } catch {
        resolve(null);
      }
    };
    image.onerror = () => resolve(null);
    image.src = url;
  });

const PhotoItem = memo(({ photo, i, onClick, settings }: any) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(i < 4);
  const portrait = photo.orientation === "portrait";
  
  // dynamic bento logic - more conservative to prevent gaps
  const isHero = i === 0;
  const isWorkstation = photo.description.includes("workstation");
  
  // Controlled variety for better packing
  const isLarge = isHero && !portrait; // Only hero is 2x2
  const isWide = !isLarge && !portrait && (i === 2 || i === 7 || i === 13 || i === 18);
  const isTall = !isLarge && !isWide && (portrait || isWorkstation || i === 5 || i === 11);

  return (
    <TiltContainer
      id={`lens-photo-${photo.id}`}
      settings={settings}
      onClick={() => {
         onClick(i)
         haptic.light();
      }}
      initial={settings.disableAnimations ? false : { opacity: 0, y: 10 }}
      whileInView={settings.disableAnimations ? false : { opacity: 1, y: 0 }}
      viewport={{ margin: "100px", once: true }}
      onViewportEnter={() => setIsInView(true)}
      whileHover={settings.disableAnimations ? undefined : "hover"}
      variants={{
        hover: {
        }
      }}
      whileTap={settings.disableAnimations ? undefined : { scale: 0.98 }}
      transition={{
        duration: 0.4,
        ease: [0.22, 1, 0.36, 1],
      }}
      className={cn(
        isLarge
          ? "md:col-span-2 md:row-span-2"
          : isWide
            ? "md:col-span-2"
            : isTall
              ? "md:row-span-2"
              : "",
      )}
      innerClassName="rounded-[2.5rem] cursor-pointer relative group lens-item capitalize bg-[var(--surface-variant)]/20 overflow-hidden"
    >
      <div className="absolute inset-0 rounded-[1.8rem] overflow-hidden m-0.5">
        {/* blur thing p */}
        <img
          src={photo.blur}
          alt=""
          aria-hidden="true"
          className={cn(
            "absolute inset-0 w-full h-full object-cover scale-110 blur-xl transition-all duration-700",
            isLoaded ? "opacity-0 invisible" : "opacity-100 visible"
          )}
        />
        {/* main image*/}
        {isInView && (
          <motion.img
            src={photo.url}
            alt={photo.description}
            onLoad={() => setIsLoaded(true)}
            loading={i < 2 ? "eager" : "lazy"}
            decoding="async"
            className={cn(
              "w-full h-full object-cover transition-opacity duration-500",
              isLoaded ? "opacity-100" : "opacity-0",
            )}
            variants={{
              hover: { scale: 1.05 }
            }}
            transition={{
              type: "spring",
              stiffness: settings.highHz ? 400 : 300,
              damping: 25,
            }}
            referrerPolicy="no-referrer"
          />
        )}
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-300 flex items-end p-8 z-20">
        <div className="translate-y-0 sm:translate-y-4 sm:group-hover:translate-y-0 transition-transform duration-300 w-full flex justify-between items-end gap-4">
          <div className="flex flex-col gap-1">
            <p className="text-white md:text-lg font-bold leading-tight drop-shadow-md">
              {photo.description}
            </p>
            {photo.date && (
              <p className="text-white/80 md:text-sm text-xs font-medium drop-shadow-md">
                {photo.date}
              </p>
            )}
          </div>
          {photo.pinned && (
            <div className="bg-[var(--primary)] text-[var(--on-primary)] px-2.5 py-1 rounded-full shadow-xl">
              <Pin size={20} fill="currentColor" className="pt-3" strokeWidth={1.5} />
            </div>
          )}
        </div>
      </div>
      {/* static outline border (never changes color, zero paint invalidation cost) */}
      <div className="absolute inset-0 border-6 border-[var(--outline-variant)] rounded-[2.5rem] pointer-events-none z-30" />
      {/* hovers primary border (only changes opacity on hover, compositor only operation) */}
      <div className="absolute inset-0 border-6 border-[var(--primary)] rounded-[2.5rem] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-30" />
    </TiltContainer>
  );
});

export const LensPage = memo(({ viewport }: { viewport: any }) => {
  const [idx, setIdx] = useState<number | null>(null);
  const [isExpandedLoaded, setIsExpandedLoaded] = useState(false);
  const { settings, setDynamicTheme } = useTheme();

  useEffect(() => {
    if (!settings.lensDynamicTheming || idx === null) {
      setDynamicTheme(null);
      return;
    }

    let cancelled = false;
    getImageThemeSeed(LENS_PHOTOS[idx].url).then((seed) => {
      if (!cancelled) setDynamicTheme(seed);
    });
    return () => { cancelled = true; };
  }, [idx, settings.lensDynamicTheming, setDynamicTheme]);

  useEffect(() => () => setDynamicTheme(null), [setDynamicTheme]);

  const handlePhotoClick = React.useCallback((i: number) => {
    setIdx(i);
    setIsExpandedLoaded(false);
  }, []);

  const next = React.useCallback((e?: any) => {
    e?.stopPropagation();
    setIdx((prev) => (prev !== null ? (prev + 1) % LENS_PHOTOS.length : null));
    setIsExpandedLoaded(false);
  }, []);

  const prev = React.useCallback((e?: any) => {
    e?.stopPropagation();
    setIdx((prev) => (prev !== null ? (prev - 1 + LENS_PHOTOS.length) % LENS_PHOTOS.length : null));
    setIsExpandedLoaded(false);
  }, []);

  useEffect(() => {
    if (idx !== null) {
      console.log("opened photo", idx, "-", LENS_PHOTOS[idx].description);
    } else {
      console.log("closed expanded photo back to grid, finally");
    }

    const on_key = (e: KeyboardEvent) => {
      if (idx === null) return;
      if (e.key === "ArrowRight") {
        console.log("arrow right, cycling next");
        next();
      }
      if (e.key === "ArrowLeft") {
        console.log("arrow left, cycling prev");
        prev();
      }
      if (e.key === "Escape") {
        console.log("esc key, closing expanded view");
        setIdx(null);
      }
    };
    
    let last_scroll = 0
    const on_wheel = (e: WheelEvent) => {
      if (idx === null) return
      
      if (Math.abs(e.deltaX) < 15) return
      
      const now = Date.now()
      if (now - last_scroll < 350) return
      last_scroll = now

      if (e.deltaX > 0) {
        next()
      } else {
        prev()
      }
    }
    
    window.addEventListener("keydown", on_key);
    window.addEventListener("wheel", on_wheel, { passive: true })

    let timeout: any;
    if (idx !== null) {
      document.body.style.overflow = "hidden"; // lol bye loser
      // preload next and prev images sparingly - delay slightly to avoid blocking entry animation
      timeout = setTimeout(() => {
        const next_idx = (idx + 1) % LENS_PHOTOS.length;
        const prev_idx = (idx - 1 + LENS_PHOTOS.length) % LENS_PHOTOS.length;
        [next_idx, prev_idx].forEach(i => {
          const img = new window.Image();
          img.src = LENS_PHOTOS[i].url;
        });
      }, 300);
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      window.removeEventListener("keydown", on_key);
      window.removeEventListener("wheel", on_wheel)
      document.body.style.overflow = "";
      if (timeout) clearTimeout(timeout);
    };
  }, [idx, next, prev]);

  return (
    <div className="max-w-[1600px] mx-auto space-y-12">
      <header className="page-header font-expressive-bold space-y-4">
        <h2 className="page-title !text-6xl md:!text-9xl font-expressive-bold italic">Lens</h2>
          <p className="text-xl md:text-2xl font-display font-medium text-[var(--on-surface-variant)] opacity-60 max-w-2xl leading-tight">
            My personal gallery for my personal photo dumps &lt;3
          </p>
      </header>
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8 auto-rows-[280px] md:auto-rows-[380px] px-4 md:px-0 grid-flow-dense">
        {LENS_PHOTOS.map((photo, i) => (
          <PhotoItem
            key={photo.id}
            photo={photo}
            i={i}
            settings={settings}
            onClick={handlePhotoClick}
          />
        ))}
      </div>
      <AnimatePresence>
        {idx !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex flex-col bg-[var(--surface)]/95 backdrop-blur-md overflow-hidden"
            onClick={() => setIdx(null)}
          >
            {/* top islands - ungrouped capsule + circle */}
            <div className="z-[230] p-6 md:p-8 flex justify-center items-center gap-3 md:gap-4 pointer-events-none">
              <div className="bg-[var(--surface-variant)]/60 backdrop-blur-md px-6 py-3 md:px-8 md:py-4 rounded-[2.5rem] md:rounded-[2.5rem] border-6 border-[var(--outline-variant)]/40 flex flex-col shadow-2xl pointer-events-auto min-w-0 max-w-[240px] md:max-w-lg">
                <div className="text-[11px] md:text-[18px] font-black tracking-[0.14em] text-[var(--primary)] mb-0.5 md:mb-1">
                  Description:
                </div>
                <div className="text-[var(--on-surface)] font-display font-black text-[14px] first-letter:uppercase md:text-2xl tracking-tight leading-tight truncate">
                  {LENS_PHOTOS[idx].description}
                </div>
                {LENS_PHOTOS[idx].date && (
                  <div className="text-[var(--on-surface)]/60 font-medium text-xs md:text-sm mt-0.5 md:mt-1 truncate">
                    {LENS_PHOTOS[idx].date}
                  </div>
                )}
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.9, rotate: -8 }}
                transition={{
                  type: "spring",
                  stiffness: 800,
                  damping: 15,
                  mass: 0.5
                }}
                onClick={() => { 
                  haptic.light();
                  setIdx(null);
                }}
                className="w-14 h-14 md:w-18 md:h-18 bg-[var(--primary)] text-[var(--on-primary)] rounded-full flex items-center justify-center border-6 border-[var(--outline-variant)]/40 shadow-2xl pointer-events-auto cursor-pointer"
              >
                <X size={viewport.w < 768 ? 28 : 36} />
              </motion.button>
            </div>

            {/* central content area - image and side arrows */}
            <div className="flex-1 relative w-full flex items-center justify-center px-4 md:px-32 lg:px-48 min-h-0 overflow-hidden">
              {/* desktop side arrows */}
              <div className="hidden md:flex absolute left-8 inset-y-0 items-center z-[220] pointer-events-none">
                <button
                  onClick={prev}
                  className="w-20 h-20 bg-[var(--surface-variant)]/40 hover:bg-[var(--primary)] hover:text-[var(--on-primary)] text-[var(--on-surface)] rounded-full flex items-center justify-center transition-all border-6 border-[var(--outline-variant)]/40 backdrop-blur-md pointer-events-auto active:scale-90 shadow-2xl"
                >
                  <ChevronLeft size={44} />
                </button>
              </div>

              <motion.div
                key={idx}
                initial={{
                  opacity: 0,
                  scale: 0.8,
                  x: 40,
                  scaleY: 1.1,
                  scaleX: 0.9,
                }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  x: 0,
                  scaleY: 1,
                  scaleX: 1,
                }}
                exit={{
                  opacity: 0,
                  scale: 0.8,
                  x: -40,
                  scaleY: 1.1,
                  scaleX: 0.9,
                }}
                transition={{
                  type: "spring",
                  damping: 20,
                  stiffness: 150,
                  mass: 1,
                }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.4}
                onDragEnd={(_, info) => {
                  if (info.offset.x > 50) prev();
                  else if (info.offset.x < -50) next();
                  haptic.light();
                }}
                className="relative w-full h-full flex items-center justify-center cursor-grab active:cursor-grabbing z-[205]"
                onClick={(e) => {
                  e.stopPropagation()
                }}
              >
                {/* blur thing for expanded view */}
                <img
                  src={LENS_PHOTOS[idx].blur}
                  aria-hidden="true"
                  className={cn(
                    "absolute inset-0 w-full h-full object-contain scale-110 blur-xl transition-all duration-500 rounded-[40px] md:rounded-[60px]",
                    isExpandedLoaded ? "opacity-0 invisible" : "opacity-100 visible"
                  )}
                />
                <img
                  src={LENS_PHOTOS[idx].url}
                  onLoad={() => setIsExpandedLoaded(true)}
                  className={cn(
                    "max-w-full max-h-full object-contain rounded-[40px] md:rounded-[60px] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.2)] dark:shadow-[0_48px_96px_-24px_rgba(0,0,0,0.6)] border-[12px] border-[var(--outline-variant)]/20 dark:border-white/10 pointer-events-none select-none transition-opacity duration-500",
                    isExpandedLoaded ? "opacity-100" : "opacity-0"
                  )}
                  referrerPolicy="no-referrer"
                  loading="eager"
                  decoding="async"
                />
              </motion.div>

              <div className="hidden md:flex absolute right-8 inset-y-0 items-center z-[220] pointer-events-none">
                <button
                  onClick={next}
                  className="w-20 h-20 bg-[var(--surface-variant)]/40 hover:bg-[var(--primary)] hover:text-[var(--on-primary)] text-[var(--on-surface)] rounded-full flex items-center justify-center transition-all border-6 border-[var(--outline-variant)]/40 backdrop-blur-md pointer-events-auto active:scale-90 shadow-2xl"
                >
                  <ChevronRight size={44} />
                </button>
              </div>
            </div>

            {/* bottom island - unified navigation, raw, and position */}
            <div className="z-[230] p-6 md:p-12 flex flex-col items-center gap-6">
              <div className="flex items-center gap-1 md:mb-0 mb-4 md:gap-2 bg-[var(--surface-variant)]/60 backdrop-blur-md p-2 md:p-3 rounded-full border-6 border-[var(--outline-variant)]/40 shadow-2xl pointer-events-auto">
                {/* mobile navigation buttons integrated into island */}
                <div className="flex md:hidden items-center gap-1 pr-2 border-r-2 border-[var(--outline-variant)]/20">
                  <button
                    className="w-11 h-11 bg-transparent hover:bg-[var(--primary)] hover:text-[var(--on-primary)] text-[var(--on-surface)] rounded-full flex items-center justify-center transition-all active:scale-90"
                    onClick={(e) => {
                      e.stopPropagation();
                      haptic.light();
                      next();
                    }}
                  >
                    <ChevronLeft size={22} />
                  </button>
                  <button
                    className="w-11 h-11 bg-transparent hover:bg-[var(--primary)] hover:text-[var(--on-primary)] text-[var(--on-surface)] rounded-full flex items-center justify-center transition-all active:scale-90"
                    onClick={(e) => {
                      e.stopPropagation();
                      haptic.light();
                      next();
                    }}
                  >
                    <ChevronRight size={22} />
                  </button>
                </div>

                <div className="px-4 md:px-8 py-1 md:py-2 flex flex-col items-center">
                  <span className="text-[11px] md:text-[16px] capitalize font-black text-[var(--on-surface-variant)] opacity-60">
                    image position:
                  </span>
                  <div className="flex items-center gap-1 md:gap-2 text-[var(--on-surface)] font-mono font-bold text-xs md:text-base">
                    <span className="text-[var(--primary)]">
                      {String(idx + 1).padStart(2, "0")}
                    </span>
                    <span className="opacity-20">/</span>
                    <span className="opacity-60">
                      {String(LENS_PHOTOS.length).padStart(2, "0")}
                    </span>
                  </div>
                </div>

                <div className="w-[2px] h-8 md:h-10 bg-[var(--outline-variant)]/30 rounded-full mx-1 md:mx-2" />

                <button
                  onClick={() => {
                    haptic.light();
                    window.open(LENS_PHOTOS[idx].url, "_blank");
                  }}
                  className="w-11 h-11 md:w-14 md:h-14 bg-[var(--primary-container)] hover:bg-[var(--primary)] hover:text-[var(--on-primary)] text-[var(--on-primary-container)] rounded-full flex items-center justify-center transition-all border-4 md:border-6 border-[var(--outline-variant)]/20 active:scale-90 group relative"
                >
                  <ExternalLink size={viewport.w < 768 ? 20 : 28} />
                  <span className="absolute -top-14 left-1/2 -translate-x-1/2 bg-[var(--surface-variant)] text-[var(--on-surface)] text-[10px] font-black px-4 py-2 rounded-xl border-4 border-[var(--outline-variant)] opacity-0 group-hover:opacity-100 transition-all scale-90 group-hover:scale-100 whitespace-nowrap pointer-events-none shadow-xl">
                    Open Raw
                  </span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});
