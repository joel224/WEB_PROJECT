'use client';
import { useRef, useEffect } from 'react';
import { useGSAP } from '@gsap/react';
import type { Mesh } from 'three';
import Scene from '@/components/Scene';
import FigmaLogo from '@/components/FigmaLogo';
import ShimmerText from '@/components/ShimmerText';
import RevealText from '@/components/RevealText';

export default function Home() {
  const cubeRefs = useRef<(Mesh | null)[]>([]);
  const { contextSafe } = useGSAP();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <main className="relative w-full bg-[#2B1C13] text-[#FFE9D9] font-sans">
      
      {/* 1. 3D SCENE (Fixed at Z-0) */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <Scene cubeRefs={cubeRefs} />
      </div>

      <div className="scroller relative z-10 w-full">
        
        {/* --- PAGE 1 --- */}
        <div className="h-[200vh] relative">
            {/* Ghost Logo for Math */}
            <div className="absolute left-1/2 top-[30vh] -translate-x-1/2 -translate-y-1/2 opacity-0 pointer-events-none z-0">
                <FigmaLogo />
            </div>

            {/* Sticky Content */}
            <div className="sticky top-0 h-screen w-full overflow-hidden z-10">
                <div className="logo-fade absolute left-1/2 top-[30vh] -translate-x-1/2 -translate-y-1/2">
                    <FigmaLogo idPrefix="visible-logo-" />
                </div>
                <div className="hero-text absolute w-full text-center top-[45vh] px-4">
                    <h1 className="font-serif text-[70px] md:text-[56px] leading-[1.1] max-w-[900px] mx-auto tracking-tight">
                    The First Media Company crafted For the<br />
                        {/* New Animation Here */}
                        <RevealText />
                    </h1>
                </div>
            </div>
        </div>

        {/* --- PAGE 2 --- */}
        {/* FIX: Removed 'bg-[#2B1C13]' so it is transparent. 
            Now the cubes (Z-0) show through this section (Z-20). */}
        <section id="target-section" className="h-screen w-full flex items-center justify-center relative z-20">
           
           {/* Increased max-width to 600px for better readability */}
           <div className="center-text opacity-0 blur-md text-center max-w-[600px] px-6">
              
              {/* Bigger Headline: 2xl on mobile, 4xl on desktop */}
              <h2 className="text-2xl md:text-4xl font-bold tracking-wide mb-6 text-[#FFE9D9]">
                 Where innovation meets precision.
              </h2>
              
              {/* Bigger Body Text: sm on mobile, lg on desktop */}
              <p className="text-sm md:text-lg text-[#FFE9D9]/80 leading-relaxed font-sans">
                 Symphonia unites visionary thinkers, creative architects, and analytical
                 experts, collaborating seamlessly to transform challenges into
                 opportunities. Together, we deliver tailored solutions that drive impact
                 and inspire growth.
              </p>

           </div>
        </section>

        {/* --- PAGE 3 (NEW) --- */}
        <section className="h-screen w-full flex items-center justify-center relative z-20 bg-[#331707]">
           <div className="text-center max-w-[600px] px-6">
              <h2 className="text-2xl md:text-4xl font-bold tracking-wide mb-6 text-[#FFE9D9]">
                 A New Chapter
              </h2>
              <p className="text-sm md:text-lg text-[#FFE9D9]/80 leading-relaxed font-sans">
                 This is the new section you requested. You can start adding your content here.
              </p>
           </div>
        </section>

      </div>
    </main>
  );
}
