import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static export for GitHub Pages
  output: 'export',
  // Base path for GitHub Pages (repo name)
  basePath: '/abuosba-landing-v2',
  assetPrefix: '/abuosba-landing-v2/',
  // Transpile three.js and related packages
  transpilePackages: ['three', '@react-three/fiber', '@react-three/drei', '@react-three/postprocessing'],
};

export default nextConfig;
