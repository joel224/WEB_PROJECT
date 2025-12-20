'use client';

import React, { useRef, useEffect, useState, useMemo } from 'react';
import { gsap } from 'gsap';

// --- SUB-COMPONENT 1: RANDOM TYPEWRITER ---
// Used for "Precision" and "Digital"
const TypewriterWord = ({ text, isActive }: { text: string; isActive: boolean }) => {
  const containerRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const chars = containerRef.current.querySelectorAll('.type-char');

    // Kill any running tweens to prevent conflicts
    gsap.killTweensOf(chars);

    if (isActive) {
      // 1. Reset to invisible
      gsap.set(chars, { opacity: 0, y: 5 });

      // 2. Animate in (Randomized Stagger)
      gsap.to(chars, {
        opacity: 1,
        y: 0,
        duration: 0.1,
        // "random" stagger makes it look like a hacked/typing effect
        stagger: { amount: 0.5, from: "random" }, 
        delay: 0.2, // Wait for parent fade-in to start
        ease: "power2.out",
      });
    } else {
      // Reset when not active so it can replay later
      gsap.set(chars, { opacity: 1, y: 0 }); 
    }
  }, [isActive]);

  return (
    <span ref={containerRef} className="inline-block whitespace-nowrap">
      {text.split('').map((char, i) => (
        <span key={i} className="type-char inline-block relative">
          {char}
        </span>
      ))}
    </span>
  );
};

// --- SUB-COMPONENT 2: SHIMMER TEXT ---
// Adapted from your snippet for "Generation"
const ShimmerWord = ({ text, isActive }: { text: string; isActive: boolean }) => {
  const containerRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const chars = containerRef.current.querySelectorAll('.shimmer-char');
    const ctx = gsap.context(() => {}); // Empty context init

    if (isActive) {
      ctx.add(() => {
        // 1. Create Timeline
        const tl = gsap.timeline({ delay: 0.5 }); // Delay so text is visible first

        // 2. The Sweep Animation
        tl.fromTo(chars, 
          { 
            backgroundImage: "linear-gradient(110deg, #FFE9D9 40%, #FFFFFF 50%, #FFE9D9 60%)",
            backgroundSize: "200% 100%",
            backgroundPosition: "200% 0%",
            webkitBackgroundClip: "text",
            webkitTextFillColor: "transparent", 
            color: "transparent"
          },
          {
            backgroundPosition: "-100% 0%",
            duration: 1.5,
            ease: "power2.inOut",
            stagger: 0.05,
            onComplete: () => {
              // Lock in the solid color at the end
              gsap.to(chars, {
                 color: "#FFE9D9",
                 webkitTextFillColor: "#FFE9D9",
                 duration: 0.5
              });
            }
          }
        );
      });
    } else {
       // Revert/Cleanup when inactive
       ctx.revert();
       gsap.set(chars, { color: "#FFE9D9", webkitTextFillColor: "#FFE9D9", background: "none" });
    }

    return () => ctx.revert();
  }, [isActive]);

  return (
    <span ref={containerRef} className="inline-block whitespace-nowrap">
      {text.split('').map((char, i) => (
        <span key={i} className="shimmer-char inline-block relative">
          {char}
        </span>
      ))}
    </span>
  );
};

// --- MAIN COMPONENT ---
export default function KineticSection() {
  const containerRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  // Define phrases data structure
  const phrases = useMemo(() => [
    { text: 'Innovation', type: 'normal' },
    { 
      type: 'mixed', 
      parts: [
        { text: 'Meets ', style: 'normal' },
        { text: 'Precision', style: 'typewriter' }
      ] 
    },
    { text: 'Crafted For', type: 'normal' },
    { 
      type: 'mixed', 
      parts: [
        { text: 'The ', style: 'normal' },
        { text: 'Digital', style: 'typewriter' }
      ] 
    },
    { text: 'Generation', type: 'shimmer' },
  ], []);

  // --- RAW MATH LOOP ---
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
  }, [progress, phrases.length]); 

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

        {/* --- LAYER 2: LEAVES --- */}
        <div className="absolute inset-0 z-20 pointer-events-none overflow-hidden">
            <img
                src="/images/hero-left-leaf.png"
                alt="Leaf Decor"
                className="absolute left-[-5%] top-1/2 w-[120px] md:w-[200px] transition-transform duration-75 ease-linear"
                style={{ transform: `translateY(calc(-50% - ${progress * 100}px))` }}
            />
            <img
                src="/images/hero-right-leaf.png"
                alt="Leaf Decor"
                className="absolute right-[-2%] top-[-5%] w-[140px] md:w-[200px] transition-transform duration-75 ease-linear"
                style={{ transform: `translateY(${progress * 150}px)` }}
            />
        </div>

        {/* --- LAYER 3: TEXT RENDERER --- */}
        <div className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none">
          {phrases.map((phraseObj, i) => {
            const isActive = i === activeIndex;

            return (
              <h2
                key={i}
                className={`
                  absolute text-5xl md:text-8xl font-serif font-bold text-center leading-tight tracking-tight uppercase px-4 text-[#FFE9D9] drop-shadow-2xl
                  transition-all duration-700 ease-out
                  ${isActive 
                      ? 'opacity-100 blur-0 scale-100 translate-y-0' 
                      : i < activeIndex
                          ? 'opacity-0 blur-xl scale-110 -translate-y-20' 
                          : 'opacity-0 blur-xl scale-90 translate-y-20'
                  }
                `}
              >
                {/* LOGIC TO CHOOSE RENDER TYPE */}
                
                {/* 1. NORMAL TEXT */}
                {phraseObj.type === 'normal' && phraseObj.text}

                {/* 2. MIXED (Normal + Typewriter) */}
                {phraseObj.type === 'mixed' && phraseObj.parts?.map((part, pIndex) => (
                  <span key={pIndex}>
                    {part.style === 'typewriter' 
                      ? <TypewriterWord text={part.text} isActive={isActive} />
                      : part.text
                    }
                  </span>
                ))}

                {/* 3. SHIMMER TEXT */}
                {phraseObj.type === 'shimmer' && (
                  <ShimmerWord text={phraseObj.text!} isActive={isActive} />
                )}

              </h2>
            );
          })}
        </div>

      </div>
    </section>
  );
}