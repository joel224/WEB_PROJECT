'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from './ui/button';
import Link from 'next/link';

export default function Header() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.header
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      animate={{
        backgroundColor: scrolled ? 'hsla(var(--background) / 0.8)' : 'hsla(var(--background) / 0)',
        backdropFilter: scrolled ? 'blur(8px)' : 'blur(0px)',
        boxShadow: scrolled ? '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' : 'none',
      }}
    >
      <div className="container mx-auto flex h-20 items-center justify-between px-4 md:px-6">
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="text-2xl font-bold tracking-tighter text-primary"
        >
          <Link href="/">JJ</Link>
        </motion.div>
        <nav className="hidden md:flex items-center gap-6 text-lg font-medium">
          <motion.a href="/work" whileHover={{ y: -2 }} className="hover:text-primary transition-colors">Work</motion.a>
          <motion.a href="#about" whileHover={{ y: -2 }} className="hover:text-primary transition-colors">About</motion.a>
          <motion.a href="#contact" whileHover={{ y: -2 }} className="hover:text-primary transition-colors">Contact</motion.a>
        </nav>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button>Get In Touch</Button>
        </motion.div>
      </div>
    </motion.header>
  );
}
