"use client";

import { motion } from "framer-motion";

interface TextRevealProps {
  text: string;
  className?: string;
  delay?: number;
  staggerChildren?: number;
  as?: "h1" | "h2" | "h3" | "p" | "span";
}

const containerVariants = {
  hidden: {},
  visible: (custom: { delay: number; stagger: number }) => ({
    transition: {
      delayChildren: custom.delay,
      staggerChildren: custom.stagger,
    },
  }),
};

const wordVariants = {
  hidden: {
    opacity: 0,
    y: 20,
    rotateX: -20,
  },
  visible: {
    opacity: 1,
    y: 0,
    rotateX: 0,
    transition: {
      type: "spring" as const,
      damping: 12,
      stiffness: 100,
    },
  },
};

export function TextReveal({
  text,
  className = "",
  delay = 0,
  staggerChildren = 0.05,
  as = "span",
}: TextRevealProps) {
  const words = text.split(" ");
  const Tag = motion[as] as typeof motion.span;

  return (
    <Tag
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      custom={{ delay, stagger: staggerChildren }}
      className={`inline-flex flex-wrap ${className}`}
      style={{ perspective: "1000px" }}
    >
      {words.map((word, i) => (
        <motion.span
          key={i}
          variants={wordVariants}
          className="inline-block mr-[0.25em]"
          style={{ transformStyle: "preserve-3d" }}
        >
          {word}
        </motion.span>
      ))}
    </Tag>
  );
}

// Letter-by-letter variant for names/headings
interface LetterRevealProps {
  text: string;
  className?: string;
  delay?: number;
  staggerChildren?: number;
}

const letterVariants = {
  hidden: {
    opacity: 0,
    y: 50,
    rotateY: -90,
  },
  visible: {
    opacity: 1,
    y: 0,
    rotateY: 0,
    transition: {
      type: "spring" as const,
      damping: 10,
      stiffness: 100,
    },
  },
};

export function LetterReveal({
  text,
  className = "",
  delay = 0,
  staggerChildren = 0.03,
}: LetterRevealProps) {
  const letters = text.split("");

  return (
    <motion.span
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      custom={{ delay, stagger: staggerChildren }}
      className={`inline-flex ${className}`}
      style={{ perspective: "1000px" }}
    >
      {letters.map((letter, i) => (
        <motion.span
          key={i}
          variants={letterVariants}
          className="inline-block"
          style={{
            transformStyle: "preserve-3d",
            whiteSpace: letter === " " ? "pre" : "normal",
          }}
        >
          {letter === " " ? "\u00A0" : letter}
        </motion.span>
      ))}
    </motion.span>
  );
}
