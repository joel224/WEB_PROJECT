'use client';

import React, { useLayoutEffect, useRef, useState } from 'react';
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
  const containerRef = useRef<HTMLElement>(null);
  const textRefs = useRef<(HTMLHeadingElement | null)[]>([]);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoReady, setVideoReady] = useState(false);

  useLayoutEffect(() => {
    if (!videoReady && videoRef.current && !videoRef.current.duration) return;

    const ctx = gsap.context(() => {
      // FIX: We trigger on the tall containerRef
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top top',
          end: 'bottom bottom', // Scroll for the entire height of the container
          scrub: 1, 
          // REMOVED: pin: true (CSS Sticky handles this now)
        },
      });

      // --- 1. VIDEO SCRUBBING ---
      const video = videoRef.current;
      if (video && video.duration) {
        tl.fromTo(
          video,
          { currentTime: 0 },
          { currentTime: video.duration, ease: "none" },
          0
        );
      }

      // --- 2. TEXT ANIMATION ---
      textRefs.current.forEach((text) => {
        if (text) {
             gsap.set(text, { 
                 y: '100%', 
                 opacity: 0, 
                 scale: 0.9,
                 filter: 'blur(8px)',
                 transformOrigin: "center center"
             });
        }
      });

      phrases.forEach((_, i) => {
        const text = textRefs.current[i];
        if (!text) return;
        
        // Spread animations across the timeline
        const startTime = (i / phrases.length) * (video?.duration || 1);

        tl.to(text, {
          y: '0%',
          opacity: 1,
          scale: 1,
          filter: 'blur(0px)',
          duration: 0.5, 
          ease: 'power3.out',
        }, startTime); 

        if (i < phrases.length - 1) {
            const exitTime = ((i + 1) / phrases.length) * (video?.duration || 1) - 0.2;
            tl.to(text, {
                y: '-100%',
                opacity: 0,
                scale: 1.1,
                filter: 'blur(8px)',
                duration: 0.5,
                ease: 'power3.in',
            }, exitTime); 
        }
      });

    }, containerRef);
    
    return () => ctx.revert();
  }, [videoReady]); 

  return (
    // FIX: Outer container is 400vh tall (creating physical scroll space)
    <section 
      ref={containerRef} 
      className="relative w-full h-[400vh] bg-[#2B1C13]" 
    >
      {/* FIX: Inner container sticks to the screen while you scroll through the 400vh */}
      <div className="sticky top-0 h-screen w-full overflow-hidden flex flex-col justify-center items-center z-30">
        
        {/* --- BACKGROUND VIDEO --- */}
        <div className="absolute inset-0 z-0">
            <video
                ref={videoRef}
                className="w-full h-full object-cover"
                muted
                playsInline
                preload="auto"
                src="/Minimal_Background_Video_Generation.mp4"
                onLoadedMetadata={() => setVideoReady(true)}
            />
            {/* Dark Overlay */}
            <div className="absolute inset-0 bg-black/60 z-10" />
        </div>

        {/* --- TEXT CONTENT --- */}
        <div className="absolute inset-0 z-20 flex items-center justify-center perspective-1000">
          {phrases.map((phrase, i) => (
            <h2
              key={i}
              ref={(el) => { if (el) textRefs.current[i] = el; }}
              className="absolute text-5xl md:text-8xl font-serif font-bold text-center leading-tight tracking-tight uppercase px-4 drop-shadow-2xl text-[#FFE9D9]"
              style={{ willChange: "transform, opacity, filter" }} 
            >
              {phrase}
            </h2>
          ))}
        </div>

      </div>
    </section>
  );
}