'use client';

import React, { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const phrases = [
  'Innovation',
  'Meets Precision',
  'Crafted For',
  'The Digital',
  'Generation',
];

export default function KineticSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRefs = useRef<(HTMLHeadingElement | null)[]>([]);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top top',
          end: `+=${phrases.length * 100}%`,
          scrub: 1,
          pin: true,
        },
      });

      // --- INITIAL SETUP ---
      textRefs.current.forEach((text) => {
        if (text) {
             gsap.set(text, { 
                 y: '120%', 
                 opacity: 0, 
                 rotateX: -45, 
                 scale: 0.8,
                 filter: 'blur(10px)',
                 transformOrigin: "center center"
             });
        }
      });

      // --- ANIMATION LOOP ---
      phrases.forEach((_, i) => {
        const text = textRefs.current[i];
        if (!text) return;

        // 1. ENTER
        tl.to(text, {
          y: '0%',
          opacity: 1,
          rotateX: 0,
          scale: 1,
          filter: 'blur(0px)',
          duration: 1,
          ease: 'power4.out',
        });

        // 2. HOLD
        tl.to(text, {
          scale: 1.05,
          duration: 0.5,
          ease: 'none'
        });

        // 3. EXIT
        if (i < phrases.length - 1) {
            tl.to(text, {
                y: '-120%',
                opacity: 0,
                rotateX: 45,
                scale: 1.2,
                filter: 'blur(10px)',
                duration: 0.8,
                ease: 'power2.in',
            }, ">-0.2");
        }
      });

    }, containerRef);
    
    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} className="h-screen w-full relative overflow-hidden perspective-1000 bg-[#2B1C13]">
      <div className="absolute inset-0 flex items-center justify-center">
        {phrases.map((phrase, i) => (
          <h1
            key={i}
            ref={(el) => (textRefs.current[i] = el)}
            className="absolute text-6xl md:text-9xl font-serif font-bold text-center leading-tight tracking-tight uppercase text-[#FFE9D9]"
            style={{ 
                willChange: "transform, opacity, filter",
            }} 
          >
            {phrase}
          </h1>
        ))}
      </div>
    </section>
  );
}
