import { useRef, useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { MeshDistortMaterial, Sphere, Float } from "@react-three/drei";
import * as THREE from "three";

// Particle constellation traces - reduced count
function ParticleField() {
  const pointsRef = useRef<THREE.Points>(null);
  const count = 60; // Reduced from 180

  const { positions } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = 4 + Math.random() * 8;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);
    }
    return { positions };
  }, []);

  useFrame(({ clock }) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = clock.elapsedTime * 0.02;
    }
  });

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return geo;
  }, [positions]);

  return (
    <points ref={pointsRef} geometry={geometry}>
      <pointsMaterial
        color="#00e5ff"
        size={0.04}
        sizeAttenuation
        transparent
        opacity={0.5}
        fog={false}
      />
    </points>
  );
}

// Ring orbiting the orb - simplified
function OrbRing({
  radius,
  speed,
  tilt,
}: {
  radius: number;
  speed: number;
  tilt: number;
}) {
  const ringRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (ringRef.current) {
      ringRef.current.rotation.z = clock.elapsedTime * speed;
      ringRef.current.rotation.x = tilt;
    }
  });

  return (
    <mesh ref={ringRef}>
      <torusGeometry args={[radius, 0.008, 6, 60]} /> {/* Reduced segments */}
      <meshBasicMaterial color="#00e5ff" transparent opacity={0.15} />
    </mesh>
  );
}

// Inner glow sphere
function GlowSphere() {
  const ref = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (ref.current) {
      const mat = ref.current.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.06 + Math.sin(clock.elapsedTime * 2.5) * 0.03;
    }
  });

  return (
    <mesh ref={ref}>
      <sphereGeometry args={[2.2, 24, 24]} /> {/* Reduced from 32x32 */}
      <meshBasicMaterial
        color="#00e5ff"
        transparent
        opacity={0.06}
        side={THREE.BackSide}
      />
    </mesh>
  );
}

export function NeuralOrb() {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<any>(null);

  useFrame(({ clock, pointer }) => {
    if (materialRef.current) {
      materialRef.current.distort = THREE.MathUtils.lerp(
        materialRef.current.distort,
        0.35 + Math.sin(clock.elapsedTime * 1.5) * 0.08,
        0.05,
      );
    }
    if (meshRef.current) {
      meshRef.current.rotation.y = THREE.MathUtils.lerp(
        meshRef.current.rotation.y,
        pointer.x * 0.3 + clock.elapsedTime * 0.08,
        0.02,
      );
      meshRef.current.rotation.x = THREE.MathUtils.lerp(
        meshRef.current.rotation.x,
        pointer.y * -0.2 + clock.elapsedTime * 0.05,
        0.02,
      );
    }
  });

  return (
    <>
      <ParticleField />
      <OrbRing radius={2.6} speed={0.3} tilt={0.8} />
      <OrbRing radius={3.2} speed={-0.2} tilt={1.3} />

      <Float speed={1.5} rotationIntensity={0.3} floatIntensity={0.8}>
        <GlowSphere />
        <Sphere ref={meshRef} args={[1.5, 64, 64]}>
          {" "}
          {/* Reduced from 128x128 */}
          <MeshDistortMaterial
            ref={materialRef}
            color="#001a1f"
            emissive="#00e5ff"
            emissiveIntensity={0.8}
            envMapIntensity={1.5}
            clearcoat={1}
            clearcoatRoughness={0}
            metalness={0.9}
            roughness={0.05}
            distort={0.35}
            speed={2}
            toneMapped={false}
          />
        </Sphere>
        <pointLight color="#00f0ff" intensity={8} distance={8} decay={2} />
        <pointLight color="#0a4cff" intensity={3} distance={18} decay={2} />
      </Float>
    </>
  );
}
