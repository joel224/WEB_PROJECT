'use client';

import { motion } from 'framer-motion';
import { Twitter, Linkedin, Github } from 'lucide-react';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: 'easeOut',
    },
  },
};

const Footer = () => {
  return (
    <motion.footer
      className="relative z-20 w-full bg-[#2B1C13] py-20 px-4 text-center text-[#FFE9D9]/80"
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.5 }}
    >
      <motion.h3
        className="font-serif text-3xl md:text-4xl font-bold text-[#FFE9D9] mb-4"
        variants={itemVariants}
      >
        Let's Create Together
      </motion.h3>
      <motion.p
        className="max-w-xl mx-auto mb-8 font-sans"
        variants={itemVariants}
      >
       By Joel :) 
      </motion.p>
      <motion.div
        className="flex items-center justify-center space-x-6"
        variants={itemVariants}
      >
        <a href="#" className="text-[#FFE9D9] hover:text-white transition-colors duration-300">
          <Twitter size={24} />
        </a>
        <a href="#" className="text-[#FFE9D9] hover:text-white transition-colors duration-300">
          <Linkedin size={24} />
        </a>
        <a href="#" className="text-[#FFE9D9] hover:text-white transition-colors duration-300">
          <Github size={24} />
        </a>
      </motion.div>
       <motion.p
        className="text-xs text-[#FFE9D9]/50 mt-12"
        variants={itemVariants}
      >
        © {new Date().getFullYear()}  All Rights Reserved.
      </motion.p>
    </motion.footer>
  );
};

export default Footer;
