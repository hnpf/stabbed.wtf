const themeSeedCache = new Map<string, { hue: number; saturation: number } | null>();
export const getImageThemeSeed = (url: string): Promise<{ hue: number; saturation: number } | null> => {
  if (!url) return Promise.resolve(null);
  if (themeSeedCache.has(url)) {
    return Promise.resolve(themeSeedCache.get(url) ?? null);
  }

  return new Promise((resolve) => {
    const image = new window.Image();
    image.crossOrigin = "anonymous";
    image.decoding = "async";
    image.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = 48;
        canvas.height = 48;
        const context = canvas.getContext("2d", { willReadFrequently: true });
        if (!context) {
          themeSeedCache.set(url, null);
          return resolve(null);
        }

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
          themeSeedCache.set(url, null);
          return resolve(null);
        }
        const hue = (Math.atan2(sinSum, cosSum) * 180) / Math.PI;
        const avgSat = maxSum / weightTotal;
        const result = {
          hue: (hue + 360) % 360,
          saturation: Math.round(Math.min(96, Math.max(48, avgSat * 100))),
        };
        themeSeedCache.set(url, result);
        resolve(result);
      } catch {
        themeSeedCache.set(url, null);
        resolve(null);
      }
    };
    image.onerror = () => {
      themeSeedCache.set(url, null);
      resolve(null);
    };
    image.src = url;
  });
};
