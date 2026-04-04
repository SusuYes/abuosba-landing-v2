"use client";

import { useRef } from "react";
import { motion, useInView, useScroll, useTransform } from "framer-motion";
import { DecodeText } from "@/components/ui/GlitchText";
import { ScanlineReveal } from "@/components/ui/ScanlineReveal";
import { dict } from "@/lib/i18n";

export function AboutSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const t = dict();

  const decorY = useTransform(scrollYProgress, [0, 1], [60, -60]);

  return (
    <section id="about" className="relative overflow-hidden" ref={ref}>
      {/* Background grid — fades in */}
      <motion.div
        className="absolute inset-0 pointer-events-none opacity-0"
        animate={isInView ? { opacity: 0.03 } : {}}
        transition={{ duration: 1.5 }}
        style={{
          backgroundImage: `linear-gradient(var(--accent) 1px, transparent 1px), linear-gradient(90deg, var(--accent) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />

      <motion.div
        className="absolute -top-20 -right-20 w-80 h-80 rounded-full opacity-20 blur-3xl pointer-events-none"
        style={{ background: "radial-gradient(circle, var(--accent), transparent 70%)", y: decorY }}
      />

      <div className="max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            <motion.div initial={{ width: 0 }} animate={isInView ? { width: "2rem" } : {}} transition={{ duration: 0.6 }} className="h-px bg-[var(--accent)] mb-4" />
            <span className="text-sm font-mono tracking-widest text-[var(--accent)] uppercase">
              {isInView ? <DecodeText text="01 // ABOUT" delay={200} speed={60} /> : "01 // ABOUT"}
            </span>
            <h2 className="text-4xl md:text-5xl font-bold mt-4 mb-6">{t.about.title}</h2>
            <p className="text-xl text-[var(--muted)] leading-relaxed">{t.about.subtitle}</p>
          </motion.div>

          <ScanlineReveal delay={0.3} direction="left" className="relative">
            <div className="glass-card p-8 md:p-10 relative group">
              <p className="text-lg leading-relaxed text-[var(--foreground)]">{t.about.body}</p>
              <motion.div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[var(--accent)] to-transparent opacity-0 group-hover:opacity-40 transition-opacity" />
            </div>
          </ScanlineReveal>
        </div>
      </div>
    </section>
  );
}
