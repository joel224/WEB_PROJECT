'use client';

import React, { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';

const RevealText = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const text = "Digital First generation";

  useLayoutEffect(() => {
    if (!containerRef.current) return;
    
    // Grab all character elements
    const chars = containerRef.current.querySelectorAll('.char');

    const ctx = gsap.context(() => {
      // 1. INITIAL STATE: "Closed"
      // clip-path: inset(0 100% 0 0) -> Crops 100% from the right side (Hidden)
      gsap.set(chars, { clipPath: 'inset(0 100% 0 0)' });

      // 2. ANIMATION: "Open"
      // Animate to inset(0 0% 0 0) -> No cropping (Fully Visible)
      gsap.to(chars, {
        clipPath: 'inset(0 0% 0 0)',
        duration: 0.8,      // Speed of individual letter opening
        ease: 'power4.out', // Snappy, mechanical "door opening" feel
        stagger: 0.04,      // The "Left to Right" wave delay
        delay: 0.2          // Slight pause before starting
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="inline-block">
      {text.split(" ").map((word, wIndex) => (
        // Wrap words to handle spacing correctly
        <span key={wIndex} className="inline-block whitespace-nowrap mr-[0.25em]">
          {word.split("").map((char, cIndex) => (
            <span
              key={cIndex}
              className="char inline-block"
              style={{
                 // Force the color to match your design immediately
                 color: '#FFE9D9',
                 // Important: inline-block allows clip-path to work
                 display: 'inline-block',
                 lineHeight: '1.1' 
              }}
            >
              {char}
            </span>
          ))}
        </span>
      ))}
    </div>
  );
};

export default RevealText;