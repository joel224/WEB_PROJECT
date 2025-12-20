'use client';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Suspense }from 'react';
import Scene from '@/components/Scene';

gsap.registerPlugin(ScrollTrigger);

export default function Home() {
  useGSAP(() => {
    gsap.to('.title-overlay', {
      opacity: 0,
      scrollTrigger: {
        trigger: '.scroller',
        start: 'top top',
        end: '20% top',
        scrub: true,
      },
    });
  });

  return (
    <main className="relative w-full h-full bg-[#111111]">
      <div className="scroller h-[200vh]">
        <div className="h-screen sticky top-0">
          <div className="absolute inset-0 z-0">
            <Suspense fallback={null}>
              <Scene />
            </Suspense>
          </div>
          <header className="absolute inset-0 z-10 flex items-center justify-center">
            <div className="title-overlay text-center text-[#FFE9D9] max-w-4xl mx-auto px-4">
              <h1 className="text-4xl md:text-6xl font-bold">
                The First Media Company crafted For the Digital First generation
              </h1>
            </div>
          </header>
        </div>
      </div>
    </main>
  );
}
