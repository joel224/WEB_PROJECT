'use client';

import React, { useEffect, useRef, useState, Suspense } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Physics, RigidBody, CuboidCollider, RapierRigidBody } from '@react-three/rapier';
import { Text3D, Center, Loader, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

// --- 1. LETTERS ---
function HittableLetter({ char, position }: { char: string, position: [number, number, number] }) {
  const fontUrl = 'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/fonts/helvetiker_regular.typeface.json';

  return (
    <RigidBody 
      position={position} 
      colliders="cuboid" 
      restitution={0.6} 
      friction={0.5} // Higher friction so they don't slide forever
      mass={1} // Heavier so they feel satisfying to hit
    >
      <Center>
        <Text3D font={fontUrl} size={1.2} height={0.5} curveSegments={4} bevelEnabled bevelThickness={0.02} bevelSize={0.02}>
            {char}
            <meshStandardMaterial color="#fbbf24" />
        </Text3D>
      </Center>
    </RigidBody>
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

// --- 3. CAR (FORCE BASED) ---
function Car({ orbitRef }: { orbitRef: any }) {
  const rigidBody = useRef<RapierRigidBody>(null);
  const controls = useControls();
  const wheelsRef = useRef<THREE.Group>(null);
  
  // Reusable vectors
  const forward = new THREE.Vector3();

  useFrame(() => {
    if (!rigidBody.current) return;

    const { forward: isFwd, backward: isBwd, left, right, brake } = controls.current;
    
    // --- A. DATA SYNC ---
    const rot = rigidBody.current.rotation();
    const pos = rigidBody.current.translation();
    const vel = rigidBody.current.linvel();

    // --- B. RESPAWN ---
    if (pos.y < -10) {
        rigidBody.current.setTranslation({ x: 0, y: 2, z: 0 }, true);
        rigidBody.current.setLinvel({ x: 0, y: 0, z: 0 }, true);
        rigidBody.current.setAngvel({ x: 0, y: 0, z: 0 }, true);
        rigidBody.current.setRotation({ x: 0, y: 0, z: 0, w: 1 }, true);
    }

    // --- C. STEERING ---
    // We stick to direct angular velocity for steering because 
    // force-based steering (Torque) is incredibly hard to control.
    const turnSpeed = 3.5;
    let turn = 0;
    if (left) turn = turnSpeed;
    if (right) turn = -turnSpeed;
    rigidBody.current.setAngvel({ x: 0, y: turn, z: 0 }, true);

    // --- D. ENGINE FORCE ---
    // Calculate Forward Direction
    const quaternion = new THREE.Quaternion(rot.x, rot.y, rot.z, rot.w);
    forward.set(0, 0, 1).applyQuaternion(quaternion);

    // Engine Power (Force)
    // 50kg Car * 60 = 3000 Force for fast acceleration
    const enginePower = 60; 
    let impulseStrength = 0;

    if (isFwd) impulseStrength = -enginePower;
    else if (isBwd) impulseStrength = enginePower;

    // Apply the Impulse (Instant Force for this frame)
    // This pushes the car physically.
    rigidBody.current.applyImpulse({ 
        x: forward.x * impulseStrength, 
        y: 0, // Don't push up/down
        z: forward.z * impulseStrength 
    }, true);

    // --- E. BRAKES / DRAG ---
    // If we are pushing "Space", we increase drag massively to stop.
    // Otherwise, standard drag (1.0) slows us down gradually.
    const currentDrag = brake ? 5.0 : 1.0;
    rigidBody.current.setLinearDamping(currentDrag);

    // --- F. CAMERA ---
    if (orbitRef.current) {
        orbitRef.current.target.set(pos.x, pos.y, pos.z);
        orbitRef.current.update();
    }

    // --- G. VISUALS ---
    if (wheelsRef.current) {
        const targetRot = left ? 0.6 : (right ? -0.6 : 0);
        wheelsRef.current.rotation.y += (targetRot - wheelsRef.current.rotation.y) * 0.1;
    }
  });

  return (
    <RigidBody 
        ref={rigidBody} 
        position={[0, 2, 0]} 
        mass={50} // Heavy car feels grounded
        colliders="cuboid"
        friction={1.5} // High tire friction
        linearDamping={1.0} // Air resistance (Important for Force-based!)
        angularDamping={0.5}
        enabledRotations={[false, true, false]} // Lock Tipping
        ccd={true} // Anti-Tunneling
    >
      <mesh castShadow><boxGeometry args={[1.2, 0.5, 2.4]} /><meshStandardMaterial color="#ef4444" /></mesh>
      <mesh position={[0, 0.4, -0.3]} castShadow><boxGeometry args={[0.9, 0.45, 1.2]} /><meshStandardMaterial color="#111" /></mesh>
      <group ref={wheelsRef}>
         <mesh position={[-0.7, -0.2, -0.8]} rotation={[0, 0, Math.PI/2]}><cylinderGeometry args={[0.35, 0.35, 0.25, 24]} /><meshStandardMaterial color="#111" /></mesh>
         <mesh position={[0.7, -0.2, -0.8]} rotation={[0, 0, Math.PI/2]}><cylinderGeometry args={[0.35, 0.35, 0.25, 24]} /><meshStandardMaterial color="#111" /></mesh>
      </group>
      <mesh position={[-0.7, -0.2, 0.9]} rotation={[0, 0, Math.PI/2]}><cylinderGeometry args={[0.35, 0.35, 0.25, 24]} /><meshStandardMaterial color="#111" /></mesh>
      <mesh position={[0.7, -0.2, 0.9]} rotation={[0, 0, Math.PI/2]}><cylinderGeometry args={[0.35, 0.35, 0.25, 24]} /><meshStandardMaterial color="#111" /></mesh>
    </RigidBody>
  );
}

// --- 4. GROUND ---
function Ground() {
  return (
    <RigidBody type="fixed" position={[0, -0.1, 0]} friction={0.5}>
        <CuboidCollider args={[250, 0.1, 250]} />
        <gridHelper position={[0, 0.15, 0]} args={[500, 50, 0x555555, 0xcccccc]} />
        <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
            <planeGeometry args={[500, 500]} />
            <meshStandardMaterial color="#e5e5e5" />
        </mesh>
    </RigidBody>
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
         <p>SPACE to Brake</p>
         <p>Mouse Drag to Rotate Camera</p>
      </div>

      <Canvas shadows camera={{ position: [0, 5, 10], fov: 50 }}>
        <color attach="background" args={['#e5e5e5']} />
        <ambientLight intensity={0.6} />
        <directionalLight position={[50, 100, 50]} intensity={1.5} castShadow />
        <OrbitControls ref={orbitRef} maxPolarAngle={Math.PI / 2.1} />

        {/* Physics Environment */}
        <Physics gravity={[0, -20, 0]}>
          <Car orbitRef={orbitRef} />
          <Suspense fallback={null}>
            <HittableLetter char="J" position={[-3, 0.5, -8]} />
            <HittableLetter char="O" position={[-1, 0.5, -8]} />
            <HittableLetter char="E" position={[1, 0.5, -8]} />
            <HittableLetter char="L" position={[3, 0.5, -8]} />
          </Suspense>
          <Ground />
        </Physics>
      </Canvas>
    </main>
  );
}