'use client';
import Scene from '@/components/Scene';
import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import type { Mesh } from 'three';

export default function Home() {
  const cubeRefs = useRef<(Mesh | null)[]>([]);
  const { contextSafe } = useGSAP();

  return (
    <main className="relative w-full min-h-screen bg-background text-foreground overflow-x-hidden">
      
      {/* 1. The 3D Scene Background (Fixed) */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <Scene cubeRefs={cubeRefs} contextSafe={contextSafe} />
      </div>

      {/* 2. The Scrollable Content (Triggers Animations) */}
      <div className="scroller relative z-10 w-full">
        
        {/* HERO SECTION */}
        <section className="h-screen w-full flex flex-col items-center pt-20 relative">
          
          {/* Top Logo (SVG Placeholder) */}
          <div className="mb-8 title-overlay">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor" className="text-beige">
               <path d="M12 2L2 7l10 5 10-5-10-5zm0 9l2.5-1.25L12 8.5l-2.5 1.25L12 11zm0 2.5l-5-2.5-5 2.5L12 22l10-8.5-5-2.5-5 2.5z"/> 
            </svg>
          </div>

          {/* Main Headline */}
          <h1 className="title-overlay text-4xl md:text-5xl font-serif text-center max-w-3xl leading-tight text-[#E8DCC6]">
            The First Media Company crafted For the Digital First generation
          </h1>

          {/* Center Text (Absolute Positioned in the middle of the screen) */}
          {/* This is the text "Where innovation meets precision" */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center w-[300px]">
             <h2 className="text-sm font-bold tracking-widest uppercase mb-2 text-[#E8DCC6]">
               Where innovation meets precision.
             </h2>
             <p className="text-xs text-opacity-80 text-white leading-relaxed">
               Symbiosis - interlacing intellect, creative chemistry, and technical expertise.
             </p>
          </div>

        </section>

        {/* Spacer for scrolling effect */}
        <section className="h-screen flex items-center justify-center">
            <p>Your next section starts here...</p>
        </section>

      </div>
    </main>
  );
}