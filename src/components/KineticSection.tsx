'use client';

import React, { useRef, useEffect, useState } from 'react';

const phrases = [
  'Innovation',
  'Meets Precision',
  'Crafted For',
  'The Digital',
  'Generation',
];

export default function KineticSection() {
  const containerRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  // --- THE "BRUTE FORCE" LOOP ---
  // This bypasses all library complexity. It just calculates:
  // "How far have I scrolled into this specific box?"
  useEffect(() => {
    let animationFrameId: number;

    const update = () => {
      if (!containerRef.current || !videoRef.current) {
        animationFrameId = requestAnimationFrame(update);
        return;
      }

      const rect = containerRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      
      // Calculate how much of the section has been scrolled past
      // The section is 500vh tall. 
      // We want progress 0% when the top hits the screen top.
      // We want progress 100% when the bottom hits the screen bottom.
      const totalScrollableHeight = rect.height - viewportHeight;
      
      // Math: -rect.top is how many pixels we've scrolled past the start
      let rawProgress = -rect.top / totalScrollableHeight;
      
      // Clamp between 0 and 1
      const safeProgress = Math.max(0, Math.min(1, rawProgress));
      
      // Only update if changed (performance)
      if (Math.abs(safeProgress - progress) > 0.001) {
          setProgress(safeProgress);
          
          // 1. DRIVE VIDEO DIRECTLY
          const vid = videoRef.current;
          if (vid.duration) {
              // Smooth scrub hack: If the jump is huge, don't snap.
              vid.currentTime = safeProgress * vid.duration;
          }

          // 2. CALCULATE ACTIVE TEXT INDEX
          // Map 0.0-1.0 to 0-(phrases.length-1)
          const index = Math.min(
              phrases.length - 1, 
              Math.floor(safeProgress * phrases.length)
          );
          setActiveIndex(index);
      }

      animationFrameId = requestAnimationFrame(update);
    };

    // Start the loop
    animationFrameId = requestAnimationFrame(update);

    return () => cancelAnimationFrame(animationFrameId);
  }, []); // No dependencies. It runs forever.

  return (
    <section 
      ref={containerRef} 
      className="relative w-full h-[500vh] bg-[#2B1C13]" // 500vh for extra long scroll
    >
      <div className="sticky top-0 h-screen w-full overflow-hidden flex flex-col justify-center items-center">
        
        {/* VIDEO LAYER */}
        <div className="absolute inset-0 z-0 bg-black">
            <video
                ref={videoRef}
                className="w-full h-full object-cover"
                muted
                playsInline
                preload="auto"
                src="/output.mp4" 
            />
            {/* Dark Overlay */}
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm z-10" />
        </div>

        {/* TEXT LAYER */}
        <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
          {phrases.map((phrase, i) => (
            <h2
              key={i}
              className={`
                absolute text-5xl md:text-8xl font-serif font-bold text-center leading-tight tracking-tight uppercase px-4 text-[#FFE9D9] drop-shadow-2xl
                transition-all duration-700 ease-out
                ${i === activeIndex 
                    ? 'opacity-100 blur-0 scale-100 translate-y-0' // Active State
                    : i < activeIndex
                        ? 'opacity-0 blur-xl scale-110 -translate-y-20' // Past State (Fly up)
                        : 'opacity-0 blur-xl scale-90 translate-y-20'   // Future State (Wait down)
                }
              `}
            >
              {phrase}
            </h2>
          ))}
        </div>

      </div>
    </section>
  );
}