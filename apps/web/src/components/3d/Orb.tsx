import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { MeshDistortMaterial, Sphere, Float } from '@react-three/drei';
import * as THREE from 'three';

export function NeuralOrb() {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<any>(null);

  // Animate the orb
  useFrame(({ clock }) => {
    if (materialRef.current) {
      materialRef.current.distort = THREE.MathUtils.lerp(
        materialRef.current.distort,
        0.4 + Math.sin(clock.elapsedTime * 2) * 0.1,
        0.1
      );
    }
    if (meshRef.current) {
      meshRef.current.rotation.x = clock.elapsedTime * 0.1;
      meshRef.current.rotation.y = clock.elapsedTime * 0.15;
    }
  });

  return (
    <Float speed={2} rotationIntensity={1} floatIntensity={2}>
      <Sphere ref={meshRef} args={[1.5, 64, 64]}>
        <MeshDistortMaterial
          ref={materialRef}
          color="#00e5ff"
          emissive="#00e5ff"
          emissiveIntensity={2}
          envMapIntensity={1}
          clearcoat={1}
          clearcoatRoughness={0.1}
          metalness={0.8}
          roughness={0.2}
          distort={0.4}
          speed={3}
          toneMapped={false}
        />
      </Sphere>
      {/* Internal core light */}
      <pointLight color="#00f0ff" intensity={5} distance={10} decay={2} />
      {/* Outer glow */}
      <pointLight color="#3b82f6" intensity={2} distance={20} decay={2} />
    </Float>
  );
}
