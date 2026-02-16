"use client";

import { useContext } from "react";
import { Moon, SunMedium } from "lucide-react";
import { ThemeContext } from "@/components/ThemeProvider";

export function DarkModeToggle() {
  const { theme, setTheme } = useContext(ThemeContext);

  return (
    <button
      type="button"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 transition hover:bg-slate-200 dark:bg-slate-800"
      aria-label="Toggle dark mode"
    >
      {theme === "dark" ? (
        <SunMedium className="h-5 w-5" />
      ) : (
        <Moon className="h-5 w-5" />
      )}
    </button>
  );
}
