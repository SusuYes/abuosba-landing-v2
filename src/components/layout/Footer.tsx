"use client";

import { motion } from "framer-motion";
import { MagneticWrapper } from "@/components/ui/MagneticWrapper";
import { dict } from "@/lib/i18n";

export function Footer() {
  const t = dict();
  const year = new Date().getFullYear();

  return (
    <footer className="relative border-t border-[var(--border)] mt-20">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Copyright */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-sm text-[var(--muted)]"
          >
            {t.footer.copyright.replace("{year}", String(year))}
          </motion.p>

          {/* Links */}
          <div className="flex items-center gap-4">
            <MagneticWrapper strength={0.2}>
              <a
                href={`mailto:${t.contact.email}`}
                className="w-10 h-10 rounded-full glass-card-subtle flex items-center justify-center text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
                aria-label="Email"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <rect width="20" height="16" x="2" y="4" rx="2" />
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                </svg>
              </a>
            </MagneticWrapper>
          </div>
        </div>
      </div>
    </footer>
  );
}
