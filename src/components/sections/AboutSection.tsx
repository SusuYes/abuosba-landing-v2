"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { dict } from "@/lib/i18n";

export function AboutSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const t = dict();

  return (
    <section id="about" className="relative overflow-hidden" ref={ref}>
      {/* Background decoration */}
      <div
        className="absolute -top-40 -right-40 w-80 h-80 rounded-full opacity-30 blur-3xl pointer-events-none"
        style={{ background: "var(--accent)" }}
      />

      <div className="max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left: Title */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.1 }}
              className="text-sm font-mono tracking-widest text-[var(--accent)] uppercase"
            >
              01
            </motion.span>
            <h2 className="text-4xl md:text-5xl font-bold mt-4 mb-6">
              {t.about.title}
            </h2>
            <p className="text-xl text-[var(--muted)] leading-relaxed">
              {t.about.subtitle}
            </p>
          </motion.div>

          {/* Right: Content card */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="glass-card p-8 md:p-10 relative">
              <p className="text-lg leading-relaxed text-[var(--foreground)]">
                {t.about.body}
              </p>

              {/* Decorative corner */}
              <div className="absolute top-0 right-0 w-20 h-20 overflow-hidden rounded-tr-[inherit]">
                <div
                  className="absolute top-0 right-0 w-full h-full"
                  style={{
                    background:
                      "linear-gradient(135deg, transparent 50%, var(--accent) 50%)",
                    opacity: 0.1,
                  }}
                />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
