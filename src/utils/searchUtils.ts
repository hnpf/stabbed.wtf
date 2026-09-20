/**
 * search utils for extracting and organizing searchable content across the site
 */

import { BLOG_POSTS, PROJECTS } from "../constants";
import { LENS_PHOTOS } from "../pages/LensPage";
import { Search, Monitor, Settings as SettingsIcon, Layers, Palette, Moon, Sun, Link as LinkIcon, FileText, Boxes, Image } from "lucide-react";

export interface SearchItem {
  id: string;
  label: string;
  description: string;
  category: "Settings" | "Blog" | "Lens" | "Projects" | "Links" | "Pages" | "Navigation" | "Tools" | "Appearance";
  icon: any;
  previewUrl?: string;
  previewAlt?: string;
  action: () => void;
  tags: string[];
  excerpt?: string;
}

/**
 * extract all settings into searchable items
 */
export const getSettingsSearchItems = (
  settings: any,
  updateSettings: any,
  openSettings: () => void
): SearchItem[] => {
  const items: SearchItem[] = [];

  // theme settings
  items.push({
    id: "setting-theme-mode",
    label: "Theme mode",
    description: "Switch between light, dark, or system theme",
    category: "Settings",
    icon: Palette,
    action: openSettings,
    tags: ["theme", "appearance", "light", "dark", "mode"],
  });

  items.push({
    id: "setting-theme-light",
    label: "Set light theme",
    description: "Switch to light mode",
    category: "Settings",
    icon: Sun,
    action: () => updateSettings({ mode: "light" }),
    tags: ["light", "theme"],
  });

  items.push({
    id: "setting-theme-dark",
    label: "Set dark theme",
    description: "Switch to dark mode",
    category: "Settings",
    icon: Moon,
    action: () => updateSettings({ mode: "dark" }),
    tags: ["dark", "theme"],
  });

  items.push({
    id: "setting-theme-system",
    label: "Set system theme",
    description: "Follow OS theme setting",
    category: "Settings",
    icon: Monitor,
    action: () => updateSettings({ mode: "system" }),
    tags: ["system", "theme"],
  });

  items.push({
    id: "setting-amoled-mode",
    label: "AMOLED mode",
    description: "Total black backgrounds for OLED screens (dark mode)",
    category: "Settings",
    icon: Moon,
    action: () => updateSettings({ amoledMode: !settings.amoledMode }),
    tags: ["amoled", "dark", "oled", "black"],
  });

  items.push({
    id: "setting-accent-color",
    label: "Accent color",
    description: `Current: ${settings.accent}. Choose between orange, blue, green, red, purple, or custom`,
    category: "Settings",
    icon: Palette,
    action: openSettings,
    tags: ["accent", "color", "palette", settings.accent],
  });

  items.push({
    id: "setting-color-palette",
    label: "Color palette",
    description: `Current: ${settings.palette}. Choose tonal-spot, fidelity, content, neutral, expressive, or fruit-salad`,
    category: "Settings",
    icon: Palette,
    action: openSettings,
    tags: ["palette", "colors", settings.palette],
  });

  // customization settings
  const customizationOptions = [
    { key: "helloAnimation", label: "Hello animation", desc: "Fluent language cycling home hero" },
    { key: "brutalistMode", label: "Brutalist mode", desc: "Sharp edges only" },
    { key: "developerFont", label: "Developer font", desc: "Use JetBrains Mono" },
    { key: "focusMode", label: "Focus mode", desc: "Minimal zen layout" },
    { key: "disableAnimations", label: "Disable animations", desc: "Turn off motion & transition effects" },
    { key: "bentoTilt", label: "3D bento tilt", desc: "Cursor tracking parallax tilt effect" },
    { key: "lensDynamicTheming", label: "Lens dynamic theming", desc: "Match theme to expanded Lens photo" },
    { key: "metricUnits", label: "Metric units", desc: "Use metric units (°C, km/h) for weather (off switches to imperial)" },
    { key: "dynamicWeatherLocation", label: "Local weather detection", desc: "Auto-detect visitor's city for weather" },
  ];

  customizationOptions.forEach((opt) => {
    items.push({
      id: `setting-${opt.key}`,
      label: opt.label,
      description: opt.desc,
      category: "Settings",
      icon: SettingsIcon,
      action: () => updateSettings({ [opt.key]: !settings[opt.key as keyof typeof settings] }),
      tags: [opt.key, opt.label.toLowerCase(), opt.desc.toLowerCase()],
    });
  });

  const layoutOptions = [
    { key: "sidebarFlipped", label: "Flip sidebar", desc: "Changes desktop sidebar to the right" },
    { key: "floatingSidebar", label: "Floating sidebar", desc: "Undock the sidebar with rounded corners" },
    { key: "profileContainer", label: "Profile container", desc: "Clean background around profile header" },
    { key: "forceDesktop", label: "Force desktop", desc: "Prevents switching to mobile layout" },
    { key: "infoFullscreen", label: "Info page fullscreen", desc: "Hides navbars on /info page" },
  ];

  layoutOptions.forEach((opt) => {
    items.push({
      id: `setting-${opt.key}`,
      label: opt.label,
      description: opt.desc,
      category: "Settings",
      icon: Layers,
      action: () => updateSettings({ [opt.key]: !settings[opt.key as keyof typeof settings] }),
      tags: [opt.key, opt.label.toLowerCase(), "layout"],
    });
  });

  // command palette settings
  items.push({
    id: "setting-palette-hotkey",
    label: "Palette hotkey",
    description: `Current: ${settings.paletteHotkey}. Choose Ctrl+K, ⌘K, or Ctrl+Shift+P`,
    category: "Settings",
    icon: SettingsIcon,
    action: openSettings,
    tags: ["hotkey", "shortcut", "palette", "keyboard"],
  });

  items.push({
    id: "setting-palette-view",
    label: "Palette default view",
    description: `Current: ${settings.paletteDefaultView}. Choose lists or cards layout`,
    category: "Settings",
    icon: Monitor,
    action: () => updateSettings({ paletteDefaultView: settings.paletteDefaultView === "lists" ? "cards" : "lists" }),
    tags: ["view", "palette", "layout", "lists", "cards"],
  });

  items.push({
    id: "setting-palette-scope",
    label: "Palette search scope",
    description: `Current: ${settings.paletteSearchScope}. Limit search to pages, commands, blog, or everything`,
    category: "Settings",
    icon: Search,
    action: openSettings,
    tags: ["scope", "palette", "search", "filter"],
  });

  items.push({
    id: "setting-palette-results",
    label: "Palette results limit",
    description: `Current: ${settings.paletteResultsLimit}. Control how many items appear before scrolling`,
    category: "Settings",
    icon: SettingsIcon,
    action: openSettings,
    tags: ["results", "limit", "palette"],
  });

  items.push({
    id: "setting-palette-recent",
    label: "Show recent actions",
    description: "Toggle recent command suggestions when palette opens empty",
    category: "Settings",
    icon: SettingsIcon,
    action: () => updateSettings({ paletteShowRecentActions: !settings.paletteShowRecentActions }),
    tags: ["recent", "palette", "history"],
  });

  items.push({
    id: "setting-palette-nav",
    label: "Palette keyboard navigation",
    description: `Current: ${settings.paletteKeyboardNavBehavior}. Choose standard, wrap, or 2D grid`,
    category: "Settings",
    icon: SettingsIcon,
    action: openSettings,
    tags: ["keyboard", "navigation", "palette", "arrows"],
  });

  items.push({
    id: "setting-palette-hover",
    label: "Suppress hover",
    description: "Keep keyboard selection fixed while moving your mouse",
    category: "Settings",
    icon: SettingsIcon,
    action: () => updateSettings({ paletteSuppressHover: !settings.paletteSuppressHover }),
    tags: ["hover", "keyboard", "mouse", "palette"],
  });

  return items;
};

/**
 * get blog posts with full-text search capability
 */
export const getBlogSearchItems = (goto: (page: string, link?: string) => void): SearchItem[] => {
  return BLOG_POSTS.map((post) => ({
    id: `blog-${post.id}`,
    label: `Blog: ${post.title}`,
    description: post.snippet,
    category: "Blog",
    icon: FileText,
    action: () => goto("blog", post.link),
    tags: [
      post.title.toLowerCase(),
      post.snippet.toLowerCase(),
      post.category.toLowerCase(),
      post.link.toLowerCase(),
      post.content.toLowerCase().substring(0, 200),
    ],
    excerpt: post.snippet,
  }));
};

/**
 * get projects/portfolio
 */
export const getProjectsSearchItems = (navigateTo: (page: string) => void): SearchItem[] => {
  return PROJECTS.map((project) => ({
    id: `project-${project.id}`,
    label: `Project: ${project.title}`,
    description: project.description,
    category: "Projects",
    icon: Boxes,
    action: () => {
      navigateTo("home");
      setTimeout(() => {
        const projectEl = document.getElementById(`project-${project.id}`);
        projectEl?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 100);
    },
    tags: [
      project.title.toLowerCase(),
      project.description.toLowerCase(),
      ...project.tags.map((t) => t.toLowerCase()),
    ],
  }));
};

/**
 * get searchable lens photo items
 */
export const getLensSearchItems = (navigateTo: (page: string) => void): SearchItem[] => {
  return LENS_PHOTOS.map((photo): SearchItem => ({
    id: `lens-${photo.id}`,
    label: `Lens: ${photo.description}`,
    description: photo.date ? `${photo.date} · Lens photo` : "Lens photo",
    category: "Lens",
    icon: Image,
    previewUrl: photo.url || photo.blur,
    previewAlt: `Preview of lens photo: ${photo.description}`,
    action: () => {
      navigateTo("lens");
      setTimeout(() => {
        const photoEl = document.getElementById(`lens-photo-${photo.id}`);
        photoEl?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 120);
    },
    tags: [
      photo.id,
      photo.description?.toLowerCase() ?? "",
      photo.date?.toLowerCase() ?? "",
      "lens",
      "photo",
    ],
    excerpt: photo.description,
  }));
};

/**
 * extract all external links from the page
 */
export const getLinksSearchItems = (): SearchItem[] => {
  const items: SearchItem[] = [];
  const links = document.querySelectorAll("a[href]");
  const seen = new Set<string>();

  links.forEach((link) => {
    const href = link.getAttribute("href");
    const text = link.textContent?.trim();

    if (href && text && !href.startsWith("#") && !seen.has(href)) {
      seen.add(href);

      // determine link type
      let category = "Links";
      let icon = LinkIcon;

      if (href.includes("github")) {
        category = "Links";
        icon = LinkIcon;
      } else if (href.includes("mailto")) {
        category = "Links";
        icon = LinkIcon;
      }

      items.push({
        id: `link-${href}`,
        label: text,
        description: new URL(href, window.location.origin).hostname,
        category: category as any,
        icon,
        action: () => {
          if (href.startsWith("http")) {
            window.open(href, "_blank");
          } else {
            window.location.href = href;
          }
        },
        tags: [text.toLowerCase(), href.toLowerCase(), new URL(href, window.location.origin).hostname],
      });
    }
  });

  return items;
};

/**
 * get all searchable items combined
 */
export const getAllSearchItems = (
  settings: any,
  updateSettings: any,
  openSettings: () => void,
  goto: (page: string, link?: string) => void,
  navigateTo: (page: string) => void
): SearchItem[] => {
  return [
    ...getSettingsSearchItems(settings, updateSettings, openSettings),
    ...getBlogSearchItems(goto),
    ...getLensSearchItems(navigateTo),
    ...getProjectsSearchItems(navigateTo),
    ...getLinksSearchItems(),
  ];
};

/**
 * filter search items by query
 */
export const filterSearchItems = (items: SearchItem[], query: string): SearchItem[] => {
  if (!query.trim()) return items;

  const normalizedQuery = query.toLowerCase().trim();
  return items.filter((item) => {
    const searchText = [
      item.label,
      item.description,
      ...item.tags,
      item.excerpt || "",
    ]
      .join(" ")
      .toLowerCase();

    return searchText.includes(normalizedQuery);
  });
};

/**
 * group search items by category
 */
export const groupByCategory = (items: SearchItem[]): Record<string, SearchItem[]> => {
  return items.reduce(
    (groups, item) => {
      if (!groups[item.category]) {
        groups[item.category] = [];
      }
      groups[item.category].push(item);
      return groups;
    },
    {} as Record<string, SearchItem[]>
  );
};
