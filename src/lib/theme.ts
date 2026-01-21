export type ThemePreference = "light" | "dark" | "system";

const STORAGE_KEY = "abuosba.theme";

export function getThemePreference(): ThemePreference {
  if (typeof window === "undefined") return "system";
  try {
    const v = window.localStorage.getItem(STORAGE_KEY);
    if (v === "light" || v === "dark" || v === "system") return v;
    return "system";
  } catch {
    return "system";
  }
}

export function setThemePreference(pref: ThemePreference) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, pref);
  } catch {
    // ignore
  }
  applyThemePreference(pref);
}

export function applyThemePreference(pref: ThemePreference) {
  if (typeof window === "undefined") return;
  const mql = window.matchMedia?.("(prefers-color-scheme: dark)");
  const systemDark = () => (mql ? mql.matches : false);
  const isDark = pref === "dark" ? true : pref === "light" ? false : systemDark();

  const root = document.documentElement;
  root.classList.toggle("dark", isDark);
  root.dataset.theme = isDark ? "dark" : "light";
}

export function cycleThemePreference(current: ThemePreference): ThemePreference {
  if (current === "system") return "light";
  if (current === "light") return "dark";
  return "system";
}
