"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { TiltCard } from "@/components/ui/TiltCard";
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

export function ProjectsSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const t = dict();

  return (
    <section id="projects" ref={ref} className="relative overflow-hidden">
      {/* Background gradient */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full opacity-10 blur-3xl pointer-events-none"
        style={{
          background: "radial-gradient(circle, var(--accent), transparent 70%)",
        }}
      />

      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-16"
        >
          <span className="text-sm font-mono tracking-widest text-[var(--accent)] uppercase">
            04
          </span>
          <h2 className="text-4xl md:text-5xl font-bold mt-4 mb-6">
            {t.projects.title}
          </h2>
          <p className="text-lg text-[var(--muted)] max-w-2xl mx-auto">
            {t.projects.subtitle}
          </p>
        </motion.div>

        {/* Projects grid */}
        <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
          {t.projects.items.map((project, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
              transition={{
                duration: 0.8,
                delay: 0.2 + i * 0.15,
                ease: [0.22, 1, 0.36, 1],
              }}
              className={i === 0 ? "lg:col-span-2 lg:row-span-2" : ""}
            >
              <TiltCard
                className={`glass-card h-full group relative overflow-hidden ${
                  i === 0 ? "p-10" : "p-8"
                }`}
                intensity={5}
              >
                {/* Background pattern for featured project */}
                {i === 0 && (
                  <div className="absolute inset-0 opacity-5">
                    <div
                      className="absolute inset-0"
                      style={{
                        backgroundImage: `
                          linear-gradient(var(--accent) 1px, transparent 1px),
                          linear-gradient(90deg, var(--accent) 1px, transparent 1px)
                        `,
                        backgroundSize: "40px 40px",
                      }}
                    />
                  </div>
                )}

                {/* Icon */}
                <div
                  className={`${
                    i === 0 ? "w-16 h-16" : "w-12 h-12"
                  } rounded-xl bg-gradient-to-br from-[var(--accent)] to-[var(--accent-2)] flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform`}
                >
                  {iconMap[project.icon] || iconMap.compass}
                </div>

                {/* Content */}
                <h3
                  className={`${
                    i === 0 ? "text-2xl" : "text-xl"
                  } font-semibold mb-4 group-hover:text-[var(--accent)] transition-colors`}
                >
                  {project.title}
                </h3>
                <p
                  className={`text-[var(--muted)] leading-relaxed ${
                    i === 0 ? "text-lg" : ""
                  }`}
                >
                  {project.summary}
                </p>

                {/* Gradient border on hover */}
                <div
                  className="absolute inset-0 rounded-[inherit] opacity-0 group-hover:opacity-100 transition-opacity -z-10"
                  style={{
                    background:
                      "linear-gradient(135deg, var(--accent), transparent, var(--accent-2))",
                    padding: "1px",
                  }}
                />
              </TiltCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
