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
          end: '+=500%', // 5 phrases, 100% per phrase
          scrub: true,
          pin: true,
        },
      });

      textRefs.current.forEach((text, i) => {
        if (!text) return;
        // Animation to bring the text in
        tl.from(text, {
            y: '100%', // Start from below the container
            opacity: 0,
            ease: 'power2.out',
        }, i * 0.5); // Stagger the start time

        // Animation to move the text out
        if (i < phrases.length - 1) {
            tl.to(text, {
                y: '-100%', // Move up out of the container
                opacity: 0,
                ease: 'power2.in',
            }, (i * 0.5) + 0.4); // Stagger the end time
        } else {
             // Last phrase stays longer
             tl.to(text, {
                opacity: 1,
            }, (i * 0.5) + 0.4);
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
