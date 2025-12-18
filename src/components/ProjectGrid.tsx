'use client';
import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const ProjectCard = ({ project }: { project: any }) => {
  return (
    <motion.div
      className="relative overflow-hidden rounded-lg group"
      whileHover="hover"
      initial="initial"
      variants={{
        initial: {
          scale: 1,
        },
        hover: {
          scale: 1.05,
        },
      }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      <motion.div
        className="absolute inset-0 z-10 bg-black/50 backdrop-blur-0 transition-all duration-300"
        variants={{
          initial: { backdropFilter: 'blur(0px)' },
          hover: { backdropFilter: 'blur(10px)' },
        }}
      />
      <Image
        src={project.imageUrl}
        alt={project.description}
        width={600}
        height={400}
        data-ai-hint={project.imageHint}
        className="object-cover w-full h-full"
      />
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.span
          className="text-white text-lg font-bold"
          variants={{
            initial: { opacity: 0, y: 20 },
            hover: { opacity: 1, y: 0 },
          }}
          transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.1 }}
        >
          View Project
        </motion.span>
      </div>
    </motion.div>
  );
};

export default function ProjectGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {PlaceHolderImages.slice(0, 6).map((project) => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </div>
  );
}
