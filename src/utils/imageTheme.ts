const themeSeedCache = new Map<string, { hue: number; saturation: number } | null>();

function computeSeedFromCanvas(image: HTMLImageElement): { hue: number; saturation: number } | null {
  const canvas = document.createElement("canvas");
  canvas.width = 48;
  canvas.height = 48;
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) return null;

  context.drawImage(image, 0, 0, canvas.width, canvas.height);
  const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
  let weightTotal = 0;
  let sinSum = 0;
  let cosSum = 0;
  let maxSum = 0;

  for (let i = 0; i < pixels.length; i += 4) {
    const r = pixels[i] / 255;
    const g = pixels[i + 1] / 255;
    const b = pixels[i + 2] / 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const delta = max - min;
    const saturation = max === 0 ? 0 : delta / max;
    const weight = saturation * (0.15 + max * 0.85) * (pixels[i + 3] / 255);

    if (weight < 0.002) continue;

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

  if (weightTotal < 0.02) {
    return null;
  }
  const hue = (Math.atan2(sinSum, cosSum) * 180) / Math.PI;
  const avgSat = maxSum / weightTotal;
  return {
    hue: (hue + 360) % 360,
    saturation: Math.round(Math.min(96, Math.max(48, avgSat * 100))),
  };
}

function loadAndExtract(url: string): Promise<{ hue: number; saturation: number } | null> {
  return new Promise((resolve) => {
    const image = new window.Image();
    image.crossOrigin = "anonymous";
    image.decoding = "async";
    image.onload = () => {
      try {
        const seed = computeSeedFromCanvas(image);
        resolve(seed);
      } catch {
        resolve(null);
      }
    };
    image.onerror = () => {
      resolve(null);
    };
    image.src = url;
  });
}

export const getImageThemeSeed = async (url: string): Promise<{ hue: number; saturation: number } | null> => {
  if (!url) return null;
  if (themeSeedCache.has(url)) {
    return themeSeedCache.get(url) ?? null;
  }

  let seed = await loadAndExtract(url);
  if (!seed && url.startsWith("http")) {
    const proxyUrl = `/api/proxy-image?url=${encodeURIComponent(url)}`;
    seed = await loadAndExtract(proxyUrl);
  }

  themeSeedCache.set(url, seed);
  return seed;
};
