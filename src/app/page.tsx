"use client";

import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { HeroSection } from "@/components/sections/HeroSection";
import { AboutSection } from "@/components/sections/AboutSection";
import { ExperienceSection } from "@/components/sections/ExperienceSection";
import { ProjectsSection } from "@/components/sections/ProjectsSection";
import { ContactSection } from "@/components/sections/ContactSection";
import { ShaderCanvas } from "@/components/webgl/ShaderCanvas";
import { CursorTrail } from "@/components/ui/CursorTrail";

export default function Home() {
  return (
    <>
      {/* Full-screen WebGL shader background */}
      <ShaderCanvas />

      {/* Cursor distortion trail */}
      <CursorTrail />

      <Header />
      <main className="relative">
        <HeroSection />
        <AboutSection />
        <ProjectsSection />
        <ExperienceSection />
        <ContactSection />
      </main>
      <Footer />
    </>
  );
}
