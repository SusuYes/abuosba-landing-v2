"use client";

import { useCallback, useRef } from "react";

interface ScrollSample {
  /** 0-1 overall page progress */
  progress: number;
  /** 0-1 spikes when crossing section boundaries, decays quickly */
  sectionPulse: number;
}

const SECTION_IDS = ["hero", "about", "projects", "experience", "contact"];
const PULSE_DECAY = 0.92; // How quickly the section pulse decays

/**
 * Returns a sampler to call once per animation frame. It reads scroll state
 * directly from the DOM and keeps pulse state in refs, so it never triggers
 * a React re-render.
 */
export function useScrollOrchestrator(): () => ScrollSample {
  const prevSectionRef = useRef(0);
  const pulseRef = useRef(0);

  return useCallback(() => {
    const scrollY = window.scrollY;
    const viewportHeight = window.innerHeight;
    const docHeight = document.documentElement.scrollHeight - viewportHeight;
    const progress = docHeight > 0 ? scrollY / docHeight : 0;

    // Find the section that fills the most of the viewport
    let activeSection = 0;
    let maxVisibility = 0;

    for (let i = 0; i < SECTION_IDS.length; i++) {
      const el = document.getElementById(SECTION_IDS[i]);
      if (!el) continue;

      const rect = el.getBoundingClientRect();
      const top = Math.max(0, rect.top);
      const bottom = Math.min(viewportHeight, rect.bottom);
      const visible = Math.max(0, bottom - top) / viewportHeight;

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

    return { progress, sectionPulse: pulseRef.current };
  }, []);
}
