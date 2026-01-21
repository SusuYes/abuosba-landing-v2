"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Canvas3D } from "@/components/3d/Canvas3D";
import { TextReveal, LetterReveal } from "@/components/ui/TextReveal";
import { MagneticWrapper } from "@/components/ui/MagneticWrapper";
import { TiltCard } from "@/components/ui/TiltCard";
import { ScrollIndicator } from "@/components/ui/ScrollIndicator";
import { useMousePosition } from "@/hooks/useMousePosition";
import { dict } from "@/lib/i18n";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3,
    },
  },
} as const;

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring" as const,
      damping: 12,
      stiffness: 100,
    },
  },
} as const;

export function HeroSection() {
  const [mounted, setMounted] = useState(false);
  const { normalizedX, normalizedY } = useMousePosition();
  const t = dict();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <section className="relative min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-[var(--muted)]">Loading...</div>
      </section>
    );
  }

  return (
    <section className="relative min-h-screen flex items-start overflow-hidden">
      {/* 3D Background */}
      <Canvas3D mouseX={normalizedX} mouseY={normalizedY} />

      {/* Content overlay */}
      <div className="content-layer w-full">
        <div className="max-w-7xl mx-auto px-6 pt-6 pb-20">
          <div className="grid lg:grid-cols-[1.2fr_1fr] gap-12 lg:gap-16 items-center">
            {/* Left: Main content */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-8"
            >
              {/* Brand name */}
              <motion.div variants={itemVariants}>
                <LetterReveal
                  text={t.hero.brand.toUpperCase()}
                  className="text-sm font-mono tracking-[0.3em] text-[var(--muted)]"
                  delay={0.2}
                />
              </motion.div>

              {/* Main headline */}
              <motion.h1
                variants={itemVariants}
                className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight"
              >
                <TextReveal
                  text={t.hero.headlineA}
                  delay={0.4}
                  staggerChildren={0.04}
                />
                <br />
                <span className="gradient-text-animated">
                  <TextReveal
                    text={t.hero.headlineB}
                    delay={0.8}
                    staggerChildren={0.08}
                  />
                </span>
              </motion.h1>

              {/* Blurb */}
              <motion.p
                variants={itemVariants}
                className="text-lg text-[var(--muted)] max-w-xl leading-relaxed"
              >
                {t.hero.blurb}
              </motion.p>

              {/* CTA buttons */}
              <motion.div
                variants={itemVariants}
                className="flex flex-wrap gap-4 pt-4"
              >
                <MagneticWrapper strength={0.2}>
                  <a href="#contact" className="btn-primary glow-hover">
                    <span>{t.hero.ctaPrimary}</span>
                  </a>
                </MagneticWrapper>
              </motion.div>
            </motion.div>

            {/* Right: Focus card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: 1, duration: 0.8, type: "spring" }}
            >
              <TiltCard
                className="glass-card p-8 md:p-10"
                intensity={8}
              >
                <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[var(--accent)]" />
                  {t.hero.focus}
                </h3>

                <div className="space-y-5">
                  {t.hero.focusItems.map((item, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 1.2 + i * 0.15 }}
                      className="group"
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-xl mt-0.5 transition-transform group-hover:scale-110">
                          {i === 0 ? "📊" : i === 1 ? "🧩" : "🤝"}
                        </span>
                        <div>
                          <p className="font-medium text-[var(--foreground)]">
                            {item.k}
                          </p>
                          <p className="text-sm text-[var(--muted)]">
                            {item.v}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Decorative gradient border */}
                <div
                  className="absolute -inset-px rounded-[inherit] -z-10 opacity-50"
                  style={{
                    background:
                      "linear-gradient(135deg, var(--accent), transparent, var(--accent-2))",
                  }}
                />
              </TiltCard>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <ScrollIndicator />
    </section>
  );
}
