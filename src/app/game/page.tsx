'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';

export default function GamePage() {
  return (
    <main className="w-full min-h-screen bg-[#1a1a1a] text-white flex flex-col items-center justify-center p-8">
      <motion.div
        className="text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      >
        <h1 className="font-serif text-5xl md:text-7xl font-bold mb-4">
          Game Page
        </h1>
        <p className="max-w-xl mx-auto text-white/80 mb-12">
          This is the game page. Ready for some interactive content!
        </p>

        <Link href="/">
          <motion.div
            className="inline-flex items-center gap-2 text-white border border-white/50 rounded-full py-3 px-6 hover:bg-white/10 transition-colors duration-300"
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
