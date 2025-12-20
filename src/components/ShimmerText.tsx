'use client';

import React, { useLayoutEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import gsap from 'gsap';

const ShimmerText = () => {
  const containerRef = useRef<HTMLHeadingElement>(null);
  const text = " generation";
  
  useLayoutEffect(() => {
    if (!containerRef.current) return;

    const allChars = containerRef.current.querySelectorAll('.char');

    const ctx = gsap.context(() => {
      // 1. Create Timeline (No repeat)
      // delay: 0.8 ensures the text is fully visible before the shine starts
      const tl = gsap.timeline({ delay: 0.8 });

      // 2. The Sweep Animation
      tl.fromTo(allChars, 
        { 
          // Gradient: Beige -> White -> Beige
          // The text starts transparent to let the gradient show through
          backgroundImage: "linear-gradient(110deg, #FFE9D9 40%, #FFFFFF 50%, #FFE9D9 60%)",
          backgroundSize: "200% 100%",
          backgroundPosition: "200% 0%",
          webkitBackgroundClip: "text",
          webkitTextFillColor: "transparent", 
        },
        {
          // Move the white shine all the way to the left
          backgroundPosition: "-100% 0%",
          duration: 1.5, // Slower duration for smoothness
          ease: "power2.inOut",
          stagger: 0.05,
          
          // 3. Seamless Finish
          // Once done, we smoothly fade the real solid color back in
          // This prevents any "snap" or glitch
          onComplete: () => {
            gsap.to(allChars, {
                color: "#FFE9D9",
                webkitTextFillColor: "#FFE9D9",
                duration: 0.5
            });
          }
        }
      );

    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <motion.div
      ref={containerRef}
      className="inline-flex flex-wrap justify-center gap-[0.3em]"
      // Entrance: Fade Up
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
    >
      {text.split(" ").map((word, wIndex) => (
        <span key={wIndex} className="whitespace-nowrap">
            {word.split("").map((char, i) => (
            <span
                key={i}
                className="char inline-block relative bg-no-repeat"
            >
                {char}
            </span>
            ))}
        </span>
      ))}
    </motion.div>
  );
};

export default ShimmerText;