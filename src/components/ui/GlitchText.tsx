"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion } from "framer-motion";

// Characters used during scramble
const GLITCH_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;':\",./<>?`~";

interface GlitchTextProps {
  text: string;
  className?: string;
  /** Delay before scramble starts (ms) */
  delay?: number;
  /** Duration of the scramble phase (ms) */
  scrambleDuration?: number;
  /** Trigger the animation */
  trigger?: boolean;
  /** Continuously glitch */
  continuous?: boolean;
  /** Intensity: how many characters are wrong at peak */
  intensity?: number;
  as?: "h1" | "h2" | "h3" | "p" | "span" | "div";
}

export function GlitchText({
  text,
  className = "",
  delay = 0,
  scrambleDuration = 1500,
  trigger = true,
  continuous = false,
  intensity = 1.0,
  as: Tag = "span",
}: GlitchTextProps) {
  const [displayText, setDisplayText] = useState(trigger ? "" : text);
  const frameRef = useRef<number>(0);
  const hasRunRef = useRef(false);

  const scramble = useCallback(() => {
    const startTime = Date.now();
    const chars = text.split("");

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / scrambleDuration, 1);

      // Ease out — characters resolve faster toward the end
      const eased = 1 - Math.pow(1 - progress, 3);

      const result = chars.map((char, i) => {
        if (char === " ") return " ";

        // Each character has its own resolve threshold
        const charThreshold = (i / chars.length) * intensity;
        if (eased > charThreshold) {
          // Additional per-character resolve with some randomness
          const charProgress = (eased - charThreshold) / (1 - charThreshold);
          if (charProgress > 0.5 + Math.random() * 0.3) {
            return char; // Resolved
          }
        }

        // Still scrambling
        return GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)];
      });

      setDisplayText(result.join(""));

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      } else {
        setDisplayText(text);
      }
    };

    frameRef.current = requestAnimationFrame(animate);
  }, [text, scrambleDuration, intensity]);

  useEffect(() => {
    if (!trigger || hasRunRef.current) return;

    if (continuous) {
      // For continuous mode, re-scramble periodically
      const interval = setInterval(() => {
        scramble();
      }, scrambleDuration + 2000);
      const timeout = setTimeout(scramble, delay);
      return () => {
        clearInterval(interval);
        clearTimeout(timeout);
        cancelAnimationFrame(frameRef.current);
      };
    }

    hasRunRef.current = true;
    const timeout = setTimeout(scramble, delay);
    return () => {
      clearTimeout(timeout);
      cancelAnimationFrame(frameRef.current);
    };
  }, [trigger, delay, scramble, scrambleDuration, continuous]);

  return (
    <Tag className={`${className} font-mono`}>
      {displayText}
    </Tag>
  );
}

/** Decode effect — characters appear one by one from random to correct */
interface DecodeTextProps {
  text: string;
  className?: string;
  delay?: number;
  speed?: number; // ms per character
  trigger?: boolean;
  as?: "h1" | "h2" | "h3" | "p" | "span" | "div";
}

export function DecodeText({
  text,
  className = "",
  delay = 0,
  speed = 40,
  trigger = true,
  as: Tag = "span",
}: DecodeTextProps) {
  const [revealIndex, setRevealIndex] = useState(-1);
  const [scrambleChars, setScrambleChars] = useState<string[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval>>(undefined);
  const hasRunRef = useRef(false);

  useEffect(() => {
    if (!trigger || hasRunRef.current) return;
    hasRunRef.current = true;

    const timeout = setTimeout(() => {
      let idx = 0;
      // Pre-generate scramble characters for upcoming positions
      setScrambleChars(
        text.split("").map(() => GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)])
      );

      intervalRef.current = setInterval(() => {
        idx++;
        setRevealIndex(idx);
        // Update scramble chars for unrevealed positions
        setScrambleChars(prev =>
          prev.map((c, i) =>
            i >= idx ? GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)] : c
          )
        );

        if (idx >= text.length) {
          clearInterval(intervalRef.current);
        }
      }, speed);
    }, delay);

    return () => {
      clearTimeout(timeout);
      clearInterval(intervalRef.current);
    };
  }, [trigger, text, delay, speed]);

  if (!trigger) return <Tag className={className}>{text}</Tag>;

  return (
    <Tag className={className}>
      {text.split("").map((char, i) => {
        if (char === " ") return " ";
        const revealed = i < revealIndex;
        return (
          <motion.span
            key={i}
            initial={{ opacity: 0 }}
            animate={{ opacity: revealed ? 1 : i < revealIndex + 3 ? 0.4 : 0 }}
            className={revealed ? "" : "text-[var(--accent)]"}
          >
            {revealed ? char : scrambleChars[i] || char}
          </motion.span>
        );
      })}
    </Tag>
  );
}

/** Typewriter with intentional errors that get corrected */
interface TypewriterProps {
  text: string;
  className?: string;
  delay?: number;
  speed?: number;
  errorRate?: number; // 0-1, chance of making a typo
  trigger?: boolean;
  as?: "h1" | "h2" | "h3" | "p" | "span" | "div";
}

export function Typewriter({
  text,
  className = "",
  delay = 0,
  speed = 60,
  errorRate = 0.08,
  trigger = true,
  as: Tag = "span",
}: TypewriterProps) {
  const [displayText, setDisplayText] = useState("");
  const [showCursor, setShowCursor] = useState(true);
  const hasRunRef = useRef(false);

  useEffect(() => {
    if (!trigger || hasRunRef.current) return;
    hasRunRef.current = true;

    const timeout = setTimeout(() => {
      let idx = 0;
      let current = "";
      let errorCorrectQueue: number[] = [];

      const type = () => {
        // If we have errors to correct, backspace first
        if (errorCorrectQueue.length > 0) {
          current = current.slice(0, -1);
          errorCorrectQueue.pop();
          setDisplayText(current);
          setTimeout(type, speed * 0.5);
          return;
        }

        if (idx >= text.length) {
          setShowCursor(false);
          return;
        }

        // Maybe make an error
        if (Math.random() < errorRate && text[idx] !== " " && idx < text.length - 1) {
          const wrongChar = GLITCH_CHARS[Math.floor(Math.random() * 26)]; // just letters
          current += wrongChar;
          errorCorrectQueue.push(1);
          setDisplayText(current);
          setTimeout(type, speed * 2); // Pause before correcting
          return;
        }

        current += text[idx];
        idx++;
        setDisplayText(current);
        setTimeout(type, speed + (Math.random() - 0.5) * speed * 0.5);
      };

      type();
    }, delay);

    return () => clearTimeout(timeout);
  }, [trigger, text, delay, speed, errorRate]);

  return (
    <Tag className={className}>
      {displayText}
      {showCursor && trigger && (
        <motion.span
          animate={{ opacity: [1, 0] }}
          transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse" }}
          className="text-[var(--accent)]"
        >
          |
        </motion.span>
      )}
    </Tag>
  );
}
