'use client';

import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import type { Mesh } from 'three';
import Scene from '@/components/Scene';
import FigmaLogo from '@/components/FigmaLogo';

export default function Home() {
  const cubeRefs = useRef<(Mesh | null)[]>([]);
  const { contextSafe } = useGSAP();

  return (
    <main className="relative w-full min-h-screen bg-background text-beige overflow-x-hidden selection:bg-beige selection:text-background">
      
      {/* 1. 3D SCENE (Fixed Background) */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <Scene cubeRefs={cubeRefs} contextSafe={contextSafe} />
      </div>

      {/* 2. SCROLL CONTENT (Foreground) */}
      <div className="scroller relative z-10 w-full">
        
        {/* HERO SECTION */}
        <section className="h-screen w-full flex flex-col items-center pt-24 md:pt-32 relative">
          
          {/* A. The Figma Logo */}
          <div className="mb-12 scale-75 md:scale-100 title-overlay">
            <FigmaLogo />
          </div>

          {/* B. The Headline Text */}
          {/* Matches: Times New Normal, 48px, #FFE9D9 */}
          <h1 className="title-overlay font-serif text-3xl md:text-[48px] leading-[100%] text-center max-w-[800px] px-4">
            The First Media Company crafted For the<br />
            Digital First generation
          </h1>

          {/* C. Center Text (Hidden initially if needed, or static) */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
             {/* This space is reserved for the 'Ring of Cubes' to form around */}
             <div className="opacity-0 animate-fadeIn delay-1000">
                <p className="text-xs font-bold tracking-[0.2em] uppercase mb-2">
                   Where innovation meets precision
                </p>
             </div>
          </div>

        </section>

        {/* SPACER (To allow scrolling animations) */}
        <section className="h-[150vh] w-full" />
        
      </div>
    </main>
  );
}