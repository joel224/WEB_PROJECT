'use client';

import React, { useLayoutEffect, useRef, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Text3D, Center, OrbitControls } from '@react-three/drei';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import * as THREE from 'three';

gsap.registerPlugin(ScrollTrigger);

const phrases = [
  'Innovation',
  'Meets Precision',
  'Crafted For',
  'The Digital',
  'Generation',
];

// A single 3D text phrase component
function Phrase({ text, ...props }: { text: string;[key: string]: any }) {
  const material = new THREE.MeshStandardMaterial({
    color: '#FFE9D9',
    roughness: 0.2,
    metalness: 0.8,
  });

  return (
    <group {...props}>
      <Center>
        <Text3D
          font="/fonts/Playfair Display_Bold.json"
          size={1}
          height={0.1}
          curveSegments={12}
          bevelEnabled
          bevelThickness={0.02}
          bevelSize={0.02}
          bevelOffset={0}
          bevelSegments={5}
          material={material}
        >
          {text}
        </Text3D>
      </Center>
    </group>
  );
}

// The main animation component
function AnimationCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const phraseRefs = useRef<(THREE.Group | null)[]>([]);

  useLayoutEffect(() => {
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top top',
          end: `+=${phrases.length * 120}%`,
          scrub: 1.5,
          pin: true,
        },
      });

      // Initial state for all phrases
      phraseRefs.current.forEach((ref) => {
        if (ref) {
          gsap.set(ref.scale, { x: 0, y: 0, z: 0 });
          gsap.set(ref.rotation, { x: Math.PI / 2, y: 0, z: 0 });
          gsap.set(ref.position, { z: 5 });
        }
      });

      // Animate each phrase
      phrases.forEach((_, i) => {
        const phrase = phraseRefs.current[i];
        if (!phrase) return;

        // Enter
        tl.to(phrase.scale, {
          x: 1, y: 1, z: 1,
          duration: 1,
          ease: 'power3.out',
        })
        .to(phrase.rotation, {
          x: 0,
          duration: 1,
          ease: 'power3.out',
        }, '<')
        .to(phrase.position, {
          z: 0,
          duration: 1,
          ease: 'power3.out',
        }, '<');

        // Hold (and slight rotation for dynamism)
        tl.to(phrase.rotation, {
            y: `+=${Math.PI * 0.1}`,
            duration: 1,
            ease: 'none',
        });

        // Exit (except last one)
        if (i < phrases.length - 1) {
          tl.to(phrase.scale, {
            x: 0, y: 0, z: 0,
            duration: 0.8,
            ease: 'power3.in',
          })
          .to(phrase.position, {
              z: -8,
              duration: 0.8,
              ease: 'power3.in',
          }, '<');
        }
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="w-full h-screen">
      <Canvas camera={{ position: [0, 0, 8], fov: 45 }}>
        <Suspense fallback={null}>
          <ambientLight intensity={1.5} color="#FFE9D9" />
          <directionalLight position={[5, 5, 10]} intensity={2} />
          
          {phrases.map((text, i) => (
            <Phrase
              key={text}
              text={text}
              ref={(el) => {
                if (el) phraseRefs.current[i] = el;
              }}
            />
          ))}
        </Suspense>
        {/* <OrbitControls /> */}
      </Canvas>
    </div>
  );
}


export default function KineticSection() {
    return (
        <section className="h-screen w-full relative bg-[#2B1C13] z-30">
            <AnimationCanvas />
        </section>
    )
}
