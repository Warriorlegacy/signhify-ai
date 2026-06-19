import { lazy, Suspense, useEffect, useState } from "react";

const ThreeScene = lazy(() => import("./ThreeScene"));

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
      if (renderer && (renderer.includes("SwiftShader") || renderer.includes("llvmpipe"))) {
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
    <div className="absolute inset-0 z-0 pointer-events-none select-none bg-obsidian">
      <Suspense fallback={<LoadingFallback />}>
        <ThreeScene />
      </Suspense>
    </div>
  );
}
