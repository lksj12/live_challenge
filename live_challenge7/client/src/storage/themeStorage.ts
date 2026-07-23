export type ThemeMode = 'light' | 'dark';

const THEME_KEY = 'keeply.theme.v1';

export function parseTheme(value: string | null): ThemeMode | null {
  return value === 'light' || value === 'dark' ? value : null;
}

export function loadTheme(): ThemeMode {
  try {
    const stored = parseTheme(window.localStorage.getItem(THEME_KEY));
    if (stored !== null) {
      return stored;
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  } catch {
    return 'light';
  }
}

export function saveTheme(theme: ThemeMode): boolean {
  try {
    window.localStorage.setItem(THEME_KEY, theme);
    return true;
  } catch {
    return false;
  }
}
