'use client';

import React, { useEffect, useRef, useState, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Physics, RigidBody, CuboidCollider, RapierRigidBody } from '@react-three/rapier';
import { Text3D, Center, Loader, OrbitControls, Environment } from '@react-three/drei';
import * as THREE from 'three';

// --- 1. REUSABLE WHEEL ---
function Wheel({ position, isFront, steerAngle, spinAngle, side }: { position: [number, number, number], isFront: boolean, steerAngle: number, spinAngle: number, side: 'left' | 'right' }) {
  const wheelGroupRef = useRef<THREE.Group>(null);
  const tireMeshRef = useRef<THREE.Group>(null);
  
  useFrame(() => {
      // Steer (Pivoting around Y)
      if (wheelGroupRef.current && isFront) {
          wheelGroupRef.current.rotation.y = steerAngle;
      }
      // Spin (Rotating around X)
      if (tireMeshRef.current) {
          tireMeshRef.current.rotation.x = spinAngle;
      }
  });

  const hubOffset = side === 'left' ? -0.08 : 0.08;

  return (
    <group ref={wheelGroupRef} position={position}>
        <group ref={tireMeshRef}>
            <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
                <cylinderGeometry args={[0.35, 0.35, 0.25, 32]} />
                <meshStandardMaterial color="#1a1a1a" roughness={0.9} />
            </mesh>
            <mesh rotation={[0, 0, Math.PI / 2]} position={[hubOffset, 0, 0]} castShadow>
                <cylinderGeometry args={[0.2, 0.2, 0.1, 16]} />
                <meshStandardMaterial color="#cccccc" metalness={0.6} roughness={0.3} />
            </mesh>
        </group>
    </group>
  );
}

// --- 2. LETTERS ---
function HittableLetter({ char, position }: { char: string, position: [number, number, number] }) {
  const fontUrl = 'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/fonts/helvetiker_regular.typeface.json';

  return (
    <RigidBody 
      position={position} 
      colliders="cuboid" 
      restitution={0.4} 
      friction={0.7} 
      mass={2}
    >
      <Center>
        <Text3D font={fontUrl} size={1.2} height={0.5} curveSegments={4} bevelEnabled bevelThickness={0.02} bevelSize={0.02}>
            {char}
            <meshStandardMaterial color="#fbbf24" roughness={0.1} metalness={0.2} />
        </Text3D>
      </Center>
    </RigidBody>
  );
}

// --- 3. CONTROLS ---
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

// --- 4. THE CAR ---
function Car({ orbitRef }: { orbitRef: any }) {
  const rigidBody = useRef<RapierRigidBody>(null);
  const controls = useControls();
  
  // FIX 1: Stable Material Instance (Solves "undefined reading set")
  // We create the material ONCE. We don't use a Ref to try and catch it later.
  const brakeMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#550000',
    emissive: '#000000',
    emissiveIntensity: 0,
    toneMapped: false
  }), []);

  // FIX 2: Stable Spotlight Targets (Solves "matrixWorld" null error)
  // We create these objects ONCE and keep them forever.
  const [lightTargetL] = useState(() => new THREE.Object3D());
  const [lightTargetR] = useState(() => new THREE.Object3D());

  // Animation states
  const currentSteerAngle = useRef(0);
  const wheelSpinAngle = useRef(0);

  const forward = useMemo(() => new THREE.Vector3(), []);
  const velVec = useMemo(() => new THREE.Vector3(), []);

  useFrame((state, delta) => {
    if (!rigidBody.current) return;

    const { forward: isFwd, backward: isBwd, left, right, brake } = controls.current;
    const pos = rigidBody.current.translation();
    const rot = rigidBody.current.rotation();
    const vel = rigidBody.current.linvel();

    // --- PHYSICS ---
    if (pos.y < -10) {
        rigidBody.current.setTranslation({ x: 0, y: 2, z: 0 }, true);
        rigidBody.current.setLinvel({ x: 0, y: 0, z: 0 }, true);
        rigidBody.current.setAngvel({ x: 0, y: 0, z: 0 }, true);
        rigidBody.current.setRotation({ x: 0, y: 0, z: 0, w: 1 }, true);
    }

    // Steer
    const turnSpeed = 3.0;
    let targetTurn = 0;
    if (left) targetTurn = turnSpeed;
    if (right) targetTurn = -turnSpeed;
    rigidBody.current.setAngvel({ x: 0, y: targetTurn, z: 0 }, true);

    // Drive
    const quaternion = new THREE.Quaternion(rot.x, rot.y, rot.z, rot.w);
    forward.set(0, 0, 1).applyQuaternion(quaternion);
    const enginePower = 70; 
    let impulseStrength = 0;
    if (isFwd) impulseStrength = -enginePower;
    else if (isBwd) impulseStrength = enginePower;
    
    rigidBody.current.applyImpulse({ 
        x: forward.x * impulseStrength, y: 0, z: forward.z * impulseStrength 
    }, true);

    // Brake
    const currentDrag = brake ? 6.0 : 1.0;
    rigidBody.current.setLinearDamping(currentDrag);

    // --- VISUALS ---

    // 1. Camera
    if (orbitRef.current) {
        orbitRef.current.target.set(pos.x, pos.y, pos.z);
        orbitRef.current.update();
    }

    // 2. Steer Visuals
    const maxSteerVis = 0.5; 
    const targetSteerVis = left ? maxSteerVis : (right ? -maxSteerVis : 0);
    currentSteerAngle.current = THREE.MathUtils.lerp(currentSteerAngle.current, targetSteerVis, delta * 10);

    // 3. Wheel Spin
    velVec.set(vel.x, vel.y, vel.z);
    const forwardSpeed = velVec.dot(forward); 
    wheelSpinAngle.current -= forwardSpeed * delta * 2.5; 

    // 4. Brake Lights (Directly manipulating the stable material instance)
    const isOn = brake;
    brakeMaterial.color.set(isOn ? '#ff0000' : '#550000');
    brakeMaterial.emissive.set(isOn ? '#ff0000' : '#000000');
    brakeMaterial.emissiveIntensity = isOn ? 2 : 0;
    
    // 5. Update Headlights Position relative to car
    // We manually update the target positions to stay in front of the car
    // NOTE: In R3F, parenting <primitive> usually handles position, 
    // but manually setting local position ensures stability.
    lightTargetL.position.set(-0.6, -0.5, -10);
    lightTargetR.position.set(0.6, -0.5, -10);
    lightTargetL.updateMatrixWorld();
    lightTargetR.updateMatrixWorld();
  });

  return (
    <RigidBody 
        ref={rigidBody} position={[0, 2, 0]} mass={50} colliders="cuboid" friction={1.5} linearDamping={1.0} angularDamping={0.5} enabledRotations={[false, true, false]} ccd={true}
    >
      {/* HOOD */}
      <mesh castShadow position={[0, 0, -0.5]}>
          <boxGeometry args={[1.2, 0.5, 1.5]} />
          <meshStandardMaterial color="#ef4444" envMapIntensity={1.5} roughness={0.2} metalness={0.5} />
      </mesh>
      
      {/* CABIN */}
      <mesh position={[0, 0.4, 0.5]} castShadow>
        <boxGeometry args={[1.0, 0.45, 1.0]} />
        <meshStandardMaterial color="#111" envMapIntensity={2} roughness={0.1} metalness={0.8} />
      </mesh>

      {/* HEADLIGHTS */}
      <group position={[0, 0.1, -1.25]}>
          {/* Left */}
          <mesh position={[-0.5, 0, 0]}>
              <sphereGeometry args={[0.08, 16, 8]} />
              <meshStandardMaterial color="white" emissive="white" emissiveIntensity={2} toneMapped={false} />
              {/* FIX: Add the stable target object to the scene graph here */}
              <primitive object={lightTargetL} />
              <spotLight castShadow intensity={50} angle={0.6} penumbra={0.2} distance={30} target={lightTargetL} />
          </mesh>
          {/* Right */}
          <mesh position={[0.5, 0, 0]}>
              <sphereGeometry args={[0.08, 16, 8]} />
              <meshStandardMaterial color="white" emissive="white" emissiveIntensity={2} toneMapped={false} />
              <primitive object={lightTargetR} />
              <spotLight castShadow intensity={50} angle={0.6} penumbra={0.2} distance={30} target={lightTargetR} />
          </mesh>
      </group>

      {/* BRAKE LIGHTS */}
      <group position={[0, 0.1, 1.0]}>
          {/* Left Tail - Uses the Shared Material Instance */}
          <mesh position={[-0.45, 0, 0]} material={brakeMaterial}>
              <boxGeometry args={[0.25, 0.15, 0.05]} />
          </mesh>
           {/* Right Tail - Uses the Same Material Instance */}
          <mesh position={[0.45, 0, 0]} material={brakeMaterial}>
              <boxGeometry args={[0.25, 0.15, 0.05]} />
          </mesh>
      </group>

      {/* WHEELS */}
      <Wheel position={[-0.7, -0.2, -0.8]} isFront={true} side="left" steerAngle={currentSteerAngle.current} spinAngle={wheelSpinAngle.current} />
      <Wheel position={[0.7, -0.2, -0.8]} isFront={true} side="right" steerAngle={currentSteerAngle.current} spinAngle={wheelSpinAngle.current} />
      <Wheel position={[-0.7, -0.2, 1.0]} isFront={false} side="left" steerAngle={0} spinAngle={wheelSpinAngle.current} />
      <Wheel position={[0.7, -0.2, 1.0]} isFront={false} side="right" steerAngle={0} spinAngle={wheelSpinAngle.current} />
    </RigidBody>
  );
}

// --- 5. GROUND ---
function Ground() {
  return (
    <RigidBody type="fixed" position={[0, -0.1, 0]} friction={0.5}>
        <CuboidCollider args={[250, 0.1, 250]} />
        <gridHelper position={[0, 0.15, 0]} args={[500, 50, 0x333333, 0x555555]} />
        <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
            <planeGeometry args={[500, 500]} />
            <meshStandardMaterial color="#333333" roughness={0.8} />
        </mesh>
    </RigidBody>
  );
}

// =========================================
// 6. MAIN PAGE
// =========================================
export default function GamePage() {
  const orbitRef = useRef<any>(null);

  return (
    <main className="w-full h-screen bg-black relative overflow-hidden">
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

      <Canvas shadows camera={{ position: [0, 5, 12], fov: 50 }}>
        <color attach="background" args={['#111']} />
        <ambientLight intensity={0.2} />
        <directionalLight position={[50, 100, 50]} intensity={0.5} castShadow color={"#aaaaff"} />
        <Environment preset="night" />

        <OrbitControls ref={orbitRef} maxPolarAngle={Math.PI / 2.1} minDistance={5} maxDistance={30} />

        <Physics gravity={[0, -20, 0]}>
          <Car orbitRef={orbitRef} />
          <Suspense fallback={null}>
            <HittableLetter char="J" position={[-3, 0.5, -10]} />
            <HittableLetter char="O" position={[-1, 0.5, -10]} />
            <HittableLetter char="E" position={[1, 0.5, -10]} />
            <HittableLetter char="L" position={[3, 0.5, -10]} />
          </Suspense>
          <Ground />
        </Physics>
      </Canvas>
    </main>
  );
}