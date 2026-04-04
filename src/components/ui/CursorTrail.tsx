"use client";

import { useEffect, useRef } from "react";

/** Subtle cursor distortion trail rendered on a separate canvas */
export function CursorTrail() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pointsRef = useRef<Array<{ x: number; y: number; age: number }>>([]);
  const mouseRef = useRef({ x: 0, y: 0 });
  const frameRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const handleMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
      pointsRef.current.push({ x: e.clientX, y: e.clientY, age: 0 });
      if (pointsRef.current.length > 50) {
        pointsRef.current.shift();
      }
    };
    window.addEventListener("mousemove", handleMove);

    const isDark = () => document.documentElement.classList.contains("dark");

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const points = pointsRef.current;
      for (let i = 0; i < points.length; i++) {
        points[i].age += 1;
        const alpha = Math.max(0, 1 - points[i].age / 30);
        if (alpha <= 0) continue;

        const size = 3 + (1 - alpha) * 8;

        // Glitch offset — small random displacement
        const glitchX = (Math.random() - 0.5) * 4 * alpha;
        const glitchY = (Math.random() - 0.5) * 4 * alpha;

        ctx.beginPath();
        ctx.arc(
          points[i].x + glitchX,
          points[i].y + glitchY,
          size,
          0,
          Math.PI * 2
        );

        const dark = isDark();
        const r = dark ? 96 : 37;
        const g = dark ? 165 : 99;
        const b = dark ? 250 : 235;
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha * 0.15})`;
        ctx.fill();

        // Occasional glitch rectangle
        if (Math.random() < 0.03 * alpha) {
          const w = 20 + Math.random() * 40;
          const h = 2 + Math.random() * 4;
          ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha * 0.08})`;
          ctx.fillRect(points[i].x - w / 2, points[i].y - h / 2, w, h);
        }
      }

      // Remove dead points
      pointsRef.current = points.filter(p => p.age < 30);

      frameRef.current = requestAnimationFrame(animate);
    };

    frameRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(frameRef.current);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 9999 }}
    />
  );
}
