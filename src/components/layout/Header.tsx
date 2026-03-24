"use client";

import { useEffect, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ThemeToggle } from "@/components/toggles/ThemeToggle";
import { MagneticWrapper } from "@/components/ui/MagneticWrapper";
import { dict } from "@/lib/i18n";

const navLinks = [
  { key: "about", href: "#about" },
  { key: "experience", href: "#experience" },
  { key: "contact", href: "#contact" },
] as const;

export function Header() {
  const [mounted, setMounted] = useState(false);
  const { scrollY } = useScroll();

  const headerBg = useTransform(
    scrollY,
    [0, 100],
    ["rgba(0, 0, 0, 0)", "rgba(0, 0, 0, 0.5)"]
  );

  const headerBlur = useTransform(scrollY, [0, 100], ["blur(0px)", "blur(20px)"]);

  const borderColor = useTransform(
    scrollY,
    [0, 100],
    ["transparent", "rgba(148, 163, 184, 0.12)"]
  );

  const t = dict();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <header className="fixed top-0 left-0 right-0 h-20 z-50" />;
  }

  return (
    <motion.header
      className="fixed top-0 left-0 right-0 z-50 border-b border-transparent"
      style={{
        backgroundColor: headerBg,
        backdropFilter: headerBlur,
        WebkitBackdropFilter: headerBlur,
        borderColor: borderColor,
      }}
    >
      <nav className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        {/* Logo */}
        <MagneticWrapper strength={0.1}>
          <a
            href="#"
            className="font-mono text-lg font-semibold tracking-tight hover:text-[var(--accent)] transition-colors"
          >
            {t.hero.brand.toLowerCase()}<span className="text-[var(--accent)]">.com</span>
          </a>
        </MagneticWrapper>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <MagneticWrapper key={link.key} strength={0.15}>
              <a
                href={link.href}
                className="px-4 py-2 text-sm text-[var(--muted)] hover:text-[var(--foreground)] transition-colors rounded-full hover:bg-[var(--border)]"
              >
                {t.nav[link.key as keyof typeof t.nav]}
              </a>
            </MagneticWrapper>
          ))}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          <ThemeToggle />
        </div>
      </nav>
    </motion.header>
  );
}
