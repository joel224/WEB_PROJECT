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
  
  // Track readiness
  const [isVideoReady, setIsVideoReady] = useState(false);

  useLayoutEffect(() => {
    // Safety check: ensure video ref exists
    if (!videoRef.current) return;
    
    // If video isn't marked ready yet, we wait. 
    // BUT we also check if 'duration' is already available (cached) to avoid getting stuck.
    if (!isVideoReady && !videoRef.current.duration) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top top',
          end: 'bottom bottom', 
          scrub: 0.1, // Lower scrub for more responsive video scrubbing
        },
      });

      // --- 1. VIDEO SCRUB ---
      const vid = videoRef.current;
      
      if (vid) {
          // DEBUG: Check if we are grabbing the video correctly
          console.log("GSAP Video Init:", vid.duration);

          // FALLBACK: If browser reports Infinity/NaN, assume 10s duration so it still works
          const safeDuration = (Number.isFinite(vid.duration) && vid.duration > 0) 
            ? vid.duration 
            : 10;

          vid.pause(); // Force pause
          
          tl.fromTo(vid, 
            { currentTime: 0 }, 
            { currentTime: safeDuration, ease: "none" }, 
            0
          );
      }

      // --- 2. TEXT ANIMATION ---
      const step = 1 / phrases.length;

      phrases.forEach((_, i) => {
        const text = textRefs.current[i];
        if (!text) return;

        const startTime = i * step;

        // Reset
        gsap.set(text, { 
             y: '100%', 
             opacity: 0, 
             scale: 0.9,
             filter: 'blur(10px)',
        });

        // Enter
        tl.to(text, {
          y: '0%',
          opacity: 1,
          scale: 1,
          filter: 'blur(0px)',
          duration: step * 0.4, 
          ease: 'power3.out',
        }, startTime); 

        // Exit
        if (i < phrases.length - 1) {
            tl.to(text, {
                y: '-100%',
                opacity: 0,
                scale: 1.1,
                filter: 'blur(10px)',
                duration: step * 0.4,
                ease: 'power3.in',
            }, startTime + (step * 0.6)); 
        }
      });

    }, containerRef);
    
    return () => ctx.revert();
  }, [isVideoReady]); // Re-run when video says it's ready

  return (
    <section 
      ref={containerRef} 
      className="relative w-full h-[400vh] bg-[#2B1C13]"
    >
      <div className="sticky top-0 h-screen w-full overflow-hidden flex flex-col justify-center items-center">
        
        {/* VIDEO LAYER */}
        <div className="absolute inset-0 z-0 bg-black"> 
          {/* bg-black ensures no white flash if video loads slow */}
            <video
                ref={videoRef}
                className="w-full h-full object-cover"
                muted
                playsInline
                preload="auto"
                // FIX: Path must be in 'public/output.mp4'
                src="/output.mp4"
                onLoadedMetadata={() => {
                    console.log("Video Metadata Loaded");
                    setIsVideoReady(true);
                }}
            />
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm z-10" />
        </div>

        {/* TEXT LAYER */}
        <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
          {phrases.map((phrase, i) => (
            <h2
              key={i}
              ref={(el) => { if (el) textRefs.current[i] = el; }}
              className="absolute text-5xl md:text-8xl font-serif font-bold text-center leading-tight tracking-tight uppercase px-4 text-[#FFE9D9] drop-shadow-2xl"
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