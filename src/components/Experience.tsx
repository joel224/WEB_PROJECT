'use client';

import React, { useRef, useState, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { 
    MeshTransmissionMaterial, 
    Environment, 
    Float, 
    PerspectiveCamera
} from '@react-three/drei';
import { EffectComposer, Bloom, Noise, Vignette } from '@react-three/postprocessing';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import * as THREE from 'three';

// --- CONFIG ---
const CORE_COLOR = "#00ff88"; 
const GLASS_COLOR = "#ffffff";
const BG_COLOR = "#050505";

// --- HERO OBJECT ---
function Artifact() {
    const groupRef = useRef<THREE.Group>(null);
    const coreRef = useRef<THREE.Mesh>(null);
    const outerRef = useRef<THREE.Mesh>(null);
    const [hovered, setHover] = useState(false);

    useGSAP(() => {
        if (!groupRef.current || !coreRef.current || !outerRef.current) return;
        
        // Intro Animation
        const tl = gsap.timeline({ delay: 0.5 });
        gsap.set(outerRef.current.scale, { x: 0.1, y: 0.1, z: 0.1 });
        gsap.set(coreRef.current.scale, { x: 0, y: 0, z: 0 });
        
        tl.to(outerRef.current.scale, {
            x: 1.2, y: 1.2, z: 1.2, duration: 1.5, ease: "elastic.out(1, 0.5)"
        }).to(coreRef.current.scale, {
            x: 1, y: 1, z: 1, duration: 1, ease: "power4.out"
        }, "-=1.2");

        // Idle Animation
        gsap.to(groupRef.current.rotation, { y: Math.PI * 2, duration: 20, repeat: -1, ease: "none" });
        gsap.to(coreRef.current.material, { emissiveIntensity: 4, duration: 2, repeat: -1, yoyo: true, ease: "sine.inOut" });
    }, []);

    useGSAP(() => {
        if (!outerRef.current) return;
        gsap.to(outerRef.current.scale, {
            x: hovered ? 1.4 : 1.2, y: hovered ? 1.4 : 1.2, z: hovered ? 1.4 : 1.2,
            duration: 0.4, ease: "back.out(1.7)"
        });
    }, [hovered]);

    useFrame((state) => {
        if (!coreRef.current) return;
        const t = state.clock.getElapsedTime();
        coreRef.current.rotation.z = Math.sin(t / 2) * 0.5;
        coreRef.current.rotation.x = Math.cos(t / 2) * 0.5;
    });

    return (
        <group ref={groupRef} onPointerOver={() => setHover(true)} onPointerOut={() => setHover(false)}>
            <mesh ref={coreRef}>
                <octahedronGeometry args={[1, 0]} />
                <meshStandardMaterial color={CORE_COLOR} emissive={CORE_COLOR} emissiveIntensity={2} toneMapped={false} roughness={0.2} metalness={1} />
            </mesh>
            <mesh ref={outerRef}>
                <icosahedronGeometry args={[2, 0]} />
                <MeshTransmissionMaterial backside={true} samples={16} resolution={512} thickness={0.5} roughness={0.1} anisotropy={1} chromaticAberration={0.1} color={GLASS_COLOR} />
            </mesh>
            <Ring size={3.5} speed={0.5} color="#444" />
            <Ring size={4.2} speed={-0.3} color="#666" rotation={[0.5, 0, 0]} />
        </group>
    );
}

function Ring({ size, speed, color, rotation = [0,0,0] }: any) {
    const ref = useRef<THREE.Mesh>(null);
    useFrame((state, delta) => {
        if(ref.current) {
            ref.current.rotation.z += delta * speed;
            ref.current.rotation.x += delta * (speed * 0.5);
        }
    });
    return (
        <mesh ref={ref} rotation={rotation}>
            <torusGeometry args={[size, 0.02, 16, 100]} />
            <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} toneMapped={false} />
        </mesh>
    );
}

function Particles() {
    const count = 500;
    const mesh = useRef<THREE.InstancedMesh>(null);
    const particles = useMemo(() => {
        const temp = [];
        for (let i = 0; i < count; i++) temp.push({ t: Math.random() * 100, factor: 20 + Math.random() * 100, speed: 0.01 + Math.random() / 200, x: (Math.random() - 0.5) * 50, y: (Math.random() - 0.5) * 50, z: (Math.random() - 0.5) * 50 });
        return temp;
    }, []);
    const dummy = useMemo(() => new THREE.Object3D(), []);
    useFrame(() => {
        if (!mesh.current) return;
        particles.forEach((particle, i) => {
            let { t, factor, speed, x, y, z } = particle;
            t = particle.t += speed / 2;
            const s = Math.cos(t);
            dummy.position.set(x + Math.cos((t / 10) * factor) + (Math.sin(t * 1) * factor) / 10, y + Math.sin((t / 10) * factor) + (Math.cos(t * 2) * factor) / 10, z + Math.cos((t / 10) * factor) + (Math.sin(t * 3) * factor) / 10);
            dummy.scale.set(s, s, s);
            dummy.rotation.set(s * 5, s * 5, s * 5);
            dummy.updateMatrix();
            mesh.current!.setMatrixAt(i, dummy.matrix);
        });
        mesh.current.instanceMatrix.needsUpdate = true;
    });
    return <instancedMesh ref={mesh} args={[undefined, undefined, count]}><dodecahedronGeometry args={[0.2, 0]} /><meshBasicMaterial color={CORE_COLOR} transparent opacity={0.4} /></instancedMesh>;
}

function Rig() {
    const { camera, mouse } = useThree();
    const vec = new THREE.Vector3();
    return useFrame(() => {
        camera.position.lerp(vec.set(mouse.x * 2, mouse.y * 2, 15), 0.05);
        camera.lookAt(0, 0, 0);
    });
}

// --- MAIN EXPORT ---
export default function Experience() {
    return (
        <section className="w-full h-screen bg-[#050505] relative overflow-hidden">
            {/* UI OVERLAY */}
            <div className="absolute inset-0 z-10 pointer-events-none flex flex-col justify-between p-12">
                <div className="flex justify-between items-start">
                    <h1 className="text-white font-mono text-sm tracking-[0.3em] opacity-50">JOEL JOSHY // PROTOTYPE_25</h1>
                    <div className="text-right"><div className="w-2 h-2 bg-[#00ff88] rounded-full inline-block mr-2 animate-pulse"/><span className="text-[#00ff88] font-mono text-xs">SYSTEM ONLINE</span></div>
                </div>
                <div className="text-center space-y-4">
                    <h2 className="text-6xl md:text-9xl font-bold text-white tracking-tighter mix-blend-overlay opacity-80">Woxro</h2>
                    <p className="text-white/40 font-mono text-xs tracking-widest uppercase">Interactive WebGL Experience</p>
                </div>
                <div className="flex justify-between items-end text-white/30 font-mono text-xs"><p>LAT: 45.230</p><p>LNG: -12.049</p></div>
            </div>

            {/* 3D SCENE */}
            <Canvas dpr={[1, 2]} gl={{ antialias: false, toneMapping: THREE.ACESFilmicToneMapping }}>
                <PerspectiveCamera makeDefault position={[0, 0, 15]} fov={35} />
                <color attach="background" args={[BG_COLOR]} />
                <ambientLight intensity={0.5} />
                <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={10} color="#00ff88" />
                <pointLight position={[-10, -10, -10]} intensity={10} color="purple" />
                <Environment preset="city" /> 
                <Float speed={2} rotationIntensity={0.5} floatIntensity={1}><Artifact /></Float>
                <Particles />
                <Rig />
                <EffectComposer disableNormalPass>
                    <Bloom luminanceThreshold={1} mipmapBlur intensity={1.5} radius={0.6} />
                    <Noise opacity={0.05} />
                    <Vignette eskil={false} offset={0.1} darkness={1.1} />
                </EffectComposer>
            </Canvas>
        </section>
    );
}