import { AppSettings } from "../types";

const STORAGE_PREFIX = "ct-app-";

/**
 * Save data to session storage
 */
export const saveToSession = <T>(key: string, value: T): void => {
  try {
    sessionStorage.setItem(`${STORAGE_PREFIX}${key}`, JSON.stringify(value));
  } catch (error) {
    console.warn("Could not save to session storage:", error);
  }
};

/**
 * Get data from session storage
 */
export const getFromSession = <T>(key: string): T | null => {
  try {
    const item = sessionStorage.getItem(`${STORAGE_PREFIX}${key}`);
    return item ? JSON.parse(item) : null;
  } catch (error) {
    console.warn("Could not read from session storage:", error);
    return null;
  }
};

/**
 * Default app settings
 */
export const DEFAULT_SETTINGS: AppSettings = {
  renderQuality: "high",
  backgroundColor: "light-gray",
  showGrid: true,
  autoOptimize: true,
  defaultExport: "stl",
};

/**
 * Load settings from storage or return defaults
 */
export const loadSettings = (): AppSettings => {
  const savedSettings = getFromSession<AppSettings>("settings");
  return savedSettings
    ? { ...DEFAULT_SETTINGS, ...savedSettings }
    : DEFAULT_SETTINGS;
};

/**
 * Save settings to storage
 */
export const saveSettings = (settings: AppSettings): void => {
  saveToSession("settings", settings);
};
