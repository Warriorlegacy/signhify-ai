import { Canvas } from '@react-three/fiber';
import { PerspectiveCamera, AdaptiveDpr } from '@react-three/drei';
import { NeuralOrb } from './Orb';
import { Suspense, useRef } from 'react';
import { EffectComposer, Bloom, Vignette, ChromaticAberration } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import { Vector2 } from 'three';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

function CameraRig() {
  const cameraRef = useRef<THREE.PerspectiveCamera>(null);

  useFrame(({ pointer, camera }) => {
    camera.position.x = THREE.MathUtils.lerp(camera.position.x, pointer.x * 0.5, 0.02);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, pointer.y * 0.3, 0.02);
    camera.lookAt(0, 0, 0);
  });

  return null;
}

export function BackgroundScene() {
  return (
    <div className="absolute inset-0 z-0 pointer-events-none select-none">
      <Canvas
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      >
        <AdaptiveDpr pixelated />
        <PerspectiveCamera makeDefault position={[0, 0, 9]} fov={42} />
        <CameraRig />

        <color attach="background" args={['#030305']} />
        <fog attach="fog" args={['#030305', 8, 22]} />

        <ambientLight intensity={0.1} />
        <directionalLight position={[8, 8, 4]} intensity={1.2} color="#00e5ff" />
        <directionalLight position={[-8, -4, -6]} intensity={0.6} color="#3b82f6" />
        <pointLight position={[0, -4, 2]} intensity={1} color="#a78bfa" distance={15} />

        <Suspense fallback={null}>
          <NeuralOrb />
        </Suspense>

        <EffectComposer>
          <Bloom
            luminanceThreshold={0.6}
            mipmapBlur
            intensity={2.0}
            luminanceSmoothing={0.4}
            radius={0.6}
          />
          <ChromaticAberration
            blendFunction={BlendFunction.NORMAL}
            offset={new Vector2(0.0008, 0.0008)}
            radialModulation={false}
            modulationOffset={0}
          />
          <Vignette eskil={false} offset={0.15} darkness={0.9} />
        </EffectComposer>
      </Canvas>
    </div>
  );
}
