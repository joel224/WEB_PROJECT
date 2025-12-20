'use client';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Suspense, useRef } from 'react';
import Scene from '@/components/Scene';
import type { Mesh } from 'three';

gsap.registerPlugin(ScrollTrigger);

export default function Home() {
  const container = useRef(null);
  const cubeRefs = useRef<(Mesh | null)[]>([]);

  const { contextSafe } = useGSAP({ scope: container });

  return (
    <main ref={container} className="relative w-full h-full bg-[#222A3F]">
      <div className="scroller h-[200vh]">
        <div className="h-screen sticky top-0">
          <div className="absolute inset-0 z-0">
            <Suspense fallback={null}>
              <Scene cubeRefs={cubeRefs} contextSafe={contextSafe} />
            </Suspense>
          </div>
          <header className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
            <div className="title-overlay text-center text-primary max-w-4xl mx-auto px-4">
              <h1 className="text-4xl md:text-6xl font-bold font-headline">
                joel joshy
              </h1>
            </div>
          </header>
        </div>
      </div>
    </main>
  );
}
