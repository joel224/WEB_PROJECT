'use client';

import React, { useLayoutEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import gsap from 'gsap';

const AnimatedTitle = () => {
  const titleRef = useRef<HTMLHeadingElement>(null);

  useLayoutEffect(() => {
    if (!titleRef.current) return;

    const chars = titleRef.current.querySelectorAll('.shimmer-char');
    if (chars.length === 0) return;

    const ctx = gsap.context(() => {
      // Shimmer animation
      const shimmer = gsap.to(titleRef.current, {
        backgroundPosition: '200% 0',
        duration: 2.5,
        ease: 'power2.out',
        paused: true,
      });

      // Shimmer on load
      shimmer.play();
      
      // Lingering glow on the last two letters
      gsap.to(titleRef.current, {
        scrollTrigger: {
          trigger: titleRef.current,
          start: 'top center',
          onEnter: () => {
            gsap.timeline()
              .to(titleRef.current, { backgroundPosition: '150% 0', duration: 1.5, ease: 'power1.in' })
              .to(titleRef.current, { backgroundPosition: '200% 0', duration: 1, ease: 'power1.out' });
          }
        },
      });

      // Mouse follow shimmer
      const handleMouseMove = (e: MouseEvent) => {
        const rect = titleRef.current!.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const percent = x / rect.width;
        gsap.to(titleRef.current, {
          backgroundPosition: `${percent * 200}% 0`,
          duration: 0.5,
          ease: 'power2.out',
        });
      };

      const handleMouseLeave = () => {
        shimmer.restart();
      };

      titleRef.current.addEventListener('mousemove', handleMouseMove);
      titleRef.current.addEventListener('mouseleave', handleMouseLeave);

      return () => {
        if (titleRef.current) {
          titleRef.current.removeEventListener('mousemove', handleMouseMove);
          titleRef.current.removeEventListener('mouseleave', handleMouseLeave);
        }
      };
    }, titleRef);

    return () => ctx.revert();
  }, []);

  const text = 'JOEL JOSHY';

  return (
    <motion.h1
      ref={titleRef}
      className="text-7xl md:text-9xl font-bold uppercase tracking-tighter text-gradient bg-gradient-to-r from-blue-900 via-teal-300 to-blue-900 bg-[size:200%_auto]"
      initial={{ letterSpacing: '-0.1em', opacity: 0 }}
      animate={{ letterSpacing: '0.02em', opacity: 1 }}
      transition={{ duration: 1.5, ease: [0.25, 1, 0.5, 1] }}
    >
      {text.split('').map((char, index) => (
        <span key={index} className="shimmer-char">
          {char}
        </span>
      ))}
    </motion.h1>
  );
};

export default AnimatedTitle;
