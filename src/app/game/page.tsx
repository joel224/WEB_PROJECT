'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Physics, useBox, usePlane } from '@react-three/cannon';
import { Vector3 } from 'three';

// --- 1. CONTROLS HOOK ---
function usePlayerControls() {
  const [movement, setMovement] = useState({
    forward: false,
    backward: false,
    left: false,
    right: false,
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.code) {
        case 'ArrowUp': case 'KeyW': setMovement(m => ({ ...m, forward: true })); break;
        case 'ArrowDown': case 'KeyS': setMovement(m => ({ ...m, backward: true })); break;
        case 'ArrowLeft': case 'KeyA': setMovement(m => ({ ...m, left: true })); break;
        case 'ArrowRight': case 'KeyD': setMovement(m => ({ ...m, right: true })); break;
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      switch (e.code) {
        case 'ArrowUp': case 'KeyW': setMovement(m => ({ ...m, forward: false })); break;
        case 'ArrowDown': case 'KeyS': setMovement(m => ({ ...m, backward: false })); break;
        case 'ArrowLeft': case 'KeyA': setMovement(m => ({ ...m, left: false })); break;
        case 'ArrowRight': case 'KeyD': setMovement(m => ({ ...m, right: false })); break;
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    };
  }, []);
  return movement;
}

// --- 2. VISUAL WHEEL COMPONENT ---
function Wheel({ position, isFront = false, steeringAngle = 0, speed = 0 }: any) {
  const ref = useRef<any>(null);
  
  useFrame(() => {
    if (!ref.current) return;
    ref.current.rotation.x -= speed * 0.15;
    if (isFront) {
      ref.current.rotation.y = steeringAngle;
    }
  });

  return (
    <group position={position}>
      <mesh ref={ref} rotation={[0, 0, Math.PI / 2]}> 
        <cylinderGeometry args={[0.35, 0.35, 0.25, 24]} />
        <meshStandardMaterial color="#222" />
        <mesh position={[0, 0, 0.125]}>
            <boxGeometry args={[0.7, 0.1, 0.05]} />
            <meshStandardMaterial color="#555" />
        </mesh>
      </mesh>
    </group>
  );
}

// --- 3. THE CAR LOGIC ---
function Car() {
  const { forward, backward, left, right } = usePlayerControls();
  
  const [ref, api] = useBox(() => ({ 
    mass: 150,
    position: [0, 2, 0], 
    args: [1.2, 0.5, 2.4], 
    angularDamping: 0.8,
    allowSleep: false,
  }), useRef<any>(null));

  const velocity = useRef([0, 0, 0]);
  const rotation = useRef([0, 0, 0]);
  useEffect(() => api.velocity.subscribe((v) => (velocity.current = v)), [api.velocity]);
  useEffect(() => api.rotation.subscribe((r) => (rotation.current = r)), [api.rotation]);

  const [steeringAngle, setSteeringAngle] = useState(0);
  const [speed, setSpeed] = useState(0);

  useFrame(() => {
    const currentSpeed = Math.sqrt(velocity.current[0]**2 + velocity.current[2]**2);
    setSpeed(currentSpeed);
    
    const maxSteer = 0.5;
    let targetSteer = 0;
    if (left) targetSteer = maxSteer;
    if (right) targetSteer = -maxSteer;
    setSteeringAngle(prev => prev + (targetSteer - prev) * 0.15);

    const acceleration = 15;
    const reverseSpeed = 8;
    const maxSpeed = 30;
    const turnStrength = 60;
    
    const forwardVector = new Vector3(0, 0, -1);
    forwardVector.applyEuler(new THREE.Euler(0, rotation.current[1], 0));
    
    if (forward && currentSpeed < maxSpeed) {
      api.applyImpulse(
        [forwardVector.x * acceleration, 0, forwardVector.z * acceleration],
        [0, 0, 0]
      );
    }
    
    if (backward) {
      api.applyImpulse(
        [forwardVector.x * -reverseSpeed, 0, forwardVector.z * -reverseSpeed],
        [0, 0, 0]
      );
    }

    if (currentSpeed > 0.5) {
      const turnDirection = backward ? -1 : 1;
      if (left) api.applyTorque([0, turnStrength * turnDirection, 0]);
      if (right) api.applyTorque([0, -turnStrength * turnDirection, 0]);
    }
  });

  return (
    <group ref={ref as any}>
      {/* Body */}
      <mesh position={[0, 0, 0]} castShadow>
        <boxGeometry args={[1.2, 0.5, 2.4]} />
        <meshStandardMaterial color="#ef4444" /> {/* Red Sports Car */}
      </mesh>
      {/* Cabin */}
      <mesh position={[0, 0.45, -0.3]} castShadow>
         <boxGeometry args={[0.9, 0.45, 1.2]} />
         <meshStandardMaterial color="#333" /> 
      </mesh>
      {/* Headlights */}
      <mesh position={[-0.4, 0, -1.21]}>
         <boxGeometry args={[0.3, 0.1, 0.1]} />
         <meshStandardMaterial color="#ffff00" emissive="#ffff00" emissiveIntensity={2} /> 
      </mesh>
      <mesh position={[0.4, 0, -1.21]}>
         <boxGeometry args={[0.3, 0.1, 0.1]} />
         <meshStandardMaterial color="#ffff00" emissive="#ffff00" emissiveIntensity={2} /> 
      </mesh>

      {/* Wheels */}
      <Wheel position={[-0.7, -0.2, -0.8]} isFront={true} steeringAngle={steeringAngle} speed={speed} />
      <Wheel position={[0.7, -0.2, -0.8]} isFront={true} steeringAngle={steeringAngle} speed={speed} />
      <Wheel position={[-0.7, -0.2, 0.9]} speed={speed} />
      <Wheel position={[0.7, -0.2, 0.9]} speed={speed} />
    </group>
  );
}

// --- 4. TARGET BOX ---
function TargetBox({ position }: { position: [number, number, number] }) {
  const [ref] = useBox(() => ({ 
    mass: 5, 
    position, 
    args: [2, 2, 2] 
  }));

  return (
    <mesh ref={ref as any} castShadow>
      <boxGeometry args={[2, 2, 2]} />
      <meshStandardMaterial color="#3b82f6" />
    </mesh>
  );
}

// --- 5. GROUND ---
function Ground() {
  const [ref] = usePlane(() => ({ 
    rotation: [-Math.PI / 2, 0, 0], 
    position: [0, 0, 0],
    material: { friction: 0.5 }
  }));

  return (
    <mesh ref={ref as any} receiveShadow>
      <planeGeometry args={[100, 100]} />
      <meshStandardMaterial color="#e5e5e5" />
      <gridHelper args={[100, 20, 0x999999, 0xcccccc]} />
    </mesh>
  );
}

// --- 6. MAIN PAGE ---
export default function GamePage() {
  return (
    <main className="w-full h-screen bg-white relative overflow-hidden">
      
      {/* UI OVERLAY */}
      <div className="absolute top-0 left-0 p-8 z-10 pointer-events-none">
        <Link href="/" className="pointer-events-auto">
          <motion.div
            className="inline-flex items-center gap-2 text-black border border-black/10 bg-white/50 backdrop-blur-md rounded-full py-3 px-6 hover:bg-black/5 transition-colors duration-300 shadow-sm"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <ArrowLeft size={18} />
            Back
          </motion.div>
        </Link>
        <div className="mt-4 p-4 bg-white/80 backdrop-blur rounded-xl text-black/70 font-mono text-sm border border-black/5 inline-block shadow-sm">
            <p className="font-bold mb-1">CONTROLS</p>
            <p>↑ W : Gas</p>
            <p>↓ S : Reverse</p>
            <p>← → : Steer</p>
        </div>
      </div>

      <Canvas shadows camera={{ position: [0, 15, 25], fov: 45 }}>
        <color attach="background" args={['#f0f0f0']} />
        
        <ambientLight intensity={0.7} />
        <directionalLight 
            position={[50, 50, 25]} 
            intensity={1.2} 
            castShadow 
            shadow-mapSize={[2048, 2048]}
        />

        <Physics gravity={[0, -20, 0]}>
          <Car />
          <TargetBox position={[0, 1, -10]} />
          <TargetBox position={[6, 1, -15]} />
          <TargetBox position={[-6, 1, -15]} />
          <Ground />
        </Physics>
      </Canvas>
    </main>
  );
}
