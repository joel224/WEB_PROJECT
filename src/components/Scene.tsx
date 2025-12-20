'use client';

import { Canvas, useThree } from '@react-three/fiber';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { MutableRefObject, Suspense } from 'react'; // 1. Import Suspense
import type { Mesh, Viewport } from 'three';
import { Preload } from '@react-three/drei'; // 2. Import Preload

import { cubesData } from '@/lib/cube-data';
import HeroCube from './HeroCube';

gsap.registerPlugin(ScrollTrigger);

const DESIGN_WIDTH = 1920;
const DESIGN_HEIGHT = 1200;

type AnimatedCubesProps = {
  cubeRefs: MutableRefObject<(Mesh | null)[]>;
  contextSafe: (fn: Function) => Function;
};

function pixelToThree(x: number, y: number, viewport: Viewport) {
  const threeX = (x / DESIGN_WIDTH) * viewport.width - viewport.width / 2;
  const threeY = -((y / DESIGN_HEIGHT) * viewport.height - viewport.height / 2);
  return { x: threeX, y: threeY };
}

function calculateScale(pixelWidth: number, viewport: Viewport) {
  return (pixelWidth / DESIGN_WIDTH) * viewport.width;
}

const AnimatedCubes = ({ cubeRefs, contextSafe }: AnimatedCubesProps) => {
  const { viewport } = useThree();

  const animate = contextSafe(() => {
    if (!cubeRefs.current.length || !viewport.width) return; // Add viewport check

    // ... (Keep your existing gsap code here exactly as it was) ...
    // Note: Ensure your .title-overlay class exists in your HTML/page.tsx
    
    gsap.to('.title-overlay', {
      opacity: 0,
      scrollTrigger: {
        trigger: '.scroller',
        start: 'top top',
        end: '20% top',
        scrub: true,
      },
    });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: '.scroller',
        start: 'top top',
        end: 'bottom bottom',
        scrub: true,
      },
    });

    cubesData.forEach((cube, index) => {
      const cubeRef = cubeRefs.current[index];
      if (!cubeRef) return;

      const startPos = pixelToThree(cube.start.x, cube.start.y, viewport);
      const startScale = calculateScale(cube.start.w, viewport);
      const startRotationRad = (cube.start.rotation * Math.PI) / 180;

      const endPos = pixelToThree(cube.end.x, cube.end.y, viewport);
      const endScale = calculateScale(cube.end.w, viewport);
      const endRotationRad = (cube.end.rotation * Math.PI) / 180;

      // Set initial state
      gsap.set(cubeRef.position, { ...startPos, z: 0 });
      gsap.set(cubeRef.scale, { x: startScale, y: startScale, z: startScale });
      gsap.set(cubeRef.rotation, { x: 0, y: 0, z: startRotationRad });

      // Animation Timeline
      tl.to(cubeRef.position, { z: 5, duration: 0.2 }, 0) // Adjusted Z to be closer
        .to(cubeRef.rotation, { 
             x: Math.random() * Math.PI * 2, 
             y: Math.random() * Math.PI * 2, 
             z: Math.random() * Math.PI * 2, 
             duration: 0.2 
        }, 0);

      tl.to(cubeRef.position, { ...endPos, z: 0, duration: 0.8 }, 0.2)
        .to(cubeRef.scale, { x: endScale, y: endScale, z: endScale, duration: 0.8 }, 0.2)
        .to(cubeRef.rotation, { x: 0, y: 0, z: endRotationRad, duration: 0.8 }, 0.2);
    });
  });

  useGSAP(() => {
    if(viewport.width > 0) {
       animate();
    }
  }, { dependencies: [viewport, animate] });

  return (
    <group>
      {cubesData.map((cube, i) => (
        <HeroCube
          key={cube.id}
          image={cube.image}
          ref={(el) => {
            cubeRefs.current[i] = el;
          }}
        />
      ))}
    </group>
  );
};

type SceneProps = {
  cubeRefs: MutableRefObject<(Mesh | null)[]>;
  contextSafe: (fn: Function) => Function;
};

export default function Scene({ cubeRefs, contextSafe }: SceneProps) {
  return (
    <Canvas
      camera={{ position: [0, 0, 10], fov: 50 }} // Increased Z to see more
      style={{ 
        width: '100vw', 
        height: '100vh',
        position: 'fixed', // Ensure it stays behind
        top: 0,
        left: 0,
        zIndex: 1 // Ensure it is visible
      }}
    >
      <ambientLight intensity={2} />
      <directionalLight position={[5, 5, 5]} intensity={1} />
      
      {/* 3. Wrap in Suspense is CRITICAL for useTexture */}
      <Suspense fallback={null}>
        <AnimatedCubes cubeRefs={cubeRefs} contextSafe={contextSafe} />
        <Preload all />
      </Suspense>
    </Canvas>
  );
}