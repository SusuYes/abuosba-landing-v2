"use client";

import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { ParticleField } from "./ParticleField";

interface SceneProps {
  mouseX: number;
  mouseY: number;
}

// Ambient animated fog/glow effect
function AmbientGlow() {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.z = state.clock.elapsedTime * 0.02;
    }
  });

  return (
    <mesh ref={meshRef} position={[0, 0, -5]}>
      <planeGeometry args={[20, 20]} />
      <meshBasicMaterial color="#2563eb" transparent opacity={0.02} />
    </mesh>
  );
}

export function Scene({ mouseX, mouseY }: SceneProps) {
  const { viewport } = useThree();

  return (
    <>
      {/* Subtle ambient lighting */}
      <ambientLight intensity={0.5} />

      {/* Main particle field */}
      <ParticleField mouseX={mouseX} mouseY={mouseY} />

      {/* Background glow */}
      <AmbientGlow />

      {/* Fog for depth */}
      <fog attach="fog" args={["#050608", 5, 15]} />
    </>
  );
}
