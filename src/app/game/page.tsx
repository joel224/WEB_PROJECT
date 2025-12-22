'use client';

import React, { useEffect, useRef, useState, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { ArrowLeft, Settings2 } from 'lucide-react'; 
import { Canvas, useFrame } from '@react-three/fiber';
import { Physics, RigidBody, CuboidCollider, RapierRigidBody, CylinderCollider } from '@react-three/rapier';
import { Text3D, Center, Loader, OrbitControls, Environment } from '@react-three/drei';
import * as THREE from 'three';

// --- 1. REUSABLE WHEEL ---
const Wheel = React.forwardRef(({ position, side }: { position: [number, number, number], side: 'left' | 'right' }, ref: any) => {
  const isLeft = side === 'left';
  const faceOffset = isLeft ? -0.06 : 0.06;

  return (
    <group ref={ref} position={position}>
        {/* BRAKE CALIPER (Does not spin) */}
        <mesh position={[0, 0.15, 0]} rotation={[0, isLeft ? 0 : Math.PI, 0]}>
            <boxGeometry args={[0.15, 0.12, 0.1]} />
            <meshStandardMaterial color="#cc0000" metalness={0.6} roughness={0.4} />
        </mesh>

        {/* ROTATING TIRE GROUP */}
        <group name="tireMesh">
            {/* Tire */}
            <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
                <cylinderGeometry args={[0.35, 0.35, 0.25, 32]} />
                <meshStandardMaterial color="#1a1a1a" roughness={0.9} />
            </mesh>
            {/* Rim */}
            <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
                <cylinderGeometry args={[0.22, 0.22, 0.26, 24]} />
                <meshStandardMaterial color="#silver" metalness={0.8} roughness={0.2} />
            </mesh>
            {/* Spokes */}
            <group position={[faceOffset, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                 <mesh><boxGeometry args={[0.04, 0.42, 0.02]} /><meshStandardMaterial color="#cccccc" metalness={0.9} roughness={0.1} /></mesh>
                 <mesh rotation={[0, Math.PI / 2, 0]}><boxGeometry args={[0.04, 0.42, 0.02]} /><meshStandardMaterial color="#cccccc" metalness={0.9} roughness={0.1} /></mesh>
            </group>
            {/* Hub Cap */}
             <mesh rotation={[0, 0, Math.PI / 2]} position={[faceOffset * 1.5, 0, 0]}>
                <cylinderGeometry args={[0.06, 0.06, 0.05, 16]} />
                <meshStandardMaterial color="#111" />
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
    <RigidBody position={position} colliders="cuboid" restitution={0.4} friction={0.7} mass={2}>
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

  // Wheel Refs
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

  useFrame((state, delta) => {
    if (!rigidBody.current) return;

    // isFwd is defined HERE, inside the loop. It cannot be used in the return() JSX.
    const { forward: isFwd, backward: isBwd, left, right, brake } = controls.current;
    
    const pos = rigidBody.current.translation();
    const rot = rigidBody.current.rotation();
    const vel = rigidBody.current.linvel();

    // Reset logic
    if (pos.y < -20) {
        rigidBody.current.setTranslation({ x: 0, y: 10, z: 0 }, true);
        rigidBody.current.setLinvel({ x: 0, y: 0, z: 0 }, true);
        rigidBody.current.setAngvel({ x: 0, y: 0, z: 0 }, true);
        rigidBody.current.setRotation({ x: 0, y: 0, z: 0, w: 1 }, true);
    }

    // Steering Logic
    const turnSpeed = 3.0;
    let targetTurn = 0;
    if (left) targetTurn = turnSpeed;
    if (right) targetTurn = -turnSpeed;
    rigidBody.current.setAngvel({ x: 0, y: targetTurn, z: 0 }, true);

    // Engine Logic
    const quaternion = new THREE.Quaternion(rot.x, rot.y, rot.z, rot.w);
    forward.set(0, 0, 1).applyQuaternion(quaternion);
    
    let impulseStrength = 0;
    if (isFwd) impulseStrength = -enginePower;
    else if (isBwd) impulseStrength = enginePower;
    
    rigidBody.current.applyImpulse({ 
        x: forward.x * impulseStrength, y: 0, z: forward.z * impulseStrength 
    }, true);

    // Brake & Air Resistance
    const currentSpeed = Math.sqrt(vel.x ** 2 + vel.z ** 2);
    const airResistance = currentSpeed * 0.02;
    const currentDrag = brake ? 6.0 : 1.0 + airResistance;
    rigidBody.current.setLinearDamping(currentDrag);

    // Camera
    if (orbitRef.current) {
        orbitRef.current.target.set(pos.x, pos.y, pos.z);
        orbitRef.current.update();
    }

    // Visuals: Steering
    const maxSteerVis = 0.5; 
    const targetSteerVis = left ? maxSteerVis : (right ? -maxSteerVis : 0);
    currentSteerAngle.current = THREE.MathUtils.lerp(currentSteerAngle.current, targetSteerVis, delta * 10);
    
    if (flWheel.current) flWheel.current.rotation.y = currentSteerAngle.current;
    if (frWheel.current) frWheel.current.rotation.y = currentSteerAngle.current;

    // Visuals: Wheel Spin
    velVec.set(vel.x, vel.y, vel.z);
    const forwardSpeed = velVec.dot(forward); 
    const spinStep = -forwardSpeed * delta * 2.5; 
    
    [flWheel, frWheel, blWheel, brWheel].forEach(wheelRef => {
        if(wheelRef.current) {
            const tire = wheelRef.current.getObjectByName('tireMesh');
            if(tire) tire.rotation.x += spinStep;
        }
    });

    // Visuals: Brake Lights
    const isOn = brake;
    brakeMaterial.color.set(isOn ? '#ff0000' : '#550000');
    brakeMaterial.emissive.set(isOn ? '#ff0000' : '#000000');
    brakeMaterial.emissiveIntensity = isOn ? 2 : 0;
    
    // Visuals: Headlights
    lightTargetL.position.set(-0.6, -0.5, -10);
    lightTargetR.position.set(0.6, -0.5, -10);
    lightTargetL.updateMatrixWorld();
    lightTargetR.updateMatrixWorld();
  });

  return (
    <RigidBody 
        ref={rigidBody} position={[0, 10, 0]} mass={50} colliders="cuboid" friction={1.5} linearDamping={1.0} angularDamping={0.5} enabledRotations={[false, true, false]} ccd={true}
    >
      {/* HOOD */}
      <mesh castShadow position={[0, 0, -0.5]}>
          <boxGeometry args={[1.2, 0.5, 1.5]} />
          <meshStandardMaterial color="#ef4444" envMapIntensity={1.5} roughness={0.2} metalness={0.5} />
      </mesh>
      
      {/* CABIN */}
      <mesh position={[0, 0.4, 0.5]} castShadow>
        <boxGeometry args={[1.0, 0.45, 1.0]} />
        <meshStandardMaterial color="#222" envMapIntensity={2} roughness={0.1} metalness={0.8} />
      </mesh>

      {/* HEADLIGHTS */}
      <group position={[0, 0.1, -1.25]}>
          <mesh position={[-0.5, 0, 0]}>
              <sphereGeometry args={[0.08, 16, 8]} />
              <meshStandardMaterial color="white" emissive="white" emissiveIntensity={2} toneMapped={false} />
              <primitive object={lightTargetL} />
              <spotLight castShadow intensity={100} angle={0.6} penumbra={0.2} distance={30} target={lightTargetL} />
          </mesh>
          <mesh position={[0.5, 0, 0]}>
              <sphereGeometry args={[0.08, 16, 8]} />
              <meshStandardMaterial color="white" emissive="white" emissiveIntensity={2} toneMapped={false} />
              <primitive object={lightTargetR} />
              <spotLight castShadow intensity={100} angle={0.6} penumbra={0.2} distance={30} target={lightTargetR} />
          </mesh>
      </group>

      {/* BRAKE LIGHTS */}
      <group position={[0, 0.1, 1.0]}>
          <mesh position={[-0.45, 0, 0]} material={brakeMaterial}><boxGeometry args={[0.25, 0.15, 0.05]} /></mesh>
          <mesh position={[0.45, 0, 0]} material={brakeMaterial}><boxGeometry args={[0.25, 0.15, 0.05]} /></mesh>
      </group>

      {/* WHEELS */}
      <Wheel ref={flWheel} position={[-0.7, -0.2, -0.8]} side="left" />
      <Wheel ref={frWheel} position={[0.7, -0.2, -0.8]} side="right" />
      <Wheel ref={blWheel} position={[-0.7, -0.2, 1.0]} side="left" />
      <Wheel ref={brWheel} position={[0.7, -0.2, 1.0]} side="right" />
    </RigidBody>
  );
}

// --- 5. BUMPY MOUNTAIN ROAD (Procedural Green/Mud) ---
function Ground() {
  const meshRef = useRef<THREE.Mesh>(null);

  useEffect(() => {
    if (!meshRef.current) return;
    const geom = meshRef.current.geometry;
    const pos = geom.attributes.position;
    const vertex = new THREE.Vector3();
    
    // Array to hold custom RGB colors per vertex
    const colors: number[] = [];
    const colorObj = new THREE.Color();

    for (let i = 0; i < pos.count; i++) {
        vertex.fromBufferAttribute(pos, i);
        const x = vertex.x;
        const y = vertex.y;

        // --- HEIGHT LOGIC (Bumps) ---
        let z = 0;
        z += Math.sin(x * 0.06) * 4;
        z += Math.cos(y * 0.06) * 4;
        z += Math.sin(x * 0.2 + y * 0.1) * 0.8;
        
        pos.setZ(i, z);

        // --- COLOR LOGIC (Painting) ---
        // Heights > 1.5 are grassy (Green)
        // Heights < 1.5 are muddy/gravel (Brown)
        if (z > 1.5) {
            // Mix Light & Dark Green for grass texture
            const noise = Math.sin(x * 0.5) * Math.cos(y * 0.5);
            if (noise > 0) {
                 colorObj.set('#2e7d32'); // Dark Green
            } else {
                 colorObj.set('#4caf50'); // Light Green
            }
        } else {
            // Mud Color
            colorObj.set('#5d4037'); 
        }

        colors.push(colorObj.r, colorObj.g, colorObj.b);
    }
    
    // Apply colors to the mesh
    geom.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

    pos.needsUpdate = true;
    geom.computeVertexNormals();
  }, []);

  return (
    <group>
        {/* MAIN TERRAIN: Visual + Basic Collider */}
        <RigidBody type="fixed" colliders="trimesh" friction={1.0} restitution={0.1}>
            <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
                <planeGeometry args={[500, 500, 128, 128]} />
                <meshStandardMaterial 
                    vertexColors={true} // Enables our custom greens/browns
                    roughness={0.9} 
                    metalness={0.1}
                />
            </mesh>
        </RigidBody>

        {/* MUD PITS: Slippery Physics Objects */}
        {/* These are separate bodies so we can give them low friction (slippery) */}
        
        {/* Mud Pit 1 */}
        <RigidBody type="fixed" position={[5, -3.0, 5]} friction={0.2}>
             <CylinderCollider args={[0.2, 8]} />
             <mesh rotation={[-Math.PI/2, 0, 0]} receiveShadow>
                <circleGeometry args={[8, 32]} />
                <meshStandardMaterial color="#3e2723" roughness={0.1} metalness={0.0} />
             </mesh>
        </RigidBody>
        
        {/* Mud Pit 2 */}
        <RigidBody type="fixed" position={[-15, -3.0, -10]} friction={0.2}>
             <CylinderCollider args={[0.2, 6]} />
             <mesh rotation={[-Math.PI/2, 0, 0]} receiveShadow>
                <circleGeometry args={[6, 32]} />
                <meshStandardMaterial color="#3e2723" roughness={0.1} metalness={0.0} />
             </mesh>
        </RigidBody>
    </group>
  );
}

// =========================================
// 6. MAIN PAGE
// =========================================
export default function GamePage() {
  const orbitRef = useRef<any>(null);
  const [enginePower, setEnginePower] = useState(70);

  return (
    <main className="w-full h-screen bg-gray-50 relative overflow-hidden">
      <Loader />
      
      {/* EXIT BUTTON */}
      <div className="absolute top-8 left-8 z-50">
        <Link href="/" className="px-6 py-3 bg-black/90 rounded-full font-bold shadow-lg hover:scale-105 transition-transform flex items-center gap-2 text-white">
          <ArrowLeft size={18} /> Exit
        </Link>
      </div>

      {/* SLIDER UI PANEL */}
      <div className="absolute top-8 right-8 z-50 bg-white/80 text-gray-900 p-6 rounded-2xl backdrop-blur-md border border-gray-200 shadow-xl w-72">
        <div className="flex items-center gap-2 mb-4 border-b border-gray-200 pb-2">
            <Settings2 size={20} className="text-orange-500" />
            <h2 className="font-bold text-lg tracking-wide">Tuning</h2>
        </div>
        
        <div className="flex flex-col gap-2">
            <div className="flex justify-between items-end">
                <label htmlFor="power" className="text-xs font-bold text-gray-500 uppercase tracking-wider">Acceleration</label>
                <span className="text-xl font-mono text-orange-500 font-bold">{enginePower}</span>
            </div>
            <input 
                id="power"
                type="range" 
                min="10" 
                max="200" 
                value={enginePower} 
                onChange={(e) => setEnginePower(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-500 hover:accent-orange-400 transition-all"
            />
            <p className="text-[10px] text-gray-400 mt-1">Adjust engine impulse force.</p>
        </div>
      </div>

      <div className="absolute bottom-8 right-8 z-50 bg-white/80 text-gray-900 p-4 rounded-xl font-mono text-xs pointer-events-none shadow-md border border-gray-200">
         <p>WASD to Drive</p>
         <p>SPACE to Brake</p>
         <p>Mouse Drag to Rotate Camera</p>
      </div>

      <Canvas shadows camera={{ position: [0, 5, 12], fov: 50 }}>
        <color attach="background" args={['#f3f4f6']} />
        
        <ambientLight intensity={0.8} />
        <directionalLight position={[50, 100, 50]} intensity={1.5} castShadow color={"#ffffff"} shadow-bias={-0.0001} />
        <Environment preset="sunset" />

        <OrbitControls ref={orbitRef} maxPolarAngle={Math.PI / 2.1} minDistance={5} maxDistance={30} />

        <Physics gravity={[0, -20, 0]}>
          <Car orbitRef={orbitRef} enginePower={enginePower} />
          <Suspense fallback={null}>
            <HittableLetter char="J" position={[-3, 4, -10]} />
            <HittableLetter char="O" position={[-1, 4, -10]} />
            <HittableLetter char="E" position={[1, 4, -10]} />
            <HittableLetter char="L" position={[3, 4, -10]} />
          </Suspense>
          <Ground />
        </Physics>
      </Canvas>
    </main>
  );
}