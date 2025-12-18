'use client';

import React, { useLayoutEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import gsap from 'gsap';

const AnimatedTitle = () => {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const text = 'JOEL JOSHY';
  const glowColor = '#00E0C6';

  useLayoutEffect(() => {
    if (!titleRef.current) return;

    const chars = Array.from(titleRef.current.querySelectorAll('.char'));
    if (chars.length === 0) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ repeat: -1, repeatDelay: 2 });

      // Traveling highlight
      tl.fromTo(
        chars,
        {
          textShadow: `0 0 0px ${glowColor}, 0 0 0px ${glowColor}`,
          color: 'hsl(var(--primary))',
        },
        {
          duration: 0.6,
          textShadow: `0 0 15px ${glowColor}, 0 0 25px ${glowColor}`,
          color: '#fff',
          stagger: {
            from: 'start',
            each: 0.1,
          },
        }
      ).to(chars, {
        duration: 0.6,
        textShadow: `0 0 0px ${glowColor}, 0 0 0px ${glowColor}`,
        color: 'hsl(var(--primary))',
        stagger: {
          from: 'start',
          each: 0.1,
        },
      }, '-=0.4');
      
      // Linger on 'HY'
      const lastTwoChars = chars.slice(-2);
      tl.to(lastTwoChars, {
        duration: 0.8,
        textShadow: `0 0 15px ${glowColor}, 0 0 25px ${glowColor}`,
        color: '#fff',
        ease: 'power2.inOut',
      }, '+=0.5')
      .to(lastTwoChars, {
        duration: 1.2,
        textShadow: `0 0 8px ${glowColor}, 0 0 15px ${glowColor}`,
        color: '#fff',
        ease: 'power2.inOut',
        yoyo: true,
        repeat: 1
      });

    }, titleRef);

    return () => ctx.revert();
  }, [text]);

  return (
    <motion.h1
      ref={titleRef}
      className="text-7xl md:text-9xl font-bold uppercase tracking-tighter text-primary"
      initial={{ letterSpacing: '-0.05em', opacity: 0 }}
      animate={{ letterSpacing: '0.02em', opacity: 1 }}
      transition={{ duration: 1.5, ease: [0.25, 1, 0.5, 1] }}
    >
      {text.split('').map((char, index) => (
        <span key={index} className="char inline-block">
          {char === ' ' ? '\u00A0' : char}
        </span>
      ))}
    </motion.h1>
  );
};

export default AnimatedTitle;
