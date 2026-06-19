import { useMemo, useRef, useState, useEffect, Suspense } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Sphere, MeshDistortMaterial, Points, PointMaterial, AdaptiveDpr } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import * as THREE from "three";

// Particle constellation traces from Lovable
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

// Orbital rings from Lovable
function OrbitalRings() {
  const a = useRef<THREE.Mesh>(null);
  const b = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (a.current) a.current.rotation.z = t * 0.15;
    if (b.current) b.current.rotation.x = t * 0.1;
  });
  return (
    <group>
      <mesh ref={a} rotation={[Math.PI / 2.5, 0, 0]}>
        <torusGeometry args={[3.2, 0.01, 16, 120]} />
        <meshBasicMaterial color="#00e5ff" transparent opacity={0.35} />
      </mesh>
      <mesh ref={b} rotation={[0, Math.PI / 3, Math.PI / 4]}>
        <torusGeometry args={[4, 0.008, 16, 120]} />
        <meshBasicMaterial color="#3b82f6" transparent opacity={0.25} />
      </mesh>
    </group>
  );
}

// Neural orb from Lovable
function NeuralOrb() {
  const matRef = useRef<any>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (matRef.current) matRef.current.distort = 0.35 + Math.sin(t * 1.5) * 0.08;
    if (meshRef.current) meshRef.current.rotation.y = t * 0.1;
  });
  return (
    <Sphere ref={meshRef} args={[1.2, 64, 64]} position={[0, 0, -6]}>
      <MeshDistortMaterial
        ref={matRef}
        color="#001a1f"
        emissive="#00e5ff"
        emissiveIntensity={0.3}
        distort={0.35}
        speed={2}
        metalness={0.9}
        roughness={0.05}
      />
    </Sphere>
  );
}

// Pulsing point light from Lovable
function PulsingPointLight() {
  const ref = useRef<THREE.PointLight>(null);
  useFrame((state) => {
    if (ref.current)
      ref.current.intensity = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.5;
  });
  return <pointLight ref={ref} position={[0, 0, 3]} color="#a78bfa" intensity={1} />;
}

// Camera rig from Lovable
function CameraRig() {
  const { camera, pointer } = useThree();
  useFrame(() => {
    camera.position.x = THREE.MathUtils.lerp(camera.position.x, pointer.x * 1.2, 0.05);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, pointer.y * 1.2, 0.05);
    camera.lookAt(0, 0, 0);
  });
  return null;
}

// Fallback background for low-performance devices
function LoadingFallback() {
  return (
    <div className="absolute inset-0 z-0 pointer-events-none select-none bg-obsidian">
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(0, 229, 255, 0.03) 0%, transparent 70%)",
        }}
      />
    </div>
  );
}

// Main background component that preserves device checks and delays
export function BackgroundScene() {
  const [shouldRender, setShouldRender] = useState(false);
  const [isLowPerf, setIsLowPerf] = useState(false);

  useEffect(() => {
    // Check device performance
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl") || canvas.getContext("webgl2");

    if (!gl) {
      setIsLowPerf(true);
      return;
    }

    // Check for low-end devices
    const debugInfo = gl.getExtension("WEBGL_debug_renderer_info");
    if (debugInfo) {
      const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
      if (renderer.includes("SwiftShader") || renderer.includes("llvmpipe")) {
        setIsLowPerf(true);
      }
    }

    // Delay rendering to avoid blocking initial paint
    const timer = setTimeout(() => {
      setShouldRender(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  if (isLowPerf || !shouldRender) {
    return <LoadingFallback />;
  }

  return (
    <div className="absolute inset-0 z-0 pointer-events-none select-none">
      <Canvas
        frameloop="always"
        camera={{ position: [0, 0, 10], fov: 50 }}
        dpr={[1, 1.8]}
        gl={{ antialias: true, alpha: false }}
      >
        <AdaptiveDpr pixelated />
        <color attach="background" args={["#030305"]} />
        <fog attach="fog" args={["#030305", 8, 22]} />

        <ambientLight intensity={0.15} />
        <directionalLight position={[5, 5, 5]} color="#00e5ff" intensity={1.2} />
        <directionalLight position={[-5, -5, 2]} color="#3b82f6" intensity={0.6} />
        <PulsingPointLight />

        <Suspense fallback={null}>
          <NeuralOrb />
          <OrbitalRings />
          <ParticleField />
        </Suspense>

        <CameraRig />

        <EffectComposer>
          <Bloom mipmapBlur intensity={0.85} luminanceThreshold={0.75} />
          <Vignette darkness={0.9} eskil={false} />
        </EffectComposer>
      </Canvas>
    </div>
  );
}
