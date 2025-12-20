'use client';
import { useTexture } from '@react-three/drei';
import type { Mesh } from 'three';
import { forwardRef } from 'react';

type HeroCubeProps = {
  image: string;
};

const HeroCube = forwardRef<Mesh, HeroCubeProps>(({ image }, ref) => {
  // If the image path is wrong, this will suspend indefinitely without Suspense
  const texture = useTexture(image); 
  const solidColor = '#FFE9D9';

  return (
    <mesh ref={ref}>
      <boxGeometry args={[1, 1, 1]} />
      {/* Material Index Mapping:
        0: Right (px)
        1: Left (nx)
        2: Top (py)
        3: Bottom (ny)
        4: Front (pz) - Your texture is here
        5: Back (nz)
      */}
      {[...Array(6)].map((_, i) => (
        <meshStandardMaterial
          key={i}
          attach={`material-${i}`}
          map={i === 4 ? texture : null} 
          color={i === 4 ? 'white' : solidColor}
          roughness={0.2} // Make it slightly shiny
          metalness={0.1}
        />
      ))}
    </mesh>
  );
});

HeroCube.displayName = 'HeroCube';
export default HeroCube;