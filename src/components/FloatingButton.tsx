'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Mail } from 'lucide-react';

type FloatingButtonProps = {
  href: string;
};

const FloatingButton = ({ href }: FloatingButtonProps) => {
  return (
    <Link href={href} passHref>
      <motion.div
        className="fixed bottom-8 right-8 z-50 w-16 h-16 bg-[#FFE9D9] rounded-full flex items-center justify-center shadow-2xl"
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{
          delay: 3.5, // Wait for other animations to finish
          duration: 0.5,
          ease: [0.25, 1, 0.5, 1], // Fast and bouncy
        }}
        whileHover={{ scale: 1.1, rotate: -15 }}
        whileTap={{ scale: 0.9 }}
      >
        <Mail size={28} className="text-[#2B1C13]" />
      </motion.div>
    </Link>
  );
};

export default FloatingButton;
