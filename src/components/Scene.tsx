'use client';

import { Suspense, useRef, type MutableRefObject, useCallback } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { PerspectiveCamera } from '@react-three/drei';
import type { Mesh, Group, Viewport } from 'three';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

import { cubesData } from '@/lib/cube-data';
import HeroCube from './HeroCube';

gsap.registerPlugin(ScrollTrigger);

// --- UTILITY FUNCTIONS ---
const DESIGN_WIDTH = 1920;
const DESIGN_HEIGHT = 1200;

function calculateScale(figmaWidth: number, viewport: Viewport) {
  const viewportWidth = viewport.width;
  const scale = (figmaWidth / DESIGN_WIDTH) * viewportWidth;
  return scale;
}

function usePixelToThree(x: number, y: number, viewport: Viewport) {
  const threeX = (x / DESIGN_WIDTH) * viewport.width - viewport.width / 2;
  const threeY = -((y / DESIGN_HEIGHT) * viewport.height - viewport.height / 2);
  return { x: threeX, y: threeY };
}


// --- THE 3D CUBES COMPONENT ---
type AnimatedCubesProps = {
  cubeRefs: MutableRefObject<(Mesh | null)[]>;
};

function AnimatedCubes({ cubeRefs }: AnimatedCubesProps) {
  const groupRef = useRef<Group>(null);
  const { viewport } = useThree();


  const animate = useCallback(() => {
    if (!cubeRefs.current.length || !viewport.width) return;

    // 1. UI TIMELINE (HTML elements)
    const uiTimeline = gsap.timeline({
      scrollTrigger: {
        trigger: '.scroller',
        start: 'top top',
        end: '20% top',
        scrub: true,
      },
    });

    uiTimeline
      .to('.logo-fade', { opacity: 0, duration: 0.5 }, 0)
      .to('.hero-text', { opacity: 0, filter: 'blur(10px)', duration: 1 }, 0)
      .to('.center-text', { opacity: 1, filter: 'blur(0px)', duration: 1 }, 0.5);


    // 2. CUBE TIMELINE (3D WebGL elements)
    const cubeTimeline = gsap.timeline({
      scrollTrigger: {
        trigger: '.scroller',
        start: 'top top',
        end: 'bottom bottom',
        scrub: 1,
      },
    });

    cubesData.forEach((cube, index) => {
      const cubeRef = cubeRefs.current[index];
      if (!cubeRef) return;

      const startPos = usePixelToThree(cube.start.x, cube.start.y, viewport);
      const startScale = calculateScale(cube.start.w, viewport);

      const endPos = usePixelToThree(cube.end.x, cube.end.y, viewport);
      const endScale = calculateScale(cube.end.w, viewport);
      const endRotationRad = (cube.end.rotation * Math.PI) / 180;

      // INITIAL STATE
      gsap.set(cubeRef.position, { ...startPos, z: 0 });
      gsap.set(cubeRef.scale, { x: 0, y: 0, z: 0 }); // Start hidden
      gsap.set(cubeRef.rotation, { x: 0, y: Math.PI, z: (cube.start.rotationZ * Math.PI) / 180 });

      // ANIMATION
      // Pop up to replace SVG
      cubeTimeline.to(cubeRef.scale, {
          x: startScale, y: startScale, z: startScale,
          duration: 0.1,
          ease: "power2.out"
      }, 0);

      // Fly to end position
      cubeTimeline.to(cubeRef.position, {
          x: endPos.x,
          y: endPos.y,
          z: 0,
          duration: 0.9,
          ease: "power2.inOut"
      }, 0.1);

      // Rotate to end rotation
      cubeTimeline.to(cubeRef.rotation, {
          x: 0,
          y: 0,
          z: endRotationRad,
          duration: 0.9
      }, 0.1);
      
      // Scale to end size
      cubeTimeline.to(cubeRef.scale, {
          x: endScale, y: endScale, z: endScale,
          duration: 0.9
      }, 0.1);
    });
  }, [cubeRefs, viewport]);


  useGSAP(() => {
    if (viewport.width > 0) { // Ensure viewport is calculated
        animate();
    }
  }, { dependencies: [viewport, animate] });


  return (
    <group ref={groupRef}>
      {cubesData.map((cube, i) => (
        <HeroCube
          key={cube.id}
          ref={(el) => (cubeRefs.current[i] = el)}
          image={cube.image}
        />
      ))}
    </group>
  );
}


// --- THE MAIN SCENE COMPONENT ---
type SceneProps = {
  cubeRefs: MutableRefObject<(Mesh | null)[]>;
  contextSafe?: <T extends (...args: any) => any>(fn: T) => T; // Make it optional
};

export default function Scene({ cubeRefs }: SceneProps) {
  return (
    <Canvas>
      <ambientLight intensity={1.5} />
      <directionalLight position={[0, 0, 5]} intensity={1} />
      <PerspectiveCamera makeDefault position={[0, 0, 10]} fov={30} />

      <Suspense fallback={null}>
        <AnimatedCubes cubeRefs={cubeRefs} />
      </Suspense>
    </Canvas>
  );
}
