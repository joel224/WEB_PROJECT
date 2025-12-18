'use client';

import React from 'react';
import Header from '@/components/Header';
import AnimatedTitle from '@/components/AnimatedTitle';
import ProjectGrid from '@/components/ProjectGrid';
import KineticTypography from '@/components/KineticTypography';

export default function Home() {
  return (
    <div className="bg-background text-foreground">
      <Header />
      <main>
        <section className="min-h-screen flex flex-col items-center justify-center text-center relative overflow-hidden">
          <AnimatedTitle />
          <p className="mt-4 text-lg md:text-xl text-muted-foreground max-w-3xl px-4">
            A creative developer passionate about crafting beautiful and
            interactive digital experiences.
          </p>
        </section>

        <KineticTypography />

        <section id="work" className="py-20 md:py-32 px-4 md:px-8">
          <div className="container mx-auto">
            <h2 className="text-4xl md:text-6xl font-bold text-center mb-16 text-primary">
              Featured Work
            </h2>
            <ProjectGrid />
          </div>
        </section>
      </main>
    </div>
  );
}
