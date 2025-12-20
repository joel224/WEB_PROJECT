'use client';

import { Suspense, useRef, type MutableRefObject, useCallback, useLayoutEffect, useState } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { PerspectiveCamera } from '@react-three/drei';
import type { Group, Mesh } from 'three';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

import { cubesData } from '@/lib/cube-data';
import HeroCube from './HeroCube';

gsap.registerPlugin(ScrollTrigger);

const DESKTOP_W = 1920;
const DESKTOP_H = 1200;
const MOBILE_W = 768; 
const MOBILE_H = 1536;

type AnimatedCubesProps = {
  groupRefs: MutableRefObject<(Group | null)[]>;
};

function AnimatedCubes({ groupRefs }: AnimatedCubesProps) {
  // We need a ref for the Container Group to move the whole scene up later
  const mainGroupRef = useRef<Group>(null);
  const { viewport, camera, size } = useThree();
  const [ready, setReady] = useState(false);

  // --- 1. HELPER: MATH FOR PIXEL-PERFECT ALIGNMENT ---
  const getMatchRatio = useCallback(() => {
    const camZ = camera.position.z;
    const vFOV = (camera as any).fov * Math.PI / 180;
    const visibleHeight = 2 * Math.tan(vFOV / 2) * camZ;
    // Ratio: How many 3D units = 1 Screen Pixel
    return visibleHeight / size.height;
  }, [camera, size.height]);

  const getExactPosition = useCallback((id: string) => {
    const el = document.getElementById(id);
    if (!el) return null;

    const rect = el.getBoundingClientRect();
    const domCenterX = rect.left + rect.width / 2;
    const domCenterY = rect.top + rect.height / 2;

    // Recalculate view params
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


  // --- 2. ANIMATION ---
  const animate = useCallback(() => {
    if (!groupRefs.current.length) return;
    const isMobile = size.width < 1000; 
    const ratio = getMatchRatio(); // Get the 3D-to-Pixel ratio

    ScrollTrigger.getAll().forEach(t => t.kill());

    // --- TIMELINE 1: UI FADE ---
    gsap.timeline({
      scrollTrigger: { trigger: '.scroller', start: 'top top', end: '25% top', scrub: true },
    }).to('.logo-fade', { opacity: 0, ease: "power1.out" });

    gsap.timeline({
        scrollTrigger: { trigger: '.scroller', start: 'top top', end: '30% top', scrub: true },
    }).to('.hero-text', { opacity: 0, filter: 'blur(10px)' });
    
    gsap.timeline({
      scrollTrigger: { trigger: '#target-section', start: 'top center', end: 'center center', scrub: true },
    }).to('.center-text', { opacity: 1, filter: 'blur(0px)' });


    // --- TIMELINE 2: CUBE FORMATION (Logo -> Ring) ---
    // Finishes exactly when #target-section is centered.
    const tl = gsap.timeline({
      scrollTrigger: { 
        trigger: '.scroller', 
        start: 'top top', 
        endTrigger: '#target-section', 
        end: 'center center',
        scrub: 1 
      },
    });

    // --- TIMELINE 3: EXIT SYNC (Ring -> Scroll Off) ---
    // Starts exactly when TL 2 ends. It moves the 3D group UP with the HTML scroll.
    // Result: Cubes stick to the Page 2 text.
    if (mainGroupRef.current) {
        // Calculate how much 3D distance corresponds to scrolling the section off-screen
        // If we scroll 1 viewport height, we move 1 visibleHeight in 3D.
        const vFOV = (camera as any).fov * Math.PI / 180;
        const visibleHeight = 2 * Math.tan(vFOV / 2) * camera.position.z;
        
        gsap.timeline({
            scrollTrigger: {
                trigger: '#target-section',
                start: 'center center', // Start where the previous animation ended
                end: 'bottom top',      // End when the section leaves the top of screen
                scrub: true,            // Lock to scrollbar (no smoothing delay for stickiness)
            }
        }).to(mainGroupRef.current.position, {
            y: visibleHeight, // Move UP by one full screen height
            ease: "none"      // Linear movement to match scroll exactly
        });
    }


    cubesData.forEach((cube, index) => {
      const group = groupRefs.current[index];
      if (!group) return;

      const domPos = getExactPosition(`cube-start-${cube.id}`);
      if (!domPos) return; 

      const { x: startX, y: startY, scale: startScale } = domPos;
      
      const targetData = isMobile ? cube.endMobile : cube.end;
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

      // Init
      gsap.set(group.position, { x: startX, y: startY, z: 0 });
      gsap.set(group.scale, { x: startScale, y: startScale, z: startScale });
      gsap.set(group.rotation, { x: 0, y: Math.PI, z: startRotZ });
      
      const mesh = group.children[0] as Mesh;
      if (mesh && Array.isArray(mesh.material)) {
        mesh.material.forEach(m => (m as any).opacity = 0);
      }

      // Animate
      if (!shouldHide && mesh) {
          tl.to(mesh.material, { opacity: 1, duration: 0.05, ease: "power1.in" }, 0);
      }
      tl.to(group.position, { z: 4, duration: 0.4, ease: "power2.inOut" }, 0)
        .to(group.rotation, { x: Math.random()*6, y: Math.random()*6, z: Math.random()*6, duration: 0.4 }, 0);
      tl.to(group.position, { x: endX, y: endY, z: 0, duration: 0.6, ease: "power2.out" }, 0.4)
        .to(group.scale, { x: endW, y: endW, z: endW, duration: 0.6 }, 0.4)
        .to(group.rotation, { x: 0, y: 0, z: endRot, duration: 0.6 }, 0.4);
    });

    ScrollTrigger.refresh();

  }, [groupRefs, viewport, getExactPosition, size.width, getMatchRatio, camera]); 


  useLayoutEffect(() => {
    const timer = setTimeout(() => { animate(); setReady(true); }, 200);
    return () => clearTimeout(timer);
  }, [animate, size.width, size.height]); 


  return (
    // WRAP EVERYTHING IN A MAIN GROUP TO MOVE IT UP LATER
    <group ref={mainGroupRef}> 
      {cubesData.map((cube, i) => (
        <group key={cube.id} ref={(el) => (groupRefs.current[i] = el)}>
            <HeroCube image={cube.image} spin={i >= 4} />
        </group>
      ))}
    </group>
  );
}

export default function Scene({ cubeRefs }: { cubeRefs: any }) { 
  const groupRefs = useRef<(Group | null)[]>([]);

  return (
    <Canvas>
      <ambientLight intensity={3} /> 
      <directionalLight position={[0, 0, 5]} intensity={1} />
      <PerspectiveCamera makeDefault position={[0, 0, 20]} fov={30} />
      <Suspense fallback={null}>
        <AnimatedCubes groupRefs={groupRefs} /> 
      </Suspense>
    </Canvas>
  );
}