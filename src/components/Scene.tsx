'use client';

import { Canvas, useThree, type Viewport } from '@react-three/fiber';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { MutableRefObject, Suspense } from 'react';
import { Preload } from '@react-three/drei';
import type { Mesh } from 'three';

import { cubesData } from '@/lib/cube-data';
import HeroCube from './HeroCube';

gsap.registerPlugin(ScrollTrigger);

const DESIGN_WIDTH = 1920;
const DESIGN_HEIGHT = 1200;

type AnimatedCubesProps = {
  cubeRefs: MutableRefObject<(Mesh | null)[]>;
  contextSafe: (fn: Function) => Function;
};

// Helper to map Pixels to 3D Units
function pixelToThree(x: number, y: number, viewport: Viewport) {
  // x: 0 is left edge, 1920 is right edge
  // threeX: 0 is center
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
    if (!cubeRefs.current.length || !viewport.width) return;

    // 1. TEXT BLUR ANIMATION (HTML)
    // We animate the CSS filter property
    const textTimeline = gsap.timeline({
      scrollTrigger: {
        trigger: '.scroller',
        start: 'top top',
        end: '50% top', // Effect happens quickly
        scrub: true,
      },
    });

    textTimeline
      .to('.hero-text', { opacity: 0, filter: 'blur(10px)', duration: 1 })
      .to('.center-text', { opacity: 1, filter: 'blur(0px)', duration: 1 }, "-=0.5");

    // 2. CUBE EXPLOSION ANIMATION (3D)
    const cubeTimeline = gsap.timeline({
      scrollTrigger: {
        trigger: '.scroller',
        start: 'top top',
        end: 'bottom bottom',
        scrub: 1, // Add slight delay for smoothness
      },
    });

    cubesData.forEach((cube, index) => {
      const cubeRef = cubeRefs.current[index];
      if (!cubeRef) return;

      const startPos = pixelToThree(cube.start.x, cube.start.y, viewport);
      const startScale = calculateScale(cube.start.w, viewport);
      const startRotZ = (cube.start.rotationZ * Math.PI) / 180;
      
      const startRotY = cube.start.rotationY || 0; 

      const endPos = pixelToThree(cube.end.x, cube.end.y, viewport);
      const endScale = calculateScale(cube.end.w, viewport);
      const endRotationRad = (cube.end.rotation * Math.PI) / 180;

      gsap.set(cubeRef.position, { ...startPos, z: 0 });
      gsap.set(cubeRef.scale, { x: startScale, y: startScale, z: 0.1 }); 
      gsap.set(cubeRef.rotation, { x: 0, y: startRotY, z: startRotZ });

      cubeTimeline.to(cubeRef.position, {
          z: 4, 
          duration: 0.4,
          ease: "power2.inOut"
      }, 0);

      cubeTimeline.to(cubeRef.rotation, {
          x: Math.random() * Math.PI, 
          y: Math.random() * Math.PI, 
          z: Math.random() * Math.PI,
          duration: 0.4
      }, 0);

      cubeTimeline.to(cubeRef.position, {
          x: endPos.x,
          y: endPos.y,
          z: 0,
          duration: 0.6,
          ease: "power2.out"
      }, 0.4);

      cubeTimeline.to(cubeRef.rotation, {
          x: 0,
          y: 0,
          z: endRotationRad,
          duration: 0.6
      }, 0.4);

      cubeTimeline.to(cubeRef.scale, {
          x: endScale,
          y: endScale,
          z: endScale,
          duration: 0.6
      }, 0.4);
    });
  });
  
  useGSAP(() => {
    if (viewport.width > 0) animate();
  }, { dependencies: [viewport, animate] });

  return (
    <group>
      {cubesData.map((cube, i) => (
        <HeroCube
          key={cube.id}
          image={cube.image}
          ref={(el) => { cubeRefs.current[i] = el; }}
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
      camera={{ position: [0, 0, 10], fov: 50 }}
      style={{ width: '100vw', height: '100vh', position: 'fixed', top: 0, left: 0, pointerEvents: 'none' }}
    >
      <ambientLight intensity={1.5} />
      <directionalLight position={[5, 5, 5]} intensity={1} />
      <Suspense fallback={null}>
        <AnimatedCubes cubeRefs={cubeRefs} contextSafe={contextSafe} />
        <Preload all />
      </Suspense>
    </Canvas>
  );
}
