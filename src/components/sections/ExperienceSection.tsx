"use client";

import { useRef } from "react";
import { motion, useInView, useScroll, useTransform } from "framer-motion";
import { DecodeText } from "@/components/ui/GlitchText";
import { ScanlineReveal } from "@/components/ui/ScanlineReveal";
import { dict } from "@/lib/i18n";

export function ExperienceSection() {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start end", "end start"] });
  const lineHeight = useTransform(scrollYProgress, [0.1, 0.6], ["0%", "100%"]);
  const t = dict();

  return (
    <section id="experience" ref={sectionRef} className="relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-[1fr_2fr] gap-12 lg:gap-20">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="lg:sticky lg:top-32 lg:h-fit"
          >
            <motion.div initial={{ width: 0 }} animate={isInView ? { width: "2rem" } : {}} transition={{ duration: 0.6 }} className="h-px bg-[var(--accent)] mb-4" />
            <span className="text-sm font-mono tracking-widest text-[var(--accent)] uppercase">
              {isInView ? <DecodeText text="03 // EXPERIENCE" delay={200} speed={50} /> : "03 // EXPERIENCE"}
            </span>
            <h2 className="text-4xl md:text-5xl font-bold mt-4 mb-6">{t.experience.title}</h2>
            <p className="text-lg text-[var(--muted)] leading-relaxed">{t.experience.subtitle}</p>
          </motion.div>

          <div className="relative">
            <div className="absolute left-0 lg:left-8 top-0 bottom-0 w-px bg-[var(--border)]">
              <motion.div className="w-full bg-gradient-to-b from-[var(--accent)] to-[var(--accent-2)]" style={{ height: lineHeight }} />
              <motion.div className="absolute w-3 -left-[5px] h-3 rounded-full bg-[var(--accent)] blur-sm" style={{ top: lineHeight }} />
            </div>

            <div className="space-y-12 pl-8 lg:pl-20">
              {t.experience.items.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 40 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.8, delay: 0.3 + i * 0.2, ease: [0.22, 1, 0.36, 1] }}
                  className="relative"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={isInView ? { scale: 1 } : {}}
                    transition={{ delay: 0.5 + i * 0.2, type: "spring" }}
                    className="absolute -left-8 lg:-left-20 top-2 w-4 h-4 rounded-full bg-[var(--card-solid)] border-2 border-[var(--accent)] z-10"
                  >
                    <div className="absolute inset-1 rounded-full bg-[var(--accent)]" />
                    <motion.div
                      animate={{ scale: [1, 1.8, 1], opacity: [0.4, 0, 0.4] }}
                      transition={{ duration: 2, repeat: Infinity, delay: i * 0.5 }}
                      className="absolute inset-0 rounded-full border border-[var(--accent)]"
                    />
                  </motion.div>

                  <ScanlineReveal delay={0.4 + i * 0.2} direction="left" className="relative">
                    <div className="glass-card p-6 md:p-8 group hover:border-[var(--accent)]/30 transition-all duration-300">
                      <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                        <div>
                          <h3 className="text-xl font-semibold group-hover:text-[var(--accent)] transition-colors">{item.role}</h3>
                          <p className="text-[var(--muted)]">{item.org}</p>
                        </div>
                        {item.range && (
                          <span className="text-sm font-mono text-[var(--accent)] bg-[var(--accent)]/10 px-3 py-1 rounded-full">{item.range}</span>
                        )}
                      </div>
                      <p className="text-[var(--muted)] leading-relaxed">{item.blurb}</p>
                      <motion.div className="h-px w-0 group-hover:w-full bg-gradient-to-r from-[var(--accent)] to-transparent mt-4 transition-all duration-500" />
                    </div>
                  </ScanlineReveal>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
