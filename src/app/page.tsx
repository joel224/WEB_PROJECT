'use client';
import { useRef, useEffect } from 'react';
import { useGSAP } from '@gsap/react';
import type { Mesh } from 'three';
import Scene from '@/components/Scene';
import FigmaLogo from '@/components/FigmaLogo';
import RevealText from '@/components/RevealText'; 
import KineticSection from '@/components/KineticSection';

export default function Home() {
  const cubeRefs = useRef<(Mesh | null)[]>([]);
  const { contextSafe } = useGSAP();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <main className="relative w-full bg-[#2B1C13] text-[#FFE9D9] font-sans">
      
      {/* 3D SCENE (Fixed) */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <Scene cubeRefs={cubeRefs} />
      </div>

      <div className="scroller relative z-10 w-full">
        
        {/* --- PAGE 1: Intro --- */}
        <div className="h-[200vh] relative">
            <div className="absolute left-1/2 top-[30vh] -translate-x-1/2 -translate-y-1/2 opacity-0 pointer-events-none z-0">
                <FigmaLogo />
            </div>

            <div className="sticky top-0 h-screen w-full overflow-hidden z-10">
                <div className="logo-fade absolute left-1/2 top-[30vh] -translate-x-1/2 -translate-y-1/2">
                    <FigmaLogo idPrefix="visible-logo-" />
                </div>
                <div className="hero-text absolute w-full text-center top-[45vh] px-4">
                    <h1 className="font-serif text-[40px] md:text-[56px] leading-[1.1] max-w-[900px] mx-auto tracking-tight">
                        The First Media Company crafted For the<br />
                        <RevealText />
                    </h1>
                </div>
            </div>
        </div>

        {/* --- PAGE 2: Ring (STICKY TARGET) --- */}
        {/* The 3D cubes will now move UP along with this section as you scroll past it */}
        <section id="target-section" className="h-screen w-full flex items-center justify-center relative z-20">
           <div className="center-text opacity-0 blur-md text-center max-w-[600px] px-6">
              <h2 className="text-2xl md:text-4xl font-bold tracking-wide mb-6 text-[#FFE9D9]">
                 Where innovation meets precision.
              </h2>
              <p className="text-sm md:text-lg text-[#FFE9D9]/80 leading-relaxed font-sans">
                 Symphonia unites visionary thinkers, creative architects, and analytical
                 experts, collaborating seamlessly to transform challenges into
                 opportunities.
              </p>
           </div>
        </section>

        {/* --- PAGE 3: Finale --- */}
        <KineticSection />
        
      </div>
    </main>
  );
}