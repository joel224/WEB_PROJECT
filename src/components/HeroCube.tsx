'use client';
import { useTexture } from '@react-three/drei';
import type { Mesh } from 'three';
import { forwardRef } from 'react';
import * as THREE from 'three';

type HeroCubeProps = {
  image: string;
};

const HeroCube = forwardRef<Mesh, HeroCubeProps>(({ image }, ref) => {
  const texture = useTexture(image);
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;

  return (
    <mesh ref={ref}>
      <boxGeometry args={[1, 1, 1]} />
      {[...Array(6)].map((_, i) => (
        <meshStandardMaterial
          key={i}
          attach={`material-${i}`}
          map={texture}
          color="white"
          roughness={0.2}
          metalness={0.1}
          transparent={true} // REQUIRED for fade-in
          opacity={0}        // Start invisible
        />
      ))}
    </mesh>
  );
});

HeroCube.displayName = 'HeroCube';
export default HeroCube;