"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Float, MeshDistortMaterial, Sparkles } from "@react-three/drei";
import { useRef } from "react";
import * as THREE from "three";
import { useCursorParallax } from "@/hooks/useCursorParallax";
import { useWebGLSupported } from "@/hooks/useWebGLSupported";

type Hero3DSceneProps = {
  primary: string;
  secondary: string;
  enabled: boolean;
};

export default function Hero3DScene({ primary, secondary, enabled }: Hero3DSceneProps) {
  const webgl = useWebGLSupported();

  if (!enabled || webgl !== true) {
    return <div className="hero-3d-fallback" aria-hidden />;
  }

  return (
    <Canvas camera={{ position: [0, 0, 7], fov: 42 }} dpr={[1, 1.25]} gl={{ antialias: false, powerPreference: "high-performance" }}>
      <ambientLight intensity={0.9} />
      <directionalLight position={[4, 4, 4]} intensity={1.4} />
      <HeroObjects primary={primary} secondary={secondary} />
    </Canvas>
  );
}

function HeroObjects({ primary, secondary }: { primary: string; secondary: string }) {
  const group = useRef<THREE.Group>(null);
  const cursor = useCursorParallax(true);
  const eased = useRef({ x: 0, y: 0 });

  useFrame(({ clock }) => {
    if (!group.current) {
      return;
    }

    eased.current.x += (cursor.current.x - eased.current.x) * 0.07;
    eased.current.y += (cursor.current.y - eased.current.y) * 0.07;
    group.current.rotation.y = eased.current.x * 0.11 + Math.sin(clock.elapsedTime * 0.25) * 0.04;
    group.current.rotation.x = -eased.current.y * 0.08;
    group.current.position.x = eased.current.x * 0.22;
    group.current.position.y = -eased.current.y * 0.12;
  });

  return (
    <group ref={group}>
      <Sparkles count={28} scale={[6, 3.8, 2]} size={2} speed={0.14} color={secondary} opacity={0.48} />
      <Float speed={0.75} rotationIntensity={0.35} floatIntensity={0.6}>
        <mesh position={[-1.2, 0.35, 0]} rotation={[0.45, 0.2, 0.25]}>
          <icosahedronGeometry args={[1.2, 1]} />
          <MeshDistortMaterial color={primary} roughness={0.35} metalness={0.35} distort={0.22} speed={0.8} transparent opacity={0.42} />
        </mesh>
      </Float>
      <Float speed={0.6} rotationIntensity={0.28} floatIntensity={0.45}>
        <mesh position={[1.45, -0.55, -0.55]} rotation={[0.3, 0.8, 0.15]}>
          <torusKnotGeometry args={[0.62, 0.16, 56, 8]} />
          <meshStandardMaterial color={secondary} roughness={0.28} metalness={0.6} transparent opacity={0.52} />
        </mesh>
      </Float>
      <Float speed={0.55} rotationIntensity={0.2} floatIntensity={0.35}>
        <mesh position={[0.6, 0.85, -1.2]} rotation={[0.5, 0.1, 0.9]}>
          <octahedronGeometry args={[0.54, 1]} />
          <meshStandardMaterial color="#ffffff" emissive={primary} emissiveIntensity={0.22} roughness={0.2} metalness={0.45} transparent opacity={0.45} />
        </mesh>
      </Float>
    </group>
  );
}
