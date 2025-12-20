'use client';

import { Suspense, useRef, type MutableRefObject, useCallback, useLayoutEffect, useState } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { PerspectiveCamera } from '@react-three/drei';
import type { Mesh, Group, Viewport } from 'three';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

import { cubesData } from '@/lib/cube-data';
import HeroCube from './HeroCube';

gsap.registerPlugin(ScrollTrigger);

// --- CONFIGURATION ---
const DESKTOP_W = 1920;
const DESKTOP_H = 1200;
const MOBILE_W = 768; 
const MOBILE_H = 1536;

type AnimatedCubesProps = {
  cubeRefs: MutableRefObject<(Mesh | null)[]>;
};

function AnimatedCubes({ cubeRefs }: AnimatedCubesProps) {
  const { viewport, camera, size } = useThree();
  const [ready, setReady] = useState(false);

  // --- 1. GHOST TRACKER ---
  const getExactPosition = useCallback((id: string) => {
    const el = document.getElementById(id);
    if (!el) return null;

    const rect = el.getBoundingClientRect();
    const domCenterX = rect.left + rect.width / 2;
    const domCenterY = rect.top + rect.height / 2;

    const camZ = camera.position.z;
    const vFOV = (camera as any).fov * Math.PI / 180;
    const visibleHeight = 2 * Math.tan(vFOV / 2) * camZ;
    const visibleWidth = visibleHeight * (size.width / size.height);

    const threeX = (domCenterX / size.width) * visibleWidth - visibleWidth / 2;
    const threeY = -(domCenterY / size.height) * visibleHeight + visibleHeight / 2;
    const pixelToThreeRatio = visibleHeight / size.height;
    const threeScale = 36 * pixelToThreeRatio;

    return { x: threeX, y: threeY, scale: threeScale };
  }, [camera, size]);


  // --- 2. MAIN ANIMATION LOOP ---
  const animate = useCallback(() => {
    if (!cubeRefs.current.length) return;

    // Check for Mobile
    const isMobile = size.width < 1000; 

    ScrollTrigger.getAll().forEach(t => t.kill());

    // UI Fade
    gsap.timeline({
      scrollTrigger: { 
        trigger: '.scroller', 
        start: 'top top', 
        end: '25% top', 
        scrub: true 
      },
    }).to('.logo-fade', { opacity: 0, ease: "power1.out" });

    gsap.timeline({
        scrollTrigger: { 
            trigger: '.scroller', 
            start: 'top top', 
            end: '30% top', 
            scrub: true 
        },
    }).to('.hero-text', { opacity: 0, filter: 'blur(10px)' });
    
    gsap.timeline({
      scrollTrigger: { 
        trigger: '#target-section', 
        start: 'top center', 
        end: 'center center',
        scrub: true 
      },
    }).to('.center-text', { opacity: 1, filter: 'blur(0px)' });


    // CUBE TIMELINE
    const tl = gsap.timeline({
      scrollTrigger: { 
        trigger: '.scroller', 
        start: 'top top', 
        endTrigger: '#target-section', 
        end: 'center center',
        scrub: 1 
      },
    });

    cubesData.forEach((cube, index) => {
      const cubeRef = cubeRefs.current[index];
      if (!cubeRef) return;

      const domPos = getExactPosition(`cube-start-${cube.id}`);
      if (!domPos) return; 

      const { x: startX, y: startY, scale: startScale } = domPos;
      
      // Determine End Data
      const targetData = isMobile ? cube.endMobile : cube.end;
      
      // --- LOGIC: SHOULD THIS CUBE BE HIDDEN? ---
      // If Mobile AND it's Cube 3 or 4, keep it hidden.
      const shouldHide = isMobile && (cube.id === 3 || cube.id === 4);

      let endX, endY, endW;

      if (isMobile) {
         endX = (targetData.x / MOBILE_W) * viewport.width;
         endY = -(targetData.y / MOBILE_H) * viewport.height;
         endW = (targetData.w / MOBILE_W) * viewport.width;
      } else {
         const relX = targetData.x - (DESKTOP_W / 2);
         const relY = targetData.y - (DESKTOP_H / 2);
         endX = (relX / DESKTOP_W) * viewport.width;
         endY = -(relY / DESKTOP_H) * viewport.height;
         endW = (targetData.w / DESKTOP_W) * viewport.width;
      }

      const endRot = (targetData.rotation * Math.PI) / 180;
      const startRotZ = (cube.startOffset.rotationZ * Math.PI) / 180;

      // INIT
      gsap.set(cubeRef.position, { x: startX, y: startY, z: 0 });
      gsap.set(cubeRef.scale, { x: startScale, y: startScale, z: startScale });
      gsap.set(cubeRef.rotation, { x: 0, y: Math.PI, z: startRotZ });
      
      // RESET OPACITY to 0
      if (Array.isArray(cubeRef.material)) {
        cubeRef.material.forEach(m => m.opacity = 0);
      }

      // --- ANIMATION ---
      
      // 1. FADE IN (Only if NOT hidden)
      if (!shouldHide) {
          tl.to(cubeRef.material, { 
              opacity: 1, 
              duration: 0.05, 
              ease: "power1.in" 
          }, 0);
      }
      // If shouldHide is true, we do nothing, so Opacity stays 0.

      // 2. EXPLODE 
      tl.to(cubeRef.position, { z: 4, duration: 0.4, ease: "power2.inOut" }, 0)
        .to(cubeRef.rotation, { x: Math.random()*6, y: Math.random()*6, z: Math.random()*6, duration: 0.4 }, 0);

      // 3. LAND
      tl.to(cubeRef.position, { x: endX, y: endY, z: 0, duration: 0.6, ease: "power2.out" }, 0.4)
        .to(cubeRef.scale, { x: endW, y: endW, z: endW, duration: 0.6 }, 0.4)
        .to(cubeRef.rotation, { x: 0, y: 0, z: endRot, duration: 0.6 }, 0.4);
    });

    ScrollTrigger.refresh();

  }, [cubeRefs, viewport, getExactPosition, size.width]); 


  useLayoutEffect(() => {
    const timer = setTimeout(() => { animate(); setReady(true); }, 200);
    return () => clearTimeout(timer);
  }, [animate, size.width, size.height]); 


  return (
    <group> 
      {cubesData.map((cube, i) => (
        <HeroCube key={cube.id} ref={(el) => (cubeRefs.current[i] = el)} image={cube.image} />
      ))}
    </group>
  );
}

export default function Scene({ cubeRefs }: { cubeRefs: MutableRefObject<(Mesh | null)[]> }) {
  return (
    <Canvas>
      <ambientLight intensity={3} /> 
      <directionalLight position={[0, 0, 5]} intensity={1} />
      <PerspectiveCamera makeDefault position={[0, 0, 20]} fov={30} />
      <Suspense fallback={null}>
        <AnimatedCubes cubeRefs={cubeRefs} /> 
      </Suspense>
    </Canvas>
  );
}