"use client";

import { useRef, useMemo, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useDeviceCapability } from "@/hooks/useDeviceCapability";

interface ParticleFieldProps {
  count?: number;
  mouseX?: number;
  mouseY?: number;
}

// Custom shader for particles with glow effect
const vertexShader = `
  attribute float size;
  attribute vec3 customColor;
  varying vec3 vColor;
  varying float vAlpha;

  uniform float uTime;

  void main() {
    vColor = customColor;

    vec3 pos = position;

    // Gentle floating animation (physics handles the rest)
    float floatOffset = sin(uTime * 0.5 + position.x * 0.5 + position.y * 0.3) * 0.08;
    pos.y += floatOffset;
    pos.x += cos(uTime * 0.3 + position.z * 0.4) * 0.05;

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);

    // Size based on distance to camera for depth effect
    float depth = -mvPosition.z;
    gl_PointSize = size * (300.0 / depth);

    // Alpha based on depth
    vAlpha = smoothstep(10.0, 2.0, depth);

    gl_Position = projectionMatrix * mvPosition;
  }
`;

const fragmentShader = `
  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    // Circular particle with soft edges
    vec2 center = gl_PointCoord - 0.5;
    float dist = length(center);

    // Soft glow falloff
    float alpha = smoothstep(0.5, 0.1, dist) * vAlpha;

    // Minimal glow for readability
    float glow = exp(-dist * 10.0) * 0.08;

    vec3 finalColor = vColor + glow * vColor;

    gl_FragColor = vec4(finalColor, alpha * 0.5);
  }
`;

export function ParticleField({ mouseX = 0, mouseY = 0 }: ParticleFieldProps) {
  const meshRef = useRef<THREE.Points>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const capability = useDeviceCapability();

  // Memoize uniforms to prevent recreation on every render
  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
  }), []);

  // Physics state refs
  const velocitiesRef = useRef<Float32Array | null>(null);
  const originalPositionsRef = useRef<Float32Array | null>(null);
  const prevMouseRef = useRef({ x: 0, y: 0 });

  // Physics constants
  const GRAVITY = -0.008;
  const DAMPING = 0.97;
  const MOUSE_FORCE = 0.15;
  const MOUSE_RADIUS = 2.0;
  const RETURN_FORCE = 0.003;

  // Adjust particle count based on device capability
  const count = useMemo(() => {
    switch (capability) {
      case "high":
        return 3000;
      case "medium":
        return 1500;
      default:
        return 800;
    }
  }, [capability]);

  const { viewport } = useThree();

  // Generate particle positions and attributes
  const { positions, colors, sizes, originalPositions, velocities } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const originalPositions = new Float32Array(count * 3);
    const velocities = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);

    // Accent colors (will be updated by theme)
    const color1 = new THREE.Color("#1e40af"); // deep blue
    const color2 = new THREE.Color("#1d4ed8"); // blue

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;

      // Distribute in a hemisphere shape
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      const radius = 2 + Math.random() * 4;

      const x = radius * Math.sin(phi) * Math.cos(theta);
      const y = radius * Math.sin(phi) * Math.sin(theta) * 0.6 + 0.8;
      const z = radius * Math.cos(phi) * 0.5 - 2;

      positions[i3] = x;
      positions[i3 + 1] = y;
      positions[i3 + 2] = z;

      // Store original positions for return force
      originalPositions[i3] = x;
      originalPositions[i3 + 1] = y;
      originalPositions[i3 + 2] = z;

      // Initialize velocities to zero
      velocities[i3] = 0;
      velocities[i3 + 1] = 0;
      velocities[i3 + 2] = 0;

      // Color gradient based on position
      const t = (y + 3) / 6; // normalize y position
      const color = color1.clone().lerp(color2, t + Math.random() * 0.2);

      colors[i3] = color.r;
      colors[i3 + 1] = color.g;
      colors[i3 + 2] = color.b;

      // Random sizes
      sizes[i] = Math.random() * 3 + 1;
    }

    return { positions, colors, sizes, originalPositions, velocities };
  }, [count]);

  // Store refs to physics arrays
  useEffect(() => {
    velocitiesRef.current = velocities;
    originalPositionsRef.current = originalPositions;
  }, [velocities, originalPositions]);

  // Update theme colors
  useEffect(() => {
    const updateColors = () => {
      const isDark = document.documentElement.classList.contains("dark");
      const color1 = new THREE.Color(isDark ? "#2563eb" : "#1e40af");
      const color2 = new THREE.Color(isDark ? "#3b82f6" : "#1d4ed8");

      if (meshRef.current) {
        const colorsAttr = meshRef.current.geometry.getAttribute("customColor");
        const posAttr = meshRef.current.geometry.getAttribute("position");

        for (let i = 0; i < count; i++) {
          const i3 = i * 3;
          const y = posAttr.getY(i);
          const t = (y + 3) / 6;
          const color = color1.clone().lerp(color2, t);

          colorsAttr.setXYZ(i, color.r, color.g, color.b);
        }

        colorsAttr.needsUpdate = true;
      }
    };

    updateColors();

    // Listen for theme changes, throttled via requestAnimationFrame
    let rafId: number | null = null;
    const observer = new MutationObserver(() => {
      if (rafId !== null) return;
      rafId = requestAnimationFrame(() => {
        updateColors();
        rafId = null;
      });
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => {
      observer.disconnect();
      if (rafId !== null) cancelAnimationFrame(rafId);
    };
  }, [count]);

  // Animation loop with physics
  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
    }

    if (!meshRef.current || !velocitiesRef.current || !originalPositionsRef.current) return;

    const positionAttr = meshRef.current.geometry.getAttribute("position");
    const vel = velocitiesRef.current;
    const orig = originalPositionsRef.current;

    // Convert normalized mouse (-1 to 1) to world coordinates
    const mouseWorldX = mouseX * 4;
    const mouseWorldY = mouseY * 3;

    // Calculate mouse velocity for impulse direction
    const mouseDx = mouseWorldX - prevMouseRef.current.x;
    const mouseDy = mouseWorldY - prevMouseRef.current.y;
    const mouseSpeed = Math.sqrt(mouseDx * mouseDx + mouseDy * mouseDy);

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;

      const px = positionAttr.getX(i);
      const py = positionAttr.getY(i);
      const pz = positionAttr.getZ(i);

      // Distance to mouse
      const dx = px - mouseWorldX;
      const dy = py - mouseWorldY;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Apply mouse impulse if within radius and mouse is moving
      if (dist < MOUSE_RADIUS && mouseSpeed > 0.01) {
        const force = (1 - dist / MOUSE_RADIUS) * MOUSE_FORCE * Math.min(mouseSpeed * 3, 1);
        const dirX = dist > 0.001 ? dx / dist : Math.random() - 0.5;
        const dirY = dist > 0.001 ? dy / dist : Math.random() - 0.5;

        vel[i3] += dirX * force;
        vel[i3 + 1] += dirY * force;
        vel[i3 + 2] += (Math.random() - 0.5) * force * 0.3;
      }

      // Apply gravity
      vel[i3 + 1] += GRAVITY;

      // Apply return force toward original position
      vel[i3] += (orig[i3] - px) * RETURN_FORCE;
      vel[i3 + 1] += (orig[i3 + 1] - py) * RETURN_FORCE;
      vel[i3 + 2] += (orig[i3 + 2] - pz) * RETURN_FORCE;

      // Apply damping
      vel[i3] *= DAMPING;
      vel[i3 + 1] *= DAMPING;
      vel[i3 + 2] *= DAMPING;

      // Update positions
      positionAttr.setXYZ(
        i,
        px + vel[i3],
        py + vel[i3 + 1],
        pz + vel[i3 + 2]
      );
    }

    positionAttr.needsUpdate = true;
    prevMouseRef.current = { x: mouseWorldX, y: mouseWorldY };
  });

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
        <bufferAttribute
          attach="attributes-customColor"
          args={[colors, 3]}
        />
        <bufferAttribute
          attach="attributes-size"
          args={[sizes, 1]}
        />
      </bufferGeometry>
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}
