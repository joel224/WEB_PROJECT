'use client';
import { useRef, useEffect, useState } from 'react';
import { useGSAP } from '@gsap/react';
import type { Mesh } from 'three';
import { motion, AnimatePresence } from 'framer-motion';
import Scene from '@/components/Scene';
import FigmaLogo from '@/components/FigmaLogo';
import RevealText from '@/components/RevealText'; 
import Hero from '@/components/KineticSection';
import Footer from '@/components/Footer';
import Experience from '@/components/Experience';
import FloatingButton from '@/components/FloatingButton';

export default function Home() {
  const cubeRefs = useRef<(Mesh | null)[]>([]);
  const { contextSafe } = useGSAP();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    
    // Simulate asset loading to ensure animations start after reveal
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2500); // Adjust time as needed

    return () => clearTimeout(timer);
  }, []);

  return (
    <main className="relative w-full bg-[#2B1C13] text-[#FFE9D9] font-sans">
      
      <AnimatePresence>
        {isLoading ? (
          <motion.div
            key="loader"
            className="fixed inset-0 bg-[#2B1C13] z-50 flex items-center justify-center"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: 'easeInOut' }}
          >
            <div className="text-beige">Loading...</div>
          </motion.div>
        ) : (
          <>
            {/* 3D SCENE */}
            <motion.div
                key="scene"
                className="fixed inset-0 z-0 pointer-events-none"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1.0, delay: 0.2 }}
            >
                <Scene cubeRefs={cubeRefs} />
            </motion.div>

            {/* MAIN PAGE CONTENT */}
            <motion.div
                key="content"
                className="scroller relative z-10 w-full"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1.0, delay: 0.2 }}
            >
                {/* PAGE 1 */}
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

                {/* PAGE 2 */}
                <section id="target-section" className="h-screen w-full flex items-center justify-center relative z-20">
                   <div className="center-text opacity-0 blur-md text-center max-w-[600px] px-6">
                      <h2 className="text-2xl md:text-4xl font-bold tracking-wide mb-6 text-[#FFE9D9]">
                         Where innovation meets precision.
                      </h2>
                      <p className="text-sm md:text-lg text-[#FFE9D9]/80 leading-relaxed font-sans">
                      Symphonia unites visionary thinkers, creative architects, and analytical
experts, collaborating seamlessly to transform challenges into
oppurtunities. Together, we deliver tailored solutions that drive impact
and inspire growth.
                      </p>
                   </div>
                </section>

                {/* PAGE 3: KINETIC VIDEO */}
                <Hero />
                <Experience />
                {/* FOOTER */}
                <Footer />

            </motion.div>

            <FloatingButton href="/game" />
          </>
        )}
      </AnimatePresence>

    </main>
  );
}
