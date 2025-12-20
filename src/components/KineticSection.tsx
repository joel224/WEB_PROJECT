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

  // --- RAW MATH LOOP (No Libraries) ---
  useEffect(() => {
    let animationFrameId: number;

    const update = () => {
      if (!containerRef.current || !videoRef.current) {
        animationFrameId = requestAnimationFrame(update);
        return;
      }

      const rect = containerRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const totalScrollableHeight = rect.height - viewportHeight;
      
      // Calculate Scroll Progress (0.0 to 1.0)
      let rawProgress = -rect.top / totalScrollableHeight;
      const safeProgress = Math.max(0, Math.min(1, rawProgress));
      
      if (Math.abs(safeProgress - progress) > 0.001) {
          setProgress(safeProgress);
          
          // 1. Scrub Video
          const vid = videoRef.current;
          if (vid.duration) {
              vid.currentTime = safeProgress * vid.duration;
          }

          // 2. Active Text Index
          const index = Math.min(
              phrases.length - 1, 
              Math.floor(safeProgress * phrases.length)
          );
          setActiveIndex(index);
      }

      animationFrameId = requestAnimationFrame(update);
    };

    animationFrameId = requestAnimationFrame(update);
    return () => cancelAnimationFrame(animationFrameId);
  }, []); 

  return (
    <section 
      ref={containerRef} 
      className="relative w-full h-[500vh] bg-[#2B1C13]"
    >
      <div className="sticky top-0 h-screen w-full overflow-hidden flex flex-col justify-center items-center">
        
        {/* --- LAYER 1: VIDEO --- */}
        <div className="absolute inset-0 z-0 bg-black">
            <video
                ref={videoRef}
                className="w-full h-full object-cover"
                muted
                playsInline
                preload="auto"
                src="/output.mp4" 
            />
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-10" />
        </div>

        {/* --- LAYER 2: LEAVES (Added) --- */}
        {/* Pointer events none ensures you can still scroll if you touch the leaves */}
        <div className="absolute inset-0 z-20 pointer-events-none overflow-hidden">
            
            {/* LEFT LEAF: Middle Left */}
            <img
                src="/images/hero-left-leaf.png"
                alt="Leaf Decor"
                className="absolute left-[-5%] top-1/2 w-[180px] md:w-[300px] transition-transform duration-75 ease-linear"
                style={{ 
                    // Simple Parallax: Moves up slightly as you scroll down
                    transform: `translateY(calc(-50% - ${progress * 100}px))` 
                }}
            />

            {/* RIGHT LEAF: Top Right */}
            <img
                src="/images/hero-right-leaf.png"
                alt="Leaf Decor"
                className="absolute right-[-2%] top-[-5%] w-[200px] md:w-[350px] transition-transform duration-75 ease-linear"
                style={{ 
                    // Simple Parallax: Moves down slightly as you scroll down
                    transform: `translateY(${progress * 150}px)` 
                }}
            />
        </div>

        {/* --- LAYER 3: TEXT --- */}
        <div className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none">
          {phrases.map((phrase, i) => (
            <h2
              key={i}
              className={`
                absolute text-5xl md:text-8xl font-serif font-bold text-center leading-tight tracking-tight uppercase px-4 text-[#FFE9D9] drop-shadow-2xl
                transition-all duration-700 ease-out
                ${i === activeIndex 
                    ? 'opacity-100 blur-0 scale-100 translate-y-0' 
                    : i < activeIndex
                        ? 'opacity-0 blur-xl scale-110 -translate-y-20' 
                        : 'opacity-0 blur-xl scale-90 translate-y-20'
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