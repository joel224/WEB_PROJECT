'use client';

import { Canvas, useThree } from '@react-three/fiber';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useRef, type RefObject, MutableRefObject } from 'react';
import type { Group, Mesh } from 'three';
import { Perf } from 'r3f-perf';

import { cubesData, type CubeData } from '@/lib/cube-data';
import HeroCube from './HeroCube';

gsap.registerPlugin(ScrollTrigger);

const DESIGN_WIDTH = 1920;
const DESIGN_HEIGHT = 1200;

type AnimatedCubesProps = {
  cubeRefs: MutableRefObject<(Mesh | null)[]>;
  contextSafe: (fn: Function) => Function;
};

function usePixelToThree(x: number, y: number) {
  const { viewport } = useThree();
  const threeX = (x / DESIGN_WIDTH) * viewport.width - viewport.width / 2;
  const threeY = -((y / DESIGN_HEIGHT) * viewport.height - viewport.height / 2);
  return { x: threeX, y: threeY };
}

function calculateScale(pixelWidth: number) {
  const { viewport } = useThree();
  return (pixelWidth / DESIGN_WIDTH) * viewport.width;
}

const AnimatedCubes = ({ cubeRefs, contextSafe }: AnimatedCubesProps) => {
  const { viewport } = useThree();

  const animate = contextSafe(() => {
    if (!cubeRefs.current.length) return;

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

      const startPos = usePixelToThree(cube.start.x, cube.start.y);
      const startScale = calculateScale(cube.start.w);
      const startRotationRad = (cube.start.rotation * Math.PI) / 180;

      const endPos = usePixelToThree(cube.end.x, cube.end.y);
      const endScale = calculateScale(cube.end.w);
      const endRotationRad = (cube.end.rotation * Math.PI) / 180;

      // Set initial state
      gsap.set(cubeRef.position, { ...startPos, z: 0 });
      gsap.set(cubeRef.scale, { x: startScale, y: startScale, z: startScale });
      gsap.set(cubeRef.rotation, { x: 0, y: 0, z: startRotationRad });

      // Animation Timeline
      // 0% - 20%: Explode outwards (Z-axis) and tumble
      tl.to(
        cubeRef.position,
        {
          z: viewport.width * 0.3, // Explode towards camera
          duration: 0.2,
        },
        0
      ).to(
        cubeRef.rotation,
        {
          x: Math.random() * Math.PI * 2,
          y: Math.random() * Math.PI * 2,
          z: Math.random() * Math.PI * 2,
          duration: 0.2,
        },
        0
      );

      // 20% - 100%: Settle into grid position
      tl.to(
        cubeRef.position,
        {
          ...endPos,
          z: 0,
          duration: 0.8,
        },
        0.2
      )
        .to(
          cubeRef.scale,
          {
            x: endScale,
            y: endScale,
            z: endScale,
            duration: 0.8,
          },
          0.2
        )
        .to(
          cubeRef.rotation,
          {
            x: 0,
            y: 0,
            z: endRotationRad,
            duration: 0.8,
          },
          0.2
        );
    });
  });

  useGSAP(() => {
    // We call the animation function once the viewport is ready
    animate();
  }, { dependencies: [viewport, animate] });

  return (
    <>
      {cubesData.map((cube, i) => (
        <HeroCube
          key={cube.id}
          image={cube.image}
          ref={(el) => {
            cubeRefs.current[i] = el;
          }}
        />
      ))}
    </>
  );
};

type SceneProps = {
    cubeRefs: MutableRefObject<(Mesh | null)[]>;
    contextSafe: (fn: Function) => Function;
}

export default function Scene({ cubeRefs, contextSafe }: SceneProps) {
  return (
    <Canvas
      camera={{ position: [0, 0, 5], fov: 75 }}
      style={{ width: '100vw', height: '100vh' }}
    >
      <ambientLight intensity={2} />
      <directionalLight position={[5, 5, 5]} intensity={1} />
      <AnimatedCubes cubeRefs={cubeRefs} contextSafe={contextSafe} />
      {/* <Perf position="top-left" /> */}
    </Canvas>
  );
}
