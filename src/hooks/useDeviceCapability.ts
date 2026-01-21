"use client";

import { useEffect, useState } from "react";

export type DeviceCapability = "high" | "medium" | "low";

export function useDeviceCapability(): DeviceCapability {
  const [capability, setCapability] = useState<DeviceCapability>("high");

  useEffect(() => {
    // Check hardware concurrency
    const cores = navigator.hardwareConcurrency || 4;

    // Check device memory (Chrome only)
    const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory || 8;

    // Check if mobile
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );

    // Check WebGL capabilities
    let webglTier: "high" | "medium" | "low" = "high";
    try {
      const canvas = document.createElement("canvas");
      const gl = canvas.getContext("webgl2") || canvas.getContext("webgl");
      if (gl) {
        const debugInfo = gl.getExtension("WEBGL_debug_renderer_info");
        if (debugInfo) {
          const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
          // Check for integrated graphics
          if (/Intel|Mali|Adreno/i.test(renderer)) {
            webglTier = "medium";
          }
        }
      } else {
        webglTier = "low";
      }
    } catch {
      webglTier = "medium";
    }

    // Determine overall capability
    if (isMobile || cores <= 2 || memory <= 2 || webglTier === "low") {
      setCapability("low");
    } else if (cores <= 4 || memory <= 4 || webglTier === "medium") {
      setCapability("medium");
    } else {
      setCapability("high");
    }
  }, []);

  return capability;
}
