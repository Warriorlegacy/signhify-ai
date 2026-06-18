# Signhify AI — Complete 3D Immersive UI/UX Design Prompt

> **Product:** Signhify AI  
> **Document Type:** Master UI/UX Design Prompt  
> **Version:** 1.0 — June 2026  
> **Use With:** Claude, ChatGPT, v0, Lovable, Replit AI, Figma AI, Cursor, Bolt.new, or any code/design generator  

---

## HOW TO USE THIS PROMPT

Paste the full content of **Section A (Master Prompt)** directly into your AI design tool or code generator. Use **Section B (Compressed Prompt)** for tools with token limits. Use **Section C (Stack-Specific Variants)** when targeting a specific framework or tool.

---

# SECTION A — MASTER PROMPT (FULL)

---

Design and generate a highly immersive, premium, modern, dopamine-inducing 3D web app UI/UX/GUI for a product called **Signhify AI**.

---

## PRODUCT CONTEXT

Signhify AI is a next-generation, voice-first, multi-agent AI workspace built for execution — not just chat. It helps users write, research, automate tasks, manage notes, generate code, communicate, and orchestrate specialized AI agents, all from one unified command center. It should feel like a premium fusion of an AI operating system, a cinematic sci-fi productivity suite, and a luxury software product. The experience must feel expensive, addictive, futuristic, fluid, and emotionally rewarding — but still highly usable and production-ready.

---

## IMPORTANT POSITIONING

- This must **NOT** look like a generic AI SaaS template.
- This must **NOT** feel like a clone of any existing product.
- Do **NOT** use overused "purple gradient AI slop" aesthetics.
- Do **NOT** make it look like a dashboard made from standard cards only.
- The result should feel **original, iconic, branded, premium, and deeply interactive**.

---

## CORE BRAND ESSENCE

| Attribute | Value |
|-----------|-------|
| Brand name | Signhify AI |
| Brand feeling | intelligent, elite, cinematic, neural, ambient, kinetic, premium |
| Emotional effect | awe, control, clarity, power, momentum, curiosity |
| Product personality | a living AI command center |
| Tone | calm confidence, sharp intelligence, luxury technology |
| Experience mantra | *"Type less. Orchestrate more."* |

---

## VISUAL DIRECTION

Create a rich, immersive visual system with:

- High-end futuristic interface design
- 3D spatial depth
- Layered glassmorphism used tastefully, not excessively
- Neural energy motifs
- Elegant motion design
- Dynamic lighting
- Subtle reflections
- Premium material surfaces
- Cinematic contrast
- Highly polished micro-interactions
- Rich visual hierarchy
- Deep focus on delight and "dopamine loops"

---

## AESTHETIC INSPIRATION

Blend the feeling of:

- A luxury AI operating system
- A premium cinematic cockpit UI
- A futuristic mission control center
- High-fashion technology product design
- Advanced 3D web experiences
- Modern spatial computing interfaces
- Next-gen productivity software

---

## STYLE GOALS

- Sophisticated, dark, luminous interface
- Ambient premium lighting
- Depth-rich surfaces
- Floating layers with parallax
- Living gradients that feel controlled and elegant
- Holographic restraint — not visual chaos
- Strong compositional rhythm
- Visually memorable signature moments
- Every screen should feel **"launch trailer ready"**

---

## COLOR SYSTEM

Create an original premium palette for Signhify AI:

| Role | Color Direction |
|------|----------------|
| Dominant background | Deep obsidian / carbon black / graphite navy |
| Primary accent | Electric cyan-teal or lucid aqua |
| Secondary accent | Ion blue / cool silver |
| Tertiary accent | Controlled amber or soft plasma gold (for dopamine highlights) |
| Success | Emerald green |
| Error | Coral-red |
| Secondary UI | Muted steel |

**Color behavior rules:**
- Background: near-black layered with blue-black undertones
- Surface 1: smoked graphite glass
- Surface 2: translucent midnight panels
- Accent glow: soft cyan aura
- Reward moments: brief amber pulses or gold traces
- Text: cool white, silver-gray, muted slate
- Use gradients sparingly and intentionally
- Avoid childish saturation
- Avoid rainbow interfaces
- Use color as hierarchy and reward, not decoration

**Suggested CSS tokens:**
```css
--color-bg:           #09090f;
--color-surface:      #0f1018;
--color-surface-2:    #14151f;
--color-glass:        rgba(255,255,255,0.04);
--color-border:       rgba(255,255,255,0.07);
--color-accent:       #00d4e8;
--color-accent-glow:  rgba(0,212,232,0.15);
--color-gold:         #f0b429;
--color-gold-glow:    rgba(240,180,41,0.12);
--color-text:         #e8eaf0;
--color-text-muted:   #7a7d8c;
--color-text-faint:   #3a3d4c;
--color-success:      #22c55e;
--color-error:        #f43f5e;
```

---

## TYPOGRAPHY

Use a premium type system:

| Level | Style | Feeling |
|-------|-------|---------|
| Display | futuristic, elegant, high-end editorial-tech | cinematic and precise |
| Body | clean, highly legible, modern sans | neutral and trustworthy |
| Labels | uppercase microcopy with tracking | instrument panel precision |
| Code | monospace, clean | terminal authenticity |

**Rules:**
- Display font: sharp, narrow, controlled, spatial
- Body font: neutral, clean, readable
- Labels: uppercase with wide letter-spacing
- Avoid playful rounded fonts
- Avoid generic startup typography with no identity
- Mix command-center precision with luxury-brand refinement

**Suggested pairings:**
- Display: `Neue Machina`, `Cabinet Grotesk`, `Zodiak`, or `Monument Grotesk`
- Body: `Satoshi`, `General Sans`, `Inter`
- Code: `JetBrains Mono`, `Geist Mono`

---

## 3D / IMMERSIVE LAYER

The UI must include tasteful 3D immersion:

- Floating orb / neural core / energy sphere / agent nucleus in hero or center stage
- Subtle 3D scene depth behind the main interface
- Motion-reactive lighting and parallax
- Mouse-responsive camera drift
- Layered depth planes
- Volumetric glow or fog accents
- Translucent panels floating over a living scene
- Soft glass reflections
- Reactive particles or constellation-like signal traces
- Subtle real-time visual feedback when user interacts
- Immersive but still performant

**The 3D layer should feel like:**
- An intelligent neural core powering the app
- An ambient intelligence engine
- A live command environment
- NOT a video game HUD
- NOT an overcomplicated cyberpunk mess

**Implementation approach:**
- Use Three.js or React Three Fiber for the 3D scene
- Central floating sphere with procedural noise displacement
- Particle system forming a loose neural constellation
- Ambient occlusion and bloom post-processing
- Mouse parallax tilting the entire depth stack
- Dynamic point lights that shift with user activity
- 30–60 fps performance target on modern laptops

---

## LAYOUT SYSTEM

Design a complete web app experience, not just a hero section.

**Required layout areas:**

1. Landing / hero experience
2. Main app dashboard
3. Multi-agent workspace
4. Voice interaction state
5. Thread / conversation interface
6. Memory / notes panel
7. Research / citations panel
8. Settings / model configuration
9. Team / shared workspace view
10. Empty states, loading states, and success states

---

## PAGE 1 — LANDING EXPERIENCE

The landing page should feel like a cinematic product reveal:

- Bold hero statement
- Immersive 3D centerpiece (neural sphere or agent constellation)
- Live UI preview embedded into hero section
- Animated proof of multi-agent orchestration
- Trust-building but premium social proof section
- Sections with motion, depth, and storytelling
- NOT generic "features in 3 columns"
- Premium CTA section
- A "see it think → route → execute" story flow section

**Hero copy direction:**
```
"Type less. Orchestrate more."
"One command. A team of AI agents moves."
"Your workspace, upgraded into a living intelligence layer."
```

**Landing page section flow:**
1. Hero — statement + 3D centerpiece + embedded app preview
2. Proof — "see it work" animated orchestration demo
3. Agents — introduce the agent roster with premium visual identity
4. Features — immersive, non-template layout with asymmetric composition
5. Memory / knowledge — vault metaphor, elegant and intelligent
6. Voice — show the voice interaction experience
7. Social proof — minimal, premium, credible
8. CTA — dramatic, confident, irreplaceable

---

## PAGE 2 — APP DASHBOARD

Create a premium main dashboard with:

- Left navigation rail (icon-first, expandable)
- Central command canvas (primary workspace)
- Right intelligence panel (context, memory, citations)
- Floating top status bar (agent health, session info)
- Active workspace context indicator
- Agent status pod cluster
- Recent tasks feed
- Memory health visualization
- Usage insights widget
- Quick actions toolbar
- Deep visual hierarchy

**The dashboard should feel like:**
- A command center
- A premium AI workstation
- Elegant, not cluttered
- Spatial, not flat
- Focused, not noisy

**Grid composition:**
```
┌──────────────────────────────────────────────────────────────┐
│                 TOP STATUS BAR (translucent)                 │
├────┬─────────────────────────────────────┬───────────────────┤
│    │                                     │                   │
│ N  │         COMMAND CANVAS              │  INTELLIGENCE     │
│ A  │     (Chat + Agent Workspace)        │     PANEL         │
│ V  │                                     │ (Memory/Research/ │
│    │                                     │  Citations)       │
│    │                                     │                   │
├────┴─────────────────────────────────────┴───────────────────┤
│              AGENT ACTIVITY STRIP (bottom)                   │
└──────────────────────────────────────────────────────────────┘
```

---

## MULTI-AGENT EXPERIENCE

Represent multiple agents visually in a beautiful, premium way.

**Agent roster and visual identity:**

| Agent | Role | Visual Signature |
|-------|------|-----------------|
| **Nexus** | Orchestrator / Router | Crystalline blue-white core, radiates signal lines |
| **Scribe** | Writing & Documents | Warm silver, elegant ink-trace animation |
| **Scout** | Research & Web | Electric teal, scanning pulse motion |
| **Forge** | Code & Terminal | Deep cyan, circuit-trace glow |
| **Herald** | Email & Communication | Soft amber, signal wave |
| **Vault** | Memory & Notes | Cool emerald, layered depth shimmer |
| **Vision** | Image & OCR | Prismatic lens flare, soft spectrum |

**Each agent tile should include:**
- Unique visual identity mark
- Signature color aura / glow
- Live status pulse (idle, active, busy, completed)
- Hover detail revealing capability summary
- Activation animation (node lights up, radiates brief pulse)
- A sense of "specialization" and intelligence

**Orchestration visualization:**
- Show agent routing as animated connection lines
- Tasks visually moving between agents
- Parallel execution with simultaneous active states
- Merged results converging into output stream
- Visible orchestration flow graph (optional drawer/panel)
- Progressive timeline showing task completion steps

---

## VOICE EXPERIENCE

Create a voice-first interaction mode with:

- Full-screen or modal immersive listening state
- Waveform or volumetric audio visualizer (organic, not cheap equalizer)
- Subtle reactive concentric rings or emanating pulses
- Ambient glow shift when listening
- Smooth state transitions:

```
● IDLE     → faint pulse, ready indicator
● LISTENING → expanding rings, waveform live, cyan glow
● TRANSCRIBING → text stream appearing, reduced rings
● THINKING → slow orbit, internal processing shimmer
● ROUTING  → agent tiles lighting up in sequence
● RESPONDING → streamed output with voice TTS visual
```

**Feels like:**
- Magical and trustworthy
- Calm intelligence, not excited UI chaos
- Premium microphone moment — like a high-end product reveal
- NOT neon equalizer spam
- NOT flashy for its own sake

---

## CHAT / THREAD EXPERIENCE

Design the conversation interface as a premium AI workspace:

- Elegant message panels with depth and clear role differentiation:
  - User message: right-aligned, glass panel, white text
  - Agent message: left-aligned, surface panel, agent color accent
  - System message: centered, muted, italic
- Beautiful streaming state (token-by-token with cursor pulse)
- Agent identity tag above each response (which agent answered)
- Citations and references displayed as elegant source cards
- Inline tool cards for executed actions (file created, email sent, code generated)
- Collapsible reasoning trace or action timeline
- Follow-up suggestion chips below responses
- Conversation thread timeline on left sidebar
- Rich output formats: prose, code blocks, tables, lists — all premium styled

---

## MEMORY / NOTES PANEL

Design a luxurious knowledge management experience:

- Semantic note cards with tags and smart summaries
- Graph-like memory cluster visualization (optional hover reveal)
- Pinned and recent items
- Collections / folders with depth
- Full-text search with live filtering
- Rich card previews with hover expand
- Visual hint of vector intelligence (subtle spatial layout)
- "Knowledge Vault" feeling — secure, organized, powerful
- Drag to organize, drop to connect

---

## RESEARCH PANEL

Design a right-side research drawer / panel showing:

- Source cards with domain favicon, title, snippet
- Synthesis summary at top
- Confidence or relevance indicator
- Tabs: Web / Docs / Notes / History
- Extracted key facts as chips or highlights
- Citation links mapped to inline text
- Link preview on hover
- Structured evidence blocks for complex research
- Compact / expanded view toggle

---

## SETTINGS EXPERIENCE

Settings should look premium — not a boring form dump.

**Sections:**
- Model routing preferences (which agent uses which model)
- API key vault (BYOK — secure, visual lock state)
- Voice preferences (STT engine, TTS voice, language)
- Memory preferences (retention, auto-save, indexing)
- Appearance (theme, density, accent color)
- Workspace privacy (logging, analytics opt-out)
- Agent behavior tuning (verbosity, style, format)
- Integrations (Gmail, Notion, GitHub, Slack)
- Notifications

**Make settings feel like:**
- Configuring a high-end professional instrument
- Clean, organized, trustworthy, powerful
- Sectioned with elegant category headers
- Inputs styled with glass surfaces and pixel-perfect precision
- Key vault section with visible security UI

---

## TEAM WORKSPACE

Create a collaborative view with:

- Shared agent workspace (same command canvas, team context)
- Team memory pool (shared notes and knowledge)
- Activity feed (who ran what, when)
- Collaborator presence indicators (subtle, elegant)
- Role badges (Admin, Member, Viewer)
- Thread assignment and handoff
- Shared task history
- Comments on threads or agent outputs
- Live presence dots on active panels

---

## MICRO-INTERACTIONS — CRITICAL LAYER

Every interaction must be physically satisfying and emotionally rewarding.

**Required micro-interaction catalog:**

| Interaction | Behavior |
|-------------|----------|
| Button hover | Depth shift + subtle shimmer, border glow up |
| Button click | Brief compression + ripple release |
| Agent activation | Tile pulses, emits signal arc to Nexus |
| Message send | Input collapses smoothly, message enters from bottom |
| Streaming token | Cursor blink → flowing text with subtle opacity stagger |
| Panel open | Spring-eased slide in from edge + blur lift |
| Panel close | Fade + slide out, blur collapses |
| Voice mode on | Interface dims, sphere expands, rings appear |
| Task complete | Gold trace flash on affected panel edge |
| Memory save | Note card drops into vault with satisfying "snap" |
| Error state | Soft coral pulse, message fades in with shake ease |
| Success state | Emerald trace, tick animation, brief upward lift |
| Drag hover | Elevated glass shadow + mild rotation |
| Cursor proximity | Nearby elements drift slightly toward cursor |
| Loading skeleton | Warm directional shimmer pulse |

---

## MOTION SYSTEM

Motion should feel cinematic, responsive, luxurious, physically believable, smooth, and addictive.

**Motion principles:**

- Spring easing (not linear or cubic-bezier only)
- Opacity + blur combination reveals
- Layered stagger for grouped elements
- Parallax depth layers reacting to scroll and mouse
- Gentle camera drift for 3D scene
- Micro-scale transforms (1–3px only, never large jumps)
- Glow transitions on state changes
- Panel elevation physics
- Fluid agent route lines with path animation
- Progressive orchestration timeline reveal

**Timing reference:**

| Type | Duration | Easing |
|------|----------|--------|
| Micro (hover) | 80–150ms | ease-out |
| Component (panel slide) | 200–350ms | spring |
| Macro (page transition) | 400–600ms | spring + blur |
| Ambient (3D idle) | continuous | sine wave |
| Reward (success/gold) | 600–800ms | ease-out |

**Avoid:**
- Excessive spinning
- Random flashing or blinking
- Too many simultaneous animations
- Motion that hurts usability
- Cheap bounce that feels unpolished

---

## COMPONENT SYSTEM

Design a complete, consistent premium component library:

**Navigation:**
- Left navigation rail (icon + label on expand)
- Top status bar
- Breadcrumb with depth indicator
- Tab bar (framed tabs with active underline glow)
- Bottom strip for agent activity

**Input & Controls:**
- Command input (large, floating, glass surface, glowing focus ring)
- Search (live filter, glass, result dropdown)
- Text area (auto-expanding, premium styled)
- Toggle (smooth spring animation)
- Slider (custom track with glow fill)
- Select / dropdown (glass surface, custom option list)
- Checkbox (custom mark with scale animation)
- Radio (custom animated selection)

**Cards & Panels:**
- Glass card (backdrop blur, border glow, elevated shadow)
- Source card (favicon, title, snippet, link)
- Note card (title, preview, tags)
- Agent tile (identity mark, name, status, glow)
- Code block (syntax highlighted, copy action)
- Data widget (stat + trend micro-chart)
- Activity item (avatar, action, time)

**Overlays:**
- Modal (spring entry, blur backdrop, close on escape)
- Drawer (edge slide-in, spring easing)
- Tooltip (hover reveal with arrow, 150ms delay)
- Command palette (spotlight-style, fuzzy search)
- Confirmation dialog (elegant, never jarring)

**Feedback:**
- Skeleton loader (shimmer, matching real layout)
- Progress indicator (linear or radial, premium styled)
- Toast notification (floating, minimal, auto-dismiss)
- Inline error (field-level, coral, specific message)
- Success badge (emerald, animated check)

**AI-Specific:**
- Waveform module (live audio visualizer)
- Streaming cursor (blinking pulse during generation)
- Agent identity chip (small tag with color mark)
- Citation chip (numbered, linkable)
- Reasoning trace (expandable step list)
- Follow-up suggestion chips (horizontal scroll row)

---

## ACCESSIBILITY + USABILITY

Even though this is immersive and premium, it must remain fully usable:

- WCAG 2.1 AA contrast on all text
- Strong information hierarchy — content always readable
- Keyboard-navigable with visible focus rings
- Responsive across laptop and desktop
- Mobile adaptation preserving premium feel
- Clear primary actions — one obvious next step per view
- No over-decorated forms
- Beauty must amplify usability, never compete with it

---

## RESPONSIVE BEHAVIOR

**Desktop ultrawide (2560px+):**
- Expanded three-panel layout
- Full 3D scene visible
- Agent constellation fully rendered

**Laptop (1280–1440px):**
- Standard three-panel layout
- 3D scene scaled down
- All panels visible

**Tablet (768–1024px):**
- Two-panel layout (nav + main)
- Intelligence panel becomes a slide-in drawer
- 3D scene simplified

**Mobile (375–767px):**
- Single panel with bottom tab navigation
- 3D scene reduced to ambient shader background
- Voice button as floating action button (bottom right)
- Sheets replace panels
- Full premium identity maintained with lighter performance load

---

## DESIGN SYSTEM DELIVERABLES

Generate all of the following:

1. Landing page (full scroll)
2. Dashboard UI (authenticated home)
3. Multi-agent workspace (agent grid + orchestration view)
4. Voice interaction state (full listening/responding mode)
5. Chat/thread interface (active conversation)
6. Memory/notes panel (full state)
7. Research citations panel
8. Settings screen (full view)
9. Team workspace view
10. Component system preview sheet
11. Empty states (for chat, notes, research)
12. Loading states (skeleton + animated)
13. Error states
14. Onboarding flow (3-step setup wizard)

---

## CODE OUTPUT REQUIREMENTS (if generating code)

```
Framework:      React 19 + Vite
Styling:        Tailwind CSS v4
Animations:     Framer Motion 12
3D:             Three.js r170 or React Three Fiber
State:          Zustand
Icons:          Lucide React
Fonts:          Neue Machina (display) + Satoshi (body) via Fontshare / CDN
Theme:          Dark mode first (CSS custom properties, no hardcoded values)
Performance:    < 100KB gzipped JS for initial shell, lazy-load 3D scene
File structure: Clean monorepo component organization
```

**Every component must:**
- Use CSS custom properties for all tokens (no hardcoded colors or sizes)
- Have hover, active, focus, and disabled states
- Support both light-touch pointer and keyboard interaction
- Be standalone and reusable
- Include correct ARIA roles and labels

---

## DESIGN TOKENS (FULL REFERENCE)

```css
/* Spacing (4px base) */
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;    /* 8px */
--space-3: 0.75rem;   /* 12px */
--space-4: 1rem;      /* 16px */
--space-6: 1.5rem;    /* 24px */
--space-8: 2rem;      /* 32px */
--space-12: 3rem;     /* 48px */
--space-16: 4rem;     /* 64px */

/* Type scale */
--text-xs:   clamp(0.75rem, 0.7rem + 0.25vw, 0.875rem);
--text-sm:   clamp(0.875rem, 0.8rem + 0.35vw, 1rem);
--text-base: clamp(1rem, 0.95rem + 0.25vw, 1.125rem);
--text-lg:   clamp(1.125rem, 1rem + 0.75vw, 1.5rem);
--text-xl:   clamp(1.5rem, 1.2rem + 1.25vw, 2.25rem);
--text-2xl:  clamp(2rem, 1.2rem + 2.5vw, 3.5rem);
--text-3xl:  clamp(2.5rem, 1rem + 4vw, 5rem);

/* Radius */
--radius-sm:  0.25rem;
--radius-md:  0.5rem;
--radius-lg:  0.75rem;
--radius-xl:  1rem;
--radius-2xl: 1.5rem;
--radius-full: 9999px;

/* Blur */
--blur-sm:  8px;
--blur-md:  16px;
--blur-lg:  32px;
--blur-xl:  64px;

/* Glow intensities */
--glow-accent: 0 0 20px rgba(0, 212, 232, 0.2);
--glow-accent-strong: 0 0 40px rgba(0, 212, 232, 0.35);
--glow-gold: 0 0 20px rgba(240, 180, 41, 0.2);
--glow-error: 0 0 20px rgba(244, 63, 94, 0.2);
--glow-success: 0 0 20px rgba(34, 197, 94, 0.2);

/* Elevation shadows */
--shadow-sm: 0 1px 3px rgba(0,0,0,0.4), 0 1px 2px rgba(0,0,0,0.24);
--shadow-md: 0 4px 16px rgba(0,0,0,0.4), 0 2px 4px rgba(0,0,0,0.3);
--shadow-lg: 0 16px 48px rgba(0,0,0,0.5), 0 4px 12px rgba(0,0,0,0.35);
--shadow-xl: 0 32px 80px rgba(0,0,0,0.6), 0 8px 24px rgba(0,0,0,0.4);

/* Transitions */
--ease-out: cubic-bezier(0.16, 1, 0.3, 1);
--ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
--ease-smooth: cubic-bezier(0.4, 0, 0.2, 1);

--duration-micro: 120ms;
--duration-fast: 200ms;
--duration-normal: 300ms;
--duration-slow: 500ms;
--duration-reward: 700ms;

/* Depth levels (z-index system) */
--z-base: 0;
--z-raised: 10;
--z-panel: 100;
--z-overlay: 200;
--z-modal: 300;
--z-toast: 400;
--z-cursor: 9999;
```

---

## MOOD TARGETS — FINAL EMOTIONAL GOALS

The interface should reliably trigger these reactions in users:

| Reaction | Trigger |
|----------|---------|
| *"This feels expensive"* | Premium surfaces, type, spacing, lighting |
| *"This feels alive"* | 3D scene, motion, agent activity, streaming |
| *"This feels like the future"* | Depth, glassmorphism, neural visuals |
| *"I want to keep using this"* | Dopamine loops, reward moments, satisfying micro-interactions |
| *"This is not just useful — it is thrilling"* | Agent orchestration visualization, voice mode, gold pulses |

---

## ANTI-PATTERNS TO AVOID (HARD RULES)

- ❌ Generic SaaS hero with floating screenshots and a blue gradient
- ❌ Three equal feature cards in a symmetrical row
- ❌ Stock-photo team section
- ❌ Overused violet-pink-purple AI gradients
- ❌ Childish or excessive glassmorphism everywhere
- ❌ Hyper-busy cyberpunk clutter with zero hierarchy
- ❌ Unreadable white text on glowing gradient backgrounds
- ❌ Novelty over function — every element must earn its place
- ❌ Copycat layouts from Linear, Notion, or ChatGPT
- ❌ Flat boring enterprise software aesthetic
- ❌ Icon-in-colored-circle feature grids
- ❌ Gradient buttons (solid accent is always more refined)
- ❌ Colored left-border cards (Notion/Material 1.0 look)
- ❌ Emoji as design elements or section headers
- ❌ Generic hero copy ("Empower your workflow", "Unlock the power of...")

---

## FINAL OUTPUT GOAL

Produce a complete, visually stunning, highly immersive, production-grade website and app UI for **Signhify AI** that feels like the premium evolution of voice-first multi-agent software. It should combine:

- Cinematic 3D depth
- Ambient neural intelligence visual language
- Polished, satisfying micro-interactions
- Modern spatial UI with real depth hierarchy
- Luxurious typography and type rhythm
- Addictive but elegant motion design
- Emotionally resonant "dopamine loop" design moments
- Clear, usable task flows underneath all the beauty

The result must be **original, iconic, emotionally engaging, technically sound, and immediately buildable**.

---

# SECTION B — COMPRESSED PROMPT (SHORT VERSION)

*Use this for token-limited tools like v0, Bolt.new, or Lovable.*

---

Create a premium, immersive, modern 3D web app UI for **Signhify AI** — a voice-first multi-agent AI workspace for writing, research, notes, code, and communication.

**Visual system:**
- Dark obsidian background (`#09090f`) with blue-black surface layers
- Electric cyan-teal primary accent (`#00d4e8`) with soft glow halos
- Amber/gold reward highlights for dopamine moments
- Layered glassmorphism panels (tasteful, not excessive)
- Premium typography: Neue Machina display + Satoshi body
- 3D neural sphere centerpiece with particle constellation

**Pages to create:**
1. Landing page — cinematic hero with 3D centerpiece + live agent orchestration demo
2. Dashboard — three-panel command center (nav rail + command canvas + intelligence panel)
3. Agent workspace — 7 agents (Nexus, Scribe, Scout, Forge, Herald, Vault, Vision) with individual visual identity and orchestration flow
4. Voice mode — immersive listening state with organic waveform and ambient rings
5. Chat interface — premium streaming conversation with agent identity tags and citation cards
6. Memory/notes panel — knowledge vault feel with card grid and semantic search
7. Settings — premium instrument-like configuration UI

**Motion rules:**
- Spring easing everywhere (not cubic-bezier linear)
- Opacity + blur reveals
- Agent activation pulse animations
- Streaming token cursor blink
- Gold trace flash on task completion
- Mouse-reactive camera drift on 3D scene

**Tech stack:** React 19 + Vite + Tailwind CSS v4 + Framer Motion + Three.js + Zustand + Lucide React

**Anti-patterns to avoid:**
- No purple gradients, no 3-column feature grids, no generic SaaS hero
- No gradient buttons, no icon-in-circle features, no boring dashboard cards
- No emoji as design elements, no Generic startup copy

**Result:** An original, premium, visually stunning, emotionally addictive, production-ready interface that feels like a luxury AI operating system.

---

# SECTION C — STACK-SPECIFIC VARIANT PROMPTS

## C1 — For v0.dev / Lovable / Bolt.new

```
Build a full-stack web app UI for "Signhify AI" — a premium voice-first multi-agent AI workspace.

Stack: React + Tailwind CSS + Framer Motion + Lucide React

Design system:
- Colors: #09090f bg, #0f1018 surface, #00d4e8 accent, #f0b429 gold, #e8eaf0 text
- Fonts: Neue Machina (display, CDN), Satoshi (body, Fontshare CDN)
- Radius: sm=4px, md=8px, lg=12px, xl=16px
- Glass panels: backdrop-blur-16 + bg-white/4 + border-white/7
- Shadows: layered dark shadows, no default Tailwind gray

Components to build:
1. Navigation rail (collapsible icon + label)
2. Command input (large glass panel, glowing focus ring)
3. Agent tile (icon + name + status pulse + hover glow)
4. Message bubble (user right / agent left, streaming state)
5. Source card (favicon + title + snippet + link)
6. Voice waveform module (animated bars, listening state)
7. Glass card (backdrop-blur, border-glow, elevated shadow)
8. Settings row (label + control + description)

Build the main dashboard layout with the three-panel grid:
- Left nav rail (64px collapsed / 240px expanded)
- Center command canvas (flex-1)
- Right intelligence panel (320px, slide-in on mobile)

All animations via Framer Motion, spring easing, 200–350ms.
Dark mode only. Mobile responsive.
```

## C2 — For Figma AI / Diagram Tools

```
Generate a complete design system and UI screens for "Signhify AI":

Brand: Premium, futuristic, voice-first AI workspace
Palette: #09090f bg / #00d4e8 accent / #f0b429 gold / #e8eaf0 text / glass surfaces
Typography: Neue Machina (display) + Satoshi (body) + JetBrains Mono (code)
Radius: 4/8/12/16px system
Spacing: 4px base grid
Elevation: 4 levels (flat → raised → panel → overlay)

Screens:
1. Landing hero (2560x1440) — 3D sphere + statement + embedded app preview
2. Dashboard (1440x900) — 3-panel layout
3. Agent workspace (1440x900) — agent grid + orchestration
4. Voice mode (1440x900) — full immersive listening state
5. Mobile dashboard (390x844) — compressed, premium

Component library:
- Button (primary / secondary / ghost / destructive, all states)
- Input (glass surface, focus glow ring)
- Card (glass, elevated, outlined variants)
- Agent tile (5 states: idle, active, busy, completed, error)
- Navigation items (icon only / icon+label)
- Badge/chip (filled, outlined, status variants)
- Modal (blur backdrop, spring entry)
- Tooltip (arrow, delay)
```

## C3 — For Cursor / Claude Code (Full Implementation)

```
You are a senior frontend engineer. Build the complete UI for "Signhify AI" — a premium, voice-first, multi-agent AI workspace.

Repository structure:
signhify-ai/
├── src/
│   ├── components/
│   │   ├── layout/        (NavRail, TopBar, CommandCanvas, IntelPanel)
│   │   ├── agents/        (AgentTile, AgentGrid, OrchestrationFlow)
│   │   ├── chat/          (MessageBubble, StreamingCursor, CitationCard)
│   │   ├── voice/         (VoiceModule, Waveform, ListeningState)
│   │   ├── memory/        (NoteCard, VaultGrid, MemorySearch)
│   │   ├── research/      (SourceCard, CitationPanel, ResearchTabs)
│   │   ├── settings/      (KeyVault, ModelSelector, VoiceSettings)
│   │   └── shared/        (GlassCard, Button, Input, Badge, Modal)
│   ├── stores/            (useAppStore, useAgentStore, useVoiceStore)
│   ├── hooks/             (useStream, useVoice, useAgentOrchestration)
│   ├── lib/               (tokens, animations, cn utility)
│   ├── pages/             (Landing, Dashboard, Settings, Workspace)
│   └── styles/            (globals.css with design tokens)
├── public/
└── index.html

Design tokens (globals.css):
[include all CSS custom properties from Section A]

Animation config (lib/animations.ts):
[include all Framer Motion spring configs and variants]

Requirements:
- All tokens as CSS custom properties, never hardcoded
- Framer Motion for all transitions (spring easing)
- Three.js neural sphere background scene
- Mobile-first responsive
- WCAG AA contrast minimum
- Zero placeholder content — use realistic Signhify AI copy
- Every component: hover, active, focus, disabled states
- Dark mode only (light mode scaffold for Phase 2)
```

---

*Document Version 1.0 — Signhify AI Design Prompt — June 2026*  
*Use freely for Signhify AI product development. Adapt as needed.*
