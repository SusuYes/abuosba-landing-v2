"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { DecodeText } from "@/components/ui/GlitchText";
import { MagneticWrapper } from "@/components/ui/MagneticWrapper";
import { ScrollIndicator } from "@/components/ui/ScrollIndicator";
import { dict } from "@/lib/i18n";

const stagger = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.4 },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const },
  },
};

export function HeroSection() {
  const [mounted, setMounted] = useState(false);
  const t = dict();

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 40, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 40, damping: 20 });
  const parallaxX = useTransform(springX, [-0.5, 0.5], [-15, 15]);
  const parallaxY = useTransform(springY, [-0.5, 0.5], [-10, 10]);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      mouseX.set((e.clientX / window.innerWidth) - 0.5);
      mouseY.set((e.clientY / window.innerHeight) - 0.5);
    };
    window.addEventListener("mousemove", h);
    return () => window.removeEventListener("mousemove", h);
  }, [mouseX, mouseY]);

  if (!mounted) {
    return (
      <section id="hero" className="relative min-h-screen flex items-center justify-center">
        <div className="text-[var(--muted)] font-mono text-sm animate-pulse">...</div>
      </section>
    );
  }

  return (
    <section id="hero" className="relative min-h-screen flex items-center overflow-hidden">
      <motion.div className="content-layer w-full relative z-10" style={{ x: parallaxX, y: parallaxY }}>
        <div className="max-w-7xl mx-auto px-6 pt-6 pb-20">
          <motion.div
            className="grid lg:grid-cols-[1.2fr_1fr] gap-12 lg:gap-16 items-center"
            variants={stagger}
            initial="hidden"
            animate="visible"
          >
            {/* Left */}
            <div className="space-y-8">
              {/* Brand */}
              <motion.div variants={fadeUp}>
                <DecodeText
                  text={t.hero.brand.toUpperCase()}
                  className="text-sm font-mono tracking-[0.3em] text-[var(--muted)]"
                  delay={500}
                  speed={70}
                />
              </motion.div>

              {/* Headline — always readable, clean type */}
              <motion.h1
                variants={fadeUp}
                className="text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.1]"
              >
                {t.hero.headlineA}
                <br />
                <span className="gradient-text-animated">{t.hero.headlineB}</span>
              </motion.h1>

              {/* Blurb */}
              <motion.p variants={fadeUp} className="text-lg text-[var(--muted)] max-w-xl leading-relaxed">
                {t.hero.blurb}
              </motion.p>

              {/* CTAs */}
              <motion.div variants={fadeUp} className="flex flex-wrap gap-4 pt-4">
                <MagneticWrapper strength={0.2}>
                  <a href="#contact" className="btn-primary glow-hover">
                    <span>{t.hero.ctaPrimary}</span>
                  </a>
                </MagneticWrapper>
                <MagneticWrapper strength={0.15}>
                  <a href={`mailto:${t.contact.email}`} className="btn-secondary btn-glitch">
                    <span>{t.hero.ctaSecondary}</span>
                  </a>
                </MagneticWrapper>
              </motion.div>
            </div>

            {/* Right — Focus card with terminal aesthetic */}
            <motion.div variants={fadeUp}>
              <div className="glass-card p-8 md:p-10 relative overflow-hidden group">
                {/* Hover border animation */}
                <div className="absolute inset-0 rounded-[inherit] opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <div className="absolute inset-[-1px] rounded-[inherit] bg-gradient-to-r from-[var(--accent)] via-[var(--accent-2)] to-[var(--accent)] animate-border-flow" />
                  <div className="absolute inset-[1px] rounded-[calc(1.5rem-1px)] bg-[var(--card-solid)]" />
                </div>

                {/* Terminal dots */}
                <div className="flex items-center gap-2 mb-6 relative z-10">
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500/50" />
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50" />
                    <motion.div
                      animate={{ opacity: [0.4, 0.9, 0.4] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="w-2.5 h-2.5 rounded-full bg-green-500/60"
                    />
                  </div>
                  <span className="text-xs font-mono text-[var(--muted)] ml-2">
                    ~/{t.hero.focus.toLowerCase()}
                  </span>
                </div>

                {/* Focus items — clean text, decorative $ prompt */}
                <div className="space-y-4 relative z-10">
                  {t.hero.focusItems.map((item, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -15 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 1.0 + i * 0.15, duration: 0.5, ease: [0.22, 1, 0.36, 1] as const }}
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-[var(--accent)] font-mono text-sm select-none mt-0.5">$</span>
                        <div>
                          <p className="font-medium text-[var(--foreground)]">{item.k}</p>
                          <p className="text-sm text-[var(--muted)]">{item.v}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Subtle corner decoration */}
                <motion.div
                  animate={{ opacity: [0.15, 0.3, 0.15] }}
                  transition={{ duration: 4, repeat: Infinity }}
                  className="absolute top-4 right-4 text-[10px] font-mono text-[var(--accent)]"
                >
                  SIGNAL_OK
                </motion.div>

                <div
                  className="absolute -inset-px rounded-[inherit] -z-10 opacity-30"
                  style={{ background: "linear-gradient(135deg, var(--accent), transparent, var(--accent-2))" }}
                />
              </div>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>

      <ScrollIndicator />
    </section>
  );
}
