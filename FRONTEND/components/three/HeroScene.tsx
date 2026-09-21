/// <reference types="@react-three/fiber" />
"use client";

import React, { useRef, useMemo } from "react";
import { Canvas, useFrame, type ThreeElements } from "@react-three/fiber";
import { Float, OrbitControls, Sparkles } from "@react-three/drei";
import * as THREE from "three";

// Declare intrinsic JSX elements for React Three Fiber in file scope
declare global {
  namespace JSX {
    interface IntrinsicElements extends ThreeElements {}
  }
  namespace React {
    namespace JSX {
      interface IntrinsicElements extends ThreeElements {}
    }
  }
}

// Low-poly abstract cityscape silhouette with cinematic dual-tone lighting
function Cityscape() {
  const cityGroupRef = useRef<THREE.Group>(null);

  // Generate buildings with architectural silhouette profiles
  const buildings = useMemo(() => {
    const items: Array<{
      id: number;
      x: number;
      z: number;
      width: number;
      depth: number;
      height: number;
      color: string;
      roughness: number;
    }> = [];

    const gridSize = 8;
    const spacing = 1.8;
    let id = 0;

    // Dark obsidian, graphite, and slate tones
    const palette = ["#0d0e14", "#12141c", "#181a24", "#0a0b10", "#141620"];

    for (let i = -gridSize; i <= gridSize; i++) {
      for (let j = -gridSize; j <= gridSize; j++) {
        const distFromCenter = Math.sqrt(i * i + j * j);

        // Create open plaza and major traffic corridors in the center foreground
        if (distFromCenter < 2.2) continue;
        if (Math.abs(i) === 1 || Math.abs(j) === 1) {
          if (Math.random() > 0.4) continue;
        }

        // Taller towers towards the sides and background, framing the hero text
        const sideFactor = Math.pow(Math.abs(i) / gridSize, 1.2) * 3.5;
        const depthFactor = Math.pow(Math.abs(j) / gridSize, 1.1) * 2.8;
        const randomVariation = Math.sin(i * 3.7 + j * 6.3) * 0.9 + 1.1;
        const height = Math.max(0.8, (sideFactor + depthFactor + 0.6) * randomVariation);

        const width = 0.9 + Math.cos(i * 3.2) * 0.25;
        const depth = 0.9 + Math.sin(j * 4.1) * 0.25;

        const colorIndex = Math.abs(Math.round(i * 3 + j * 5)) % palette.length;

        items.push({
          id: id++,
          x: i * spacing,
          z: j * spacing,
          width,
          depth,
          height,
          color: palette[colorIndex],
          roughness: 0.7 + (Math.sin(id) * 0.2),
        });
      }
    }
    return items;
  }, []);

  // Subtle slow continuous auto-rotation via useFrame
  useFrame((_, delta) => {
    if (cityGroupRef.current) {
      cityGroupRef.current.rotation.y += delta * 0.025;
    }
  });

  return (
    <group ref={cityGroupRef} position={[0, -2.4, -1]}>
      {/* Reflective Ground Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]}>
        <planeGeometry args={[60, 60]} />
        <meshStandardMaterial
          color="#08080d"
          roughness={0.85}
          metalness={0.4}
        />
      </mesh>

      {/* Buildings */}
      {buildings.map((b) => (
        <mesh
          key={b.id}
          position={[b.x, b.height / 2, b.z]}
          castShadow
          receiveShadow
        >
          <boxGeometry args={[b.width, b.height, b.depth]} />
          <meshStandardMaterial
            color={b.color}
            roughness={b.roughness}
            metalness={0.3}
          />
        </mesh>
      ))}

      {/* Weightless Floating Hotspot Spheres (Antigravity Feel) */}
      {/* Red-Orange Critical Bottleneck */}
      <FloatingHotspotSphere
        position={[-3.2, 5.2, 1.2]}
        color="#FF6B4A"
        speed={1.6}
        floatIntensity={1.8}
        size={0.28}
      />
      {/* Teal-Cyan Normal / Monitoring Node */}
      <FloatingHotspotSphere
        position={[3.8, 4.6, -1.8]}
        color="#3ED6C8"
        speed={1.4}
        floatIntensity={1.5}
        size={0.32}
      />
      {/* Teal-Cyan Active Patrol Vector */}
      <FloatingHotspotSphere
        position={[-4.5, 4.0, -3.4]}
        color="#3ED6C8"
        speed={1.8}
        floatIntensity={1.4}
        size={0.24}
      />
      {/* Red-Orange Priority Congestion Node */}
      <FloatingHotspotSphere
        position={[2.6, 5.8, 2.8]}
        color="#FF6B4A"
        speed={1.5}
        floatIntensity={2.0}
        size={0.3}
      />
      {/* Center Background Ambient Node */}
      <FloatingHotspotSphere
        position={[0.2, 5.0, -2.5]}
        color="#3ED6C8"
        speed={1.2}
        floatIntensity={1.2}
        size={0.22}
      />
    </group>
  );
}

// Floating, gently pulsing sphere representing urban parking hotspot markers
interface FloatingHotspotSphereProps {
  position: [number, number, number];
  color: string;
  speed?: number;
  floatIntensity?: number;
  size?: number;
}

function FloatingHotspotSphere({
  position,
  color,
  speed = 1.5,
  floatIntensity = 1.5,
  size = 0.28,
}: FloatingHotspotSphereProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowHaloRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);

  // Smooth pulsing and soft outer glow animation
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const pulse = Math.sin(t * 2.4 + position[0] * 2) * 0.15 + 1;
    const waveProgress = ((t * 1.2 + position[1]) % 2) / 2;

    if (meshRef.current) {
      meshRef.current.scale.set(pulse, pulse, pulse);
    }

    if (glowHaloRef.current) {
      const haloScale = 1.35 + Math.sin(t * 2.0 + position[2]) * 0.1;
      glowHaloRef.current.scale.set(haloScale, haloScale, haloScale);
    }

    if (ringRef.current && ringRef.current.material) {
      const ringScale = 1 + waveProgress * 2.2;
      ringRef.current.scale.set(ringScale, ringScale, ringScale);
      const ringMaterial = ringRef.current.material as THREE.MeshBasicMaterial;
      if (ringMaterial && typeof ringMaterial.opacity === "number") {
        ringMaterial.opacity = (1 - waveProgress) * 0.5;
      }
    }
  });

  return (
    <Float
      speed={speed} // Weightless antigravity motion
      rotationIntensity={0.4}
      floatIntensity={floatIntensity}
      floatingRange={[0.25, 0.7]}
    >
      <group position={position}>
        {/* Core Glowing Sphere */}
        <mesh ref={meshRef}>
          <sphereGeometry args={[size, 32, 32]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={2.8}
            roughness={0.15}
            metalness={0.85}
          />
        </mesh>

        {/* Soft Outer Glow Halo */}
        <mesh ref={glowHaloRef}>
          <sphereGeometry args={[size * 1.5, 32, 32]} />
          <meshBasicMaterial
            color={color}
            transparent
            opacity={0.18}
            side={THREE.BackSide}
          />
        </mesh>

        {/* Ground Radar Wave Ring */}
        <mesh ref={ringRef} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[size * 1.6, size * 1.9, 32]} />
          <meshBasicMaterial
            color={color}
            transparent
            opacity={0.4}
            side={THREE.DoubleSide}
          />
        </mesh>

        {/* Ethereal Vertical Ray */}
        <mesh position={[0, -1.5, 0]}>
          <cylinderGeometry args={[0.012, 0.012, 3.0, 8]} />
          <meshBasicMaterial
            color={color}
            transparent
            opacity={0.2}
          />
        </mesh>
      </group>
    </Float>
  );
}

export default function HeroScene() {
  return (
    <div className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-hidden">
      <Canvas
        camera={{ position: [0, 7.5, 14], fov: 40 }}
        gl={{ antialias: true, alpha: true }}
      >
        {/* Deep dark atmospheric fog blending into #0A0A0F */}
        <fog attach="fog" args={["#0A0A0F", 11, 28]} />

        {/* Ambient base lighting */}
        <ambientLight intensity={0.9} color="#e5e7eb" />

        {/* Dual-Tone Rim Lighting (Teal-Cyan Key Light) */}
        <directionalLight
          position={[14, 16, 8]}
          intensity={2.2}
          color="#3ED6C8"
          castShadow
        />

        {/* Dual-Tone Rim Lighting (Warm Red-Orange Counter Light) */}
        <directionalLight
          position={[-14, 12, -8]}
          intensity={1.6}
          color="#FF6B4A"
        />

        {/* Soft Cosmic / Cybernetic Particles for Depth */}
        <Sparkles
          count={70}
          scale={[25, 15, 25]}
          size={1.6}
          speed={0.3}
          color="#3ED6C8"
          opacity={0.4}
        />
        <Sparkles
          count={40}
          scale={[20, 12, 20]}
          size={1.8}
          speed={0.25}
          color="#FF6B4A"
          opacity={0.35}
        />

        {/* Cityscape & Antigravity Spheres */}
        <Cityscape />

        {/* OrbitControls with rotation disabled to allow subtle auto-rotation without user drag */}
        <OrbitControls
          enableRotate={false}
          enableZoom={false}
          enablePan={false}
        />
      </Canvas>

      {/* Cybernetic Grid Overlay for Texture & Depth */}
      <div className="absolute inset-0 bg-cyber-grid opacity-25 pointer-events-none" />

      {/* Bottom Gradient Fade */}
      <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-background via-background/70 to-transparent pointer-events-none" />
    </div>
  );
}
