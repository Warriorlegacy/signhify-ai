import { Canvas } from "@react-three/fiber";
import { PerspectiveCamera, AdaptiveDpr } from "@react-three/drei";
import { NeuralOrb } from "./Orb";
import { Suspense, useRef, useState, useEffect } from "react";
import {
  EffectComposer,
  Bloom,
  Vignette,
  ChromaticAberration,
} from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";
import { Vector2 } from "three";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

function CameraRig() {
  const cameraRef = useRef<THREE.PerspectiveCamera>(null);

  useFrame(({ pointer, camera }) => {
    camera.position.x = THREE.MathUtils.lerp(
      camera.position.x,
      pointer.x * 0.5,
      0.02,
    );
    camera.position.y = THREE.MathUtils.lerp(
      camera.position.y,
      pointer.y * 0.3,
      0.02,
    );
    camera.lookAt(0, 0, 0);
  });

  return null;
}

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
      // Simple heuristic for low-end devices
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

  // Show simple CSS background for low-perf devices
  if (isLowPerf || !shouldRender) {
    return <LoadingFallback />;
  }

  return (
    <div className="absolute inset-0 z-0 pointer-events-none select-none">
      <Canvas
        dpr={[1, 1.2]}
        gl={{
          antialias: false,
          alpha: true,
          powerPreference: "default",
          failIfMajorPerformanceCaveat: false,
        }}
        frameloop="always"
      >
        <AdaptiveDpr pixelated />
        <PerspectiveCamera makeDefault position={[0, 0, 9]} fov={42} />
        <CameraRig />

        <color attach="background" args={["#030305"]} />
        <fog attach="fog" args={["#030305", 8, 22]} />

        <ambientLight intensity={0.1} />
        <directionalLight
          position={[8, 8, 4]}
          intensity={1.2}
          color="#00e5ff"
        />
        <directionalLight
          position={[-8, -4, -6]}
          intensity={0.6}
          color="#3b82f6"
        />
        <pointLight
          position={[0, -4, 2]}
          intensity={1}
          color="#a78bfa"
          distance={15}
        />

        <Suspense fallback={null}>
          <NeuralOrb />
        </Suspense>

        <EffectComposer>
          <Bloom
            luminanceThreshold={0.6}
            mipmapBlur
            intensity={1.5}
            luminanceSmoothing={0.4}
            radius={0.6}
          />
          <Vignette eskil={false} offset={0.15} darkness={0.9} />
        </EffectComposer>
      </Canvas>
    </div>
  );
}
