"use client";

import { useEffect, useRef, useState, useCallback } from "react";

interface ScrollState {
  /** 0-1 overall page progress */
  progress: number;
  /** Which section index is currently dominant (0 = hero, 1 = about, etc.) */
  activeSection: number;
  /** 0-1 spikes when crossing section boundaries, decays quickly */
  sectionPulse: number;
  /** Per-section visibility (0-1) keyed by section id */
  sectionVisibility: Record<string, number>;
  /** Raw scroll position in pixels */
  scrollY: number;
  /** Scroll velocity (px/frame) */
  velocity: number;
}

const SECTION_IDS = ["hero", "about", "projects", "experience", "contact"];
const PULSE_DECAY = 0.92; // How quickly the section pulse decays

export function useScrollOrchestrator(): ScrollState {
  const [state, setState] = useState<ScrollState>({
    progress: 0,
    activeSection: 0,
    sectionPulse: 0,
    sectionVisibility: {},
    scrollY: 0,
    velocity: 0,
  });

  const prevScrollRef = useRef(0);
  const prevSectionRef = useRef(0);
  const pulseRef = useRef(0);
  const frameRef = useRef<number>(0);

  const update = useCallback(() => {
    const scrollY = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? scrollY / docHeight : 0;
    const velocity = scrollY - prevScrollRef.current;

    // Calculate per-section visibility
    const sectionVisibility: Record<string, number> = {};
    let activeSection = 0;
    let maxVisibility = 0;

    for (let i = 0; i < SECTION_IDS.length; i++) {
      const id = SECTION_IDS[i];
      const el = document.getElementById(id);
      if (!el) {
        // Hero doesn't have an id, use first section
        if (i === 0) {
          const heroVis = 1 - Math.min(scrollY / window.innerHeight, 1);
          sectionVisibility[id] = heroVis;
          if (heroVis > maxVisibility) {
            maxVisibility = heroVis;
            activeSection = 0;
          }
        }
        continue;
      }

      const rect = el.getBoundingClientRect();
      const viewportHeight = window.innerHeight;

      // How much of the section is in the viewport (0-1)
      const top = Math.max(0, rect.top);
      const bottom = Math.min(viewportHeight, rect.bottom);
      const visible = Math.max(0, bottom - top) / viewportHeight;

      sectionVisibility[id] = visible;
      if (visible > maxVisibility) {
        maxVisibility = visible;
        activeSection = i;
      }
    }

    // Pulse on section change
    if (activeSection !== prevSectionRef.current) {
      pulseRef.current = 1.0;
      prevSectionRef.current = activeSection;
    } else {
      pulseRef.current *= PULSE_DECAY;
      if (pulseRef.current < 0.01) pulseRef.current = 0;
    }

    prevScrollRef.current = scrollY;

    setState({
      progress,
      activeSection,
      sectionPulse: pulseRef.current,
      sectionVisibility,
      scrollY,
      velocity,
    });

    frameRef.current = requestAnimationFrame(update);
  }, []);

  useEffect(() => {
    frameRef.current = requestAnimationFrame(update);
    return () => cancelAnimationFrame(frameRef.current);
  }, [update]);

  return state;
}
