export const themeStorageKey = "portfolio-theme";

export const themes = ["light", "dark"] as const;

export type Theme = (typeof themes)[number];

export const themeBootstrapScript = `try{var t=localStorage.getItem(${JSON.stringify(themeStorageKey)});if(t==="light"||t==="dark"){document.documentElement.dataset.theme=t;}}catch(e){}`;

export function getStoredTheme(): Theme | null {
  if (globalThis.window === undefined) {
    return null;
  }

  const storedTheme = globalThis.localStorage.getItem(themeStorageKey);
  return storedTheme === "light" || storedTheme === "dark" ? storedTheme : null;
}

export function applyStoredTheme(): void {
  const storedTheme = getStoredTheme();
  if (storedTheme) {
    document.documentElement.dataset.theme = storedTheme;
  }
}
