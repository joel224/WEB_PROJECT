'use client';

import { Suspense } from 'react';
import Scene from '@/components/Scene';

export default function WorkPage() {
  return (
    <main className="relative w-full bg-[#331707]">
      
      {/* 1. The Scroll Container (The Trigger) */}
      {/* We make this 300vh tall so you have space to scroll */}
      <div className="scroller h-[300vh] relative z-10">
        
        {/* The Text Layer */}
        {/* We use sticky so the text stays centered for a while then scrolls away */}
        <div className="sticky top-0 h-screen flex flex-col items-center justify-center pointer-events-none">
          <div className="text-center space-y-8 p-4">
            {/* Logo Placeholder (The cubes will cover this initially) */}
            <div className="w-[150px] h-[100px] mx-auto" /> 
            
            <h1 className="text-[#FFE9D9] font-serif text-4xl md:text-6xl max-w-4xl leading-tight">
              The First Media Company crafted For the Digital First generation
            </h1>
          </div>
        </div>

      </div>

      {/* 2. The 3D Scene Layer (Fixed Background) */}
      <div className="fixed inset-0 z-0 top-0 left-0 w-full h-full pointer-events-none">
        {/* Suspense is REQUIRED for useTexture to work */}
        <Suspense fallback={null}>
          <Scene />
        </Suspense>
      </div>

    </main>
  );
}