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
  const [isVideoReady, setIsVideoReady] = useState(false);

  useLayoutEffect(() => {
    // Wait until video metadata is loaded to ensure we have the correct duration
    if (!isVideoReady || !videoRef.current || !videoRef.current.duration) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top top',
          end: 'bottom bottom', 
          scrub: 0.5, // Slight smoothing (0.5s) for a premium feel
        },
      });

      // --- 1. VIDEO SCRUB (Strict Scroll Control) ---
      const vid = videoRef.current;
      // Ensure video is paused so GSAP can control it.
      vid.pause();
      
      // Scrub from time 0 to full duration
      tl.fromTo(vid, 
        { currentTime: 0 }, 
        { currentTime: vid.duration, ease: "none" }, 
        0
      );
      

      // --- 2. TEXT ANIMATION ---
      const step = 1 / phrases.length; // Divide the scroll timeline evenly

      phrases.forEach((_, i) => {
        const text = textRefs.current[i];
        if (!text) return;

        const startTime = i * step;

        // Reset state
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

        // Exit (except last one)
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
  }, [isVideoReady]); // Re-run the effect once the video is ready

  return (
    <section 
      ref={containerRef} 
      className="relative w-full h-[400vh] bg-[#2B1C13]"
    >
      <div className="sticky top-0 h-screen w-full overflow-hidden flex flex-col justify-center items-center">
        
        {/* VIDEO LAYER */}
        <div className="absolute inset-0 z-0">
            <video
                ref={videoRef}
                className="w-full h-full object-cover"
                muted
                playsInline
                // Removed autoPlay and loop. 
                // onLoadedMetadata signals GSAP that duration is available.
                onLoadedMetadata={() => setIsVideoReady(true)}
                src="/output.mp4"
            />
            
            {/* VISIBILITY UPGRADE 
               1. bg-black/70: Much darker overlay.
               2. backdrop-blur-sm: Blurs the video slightly to make text pop.
            */}
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
