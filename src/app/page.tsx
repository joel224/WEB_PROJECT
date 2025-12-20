'use client';

import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import type { Mesh } from 'three';
import Scene from '@/components/Scene';

export default function Home() {
  const cubeRefs = useRef<(Mesh | null)[]>([]);
  const { contextSafe } = useGSAP();

  return (
    <main className="relative w-full bg-[#2B1C13] text-[#FFE9D9] overflow-x-hidden">
      
      {/* 1. 3D Scene Background (Always Fixed) */}
      <div className="fixed inset-0 z-50 pointer-events-none">
        <Scene cubeRefs={cubeRefs} contextSafe={contextSafe} />
      </div>

      {/* 2. Scroll Trigger Container */}
      <div className="scroller relative w-full">
        
        {/* PAGE 1: HERO (Logo State) */}
        <section className="h-screen w-full flex flex-col items-center pt-[15vh] sticky top-0 z-10">
          
          {/* Logo Spacer: The 3D cubes will sit exactly here */}
          <div className="w-[154px] h-[96px] mb-12"></div>

          {/* Headline Text - Will Blur Out */}
          <div className="hero-text text-center transition-all will-change-transform">
             <h1 className="font-serif text-[40px] md:text-[48px] leading-[1.1] max-w-[900px]">
               The First Media Company crafted For the<br />
               Digital First generation
             </h1>
          </div>
        </section>

        {/* PAGE 2: RING (End State) */}
        <section className="h-screen w-full flex items-center justify-center relative z-20">
           
           {/* Center Text - Will Blur In */}
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
        
        {/* Extra space for scrolling */}
        <div className="h-[50vh]"></div>
      </div>
    </main>
  );
}