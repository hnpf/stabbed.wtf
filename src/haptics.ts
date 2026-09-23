let enabled = true;

export const haptic = {
  setEnabled: (value: boolean) => {
    enabled = value;
  },
  light: () => {
    try {
      if (enabled && typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(10);
    } catch (e) {}
  },
  medium: () => {
    try {
      if (enabled && typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(30);
    } catch (e) {}
  },
  heavy: () => {
    try {
      if (enabled && typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(50);
    } catch (e) {}
  },
  success: () => {
    try {
      if (enabled && typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate([20, 50, 40]);
    } catch (e) {}
  },
  error: () => {
    try {
      if (enabled && typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate([50, 50, 50]);
    } catch (e) {}
  },
  /** light ripple */
  ripple: () => {
    try {
      if (enabled && typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate([8, 40, 8]);
    } catch (e) {}
  },
};
