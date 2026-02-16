"use client";

import { ReactNode, createContext, useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "workstation-theme";

type Theme = "light" | "dark";

interface ThemeProviderProps {
  children: ReactNode;
}

interface ThemeContextValue {
  theme: Theme;
  setTheme: (value: Theme) => void;
}

export const ThemeContext = createContext<ThemeContextValue>({
  theme: "dark",
  setTheme: () => {},
});

export function ThemeProvider(props: Readonly<ThemeProviderProps>) {
  const { children } = props;
  const [theme, setTheme] = useState<Theme>("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = globalThis.localStorage.getItem(STORAGE_KEY) as Theme | null;
    const prefersDark = globalThis.matchMedia(
      "(prefers-color-scheme: dark)",
    ).matches;
    const initial = stored ?? (prefersDark ? "dark" : "light");
    setTheme(initial);
    setMounted(true);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    // Set data-theme attribute for CSS variable switching
    root.dataset.theme = theme;
    // Set/remove "dark" class so Tailwind dark: variants work
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    globalThis.localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  const contextValue = useMemo(() => ({ theme, setTheme }), [theme]);

  return (
    <ThemeContext.Provider value={contextValue}>
      {mounted ? children : null}
    </ThemeContext.Provider>
  );
}
