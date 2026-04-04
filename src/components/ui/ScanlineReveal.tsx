"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

interface ScanlineRevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  direction?: "left" | "right" | "up";
}

/** Content appears as if being transmitted — horizontal scanline wipe */
export function ScanlineReveal({
  children,
  className = "",
  delay = 0,
  direction = "left",
}: ScanlineRevealProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  const clipPaths = {
    left: {
      hidden: "inset(0 100% 0 0)",
      visible: "inset(0 0% 0 0)",
    },
    right: {
      hidden: "inset(0 0 0 100%)",
      visible: "inset(0 0 0 0%)",
    },
    up: {
      hidden: "inset(100% 0 0 0)",
      visible: "inset(0% 0 0 0)",
    },
  };

  return (
    <div ref={ref} className={className}>
      <motion.div
        initial={{ clipPath: clipPaths[direction].hidden, opacity: 0 }}
        animate={
          isInView
            ? { clipPath: clipPaths[direction].visible, opacity: 1 }
            : {}
        }
        transition={{
          duration: 0.8,
          delay,
          ease: [0.22, 1, 0.36, 1],
        }}
      >
        {children}
      </motion.div>
      {/* Scanline edge */}
      {isInView && (
        <motion.div
          initial={{ opacity: 1, [direction === "up" ? "top" : "left"]: "0%" }}
          animate={{ opacity: 0, [direction === "up" ? "top" : "left"]: "100%" }}
          transition={{ duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] }}
          className="absolute pointer-events-none"
          style={{
            [direction === "up" ? "left" : "top"]: 0,
            [direction === "up" ? "right" : "bottom"]: 0,
            [direction === "up" ? "height" : "width"]: "2px",
            background: "linear-gradient(90deg, transparent, var(--accent), var(--accent-2), transparent)",
            boxShadow: "0 0 20px rgba(var(--accent-rgb), 0.5)",
          }}
        />
      )}
    </div>
  );
}
