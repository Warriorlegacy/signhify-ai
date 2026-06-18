import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { BackgroundScene } from '../components/3d/Scene';
import { Bot, TerminalSquare, Workflow, Zap, ArrowRight, ShieldCheck, Cpu, Mic, Sparkles, Database } from 'lucide-react';
import { useEffect, useRef } from 'react';

interface LandingProps {
  onEnter: () => void;
}

const AGENT_NAMES = ['Nexus', 'Scribe', 'Scout', 'Forge', 'Herald', 'Vault', 'Vision'];
const AGENT_COLORS = ['#00e5ff', '#a78bfa', '#34d399', '#f59e0b', '#60a5fa', '#fb7185', '#e879f9'];

// Floating agent pill
function AgentPill({ name, color, delay }: { name: string; color: string; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] }}
      className="flex items-center gap-2 px-3 py-1.5 rounded-full border"
      style={{
        background: `${color}10`,
        borderColor: `${color}30`,
      }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full animate-pulse"
        style={{ background: color, boxShadow: `0 0 6px ${color}` }}
      />
      <span className="text-xs font-medium" style={{ color }}>
        {name}
      </span>
    </motion.div>
  );
}

// Animated command preview
function CommandPreview() {
  const commands = [
    { prompt: 'Research quantum computing breakthroughs 2025', agent: 'Scout', color: '#34d399' },
    { prompt: 'Write a technical blog post about the findings', agent: 'Scribe', color: '#a78bfa' },
    { prompt: 'Generate Python code for data visualization', agent: 'Forge', color: '#f59e0b' },
    { prompt: 'Save key insights to memory vault', agent: 'Vault', color: '#fb7185' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 1, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="glass-panel rounded-2xl overflow-hidden max-w-xl mx-auto"
      style={{ border: '1px solid rgba(0, 229, 255, 0.12)' }}
    >
      {/* Header bar */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5">
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
          <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
        </div>
        <span className="text-xs text-white/30 mx-auto">signhify — command center</span>
      </div>

      <div className="p-4 space-y-2">
        {commands.map((cmd, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 1.2 + i * 0.3 }}
            className="flex items-start gap-3 p-2.5 rounded-xl"
            style={{ background: `${cmd.color}06` }}
          >
            <div
              className="mt-0.5 w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ background: `${cmd.color}20`, border: `1px solid ${cmd.color}40` }}
            >
              <span className="text-[8px] font-bold" style={{ color: cmd.color }}>
                {cmd.agent[0]}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[11px] font-medium" style={{ color: cmd.color }}>
                {cmd.agent}
              </div>
              <div className="text-xs text-white/50 truncate">{cmd.prompt}</div>
            </div>
            <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0"
              style={{ background: cmd.color, boxShadow: `0 0 6px ${cmd.color}`, animation: 'pulse 1s ease-in-out infinite' }}
            />
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

// Stat counter
function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center">
      <div className="font-display text-2xl font-bold gradient-text-cyan">{value}</div>
      <div className="text-xs text-white/40 mt-1">{label}</div>
    </div>
  );
}

export function Landing({ onEnter }: LandingProps) {
  return (
    <div className="relative w-full h-screen overflow-hidden bg-obsidian text-white">
      <BackgroundScene />

      {/* Dark overlay gradient */}
      <div className="absolute inset-0 z-1 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center 30%, transparent 0%, rgba(3,3,5,0.5) 60%, rgba(3,3,5,0.95) 100%)'
        }}
      />

      <div className="relative z-10 w-full h-full flex flex-col pointer-events-auto">

        {/* Top Nav */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="flex justify-between items-center px-8 py-6 max-w-7xl mx-auto w-full"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{
                background: 'rgba(0, 229, 255, 0.1)',
                border: '1px solid rgba(0, 229, 255, 0.3)',
                boxShadow: '0 0 20px rgba(0, 229, 255, 0.2)'
              }}
            >
              <Zap className="w-5 h-5 text-cyan-teal" />
            </div>
            <span className="font-display font-semibold tracking-widest text-base text-white">
              SIGNHIFY<span className="text-cyan-teal">.</span>AI
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-6">
            {['Features', 'Agents', 'Pricing'].map((item) => (
              <button key={item} className="text-sm text-white/50 hover:text-white/90 transition-colors">
                {item}
              </button>
            ))}
          </nav>

          <button
            onClick={onEnter}
            className="btn-primary text-sm"
            id="launch-btn"
          >
            Launch App
            <ArrowRight className="w-4 h-4" />
          </button>
        </motion.header>

        {/* Hero */}
        <main className="flex-1 flex flex-col items-center justify-center text-center px-6 -mt-12">

          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex items-center gap-2 px-4 py-1.5 rounded-full mb-8"
            style={{
              background: 'rgba(0, 229, 255, 0.06)',
              border: '1px solid rgba(0, 229, 255, 0.2)',
            }}
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-teal" />
            <span className="text-xs font-medium text-cyan-teal tracking-wider">
              7 specialized AI agents · Self-learning · Always on
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="font-display text-5xl md:text-7xl font-bold leading-tight tracking-tight mb-6 max-w-4xl"
          >
            <span className="gradient-text">Type less.</span>
            <br />
            <span className="gradient-text-cyan text-glow-cyan">
              Orchestrate more.
            </span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="text-lg md:text-xl max-w-2xl font-light leading-relaxed mb-10"
            style={{ color: 'rgba(255,255,255,0.45)' }}
          >
            One command. A team of specialized AI agents moves in unison.
            Your workspace, upgraded into a{' '}
            <span style={{ color: 'rgba(255,255,255,0.75)' }}>living intelligence layer.</span>
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.7 }}
            className="flex flex-col sm:flex-row items-center gap-4 mb-14"
          >
            <button
              onClick={onEnter}
              id="cta-main-btn"
              className="group relative px-8 py-4 rounded-full overflow-hidden transition-all hover:scale-105 active:scale-100"
              style={{
                background: 'rgba(0, 229, 255, 0.1)',
                border: '1px solid rgba(0, 229, 255, 0.4)',
                boxShadow: '0 0 40px rgba(0, 229, 255, 0.15), inset 0 0 20px rgba(0, 229, 255, 0.05)',
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-teal/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              <div className="relative flex items-center gap-3 font-semibold text-cyan-teal tracking-wide">
                <Zap className="w-5 h-5" />
                INITIALIZE WORKSPACE
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>

            <button
              className="flex items-center gap-2 px-6 py-4 rounded-full transition-all hover:scale-105"
              style={{ color: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              <Mic className="w-4 h-4" />
              <span className="text-sm font-medium">Try voice mode</span>
            </button>
          </motion.div>

          {/* Command Preview */}
          <CommandPreview />
        </main>

        {/* Agents + Stats Footer */}
        <motion.footer
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.4 }}
          className="w-full max-w-7xl mx-auto px-8 pb-10"
        >
          {/* Agent pills */}
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {AGENT_NAMES.map((name, i) => (
              <AgentPill
                key={name}
                name={name}
                color={AGENT_COLORS[i]}
                delay={1.6 + i * 0.08}
              />
            ))}
          </div>

          {/* Divider */}
          <div className="border-t mb-8" style={{ borderColor: 'rgba(255,255,255,0.06)' }} />

          {/* Stats + Features */}
          <div className="flex flex-wrap justify-center gap-8 md:gap-16">
            <Stat value="7" label="Specialized Agents" />
            <Stat value="5+" label="LLM Providers" />
            <Stat value="∞" label="Self-Generated Skills" />
            <Stat value="24/7" label="Always On Scheduling" />
          </div>
        </motion.footer>
      </div>
    </div>
  );
}
