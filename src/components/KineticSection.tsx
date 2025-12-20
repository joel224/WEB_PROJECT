'use client';

import React, { useRef, useEffect, useState, useMemo } from 'react';
import { gsap } from 'gsap';

// --- SUB-COMPONENT 1: RANDOM TYPEWRITER ---
const TypewriterWord = ({ text, isActive }: { text: string; isActive: boolean }) => {
  const containerRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const chars = containerRef.current.querySelectorAll('.type-char');
    gsap.killTweensOf(chars);

    if (isActive) {
      gsap.set(chars, { opacity: 0, y: 5 });
      gsap.to(chars, {
        opacity: 1,
        y: 0,
        duration: 0.1,
        stagger: { amount: 0.5, from: "random" }, 
        delay: 0.2, 
        ease: "power2.out",
      });
    } else {
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
const ShimmerWord = ({ text, isActive }: { text: string; isActive: boolean }) => {
  const containerRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const chars = containerRef.current.querySelectorAll('.shimmer-char');
    const ctx = gsap.context(() => {}); 

    if (isActive) {
      ctx.add(() => {
        const tl = gsap.timeline({ delay: 0.5 }); 
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
          
          const vid = videoRef.current;
          if (vid.duration) {
              vid.currentTime = safeProgress * vid.duration;
          }

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
            {/* Dark Overlay (z-10) */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-10" />
        </div>

        {/* --- LAYER 1.5: LIGHT GLOW (Added) --- */}
        {/* z-[15] places it ABOVE the dark overlay but BELOW leaves/text */}
        <div className="absolute inset-0 z-[15] pointer-events-none flex items-center justify-center">
            <div 
                className="
                    w-[300px] h-[500px] md:w-[500px] md:h-[800px] 
                    bg-white/40 
                    rounded-[50%] 
                    blur-[80px] md:blur-[120px] 
                    rotate-90
                    opacity: 0.5
                "
                
                // Removed mix-blend-mode to ensure visibility
            />
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

        {/* --- LAYER 3: TEXT --- */}
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
                {phraseObj.type === 'normal' && phraseObj.text}

                {phraseObj.type === 'mixed' && phraseObj.parts?.map((part, pIndex) => (
                  <span key={pIndex}>
                    {part.style === 'typewriter' 
                      ? <TypewriterWord text={part.text} isActive={isActive} />
                      : part.text
                    }
                  </span>
                ))}

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