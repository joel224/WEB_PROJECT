'use client';
import { useTexture } from '@react-three/drei';
import type { Mesh } from 'three';
import { forwardRef } from 'react';

type HeroCubeProps = {
  image: string;
};

const HeroCube = forwardRef<Mesh, HeroCubeProps>(({ image }, ref) => {
  const texture = useTexture(image);
  const solidColor = '#FFE9D9';

  return (
    <mesh ref={ref}>
      <boxGeometry args={[1, 1, 1]} />
      {[...Array(6)].map((_, i) => (
        <meshStandardMaterial
          key={i}
          attach={`material-${i}`}
          map={i === 4 ? texture : null} // Front face
          color={i === 4 ? 'white' : solidColor}
        />
      ))}
    </mesh>
  );
});

HeroCube.displayName = 'HeroCube';

export default HeroCube;
