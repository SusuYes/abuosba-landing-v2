"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  getThemePreference,
  cycleThemePreference,
  setThemePreference,
  type ThemePreference,
} from "@/lib/theme";

const icons = {
  system: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="2" y="3" width="20" height="14" rx="2" />
      <line x1="8" y1="21" x2="16" y2="21" />
      <line x1="12" y1="17" x2="12" y2="21" />
    </svg>
  ),
  light: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="5" />
      <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
    </svg>
  ),
  dark: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  ),
};

export function ThemeToggle() {
  const [pref, setPref] = useState<ThemePreference>("system");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setPref(getThemePreference());
  }, []);

  const handleClick = () => {
    const next = cycleThemePreference(pref);
    setPref(next);
    setThemePreference(next);
  };

  if (!mounted) {
    return <div className="w-10 h-10" />;
  }

  return (
    <motion.button
      onClick={handleClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="relative w-10 h-10 rounded-full glass-card-subtle flex items-center justify-center text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
      aria-label={`Theme: ${pref}`}
      title={`Theme: ${pref}`}
    >
      <motion.div
        key={pref}
        initial={{ opacity: 0, rotate: -90, scale: 0.5 }}
        animate={{ opacity: 1, rotate: 0, scale: 1 }}
        exit={{ opacity: 0, rotate: 90, scale: 0.5 }}
        transition={{ duration: 0.2 }}
      >
        {icons[pref]}
      </motion.div>
    </motion.button>
  );
}
