'use client';

import React, { useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react'; // Ensure you have installed: npm i @gsap/react

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
  const [videoDuration, setVideoDuration] = useState<number>(0);

  // --- MAIN ANIMATION LOGIC ---
  // We use useGSAP instead of useLayoutEffect for better React 18/Next.js compatibility
  useGSAP(() => {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.5, // Smooth scrubbing
        invalidateOnRefresh: true, // Recalculate on resize
      },
    });

    // 1. VIDEO ANIMATION
    const vid = videoRef.current;
    if (vid) {
        // Pause immediately so scroll can take over
        vid.pause();
        
        // Use the state duration or fallback to 10s if metadata failed
        const duration = videoDuration || 10;
        
        tl.fromTo(vid, 
            { currentTime: 0 }, 
            { currentTime: duration, ease: "none" }, 
            0
        );
    }

    // 2. TEXT ANIMATION
    const step = 1 / phrases.length;
    
    phrases.forEach((_, i) => {
      const text = textRefs.current[i];
      if (!text) return;

      const startTime = i * step;

      // Reset CSS to ensure they are hidden but ready
      gsap.set(text, { 
           y: '100%', 
           opacity: 0, 
           scale: 0.9, 
           filter: 'blur(10px)',
      });

      // Enter
      tl.to(text, {
        y: '0%', opacity: 1, scale: 1, filter: 'blur(0px)',
        duration: step * 0.4, ease: 'power3.out',
      }, startTime); 

      // Exit
      if (i < phrases.length - 1) {
          tl.to(text, {
              y: '-100%', opacity: 0, scale: 1.1, filter: 'blur(10px)',
              duration: step * 0.4, ease: 'power3.in',
          }, startTime + (step * 0.6)); 
      }
    });

  }, { 
      scope: containerRef, 
      dependencies: [videoDuration] // Re-build timeline when video loads
  });


  // --- LAYOUT CORRECTION ---
  // This fixes the "Forceful Scroll" issue by refreshing triggers 
  // after the page has had time to load fully.
  useGSAP(() => {
    // Refresh immediately
    ScrollTrigger.refresh();

    // And refresh again after 500ms and 1s to catch any 3D scene layout shifts
    const timer1 = setTimeout(() => ScrollTrigger.refresh(), 500);
    const timer2 = setTimeout(() => ScrollTrigger.refresh(), 1000);

    return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
    };
  }, []);


  return (
    <section 
      ref={containerRef} 
      // 400vh Height guarantees scrolling space
      className="relative w-full h-[400vh] bg-[#2B1C13]"
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
                onLoadedMetadata={(e) => {
                    // Update state with actual duration when ready
                    setVideoDuration(e.currentTarget.duration);
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