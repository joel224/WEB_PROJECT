'use client';

import React, { useEffect, useRef, useState, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { ArrowLeft, Settings2 } from 'lucide-react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Physics, RigidBody, CuboidCollider, RapierRigidBody, BallCollider } from '@react-three/rapier';
import { Text3D, Center, Loader, OrbitControls, Environment } from '@react-three/drei';
import * as THREE from 'three';

// --- CONFIG TYPE ---
type CarConfig = {
  acceleration: number;
  drag: number;
  maxSpeed: number;
};

// --- 1. REUSABLE WHEEL VISUALS ---
const Wheel = React.forwardRef(({ position, side }: { position: [number, number, number], side: 'left' | 'right' }, ref: any) => {
  const hubOffset = side === 'left' ? -0.08 : 0.08;
  return (
    <group ref={ref} position={position}>
        <group name="tireMesh">
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
});
Wheel.displayName = 'Wheel';

// --- 2. LETTERS ---
function HittableLetter({ char, position }: { char: string, position: [number, number, number] }) {
  const fontUrl = 'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/fonts/helvetiker_regular.typeface.json';
  return (
    <RigidBody position={position} colliders="cuboid" restitution={0.2} friction={0.5} mass={2}>
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

// --- 4. THE CAR (WITH REAL TIRE PHYSICS & SPEED LIMITER) ---
function Car({ orbitRef, config }: { orbitRef: any, config: CarConfig }) {
  const rigidBody = useRef<RapierRigidBody>(null);
  const controls = useControls();
  
  // Wheel Visual Refs
  const flWheel = useRef<THREE.Group>(null);
  const frWheel = useRef<THREE.Group>(null);
  const blWheel = useRef<THREE.Group>(null);
  const brWheel = useRef<THREE.Group>(null);

  const brakeMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#550000', emissive: '#000000', emissiveIntensity: 0, toneMapped: false
  }), []);
  
  const [lightTargetL] = useState(() => new THREE.Object3D());
  const [lightTargetR] = useState(() => new THREE.Object3D());

  const currentSteerAngle = useRef(0);
  const forward = useMemo(() => new THREE.Vector3(), []);
  const velVec = useMemo(() => new THREE.Vector3(), []);
  const resetTimer = useRef(0);

  useFrame((state, delta) => {
    if (!rigidBody.current) return;

    // --- 0. RESET LOCK ---
    if (resetTimer.current > 0) {
        resetTimer.current -= delta;
        rigidBody.current.setLinvel({ x: 0, y: 0, z: 0 }, true);
        rigidBody.current.setAngvel({ x: 0, y: 0, z: 0 }, true);
        return; 
    }

    const { forward: isFwd, backward: isBwd, left, right, brake } = controls.current;
    const pos = rigidBody.current.translation();
    const rot = rigidBody.current.rotation();
    const vel = rigidBody.current.linvel();

    // --- 1. RESPAWN LOGIC ---
    if (pos.y < -5) {
        rigidBody.current.setTranslation({ x: 0, y: 1, z: 0 }, true);
        rigidBody.current.setLinvel({ x: 0, y: 0, z: 0 }, true);
        rigidBody.current.setAngvel({ x: 0, y: 0, z: 0 }, true);
        rigidBody.current.setRotation({ x: 0, y: 0, z: 0, w: 1 }, true);
        resetTimer.current = 0.5;
        return;
    }

    // --- 2. STEERING ---
    const turnSpeed = 3.0;
    let targetTurn = 0;
    if (left) targetTurn = turnSpeed;
    if (right) targetTurn = -turnSpeed;
    rigidBody.current.setAngvel({ x: 0, y: targetTurn, z: 0 }, true);

    // --- 3. ENGINE FORCE ---
    const quaternion = new THREE.Quaternion(rot.x, rot.y, rot.z, rot.w);
    forward.set(0, 0, 1).applyQuaternion(quaternion);
    
    velVec.set(vel.x, vel.y, vel.z);
    const speed = velVec.length(); // Get absolute speed magnitude
    const currentSpeed = velVec.dot(forward); // Directional speed
    
    let forceStrength = 0;
    const engineForce = config.acceleration;

    if (isFwd) {
        if (currentSpeed < -1) forceStrength = -engineForce * 3.0; 
        else if (currentSpeed < config.maxSpeed) forceStrength = -engineForce;
    } else if (isBwd) {
        if (currentSpeed > 1) forceStrength = engineForce * 3.0;
        else if (currentSpeed > -config.maxSpeed) forceStrength = engineForce;
    }
    
    if (forceStrength !== 0) {
        rigidBody.current.addForce({ 
            x: forward.x * forceStrength, 
            y: 0, 
            z: forward.z * forceStrength 
        }, true);
    }

    // --- SPEED LIMITER LOGIC ---
    // If speed exceeds maxSpeed, clamp the velocity
    if (speed > config.maxSpeed) {
        // Create a normalized velocity vector (direction only)
        const normalizedVel = velVec.clone().normalize();
        // Set velocity to direction * maxSpeed
        rigidBody.current.setLinvel({
            x: normalizedVel.x * config.maxSpeed,
            y: vel.y, // Preserve vertical velocity (falling/jumping)
            z: normalizedVel.z * config.maxSpeed
        }, true);
    }

    // ARTIFICIAL DOWNFORCE
    rigidBody.current.addForce({ x: 0, y: -100, z: 0 }, true);

    // --- 4. DRAG / BRAKES ---
    const currentDrag = brake ? 10.0 : config.drag;
    rigidBody.current.setLinearDamping(currentDrag);

    // --- VISUALS ---
    if (orbitRef.current) {
        orbitRef.current.target.set(pos.x, pos.y, pos.z);
        orbitRef.current.update();
    }

    const maxSteerVis = 0.5; 
    const targetSteerVis = left ? maxSteerVis : (right ? -maxSteerVis : 0);
    currentSteerAngle.current = THREE.MathUtils.lerp(currentSteerAngle.current, targetSteerVis, delta * 10);
    if (flWheel.current) flWheel.current.rotation.y = currentSteerAngle.current;
    if (frWheel.current) frWheel.current.rotation.y = currentSteerAngle.current;

    const spinAmount = -currentSpeed * delta * 2.0;
    [flWheel, frWheel, blWheel, brWheel].forEach(wheelRef => {
        if (wheelRef.current) {
            const tire = wheelRef.current.getObjectByName("tireMesh");
            if (tire) tire.rotation.x += spinAmount;
        }
    });

    const isOn = brake;
    brakeMaterial.color.set(isOn ? '#ff0000' : '#550000');
    brakeMaterial.emissive.set(isOn ? '#ff0000' : '#000000');
    brakeMaterial.emissiveIntensity = isOn ? 2 : 0;
    
    lightTargetL.position.set(-0.6, -0.5, -10);
    lightTargetR.position.set(0.6, -0.5, -10);
    lightTargetL.updateMatrixWorld();
    lightTargetR.updateMatrixWorld();
  });

  return (
    <RigidBody 
        ref={rigidBody} 
        position={[0, 1, 0]} 
        mass={80} 
        colliders={false} 
        friction={3.0} 
        angularDamping={1.0} 
        enabledRotations={[false, true, false]} 
        ccd={true}
    >
        <CuboidCollider args={[0.6, 0.25, 1.2]} position={[0, 0.4, 0]} />

        <BallCollider args={[0.36]} position={[-0.7, 0.36, -0.8]} />
        <BallCollider args={[0.36]} position={[0.7, 0.36, -0.8]} />
        <BallCollider args={[0.36]} position={[-0.7, 0.36, 1.0]} />
        <BallCollider args={[0.36]} position={[0.7, 0.36, 1.0]} />

        <mesh castShadow position={[0, 0, -0.5]}>
            <boxGeometry args={[1.2, 0.5, 1.5]} />
            <meshStandardMaterial color="#ef4444" envMapIntensity={1.5} roughness={0.2} metalness={0.5} />
        </mesh>
        
        <mesh position={[0, 0.4, 0.5]} castShadow>
            <boxGeometry args={[1.0, 0.45, 1.0]} />
            <meshStandardMaterial color="#111" envMapIntensity={2} roughness={0.1} metalness={0.8} />
        </mesh>

        <group position={[0, 0.1, -1.25]}>
            <mesh position={[-0.5, 0, 0]}>
                <sphereGeometry args={[0.08, 16, 8]} />
                <meshStandardMaterial color="white" emissive="white" emissiveIntensity={2} toneMapped={false} />
                <primitive object={lightTargetL} />
                <spotLight castShadow intensity={50} angle={0.6} penumbra={0.2} distance={30} target={lightTargetL} />
            </mesh>
            <mesh position={[0.5, 0, 0]}>
                <sphereGeometry args={[0.08, 16, 8]} />
                <meshStandardMaterial color="white" emissive="white" emissiveIntensity={2} toneMapped={false} />
                <primitive object={lightTargetR} />
                <spotLight castShadow intensity={50} angle={0.6} penumbra={0.2} distance={30} target={lightTargetR} />
            </mesh>
        </group>

        <group position={[0, 0.1, 1.0]}>
            <mesh position={[-0.45, 0, 0]} material={brakeMaterial}><boxGeometry args={[0.25, 0.15, 0.05]} /></mesh>
            <mesh position={[0.45, 0, 0]} material={brakeMaterial}><boxGeometry args={[0.25, 0.15, 0.05]} /></mesh>
        </group>

        <Wheel ref={flWheel} position={[-0.7, -0.2, -0.8]} side="left" />
        <Wheel ref={frWheel} position={[0.7, -0.2, -0.8]} side="right" />
        <Wheel ref={blWheel} position={[-0.7, -0.2, 1.0]} side="left" />
        <Wheel ref={brWheel} position={[0.7, -0.2, 1.0]} side="right" />
    </RigidBody>
  );
}

// --- 5. GROUND ---
function Ground() {
  return (
    <RigidBody type="fixed" position={[0, -0.1, 0]} friction={4.0}>
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

  // CONFIG STATE
  const [config, setConfig] = useState<CarConfig>({
    acceleration: 4000, 
    drag: 2.5, 
    maxSpeed: 40
  });

  return (
    <main className="w-full h-screen bg-black relative overflow-hidden">
      <Loader />
      
      <div className="absolute top-8 left-8 z-50">
        <Link href="/" className="px-6 py-3 bg-white/90 rounded-full font-bold shadow-lg hover:scale-105 transition-transform flex items-center gap-2 text-black">
          <ArrowLeft size={18} /> Exit
        </Link>
      </div>

      {/* TUNING PANEL */}
      <div className="absolute top-8 right-8 z-50 bg-gray-900/90 text-white p-6 rounded-xl border border-gray-700 w-80 shadow-2xl backdrop-blur-md">
         <div className="flex items-center gap-2 mb-4 border-b border-gray-700 pb-2">
            <Settings2 size={20} className="text-yellow-400" />
            <h2 className="font-bold text-lg">Tuning Shop</h2>
         </div>
         <div className="mb-4">
            <div className="flex justify-between mb-1">
                <label className="text-xs text-gray-400 font-bold uppercase">Engine Power</label>
                <span className="text-xs text-yellow-400 font-mono">{config.acceleration}N</span>
            </div>
            <input 
                type="range" min="1000" max="8000" step="100" 
                value={config.acceleration}
                onChange={(e) => setConfig(p => ({ ...p, acceleration: Number(e.target.value) }))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-yellow-400"
            />
         </div>
         <div className="mb-4">
            <div className="flex justify-between mb-1">
                <label className="text-xs text-gray-400 font-bold uppercase">Air Drag</label>
                <span className="text-xs text-yellow-400 font-mono">{config.drag.toFixed(1)}</span>
            </div>
            <input 
                type="range" min="0.1" max="10.0" step="0.1" 
                value={config.drag}
                onChange={(e) => setConfig(p => ({ ...p, drag: Number(e.target.value) }))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-yellow-400"
            />
         </div>
         <div className="mb-2">
            <div className="flex justify-between mb-1">
                <label className="text-xs text-gray-400 font-bold uppercase">Speed Limiter</label>
                <span className="text-xs text-yellow-400 font-mono">{config.maxSpeed} MPH</span>
            </div>
            <input 
                type="range" min="10" max="100" step="5" 
                value={config.maxSpeed}
                onChange={(e) => setConfig(p => ({ ...p, maxSpeed: Number(e.target.value) }))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-yellow-400"
            />
         </div>
      </div>

      <div className="absolute bottom-8 right-8 z-50 bg-black/80 text-white p-4 rounded-xl font-mono text-xs pointer-events-none border border-gray-800">
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
          <Car orbitRef={orbitRef} config={config} />
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