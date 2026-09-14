import { useEffect } from 'react';
import { useTheme } from '../ThemeContext';

export const useSettingsSync = (onCapsuleDetected: (settings: any) => void) => {
  const { settings } = useTheme();

  // parse link from URL params on startup
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const capsule = params.get("theme") || params.get("capsule");
    if (capsule) {
      try {
        const decoded = JSON.parse(atob(capsule));
        const validatedSettings: Partial<typeof settings> = {};
        
        const keys: (keyof typeof settings)[] = [
          "mode", "accent", "hue", "saturation", "sidebarFlipped",
          "sidebarCollapsed", "profileContainer", "brutalistMode",
          "developerFont", "focusMode", "floatingSidebar", "debugMode",
          "helloAnimation", "disableAnimations", "highHz", "amoledMode",
          "bentoTilt", "lensDynamicTheming", "metricUnits", "dynamicWeatherLocation"
        ];
        
        for (const k of keys) {
          if (decoded[k] !== undefined) {
            (validatedSettings as any)[k] = decoded[k];
          }
        }
        
        onCapsuleDetected(validatedSettings);
        
        const cleanUrl = window.location.pathname;
        window.history.replaceState({}, document.title, cleanUrl);
      } catch (e) {
        console.error("capsule decoding failed, invalid link?", e);
      }
    }
  }, [onCapsuleDetected]);
};
