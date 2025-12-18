'use client';

import React from 'react';
import Header from '@/components/Header';
import AnimatedTitle from '@/components/AnimatedTitle';

export default function Home() {
  return (
    <div className="bg-background text-foreground">
      <Header />
      <main className="pt-24 px-4 md:px-8">
        <section className="min-h-[80vh] flex flex-col items-center justify-center text-center">
          <AnimatedTitle />
          <p className="mt-4 text-lg md:text-xl text-muted-foreground max-w-3xl">
            A creative developer passionate about crafting beautiful and interactive digital experiences.
          </p>
        </section>
      </main>
    </div>
  );
}
