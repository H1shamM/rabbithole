// ui/src/hooks/useTheme.ts
import { useState, useEffect } from "react";

export function useTheme() {
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    // Check localStorage first
    const saved = localStorage.getItem("theme");
    if (saved) return saved === "dark";
    // Otherwise use system preference
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  useEffect(() => {
    // Apply dark mode attribute to html element
    document.documentElement.setAttribute(
      "data-theme",
      darkMode ? "dark" : "light",
    );
    // Save to localStorage
    localStorage.setItem("theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  // Listen for system preference changes
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (e: MediaQueryListEvent) => {
      // Only update if user hasn't manually set a preference
      const hasManualPreference = localStorage.getItem("theme") !== null;
      if (!hasManualPreference) {
        setDarkMode(e.matches);
      }
    };
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  return { darkMode, setDarkMode };
}
