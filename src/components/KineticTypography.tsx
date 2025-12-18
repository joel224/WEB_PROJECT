'use client';
import React, { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const phrases = [
  'Animating Text',
  'Like This',
  'With Kinetic',
  'Typography',
  'In Next.js',
];

const KineticTypography = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRefs = useRef<(HTMLHeadingElement | null)[]>([]);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top top',
          end: '+=400%', // 4 transitions
          scrub: true,
          pin: true,
        },
      });

      // Animate in the first phrase
      tl.from(textRefs.current[0], {
        y: '100%',
        opacity: 0,
        ease: 'power2.out',
      });
      tl.to(textRefs.current[0], {
        opacity: 1, // Hold it for a bit
      }, '+=0.5');

      textRefs.current.forEach((text, i) => {
        if (i > 0) {
          // Animate out the previous phrase
          tl.to(textRefs.current[i - 1], {
            y: '-100%',
            opacity: 0,
            ease: 'power2.in',
          });
          
          // Animate in the current phrase
          tl.from(text, {
            y: '100%',
            opacity: 0,
            ease: 'power2.out',
          }, "-=0.5"); // Overlap start of next animation

          // Hold the current phrase
          tl.to(text, {
            opacity: 1,
          }, '+=0.5');
        }
      });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} className="h-screen w-full relative">
      <div className="absolute inset-0 bg-background flex items-center justify-center overflow-hidden">
        {phrases.map((phrase, i) => (
          <h2
            key={i}
            ref={(el) => (textRefs.current[i] = el)}
            className="text-6xl md:text-9xl font-bold uppercase absolute text-primary tracking-tighter"
            style={{ opacity: 0 }} // Initially hidden
          >
            {phrase}
          </h2>
        ))}
      </div>
    </section>
  );
};

export default KineticTypography;
