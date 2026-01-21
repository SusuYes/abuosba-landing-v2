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
          {/* LinkedIn - desktop only */}
          <MagneticWrapper strength={0.15} className="hidden lg:block">
            <a
              href="https://www.linkedin.com/in/abuosba"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 text-sm text-[var(--muted)] hover:text-[var(--foreground)] transition-colors rounded-full hover:bg-[var(--border)] flex items-center gap-2"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
              {t.nav.linkedin}
            </a>
          </MagneticWrapper>

          <ThemeToggle />
        </div>
      </nav>
    </motion.header>
  );
}
