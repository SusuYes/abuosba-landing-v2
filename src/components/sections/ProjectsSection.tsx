"use client";

import { useRef, useState } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { DecodeText } from "@/components/ui/GlitchText";
import { dict } from "@/lib/i18n";

const iconMap: Record<string, React.ReactNode> = {
  compass: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
    </svg>
  ),
  folder: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z" />
    </svg>
  ),
  pin: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  ),
};

const cardPatterns = [
  `repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(var(--accent-rgb), 0.03) 10px, rgba(var(--accent-rgb), 0.03) 11px)`,
  `radial-gradient(circle at 30% 70%, rgba(var(--accent-rgb), 0.05), transparent 60%)`,
  `radial-gradient(circle, rgba(var(--accent-rgb), 0.06) 1px, transparent 1px)`,
];
const cardPatternSizes = ["auto", "auto", "12px 12px"];

export function ProjectsSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [hovered, setHovered] = useState<number | null>(null);
  const t = dict();

  return (
    <section id="projects" ref={ref} className="relative overflow-hidden">
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full opacity-0 blur-3xl pointer-events-none"
        animate={isInView ? { opacity: 0.07 } : {}}
        transition={{ duration: 2 }}
        style={{ background: "radial-gradient(circle, var(--accent), transparent 70%)" }}
      />

      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-16"
        >
          <motion.div initial={{ width: 0 }} animate={isInView ? { width: "3rem" } : {}} transition={{ duration: 0.6 }} className="h-px bg-[var(--accent)] mx-auto mb-4" />
          <span className="text-sm font-mono tracking-widest text-[var(--accent)] uppercase">
            {isInView ? <DecodeText text="02 // PROJECTS" delay={200} speed={50} /> : "02 // PROJECTS"}
          </span>
          <h2 className="text-4xl md:text-5xl font-bold mt-4 mb-6">{t.projects.title}</h2>
          <p className="text-lg text-[var(--muted)] max-w-2xl mx-auto">{t.projects.subtitle}</p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
          {t.projects.items.map((project, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
              transition={{ duration: 0.8, delay: 0.2 + i * 0.15, ease: [0.22, 1, 0.36, 1] }}
              className={i === 0 ? "lg:col-span-2 lg:row-span-2" : ""}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
            >
              <div className={`glass-card h-full group relative overflow-hidden ${i === 0 ? "p-10" : "p-8"} transition-all duration-300`}>
                {/* Hover pattern */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{ background: cardPatterns[i], backgroundSize: cardPatternSizes[i] }}
                />

                {/* Hover border */}
                <AnimatePresence>
                  {hovered === i && (
                    <motion.div
                      className="absolute inset-0 rounded-[inherit] pointer-events-none"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="absolute inset-[-1px] rounded-[inherit] bg-gradient-to-r from-[var(--accent)] via-transparent to-[var(--accent-2)] opacity-40" />
                      <div className="absolute inset-[1px] rounded-[calc(1.5rem-1px)] bg-[var(--card-solid)]" />
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Glitch flash */}
                <AnimatePresence>
                  {hovered === i && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: [0, 0.1, 0, 0.06, 0] }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="absolute inset-0 bg-[var(--accent)] rounded-[inherit] pointer-events-none"
                    />
                  )}
                </AnimatePresence>

                <div className={`${i === 0 ? "w-16 h-16" : "w-12 h-12"} rounded-xl bg-gradient-to-br from-[var(--accent)] to-[var(--accent-2)] flex items-center justify-center text-white mb-6 group-hover:scale-110 group-hover:shadow-[0_0_25px_rgba(var(--accent-rgb),0.25)] transition-all duration-300 relative z-10`}>
                  {iconMap[project.icon] || iconMap.compass}
                </div>

                <h3 className={`${i === 0 ? "text-2xl" : "text-xl"} font-semibold mb-4 group-hover:text-[var(--accent)] transition-colors relative z-10`}>
                  {project.title}
                </h3>
                <p className={`text-[var(--muted)] leading-relaxed relative z-10 ${i === 0 ? "text-lg" : ""}`}>
                  {project.summary}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
