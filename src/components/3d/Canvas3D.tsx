"use client";

import { Canvas } from "@react-three/fiber";
import { Suspense, useEffect, useState, Component, type ReactNode } from "react";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useDeviceCapability } from "@/hooks/useDeviceCapability";
import { Scene } from "./Scene";

interface Canvas3DProps {
  mouseX: number;
  mouseY: number;
}

function GradientFallback() {
  return (
    <div
      className="absolute inset-0"
      style={{
        background: `
          radial-gradient(
            ellipse 80% 50% at 50% -20%,
            rgba(var(--accent-rgb), 0.15),
            transparent 50%
          ),
          radial-gradient(
            ellipse 60% 40% at 80% 0%,
            rgba(var(--accent-2-rgb), 0.1),
            transparent 40%
          )
        `,
      }}
    />
  );
}

function LoadingFallback() {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <GradientFallback />
      <div className="w-8 h-8 border-2 border-[var(--accent)]/30 border-t-[var(--accent)] rounded-full animate-spin" />
    </div>
  );
}

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class Canvas3DErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return <GradientFallback />;
    }
    return this.props.children;
  }
}

export function Canvas3D({ mouseX, mouseY }: Canvas3DProps) {
  const [mounted, setMounted] = useState(false);
  const [webglLost, setWebglLost] = useState(false);
  const reducedMotion = useReducedMotion();
  const capability = useDeviceCapability();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Show fallback for reduced motion or low capability devices
  if (!mounted || reducedMotion || capability === "low" || webglLost) {
    return <GradientFallback />;
  }

  return (
    <Canvas3DErrorBoundary>
      <div className="canvas-container">
        <Suspense fallback={<LoadingFallback />}>
          <Canvas
            camera={{ position: [0, 0, 5], fov: 75 }}
            dpr={[1, capability === "high" ? 2 : 1.5]}
            gl={{
              antialias: capability === "high",
              alpha: true,
              powerPreference: "high-performance",
            }}
            style={{ background: "transparent" }}
            onCreated={({ gl }) => {
              const canvas = gl.domElement;
              canvas.addEventListener("webglcontextlost", (e) => {
                e.preventDefault();
                setWebglLost(true);
              });
            }}
          >
            <Scene mouseX={mouseX} mouseY={mouseY} />
          </Canvas>
        </Suspense>
      </div>
    </Canvas3DErrorBoundary>
  );
}
