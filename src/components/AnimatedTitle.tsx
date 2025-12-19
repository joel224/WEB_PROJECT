'use client';

import React, { useLayoutEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import gsap from 'gsap';

const ShimmerTitle = () => {
  const containerRef = useRef<HTMLHeadingElement>(null);
  const text = "JOEL JOSHY";
  
  useLayoutEffect(() => {
    if (!containerRef.current) return;

    // Grab all characters and specifically the last two
    const allChars = containerRef.current.querySelectorAll('.char');
    const lastTwo = Array.from(allChars).slice(-2);

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ repeat: -1, repeatDelay: 1.5 });

      // 1. Initial Sweep across the whole name
      tl.fromTo(allChars, 
        { 
          backgroundImage: "linear-gradient(110deg, transparent 40%, #fff 50%, transparent 60%)",
          backgroundSize: "200% 100%",
          backgroundPosition: "200% 0%",
          webkitBackgroundClip: "text",
          color: "rgba(255,255,255,0.3)", // Base dimmed color
        },
        {
          backgroundPosition: "-100% 0%",
          duration: 1.5,
          ease: "power2.inOut",
          stagger: 0.05
        }
      );

      // 2. Focused shimmer on "HY"
      tl.to(lastTwo, {
        color: "#fff",
        textShadow: "0 0 20px rgba(0, 224, 198, 0.8), 0 0 30px rgba(0, 224, 198, 0.4)",
        duration: 0.4,
        yoyo: true,
        repeat: 1, // Rapid blink/shimmer effect
        ease: "sine.inOut"
      }, "-=0.2");

    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    
    <div className="flex items-center justify-center min-h-[200px] bg-black">
     
      <motion.h1
        ref={containerRef}
        className="text-6xl md:text-8xl font-black tracking-tighter uppercase flex flex-wrap justify-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
      >
        {text.split("").map((char, i) => (
          <span
            key={i}
            className="char inline-block relative bg-no-repeat transition-colors duration-300"
            style={{ 
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundImage: "linear-gradient(110deg, transparent 40%, #fff 50%, transparent 60%)",
              backgroundSize: "200% 100%",
              backgroundPosition: "200% 0%",
            }}
          >
            {char === " " ? "\u00A0" : char}
          </span>
        ))}
      </motion.h1>
    </div>
  );
};

export default ShimmerTitle;