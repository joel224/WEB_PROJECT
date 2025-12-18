'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import Header from '@/components/Header';
import { Card, CardContent } from '@/components/ui/card';
import AnimatedTitle from '@/components/AnimatedTitle';

const projects = PlaceHolderImages;

export default function Home() {
  return (
    <div className="bg-background text-foreground">
      <Header />
      <main className="pt-24 px-4 md:px-8">
        <section className="min-h-[60vh] flex flex-col items-center justify-center text-center">
          <AnimatedTitle />
          <p className="mt-4 text-lg md:text-xl text-muted-foreground max-w-3xl">
            A creative developer passionate about crafting beautiful and interactive digital experiences.
          </p>
        </section>

        <section className="py-20">
          <h2 className="text-5xl md:text-7xl font-bold text-center mb-16">
            Featured Work
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.map((project) => (
              <motion.div
                key={project.id}
                className="relative"
                whileHover="hover"
              >
                <Card className="overflow-hidden group">
                  <CardContent className="p-0">
                    <motion.div
                      className="absolute inset-0 z-10 flex items-center justify-center bg-black bg-opacity-50 transition-opacity duration-300"
                      variants={{
                        initial: { opacity: 0 },
                        hover: { opacity: 1 },
                      }}
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    >
                      <span className="text-white text-lg font-bold">
                        View Project
                      </span>
                    </motion.div>
                    <motion.div
                      variants={{
                        initial: { scale: 1, filter: 'blur(0px)' },
                        hover: { scale: 1.05, filter: 'blur(4px)' },
                      }}
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    >
                      <Image
                        src={project.imageUrl}
                        alt={project.description}
                        width={600}
                        height={400}
                        className="object-cover w-full h-full"
                        data-ai-hint={project.imageHint}
                      />
                    </motion.div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
