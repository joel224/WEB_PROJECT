

'use client';

import React, { useEffect, useRef, useState, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { ArrowLeft, Settings2 } from 'lucide-react'; // Added Settings icon
import { Canvas, useFrame } from '@react-three/fiber';
import { Physics, RigidBody, CuboidCollider, RapierRigidBody } from '@react-three/rapier';
import { Text3D, Center, Loader, OrbitControls, Environment } from '@react-three/drei';
import * as THREE from 'three';

// --- 1. REUSABLE WHEEL (Fixed with forwardRef) ---
// We use forwardRef so the parent (Car) can rotate this component directly 
// without triggering slow React re-renders.
const Wheel = React.forwardRef(({ position, side }: { position: [number, number, number], side: 'left' | 'right' }, ref: any) => {
  const hubOffset = side === 'left' ? -0.08 : 0.08;
  
  // Note: We removed the internal useFrame here. 
  // The parent (Car) will handle all rotations to ensure they are perfectly synced.

  return (
    <group ref={ref} position={position}>
        {/* We name this inner group so we can find it later for "spinning" the tire */}
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
function Car({ orbitRef, enginePower }: { orbitRef: any, enginePower: number }) {
  const rigidBody = useRef<RapierRigidBody>(null);
  const controls = useControls();

  // WHEEL REFS (To control them visually)
  const flWheel = useRef<THREE.Group>(null);
  const frWheel = useRef<THREE.Group>(null);
  const blWheel = useRef<THREE.Group>(null);
  const brWheel = useRef<THREE.Group>(null);
  
  // Stable Material Instance
  const brakeMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#550000',
    emissive: '#000000',
    emissiveIntensity: 0,
    toneMapped: false
  }), []);

  // Stable Spotlight Targets
  const [lightTargetL] = useState(() => new THREE.Object3D());
  const [lightTargetR] = useState(() => new THREE.Object3D());

  // Animation states
  const currentSteerAngle = useRef(0);
  const wheelSpinAngle = useRef(0); // Track total spin

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

    // Steer Physics
    const turnSpeed = 3.0;
    let targetTurn = 0;
    if (left) targetTurn = turnSpeed;
    if (right) targetTurn = -turnSpeed;
    rigidBody.current.setAngvel({ x: 0, y: targetTurn, z: 0 }, true);

    // Drive Physics
    const quaternion = new THREE.Quaternion(rot.x, rot.y, rot.z, rot.w);
    forward.set(0, 0, 1).applyQuaternion(quaternion);
    
    // USE THE SLIDER VALUE HERE
    let impulseStrength = 0;
    if (isFwd) impulseStrength = -enginePower;
    else if (isBwd) impulseStrength = enginePower;
    
    rigidBody.current.applyImpulse({ 
        x: forward.x * impulseStrength, y: 0, z: forward.z * impulseStrength 
    }, true);

    // Brake Physics
    const currentDrag = brake ? 6.0 : 1.0;
    rigidBody.current.setLinearDamping(currentDrag);

    // --- VISUALS ---

    // 1. Camera
    if (orbitRef.current) {
        orbitRef.current.target.set(pos.x, pos.y, pos.z);
        orbitRef.current.update();
    }

    // 2. Steer Visuals (Apply to FRONT wheels via refs)
    const maxSteerVis = 0.5; 
    const targetSteerVis = left ? maxSteerVis : (right ? -maxSteerVis : 0);
    currentSteerAngle.current = THREE.MathUtils.lerp(currentSteerAngle.current, targetSteerVis, delta * 10);
    
    // Direct manipulation of DOM elements for performance
    if (flWheel.current) flWheel.current.rotation.y = currentSteerAngle.current;
    if (frWheel.current) frWheel.current.rotation.y = currentSteerAngle.current;

    // 3. Wheel Spin Visuals
    velVec.set(vel.x, vel.y, vel.z);
    const forwardSpeed = velVec.dot(forward); 
    const spinStep = -forwardSpeed * delta * 2.5; // Calculate step for this frame
    
    // Rotate the inner tire mesh for all 4 wheels
    [flWheel, frWheel, blWheel, brWheel].forEach(wheelRef => {
        if(wheelRef.current) {
            // We look for the inner group we named 'tireMesh'
            const tire = wheelRef.current.getObjectByName('tireMesh');
            if(tire) tire.rotation.x += spinStep;
        }
    });

    // 4. Brake Lights
    const isOn = brake;
    brakeMaterial.color.set(isOn ? '#ff0000' : '#550000');
    brakeMaterial.emissive.set(isOn ? '#ff0000' : '#000000');
    brakeMaterial.emissiveIntensity = isOn ? 2 : 0;
    
    // 5. Headlights
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

      {/* BRAKE LIGHTS */}
      <group position={[0, 0.1, 1.0]}>
          <mesh position={[-0.45, 0, 0]} material={brakeMaterial}><boxGeometry args={[0.25, 0.15, 0.05]} /></mesh>
          <mesh position={[0.45, 0, 0]} material={brakeMaterial}><boxGeometry args={[0.25, 0.15, 0.05]} /></mesh>
      </group>

      {/* WHEELS - ATTACH REFS */}
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
  
  // SLIDER STATE
  const [enginePower, setEnginePower] = useState(70);

  return (
    <main className="w-full h-screen bg-black relative overflow-hidden">
      <Loader />
      
      {/* EXIT BUTTON */}
      <div className="absolute top-8 left-8 z-50">
        <Link href="/" className="px-6 py-3 bg-white/90 rounded-full font-bold shadow-lg hover:scale-105 transition-transform flex items-center gap-2 text-black">
          <ArrowLeft size={18} /> Exit
        </Link>
      </div>

      {/* SLIDER UI PANEL */}
      <div className="absolute top-8 right-8 z-50 bg-gray-900/80 text-white p-6 rounded-2xl backdrop-blur-md border border-gray-700 shadow-xl w-72">
        <div className="flex items-center gap-2 mb-4 border-b border-gray-700 pb-2">
            <Settings2 size={20} className="text-yellow-400" />
            <h2 className="font-bold text-lg tracking-wide">Tuning</h2>
        </div>
        
        <div className="flex flex-col gap-2">
            <div className="flex justify-between items-end">
                <label htmlFor="power" className="text-xs font-bold text-gray-400 uppercase tracking-wider">Acceleration</label>
                <span className="text-xl font-mono text-yellow-400 font-bold">{enginePower}</span>
            </div>
            <input 
                id="power"
                type="range" 
                min="5" 
                max="200" 
                value={enginePower} 
                onChange={(e) => setEnginePower(Number(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-yellow-400 hover:accent-yellow-300 transition-all"
            />
            <p className="text-[10px] text-gray-500 mt-1">Adjust engine impulse force.</p>
        </div>
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
          <Car orbitRef={orbitRef} enginePower={enginePower} />
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