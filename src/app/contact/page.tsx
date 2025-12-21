'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';

export default function ContactPage() {
  return (
    <main className="w-full min-h-screen bg-[#2B1C13] text-[#FFE9D9] flex flex-col items-center justify-center p-8">
      <motion.div
        className="text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      >
        <h1 className="font-serif text-5xl md:text-7xl font-bold mb-4">
          Get in Touch
        </h1>
        <p className="max-w-xl mx-auto text-[#FFE9D9]/80 mb-12">
          We're here to answer your questions and explore how we can help bring your vision to life.
        </p>

        <Link href="/">
          <motion.div
            className="inline-flex items-center gap-2 text-[#FFE9D9] border border-[#FFE9D9]/50 rounded-full py-3 px-6 hover:bg-[#FFE9D9]/10 transition-colors duration-300"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <ArrowLeft size={18} />
            Back to Home
          </motion.div>
        </Link>
      </motion.div>
    </main>
  );
}
