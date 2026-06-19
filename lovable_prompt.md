# Lovable Master Prompt: Cinematic 3D Immersive Scroll Frontend (Signhify.AI)

Use this highly detailed prompt inside Lovable to build or sync the complete premium landing page and authentication views for Signhify.AI.

---

## 1. Core Technical Stack
* **Framework:** React 19 (TypeScript)
* **Bundler:** Vite
* **Styling:** Tailwind CSS v4 (using vanilla CSS tokens for bespoke styles)
* **Animation:** Framer Motion
* **WebGL/3D Engine:** React Three Fiber (`@react-three/fiber` & `@react-three/drei`)
* **3D Post-Processing:** `@react-three/postprocessing` + `postprocessing`
* **Icons:** Lucide React

---

## 2. Global Styling & Design Tokens (Tailwind v4 / Custom CSS)
Implement a cohesive dark obsidian palette with vibrant cyan and neon accents:
```css
/* Color Palette */
--color-obsidian: #030305;      /* Deepest dark background */
--color-carbon: #06060a;        /* Panel backing */
--color-graphite: #0d0d14;      /* Card backgrounds */
--color-border: #1e1e2e;        /* Subtle divider borders */
--color-cyan-teal: #00e5ff;     /* Active glows & primary icons */
--color-lucid-aqua: #08d9d6;    /* Secondary neon */
--color-ion-blue: #3b82f6;      /* Secondary highlights */

/* Typography */
--font-display: "Space Grotesk", system-ui, sans-serif;
--font-body: "Inter", system-ui, sans-serif;
--font-mono: "JetBrains Mono", monospace;
```

### Visual Enhancements:
1. **Glassmorphism Panels (`.glass-panel`):**
   `background: rgba(13, 13, 20, 0.7); backdrop-filter: blur(20px) saturate(1.5); border: 1px solid rgba(30, 30, 46, 0.8);`
2. **Neon Glows:**
   * Text: `text-shadow: 0 0 20px rgba(0, 229, 255, 0.5), 0 0 40px rgba(0, 229, 255, 0.2);`
   * Elements: `box-shadow: 0 0 20px rgba(0, 229, 255, 0.15), 0 0 60px rgba(0, 229, 255, 0.05);`
3. **Smooth Scroll:** Apply `scroll-behavior: smooth` and hide standard browser scrollbars in favor of a slim, custom themed scrollbar.

---

## 3. The 3D Canvas Background (`BackgroundScene` & `NeuralOrb`)
Build an immersive, interactive WebGL backdrop that spans the entire screen behind the content.
* **Canvas Settings:** Set `frameloop="always"` to maintain fluid continuous animation. Enable fog (`#030305`, near=8, far=22).
* **Interactive Camera Rig:** Map pointer mouse movements to slightly adjust the perspective camera position (using `THREE.MathUtils.lerp`) so the scene dynamically rotates when the user moves their cursor.

### Inside the Scene:
1. **Particle Field:** Render a constellation of 60 stars/points distributed spherically, rotating slowly over time (`rotation.y = elapsedTime * 0.02`).
2. **Orbital Rings:** Render two separate `torusGeometry` rings (tilted on different axes) rotating around the center.
3. **Neural Orb (Centerpiece):**
   * A central floating sphere (`Sphere` geometry with 64x64 segments).
   * Material: Use `<MeshDistortMaterial>` with:
     * Color: `#001a1f`
     * Emissive: `#00e5ff` (Intensity: 0.8)
     * Distort: `0.35` (Animate this distortion continuously using `Math.sin(elapsedTime * 1.5) * 0.08` inside the rendering frame).
     * Metalness: 0.9, Roughness: 0.05.
4. **Lighting:**
   * Directional Light 1: `#00e5ff` (intensity: 1.2, top-right).
   * Directional Light 2: `#3b82f6` (intensity: 0.6, bottom-left).
   * Point Light: `#a78bfa` (intensity: 1.0, pulsing).
5. **Post-Processing Composer:** Include a `<Bloom>` filter with `mipmapBlur` (intensity: 1.5, luminanceThreshold: 0.6) and a dark `<Vignette>` (darkness: 0.9) to make the colors feel incredibly punchy and cinematic.

---

## 4. Landing Page Layout & Interactive Components
The layout must be responsive, modern, and utilize Framer Motion for scroll-linked fade-in and scale-up transitions.

### A. Navigation Bar
* A floating header containing the logo: **SIGNHIFY.AI** (with a glowing dot).
* Navigation links: Features, Agents, Open Source.
* Action Button: "Get Started Free" with a micro-shimmer hover effect.

### B. Hero Section
* A glowing pill badge: `"Open source · Self-learning · BYOK — no subscription required"`
* H1 Title: `"Your AI workspace that gets smarter every day."` in bold typography with a cyan gradient.
* Secondary description detailing the 7 specialized agents.
* Main CTA: A large `"START FOR FREE"` button featuring an inline glowing arrow (`lucide/ArrowRight`) and scale-on-hover effects.

### C. Live Command Terminal Component (`CommandPreview`)
A mockup terminal panel showcasing real-time agent workflow logs.
* Outer wrapper has a `.glass-panel` style, simulated window buttons (red, yellow, green), and header `"signhify — command center"`.
* Shows a list of scheduled logs with progress pills for different agents:
  1. **Scout** (`#34d399`): `"Research quantum computing breakthroughs 2025"`
  2. **Scribe** (`#a78bfa`): `"Write a technical blog post about the findings"`
  3. **Forge** (`#f59e0b`): `"Generate Python code for data visualization"`
  4. **Vault** (`#fb7185`): `"Save key insights to memory vault"`
* Each row features a custom agent avatar (matching the agent's color) and an active flashing pulse indicator.

### D. Features Grid
A 3-column grid showcasing feature cards (Self-Learning, Memory, Multi-Provider, Multi-Channel, Scheduler, Open Source).
* Use Framer Motion `whileInView` animation.
* Each card must lift slightly and display a customized glow border on hover.

### E. The 7-Agent Portal
* A horizontal scroll/wrap list of Agent Pills (Nexus, Scribe, Scout, Forge, Herald, Vault, Vision).
* A detailed grid where each agent has a full card detailing their role and custom avatar (e.g. Nexus routes intent, Scout researches, Forge generates code).

---

## 5. State-Driven Authentication View
The landing page and sign-in page reside on the `/` route, managed smoothly via a React state parameter (`showLanding`).
* When clicking **any** of the "Get Started Free" / "START FOR FREE" buttons on the landing page, execute the callback `onGetStarted` which toggles `showLanding` to `false` with a sliding fade transition.
* **Authentication Form Card:**
  * Displays a gorgeous `.glass-panel` login interface.
  * Inputs: Email and Password with custom `.input-base` styles (cyan rings and glows on focus).
  * State Toggles: Switch seamlessly between "Welcome back / Sign In" and "Create your workspace / Create Account".
  * Shimmer Action Button: "SIGN IN" with a loading state spinner.
  * Footer Button: "← Back to home" which toggles `showLanding` back to `true`.
