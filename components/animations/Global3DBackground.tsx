"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useCursorParallax } from "@/hooks/useCursorParallax";
import { useWebGLSupported } from "@/hooks/useWebGLSupported";

type Global3DBackgroundProps = {
  primary: string;
  secondary: string;
  enabled: boolean;
};

export default function Global3DBackground({ primary, secondary, enabled }: Global3DBackgroundProps) {
  const webgl = useWebGLSupported();

  if (!enabled || webgl === false) {
    return <div className="pointer-events-none fixed inset-0 z-0 bg-animated-fallback" aria-hidden />;
  }

  return (
    <div className="pointer-events-none fixed inset-0 z-0 opacity-80" aria-hidden>
      <Canvas camera={{ position: [0, 0, 8], fov: 45 }} dpr={1} gl={{ antialias: false, powerPreference: "high-performance" }}>
        <ambientLight intensity={0.6} />
        <ParticleField primary={primary} secondary={secondary} />
      </Canvas>
    </div>
  );
}

function ParticleField({ primary, secondary }: { primary: string; secondary: string }) {
  const points = useRef<THREE.Points>(null);
  const cursor = useCursorParallax(true);
  const eased = useRef({ x: 0, y: 0 });
  const primaryColor = useMemo(() => new THREE.Color(primary), [primary]);
  const secondaryColor = useMemo(() => new THREE.Color(secondary), [secondary]);
  const particleCount = 320;

  const { positions, colors, sizes } = useMemo(() => {
    const nextPositions = new Float32Array(particleCount * 3);
    const nextColors = new Float32Array(particleCount * 3);
    const nextSizes = new Float32Array(particleCount);

    for (let index = 0; index < particleCount; index += 1) {
      const i = index * 3;
      nextPositions[i] = (Math.random() - 0.5) * 14;
      nextPositions[i + 1] = (Math.random() - 0.5) * 8;
      nextPositions[i + 2] = (Math.random() - 0.5) * 5;
      const mix = index / particleCount;
      const color = primaryColor.clone().lerp(secondaryColor, mix);
      nextColors[i] = color.r;
      nextColors[i + 1] = color.g;
      nextColors[i + 2] = color.b;
      nextSizes[index] = 0.025 + Math.random() * 0.035;
    }

    return { positions: nextPositions, colors: nextColors, sizes: nextSizes };
  }, [primaryColor, secondaryColor]);

  useFrame(({ clock }) => {
    if (!points.current) {
      return;
    }

    eased.current.x += (cursor.current.x - eased.current.x) * 0.06;
    eased.current.y += (cursor.current.y - eased.current.y) * 0.06;
    points.current.rotation.y = eased.current.x * 0.08 + clock.elapsedTime * 0.015;
    points.current.rotation.x = -eased.current.y * 0.05;
    points.current.position.x = eased.current.x * 0.18;
    points.current.position.y = -eased.current.y * 0.12;
  });

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
        <bufferAttribute attach="attributes-size" args={[sizes, 1]} />
      </bufferGeometry>
      <pointsMaterial vertexColors size={0.04} sizeAttenuation transparent opacity={0.72} depthWrite={false} blending={THREE.AdditiveBlending} />
    </points>
  );
}
