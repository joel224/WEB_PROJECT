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
    <main className="relative w-full bg-[#2B1C13] text-[#FFE9D9] overflow-x-hidden">
      
      {/* 1. 3D Scene (Behind everything) */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <Scene cubeRefs={cubeRefs} contextSafe={contextSafe} />
      </div>

      {/* 2. Scroll Trigger Container */}
      <div className="scroller relative w-full">
        
        {/* PAGE 1: HERO */}
        <section className="h-screen w-full flex flex-col items-center pt-[15vh] sticky top-0 z-10">
          
          {/* THE LOGO SWAP
              - The SVG sits here initially.
              - The class 'logo-fade' will be targeted by GSAP to hide it.
          */}
          <div className="mb-12 logo-fade relative">
            <FigmaLogo />
          </div>

          <div className="hero-text text-center transition-all will-change-transform">
             <h1 className="font-serif text-[40px] md:text-[48px] leading-[1.1] max-w-[900px]">
               The First Media Company crafted For the<br />
               Digital First generation
             </h1>
          </div>
        </section>

        {/* PAGE 2: RING LANDING ZONE */}
        <section className="h-screen w-full flex items-center justify-center relative z-20">
           {/* Center Text */}
           <div className="center-text opacity-0 blur-sm text-center w-[300px]">
              <p className="text-[10px] font-bold tracking-[0.2em] uppercase mb-2 text-[#FFE9D9]">
                 Where innovation meets precision
              </p>
              <p className="text-[10px] text-[#FFE9D9]/80 leading-relaxed">
                 Symbiosis - interlacing intellect, creative<br/> 
                 chemistry, and technical expertise.
              </p>
           </div>
        </section>
        
        <div className="h-[50vh]"></div>
      </div>
    </main>
  );
}
