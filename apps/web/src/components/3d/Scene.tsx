import { Canvas } from '@react-three/fiber';
import { Environment, EnvironmentProps, PerspectiveCamera } from '@react-three/drei';
import { NeuralOrb } from './Orb';
import { Suspense } from 'react';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';

export function BackgroundScene() {
  return (
    <div className="absolute inset-0 z-0 pointer-events-none select-none">
      <Canvas dpr={[1, 2]} gl={{ antialias: true, alpha: true }}>
        <PerspectiveCamera makeDefault position={[0, 0, 8]} fov={45} />
        
        <color attach="background" args={['#030305']} />
        <fog attach="fog" args={['#030305', 5, 20]} />

        <ambientLight intensity={0.2} />
        <directionalLight position={[10, 10, 5]} intensity={1} color="#00e5ff" />
        <directionalLight position={[-10, -10, -5]} intensity={0.5} color="#2563eb" />

        <Suspense fallback={null}>
          <NeuralOrb />
          <Environment preset="city" />
        </Suspense>

        <EffectComposer>
          <Bloom 
            luminanceThreshold={1} 
            mipmapBlur 
            intensity={1.5} 
            luminanceSmoothing={0.5}
          />
          <Vignette eskil={false} offset={0.1} darkness={1.1} />
        </EffectComposer>
      </Canvas>
    </div>
  );
}
