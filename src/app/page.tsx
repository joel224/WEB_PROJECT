'use client';

import React from 'react';
import Header from '@/components/Header';
import AnimatedTitle from '@/components/AnimatedTitle';
import KineticTypography from '@/components/KineticTypography';
import Hero from '@/components/Hero';

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
      </main>
    </div>
  );
}
