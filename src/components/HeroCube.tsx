'use client';
import { useRef } from 'react';
import { useTexture } from '@react-three/drei';
import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import * as THREE from 'three';

type HeroCubeProps = {
  image: string;
  spin?: boolean;
};

export default function HeroCube({ image, spin = false }: HeroCubeProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const texture = useTexture(image);
  
  // Ensure texture repeats/wraps correctly if needed
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;

  // --- IDLE SPIN ANIMATION ---
  useGSAP(() => {
    if (spin && meshRef.current) {
      gsap.to(meshRef.current.rotation, {
        y: `+=${Math.PI * 2}`, 
        duration: 2,           
        ease: "power2.inOut",
        repeat: -1,            
        repeatDelay: 3,        
        delay: 1,              
      });
    }
  }, [spin]);

  return (
    <mesh ref={meshRef}>
      <boxGeometry args={[1, 1, 1]} />
      {[...Array(6)].map((_, i) => (
        <meshStandardMaterial
          key={i}
          attach={`material-${i}`}
          // FIX: Apply texture to ALL faces, not just 'i === 4'
          map={texture} 
          // FIX: Use 'white' for all faces so the image colors are accurate
          color="white" 
          roughness={0.2}
          metalness={0.1}
          transparent={true}
          opacity={0} // Controlled by Scene.tsx
        />
      ))}
    </mesh>
  );
}