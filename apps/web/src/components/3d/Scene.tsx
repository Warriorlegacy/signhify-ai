import { lazy, Suspense, useEffect, useState } from "react";

const ThreeScene = lazy(() => import("./ThreeScene"));

function LoadingFallback() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none select-none bg-obsidian">
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
  const [isSimplified, setIsSimplified] = useState(false);

  useEffect(() => {
    // Check if device is mobile or tablet to avoid high GPU/memory cost of WebGL + postprocessing
    const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    ) || window.innerWidth < 768;

    if (isMobileDevice) {
      setIsLowPerf(true);
      return;
    }

    // Check device performance
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl") || canvas.getContext("webgl2");

    if (!gl) {
      setIsLowPerf(true);
      return;
    }

    // Check for low-end or integrated devices
    const debugInfo = gl.getExtension("WEBGL_debug_renderer_info");
    if (debugInfo) {
      const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
      if (renderer) {
        if (renderer.includes("SwiftShader") || renderer.includes("llvmpipe")) {
          setIsLowPerf(true);
          return;
        }
        // Run in simplified mode (no Bloom/Vignette, lower segments) on integrated graphics cards
        if (
          renderer.includes("Intel") ||
          renderer.includes("HD Graphics") ||
          renderer.includes("UHD") ||
          renderer.includes("Iris") ||
          (renderer.includes("AMD") && renderer.includes("Radeon") && !renderer.includes("Pro"))
        ) {
          setIsSimplified(true);
        }
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
    <div className="fixed inset-0 z-0 pointer-events-none select-none bg-obsidian">
      <Suspense fallback={<LoadingFallback />}>
        <ThreeScene isSimplified={isSimplified} />
      </Suspense>
    </div>
  );
}
