import { useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Sphere, MeshDistortMaterial, Points, PointMaterial } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import * as THREE from "three";

function ParticleField() {
  const ref = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    const count = 60;
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = 9 + Math.random() * 4;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      arr[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      arr[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      arr[i * 3 + 2] = r * Math.cos(phi);
    }
    return arr;
  }, []);

  useFrame((state) => {
    if (ref.current) ref.current.rotation.y = state.clock.elapsedTime * 0.02;
  });

  return (
    <Points ref={ref} positions={positions} stride={3}>
      <PointMaterial
        transparent
        color="#00e5ff"
        size={0.08}
        sizeAttenuation
        depthWrite={false}
      />
    </Points>
  );
}

function OrbitalRings({ isSimplified }: { isSimplified: boolean }) {
  const a = useRef<THREE.Mesh>(null);
  const b = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (a.current) a.current.rotation.z = t * 0.15;
    if (b.current) b.current.rotation.x = t * 0.1;
  });
  
  // Dramatically reduce segments in simplified mode, and optimize standard segments
  const radialSegments = isSimplified ? 6 : 8;
  const tubularSegments = isSimplified ? 32 : 64; // down from 120

  return (
    <group>
      <mesh ref={a} rotation={[Math.PI / 2.5, 0, 0]}>
        <torusGeometry args={[3.2, 0.01, radialSegments, tubularSegments]} />
        <meshBasicMaterial color="#00e5ff" transparent opacity={0.35} />
      </mesh>
      <mesh ref={b} rotation={[0, Math.PI / 3, Math.PI / 4]}>
        <torusGeometry args={[4, 0.008, radialSegments, tubularSegments]} />
        <meshBasicMaterial color="#3b82f6" transparent opacity={0.25} />
      </mesh>
    </group>
  );
}

function NeuralOrb({ isSimplified }: { isSimplified: boolean }) {
  const matRef = useRef<any>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (matRef.current) matRef.current.distort = 0.35 + Math.sin(t * 1.5) * 0.08;
    if (meshRef.current) meshRef.current.rotation.y = t * 0.1;
  });

  // Reduce sphere segments in simplified mode
  const segments = isSimplified ? 24 : 36; // down from 64

  return (
    <Sphere ref={meshRef} args={[1.2, segments, segments]} position={[0, 0, -6]}>
      <MeshDistortMaterial
        ref={matRef}
        color="#001a1f"
        emissive="#00e5ff"
        emissiveIntensity={isSimplified ? 0.75 : 0.3} // Boost emissive visibility if Bloom is off
        distort={0.35}
        speed={2}
        metalness={0.9}
        roughness={0.05}
      />
    </Sphere>
  );
}

function PulsingPointLight() {
  const ref = useRef<THREE.PointLight>(null);
  useFrame((state) => {
    if (ref.current)
      ref.current.intensity = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.5;
  });
  return <pointLight ref={ref} position={[0, 0, 3]} color="#a78bfa" intensity={1} />;
}

function CameraRig() {
  const { camera, pointer } = useThree();
  useFrame(() => {
    camera.position.x = THREE.MathUtils.lerp(camera.position.x, pointer.x * 1.2, 0.05);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, pointer.y * 1.2, 0.05);
    camera.lookAt(0, 0, 0);
  });
  return null;
}

export default function ThreeScene({ isSimplified = false }: { isSimplified?: boolean }) {
  // Limit max DPR to 1.3 (down from 1.8) on normal devices, and 1.0 on simplified devices
  const dprValue: [number, number] = isSimplified ? [1, 1] : [1, 1.3];

  return (
    <Canvas
      frameloop="always"
      camera={{ position: [0, 0, 10], fov: 50 }}
      dpr={dprValue}
      gl={{ 
        antialias: !isSimplified, 
        alpha: false,
        powerPreference: "high-performance"
      }}
    >
      <color attach="background" args={["#030305"]} />
      <fog attach="fog" args={["#030305", 8, 22]} />
      <ambientLight intensity={isSimplified ? 0.25 : 0.15} />
      <directionalLight position={[5, 5, 5]} color="#00e5ff" intensity={isSimplified ? 1.5 : 1.2} />
      <directionalLight position={[-5, -5, 2]} color="#3b82f6" intensity={0.6} />
      <PulsingPointLight />
      <NeuralOrb isSimplified={isSimplified} />
      <OrbitalRings isSimplified={isSimplified} />
      <ParticleField />
      <CameraRig />
      {!isSimplified && (
        <EffectComposer>
          <Bloom mipmapBlur intensity={0.85} luminanceThreshold={0.75} />
          <Vignette darkness={0.9} eskil={false} />
        </EffectComposer>
      )}
    </Canvas>
  );
}
