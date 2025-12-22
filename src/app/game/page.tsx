'use client';

import React, { useEffect, useRef, useMemo, useState, Suspense } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Physics, useBox } from '@react-three/cannon';
import { Text3D, Center, Loader, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

// --- 1. HITTABLE LETTER (Inside a Thick Invisible Box) ---
function HittableLetter({ char, position }: { char: string, position: [number, number, number] }) {
  const [ref] = useBox(() => ({
    mass: 5, // Enough mass to feel satisfying to hit
    position,
    // HITBOX SIZE: 1.5 wide, 2 high, AND 3 METERS THICK (Z)
    // Impossible to tunnel through a 3-meter block.
    args: [1.5, 2, 3], 
    material: { friction: 0.3, restitution: 0.2 },
    allowSleep: false
  }));

  const visualRef = useRef<THREE.Group>(null);
  const fontUrl = 'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/fonts/helvetiker_regular.typeface.json';

  useFrame(() => {
    if (!visualRef.current || !ref.current) return;
    if (!isNaN(ref.current.position.x)) {
      visualRef.current.position.copy(ref.current.position);
      visualRef.current.quaternion.copy(ref.current.quaternion);
    }
  });

  return (
    <>
      {/* PHYSICS BODY (Invisible Thick Box) */}
      <mesh ref={ref as any} visible={false}>
        <boxGeometry args={[1.5, 2, 3]} />
      </mesh>

      {/* VISUALS */}
      <group ref={visualRef}>
         {/* Optional: Faint debug box to see the hit area. Set opacity to 0 to hide completely. */}
         <mesh>
            <boxGeometry args={[1.5, 2, 3]} />
            <meshStandardMaterial color="white" transparent opacity={0} depthWrite={false} />
         </mesh>

         {/* The Text is centered inside the thick box */}
         <Center>
            <Text3D font={fontUrl} size={1.2} height={0.5} curveSegments={4} bevelEnabled bevelThickness={0.02} bevelSize={0.02}>
                {char}
                <meshStandardMaterial color="#fbbf24" />
            </Text3D>
        </Center>
      </group>
    </>
  );
}

// --- 2. CONTROLS ---
function useControls() {
  const input = useRef({ forward: false, backward: false, left: false, right: false, brake: false });
  useEffect(() => {
    const handleKey = (e: KeyboardEvent, isDown: boolean) => {
      switch (e.code) {
        case 'ArrowUp': case 'KeyW': input.current.forward = isDown; break;
        case 'ArrowDown': case 'KeyS': input.current.backward = isDown; break;
        case 'ArrowLeft': case 'KeyA': input.current.left = isDown; break;
        case 'ArrowRight': case 'KeyD': input.current.right = isDown; break;
        case 'Space': input.current.brake = isDown; break;
      }
    };
    const down = (e: KeyboardEvent) => handleKey(e, true);
    const up = (e: KeyboardEvent) => handleKey(e, false);
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up); };
  }, []);
  return input;
}

// --- 3. CAR (PROPORTIONAL SPEED CONTROL) ---
function Car({ orbitRef }: { orbitRef: any }) {
  const controls = useControls();
  const frames = useRef(0); 

  const [ref, api] = useBox(() => ({
    mass: 50, 
    position: [0, 2, 0], 
    args: [1.2, 0.5, 2.2], 
    // DAMPING 0.1: This allows the "Gliding" stop you asked for.
    linearDamping: 0.1, 
    angularDamping: 0.5, 
    angularFactor: [0, 1, 0], 
    allowSleep: false,
  }));
  
  // Track current velocity
  const velocity = useRef([0, 0, 0]);
  const position = useRef([0, 0, 0]);
  const quaternion = useRef([0, 0, 0, 1]); 

  useEffect(() => {
    const unsubV = api.velocity.subscribe((v) => (velocity.current = v));
    const unsubP = api.position.subscribe((p) => (position.current = p));
    const unsubQ = api.quaternion.subscribe((q) => (quaternion.current = q));
    return () => { unsubV(); unsubP(); unsubQ(); };
  }, [api]);

  const wheelsRef = useRef<THREE.Group>(null);
  const vec_current_vel = useMemo(() => new THREE.Vector3(), []); 
  const quat = useMemo(() => new THREE.Quaternion(), []); 

  useFrame((state) => {
    if (frames.current < 20) { frames.current++; return; } 
    if (isNaN(position.current[0])) { api.position.set(0, 2, 0); api.velocity.set(0,0,0); return; }

    // 1. INPUTS
    const { forward, backward, left, right } = controls.current;

    // 2. STEERING (Direct control remains best for steering)
    const turnSpeed = 3.5;
    let steer = 0;
    if (left) steer = turnSpeed;
    if (right) steer = -turnSpeed;
    api.angularVelocity.set(0, steer, 0);

    // 3. DRIVE LOGIC (The "Smart Force" Method)
    // We calculate how fast we WANT to go vs how fast we ARE going.
    
    // Get forward direction
    quat.set(quaternion.current[0], quaternion.current[1], quaternion.current[2], quaternion.current[3]);
    quat.normalize();
    const forwardDir = new THREE.Vector3(0, 0, 1).applyQuaternion(quat);

    // Get current speed along the forward direction
    vec_current_vel.set(velocity.current[0], velocity.current[1], velocity.current[2]);
    const currentForwardSpeed = vec_current_vel.dot(forwardDir);

    // Define Target Speed
    const maxSpeed = 30;
    let targetSpeed = 0;
    if (forward) targetSpeed = -maxSpeed; // -Z is forward
    else if (backward) targetSpeed = maxSpeed;

    // Calculate needed push
    // If we are at 0 and want 30, difference is 30.
    // If we are at 30 and want 30, difference is 0.
    const speedDiff = targetSpeed - currentForwardSpeed;

    // Apply Force proportional to difference
    // Multiplier (200) determines acceleration "snappiness"
    if (forward || backward) {
        // Accelerating
        api.applyForce(
            [forwardDir.x * speedDiff * 200, 0, forwardDir.z * speedDiff * 200], 
            [0, 0, 0]
        );
    } 
    // Note: We do NOT apply force when keys are up. 
    // We let 'linearDamping: 0.1' handle the gliding stop.

    // 4. CAMERA
    if (orbitRef.current) {
        orbitRef.current.target.set(position.current[0], position.current[1], position.current[2]);
        orbitRef.current.update();
    }

    // 5. VISUALS
    if (wheelsRef.current) {
        const targetRot = left ? 0.6 : (right ? -0.6 : 0);
        wheelsRef.current.rotation.y += (targetRot - wheelsRef.current.rotation.y) * 0.1;
    }
  });

  return (
    <group ref={ref as any}>
      <mesh castShadow><boxGeometry args={[1.2, 0.5, 2.4]} /><meshStandardMaterial color="#ef4444" /></mesh>
      <mesh position={[0, 0.4, -0.3]} castShadow><boxGeometry args={[0.9, 0.45, 1.2]} /><meshStandardMaterial color="#111" /></mesh>
      <group ref={wheelsRef}>
         <mesh position={[-0.7, -0.2, -0.8]} rotation={[0, 0, Math.PI/2]}><cylinderGeometry args={[0.35, 0.35, 0.25, 24]} /><meshStandardMaterial color="#111" /></mesh>
         <mesh position={[0.7, -0.2, -0.8]} rotation={[0, 0, Math.PI/2]}><cylinderGeometry args={[0.35, 0.35, 0.25, 24]} /><meshStandardMaterial color="#111" /></mesh>
      </group>
      <mesh position={[-0.7, -0.2, 0.9]} rotation={[0, 0, Math.PI/2]}><cylinderGeometry args={[0.35, 0.35, 0.25, 24]} /><meshStandardMaterial color="#111" /></mesh>
      <mesh position={[0.7, -0.2, 0.9]} rotation={[0, 0, Math.PI/2]}><cylinderGeometry args={[0.35, 0.35, 0.25, 24]} /><meshStandardMaterial color="#111" /></mesh>
    </group>
  );
}

// --- 4. GROUND ---
function Ground() {
  const [ref] = useBox(() => ({ 
    type: 'Static', position: [0, -5, 0], args: [500, 10, 500], material: { friction: 0.1, restitution: 0 } 
  }));
  return (
    <group>
        <mesh ref={ref as any} visible={false}><boxGeometry args={[500, 10, 500]} /></mesh>
        <gridHelper position={[0, 0.05, 0]} args={[500, 50, 0x555555, 0xcccccc]} />
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
            <planeGeometry args={[500, 500]} /><meshStandardMaterial color="#e5e5e5" />
        </mesh>
    </group>
  );
}

// =========================================
// 5. MAIN PAGE
// =========================================
export default function GamePage() {
  const orbitRef = useRef<any>(null);

  return (
    <main className="w-full h-screen bg-gray-200 relative overflow-hidden">
      <Loader />
      
      <div className="absolute top-8 left-8 z-50">
        <Link href="/" className="px-6 py-3 bg-white/90 rounded-full font-bold shadow-lg hover:scale-105 transition-transform flex items-center gap-2 text-black">
          <ArrowLeft size={18} /> Exit
        </Link>
      </div>

      <div className="absolute bottom-8 right-8 z-50 bg-black/80 text-white p-4 rounded-xl font-mono text-xs pointer-events-none">
         <p>WASD to Drive</p>
         <p>Mouse Drag to Rotate Camera</p>
      </div>

      <Canvas shadows camera={{ position: [0, 5, 10], fov: 50 }}>
        <color attach="background" args={['#e5e5e5']} />
        <ambientLight intensity={0.6} />
        <directionalLight position={[50, 100, 50]} intensity={1.5} castShadow />
        <OrbitControls ref={orbitRef} maxPolarAngle={Math.PI / 2.1} />

        {/* 1/120 Step: Precision Physics for Fast Movement */}
        <Physics gravity={[0, -20, 0]} step={1/120}>
          <Car orbitRef={orbitRef} />
          <Suspense fallback={null}>
            {/* Letters are now SUPER THICK (3m) */}
            <HittableLetter char="J" position={[-3, 1, -10]} />
            <HittableLetter char="O" position={[-1, 1, -10]} />
            <HittableLetter char="E" position={[1, 1, -10]} />
            <HittableLetter char="L" position={[3, 1, -10]} />
          </Suspense>
          <Ground />
        </Physics>
      </Canvas>
    </main>
  );
}