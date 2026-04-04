"use client";

import { useEffect, useRef, useCallback } from "react";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useDeviceCapability } from "@/hooks/useDeviceCapability";

const vertexShader = `
  attribute vec2 position;
  void main() {
    gl_Position = vec4(position, 0.0, 1.0);
  }
`;

// "The Signal" — noise that progressively resolves to clarity as you scroll.
// Hero is atmospheric chaos, deeper sections become clean flowing lines.
// Cursor creates a calm zone. Section boundaries spike distortion briefly.
const fragmentShader = `
  precision highp float;

  uniform float uTime;
  uniform float uResolve;      // 0 = chaos, 1 = clarity
  uniform vec2 uMouse;
  uniform vec2 uResolution;
  uniform float uDarkMode;
  uniform float uSectionPulse;

  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
  vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

  float snoise(vec3 v) {
    const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
    vec3 i = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);
    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;
    i = mod289(i);
    vec4 p = permute(permute(permute(
      i.z + vec4(0.0, i1.z, i2.z, 1.0))
      + i.y + vec4(0.0, i1.y, i2.y, 1.0))
      + i.x + vec4(0.0, i1.x, i2.x, 1.0));
    float n_ = 0.142857142857;
    vec3 ns = n_ * D.wyz - D.xzx;
    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);
    vec4 x = x_ * ns.x + ns.yyyy;
    vec4 y = y_ * ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);
    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);
    vec4 s0 = floor(b0) * 2.0 + 1.0;
    vec4 s1 = floor(b1) * 2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));
    vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);
    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
    p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
  }

  float fbm(vec3 p, int octaves) {
    float v = 0.0, a = 0.5, f = 1.0;
    for (int i = 0; i < 6; i++) {
      if (i >= octaves) break;
      v += a * snoise(p * f);
      f *= 2.0;
      a *= 0.5;
    }
    return v;
  }

  float scanline(vec2 uv, float time) {
    return (sin(uv.y * uResolution.y * 0.5 + time * 2.0) * 0.5 + 0.5);
  }

  float glitchBlock(vec2 uv, float time) {
    float block = floor(uv.y * 20.0 + time * 3.0);
    float r = fract(sin(block * 43758.5453) * 2.0);
    return step(0.93, r) * (fract(sin(block * 12.9898) * 43758.5453) - 0.5) * 0.08;
  }

  void main() {
    vec2 uv = gl_FragCoord.xy / uResolution;
    vec2 cuv = (gl_FragCoord.xy - 0.5 * uResolution) / min(uResolution.x, uResolution.y);
    float time = uTime * 0.3;
    float chaos = 1.0 - uResolve;

    // Mouse calm zone
    float mDist = length(cuv - uMouse * 0.5);
    float mInf = smoothstep(0.5, 0.0, mDist) * 0.3;
    float localChaos = max(chaos - mInf, 0.0);

    // Glitch displacement
    float glitch = glitchBlock(uv, time) * localChaos;
    vec2 duv = uv + vec2(glitch, 0.0);

    // Section pulse distortion
    float pD = uSectionPulse * 0.025;
    duv += vec2(sin(duv.y * 30.0 + time * 5.0) * pD, cos(duv.x * 30.0 + time * 5.0) * pD);

    // Noise
    int oct = int(mix(2.0, 5.0, localChaos));
    float n1 = fbm(vec3(duv * 3.0, time), oct);
    float n2 = fbm(vec3(duv * 3.0 + 5.2, time), oct);
    vec3 wc = vec3(duv * 3.0, time) + vec3(n1, n2, 0.0) * mix(0.2, 1.2, localChaos);
    float wn = fbm(wc, oct);

    // Colors
    vec3 bg = mix(vec3(0.98, 0.98, 0.99), vec3(0.02, 0.02, 0.035), uDarkMode);
    vec3 a1 = mix(vec3(0.15, 0.39, 0.92), vec3(0.38, 0.65, 0.98), uDarkMode);
    vec3 a2 = mix(vec3(0.02, 0.71, 0.83), vec3(0.13, 0.83, 0.93), uDarkMode);

    float cm = wn * 0.5 + 0.5;
    vec3 sig = mix(a1, a2, cm);

    // Intensity — lower overall, just atmospheric
    float chaosI = mix(0.03, 0.22, localChaos * localChaos);

    // Static noise
    float sn = fract(sin(dot(duv * uResolution, vec2(12.9898, 78.233)) + time * 100.0) * 43758.5453);
    float snAmt = localChaos * localChaos * 0.1;

    // Flowing lines (resolved state)
    float lines = sin(cuv.x * 8.0 + wn * mix(0.5, 3.0, localChaos) + time) * 0.5 + 0.5;
    lines *= sin(cuv.y * 6.0 + n1 * mix(0.3, 2.0, localChaos) + time * 0.7) * 0.5 + 0.5;
    float lineI = mix(0.05, 0.01, localChaos);

    // Scanlines
    float scan = scanline(duv, time);
    float scanAmt = localChaos * 0.06;

    // Compose
    vec3 color = bg;
    color = mix(color, sig, chaosI * (wn * 0.5 + 0.5));
    color += sig * lines * lineI;
    color = mix(color, vec3(sn) * mix(vec3(0.5), sig, 0.5), snAmt);
    color = mix(color, color * (1.0 - scan * 0.3), scanAmt);

    // Vignette
    float vig = 1.0 - smoothstep(0.4, 1.2, length(cuv * vec2(0.8, 1.0)));
    color = mix(color, color * vig, mix(0.2, 0.4, uResolve));

    // Chromatic aberration on pulse
    if (uSectionPulse > 0.01) {
      float ca = uSectionPulse * 0.003;
      float nR = fbm(vec3((duv + vec2(ca, 0.0)) * 3.0, time), 2);
      float nB = fbm(vec3((duv - vec2(ca, 0.0)) * 3.0, time), 2);
      color.r += nR * uSectionPulse * 0.04;
      color.b += nB * uSectionPulse * 0.04;
    }

    gl_FragColor = vec4(color, 1.0);
  }
`;

interface ShaderCanvasProps {
  scrollProgress: number;
  scrollY: number;
  mouseX: number;
  mouseY: number;
  sectionPulse: number;
}

export function ShaderCanvas({ scrollProgress, mouseX, mouseY, sectionPulse }: ShaderCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const glRef = useRef<WebGLRenderingContext | null>(null);
  const programRef = useRef<WebGLProgram | null>(null);
  const frameRef = useRef<number>(0);
  const startTimeRef = useRef<number>(Date.now());
  const uniformLocationsRef = useRef<Record<string, WebGLUniformLocation | null>>({});
  const reducedMotion = useReducedMotion();
  const capability = useDeviceCapability();

  const propsRef = useRef({ scrollProgress, mouseX, mouseY, sectionPulse });
  propsRef.current = { scrollProgress, mouseX, mouseY, sectionPulse };

  const initGL = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl", {
      alpha: false,
      antialias: false,
      powerPreference: capability === "high" ? "high-performance" : "default",
    });
    if (!gl) return;
    glRef.current = gl;

    const vs = gl.createShader(gl.VERTEX_SHADER)!;
    gl.shaderSource(vs, vertexShader);
    gl.compileShader(vs);

    const fs = gl.createShader(gl.FRAGMENT_SHADER)!;
    gl.shaderSource(fs, fragmentShader);
    gl.compileShader(fs);

    if (!gl.getShaderParameter(fs, gl.COMPILE_STATUS)) {
      console.error("Fragment shader error:", gl.getShaderInfoLog(fs));
      return;
    }

    const program = gl.createProgram()!;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error("Program link error:", gl.getProgramInfoLog(program));
      return;
    }

    programRef.current = program;
    gl.useProgram(program);

    const verts = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, verts, gl.STATIC_DRAW);

    const pos = gl.getAttribLocation(program, "position");
    gl.enableVertexAttribArray(pos);
    gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0);

    for (const name of ["uTime", "uResolve", "uMouse", "uResolution", "uDarkMode", "uSectionPulse"]) {
      uniformLocationsRef.current[name] = gl.getUniformLocation(program, name);
    }
  }, [capability]);

  const render = useCallback(() => {
    const gl = glRef.current;
    const canvas = canvasRef.current;
    if (!gl || !programRef.current || !canvas) return;

    const { scrollProgress, mouseX, mouseY, sectionPulse } = propsRef.current;
    const resolve = Math.min(scrollProgress * 2.5, 1.0);
    const time = (Date.now() - startTimeRef.current) / 1000;
    const isDark = document.documentElement.classList.contains("dark") ? 1.0 : 0.0;
    const locs = uniformLocationsRef.current;

    gl.uniform1f(locs.uTime, time);
    gl.uniform1f(locs.uResolve, resolve);
    gl.uniform2f(locs.uMouse, mouseX, mouseY);
    gl.uniform2f(locs.uResolution, canvas.width, canvas.height);
    gl.uniform1f(locs.uDarkMode, isDark);
    gl.uniform1f(locs.uSectionPulse, sectionPulse);

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    frameRef.current = requestAnimationFrame(render);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = capability === "high" ? Math.min(window.devicePixelRatio, 2) : 1;
    const resize = () => {
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = window.innerWidth + "px";
      canvas.style.height = window.innerHeight + "px";
      if (glRef.current) glRef.current.viewport(0, 0, canvas.width, canvas.height);
    };
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, [capability]);

  useEffect(() => {
    if (reducedMotion) return;
    initGL();
    frameRef.current = requestAnimationFrame(render);
    return () => cancelAnimationFrame(frameRef.current);
  }, [initGL, render, reducedMotion]);

  if (reducedMotion) {
    return (
      <div className="fixed inset-0 -z-10"
        style={{ background: `radial-gradient(ellipse 80% 50% at 50% -20%, rgba(var(--accent-rgb), 0.1), transparent 50%)` }}
      />
    );
  }

  return <canvas ref={canvasRef} className="fixed inset-0 -z-10" style={{ width: "100vw", height: "100vh" }} />;
}
