import { motion } from "framer-motion";
import { BackgroundScene } from "../components/3d/Scene";
import {
  Bot,
  TerminalSquare,
  Workflow,
  Zap,
  ArrowRight,
  ShieldCheck,
  Cpu,
  Mic,
  Sparkles,
  Database,
  BrainCircuit,
  Globe,
  Search,
  MessageSquare,
  Calendar,
  Check,
  Star,
  Users,
  TrendingUp,
  Code,
  Shield,
  Eye,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const AGENT_NAMES = [
  "Nexus",
  "Scribe",
  "Scout",
  "Forge",
  "Herald",
  "Vault",
  "Vision",
];
const AGENT_COLORS = [
  "#00e5ff",
  "#a78bfa",
  "#34d399",
  "#f59e0b",
  "#60a5fa",
  "#fb7185",
  "#e879f9",
];

function AgentPill({
  name,
  color,
  delay,
}: {
  name: string;
  color: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] }}
      className="flex items-center gap-2 px-3 py-1.5 rounded-full border"
      style={{ background: `${color}10`, borderColor: `${color}30` }}
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

function CommandPreview() {
  const commands = [
    {
      prompt: "Research quantum computing breakthroughs 2025",
      agent: "Scout",
      color: "#34d399",
    },
    {
      prompt: "Write a technical blog post about the findings",
      agent: "Scribe",
      color: "#a78bfa",
    },
    {
      prompt: "Generate Python code for data visualization",
      agent: "Forge",
      color: "#f59e0b",
    },
    {
      prompt: "Save key insights to memory vault",
      agent: "Vault",
      color: "#fb7185",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 1, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="glass-panel rounded-2xl overflow-hidden max-w-xl mx-auto"
      style={{ border: "1px solid rgba(0, 229, 255, 0.12)" }}
    >
      <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5">
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
          <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
        </div>
        <span className="text-xs text-white/30 mx-auto">
          signhify — command center
        </span>
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
              style={{
                background: `${cmd.color}20`,
                border: `1px solid ${cmd.color}40`,
              }}
            >
              <span
                className="text-[8px] font-bold"
                style={{ color: cmd.color }}
              >
                {cmd.agent[0]}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <div
                className="text-[11px] font-medium"
                style={{ color: cmd.color }}
              >
                {cmd.agent}
              </div>
              <div className="text-xs text-white/50 truncate">{cmd.prompt}</div>
            </div>
            <div
              className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0"
              style={{
                background: cmd.color,
                boxShadow: `0 0 6px ${cmd.color}`,
                animation: "pulse 1s ease-in-out infinite",
              }}
            />
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center">
      <div className="font-display text-2xl font-bold gradient-text-cyan">
        {value}
      </div>
      <div className="text-xs text-white/40 mt-1">{label}</div>
    </div>
  );
}

function FeatureCard({
  icon: Icon,
  title,
  desc,
  color,
}: {
  icon: any;
  title: string;
  desc: string;
  color: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="p-5 rounded-2xl"
      style={{ background: `${color}06`, border: `1px solid ${color}12` }}
    >
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
        style={{ background: `${color}15` }}
      >
        <Icon className="w-5 h-5" style={{ color }} />
      </div>
      <h3
        className="text-sm font-semibold mb-1.5"
        style={{ color: "rgba(255,255,255,0.9)" }}
      >
        {title}
      </h3>
      <p
        className="text-xs leading-relaxed"
        style={{ color: "rgba(148,163,184,0.5)" }}
      >
        {desc}
      </p>
    </motion.div>
  );
}

function TestimonialCard({
  name,
  role,
  quote,
}: {
  name: string;
  role: string;
  quote: string;
}) {
  return (
    <div
      className="p-5 rounded-2xl"
      style={{
        background: "rgba(255,255,255,0.02)",
        border: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <div className="flex items-center gap-1 mb-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            className="w-3 h-3"
            style={{ color: "#f59e0b", fill: "#f59e0b" }}
          />
        ))}
      </div>
      <p
        className="text-xs leading-relaxed mb-4"
        style={{ color: "rgba(148,163,184,0.6)" }}
      >
        "{quote}"
      </p>
      <div className="flex items-center gap-2">
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold"
          style={{ background: "rgba(0,229,255,0.12)", color: "#00e5ff" }}
        >
          {name[0]}
        </div>
        <div>
          <p
            className="text-xs font-medium"
            style={{ color: "rgba(255,255,255,0.8)" }}
          >
            {name}
          </p>
          <p className="text-[10px]" style={{ color: "rgba(148,163,184,0.4)" }}>
            {role}
          </p>
        </div>
      </div>
    </div>
  );
}

export function Landing() {
  const navigate = useNavigate();

  return (
    <div className="relative w-full min-h-screen overflow-hidden bg-obsidian text-white">
      <BackgroundScene />

      <div
        className="absolute inset-0 z-1 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at center 30%, transparent 0%, rgba(3,3,5,0.5) 60%, rgba(3,3,5,0.95) 100%)",
        }}
      />

      <div className="relative z-10 w-full pointer-events-auto">
        {/* Top Nav */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="flex justify-between items-center px-8 py-6 max-w-7xl mx-auto"
        >
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{
                background: "rgba(0, 229, 255, 0.1)",
                border: "1px solid rgba(0, 229, 255, 0.3)",
                boxShadow: "0 0 20px rgba(0, 229, 255, 0.2)",
              }}
            >
              <Zap className="w-5 h-5 text-cyan-teal" />
            </div>
            <span className="font-display font-semibold tracking-widest text-base text-white">
              SIGNHIFY<span className="text-cyan-teal">.</span>AI
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-6">
            {["Features", "Agents", "Open Source"].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                className="text-sm text-white/50 hover:text-white/90 transition-colors"
              >
                {item}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/")}
              className="btn-primary text-sm"
            >
              Get Started Free
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </motion.header>

        {/* Hero */}
        <main className="flex flex-col items-center justify-center text-center px-6 pt-16 pb-20">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex items-center gap-2 px-4 py-1.5 rounded-full mb-8"
            style={{
              background: "rgba(0, 229, 255, 0.06)",
              border: "1px solid rgba(0, 229, 255, 0.2)",
            }}
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-teal" />
            <span className="text-xs font-medium text-cyan-teal tracking-wider">
              Open source · Self-learning · BYOK — no subscription required
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="font-display text-5xl md:text-7xl font-bold leading-tight tracking-tight mb-6 max-w-4xl"
          >
            <span className="gradient-text">Your AI workspace</span>
            <br />
            <span className="gradient-text-cyan text-glow-cyan">
              that gets smarter every day.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="text-lg md:text-xl max-w-2xl font-light leading-relaxed mb-10"
            style={{ color: "rgba(255,255,255,0.45)" }}
          >
            7 specialized AI agents that learn your patterns, build reusable
            skills automatically, and remember everything. Bring your own API
            keys.{" "}
            <span style={{ color: "rgba(255,255,255,0.75)" }}>
              No vendor lock-in.
            </span>
          </motion.p>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.7 }}
            className="flex flex-col sm:flex-row items-center gap-4 mb-14"
          >
            <button
              onClick={() => navigate("/")}
              className="group relative px-8 py-4 rounded-full overflow-hidden transition-all hover:scale-105 active:scale-100"
              style={{
                background: "rgba(0, 229, 255, 0.1)",
                border: "1px solid rgba(0, 229, 255, 0.4)",
                boxShadow:
                  "0 0 40px rgba(0, 229, 255, 0.15), inset 0 0 20px rgba(0, 229, 255, 0.05)",
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-teal/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              <div className="relative flex items-center gap-3 font-semibold text-cyan-teal tracking-wide">
                <Zap className="w-5 h-5" />
                START FOR FREE
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>

            <a
              href="https://github.com/Warriorlegacy/signhify-ai"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-6 py-4 rounded-full transition-all hover:scale-105"
              style={{
                color: "rgba(255,255,255,0.5)",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
              Star on GitHub
            </a>
          </motion.div>

          <CommandPreview />
        </main>

        {/* Features */}
        <section id="features" className="max-w-7xl mx-auto px-8 py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4 gradient-text">
              Built for real work
            </h2>
            <p
              className="text-sm max-w-lg mx-auto"
              style={{ color: "rgba(148,163,184,0.5)" }}
            >
              Not another chatbot. A full AI workspace with agents that
              collaborate, learn, and improve.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FeatureCard
              icon={BrainCircuit}
              title="Self-Learning Agents"
              desc="Agents automatically detect reusable patterns from your conversations and create skills. The more you use it, the smarter it gets."
              color="#00e5ff"
            />
            <FeatureCard
              icon={Shield}
              title="Persistent Memory"
              desc="MongoDB-backed episodic memory, facts, and user profiles with semantic search. Your AI remembers context across every session."
              color="#a78bfa"
            />
            <FeatureCard
              icon={Zap}
              title="Multi-Provider BYOK"
              desc="OpenAI, Anthropic, Groq, Gemini, OpenRouter — automatic fallback, hot-swap, no vendor lock-in. You own your keys."
              color="#f59e0b"
            />
            <FeatureCard
              icon={Globe}
              title="Multi-Channel"
              desc="Telegram and Discord bots with memory context injection. Chat from anywhere — your AI follows you."
              color="#34d399"
            />
            <FeatureCard
              icon={Calendar}
              title="Always-On Scheduler"
              desc="Cron-based task scheduling with retry logic and memory-enriched prompts. Your AI works even when you're offline."
              color="#60a5fa"
            />
            <FeatureCard
              icon={Code}
              title="Open Source"
              desc="Full source code on GitHub. MIT license. Self-host on your own infrastructure. Complete data ownership."
              color="#fb7185"
            />
          </div>
        </section>

        {/* Agents */}
        <section id="agents" className="max-w-7xl mx-auto px-8 py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4 gradient-text-cyan">
              7 agents. One mission.
            </h2>
            <p
              className="text-sm max-w-lg mx-auto"
              style={{ color: "rgba(148,163,184,0.5)" }}
            >
              Specialized agents that collaborate seamlessly. Nexus routes your
              intent to the right specialist.
            </p>
          </motion.div>

          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {AGENT_NAMES.map((name, i) => (
              <AgentPill
                key={name}
                name={name}
                color={AGENT_COLORS[i]}
                delay={0.1 + i * 0.08}
              />
            ))}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { name: "Nexus", desc: "Routes intent", color: "#00e5ff" },
              { name: "Scribe", desc: "Writes content", color: "#a78bfa" },
              { name: "Scout", desc: "Researches web", color: "#34d399" },
              { name: "Forge", desc: "Generates code", color: "#f59e0b" },
              { name: "Vault", desc: "Manages memory", color: "#fb7185" },
              { name: "Herald", desc: "Communicates", color: "#60a5fa" },
              { name: "Vision", desc: "Analyzes images", color: "#e879f9" },
            ].map((a) => (
              <div
                key={a.name}
                className="p-4 rounded-xl text-center"
                style={{
                  background: `${a.color}06`,
                  border: `1px solid ${a.color}12`,
                }}
              >
                <div
                  className="w-10 h-10 rounded-full mx-auto mb-2 flex items-center justify-center"
                  style={{ background: `${a.color}20` }}
                >
                  <span
                    className="text-sm font-bold"
                    style={{ color: a.color }}
                  >
                    {a.name[0]}
                  </span>
                </div>
                <p className="text-xs font-semibold" style={{ color: a.color }}>
                  {a.name}
                </p>
                <p
                  className="text-[10px] mt-0.5"
                  style={{ color: "rgba(148,163,184,0.4)" }}
                >
                  {a.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Testimonials */}
        <section className="max-w-7xl mx-auto px-8 py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4 gradient-text">
              Loved by builders
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <TestimonialCard
              name="Alex Chen"
              role="Indie Developer"
              quote="Signhify replaced my entire AI tool stack. The self-learning agents actually get better over time — I'm impressed every week."
            />
            <TestimonialCard
              name="Sarah Kim"
              role="Product Manager"
              quote="The persistent memory is a game changer. My AI remembers my project context, my writing style, my preferences. It's like having a real assistant."
            />
            <TestimonialCard
              name="Marcus Johnson"
              role="Data Scientist"
              quote="Finally, an AI workspace I can self-host and own completely. The multi-provider BYOK model is exactly what I needed."
            />
          </div>
        </section>

        {/* Stats */}
        <section className="max-w-7xl mx-auto px-8 py-16">
          <div
            className="border-t border-b py-12"
            style={{ borderColor: "rgba(255,255,255,0.06)" }}
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <Stat value="7" label="Specialized Agents" />
              <Stat value="5+" label="LLM Providers" />
              <Stat value="∞" label="Self-Generated Skills" />
              <Stat value="24/7" label="Always-On Scheduling" />
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="max-w-7xl mx-auto px-8 py-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4 gradient-text-cyan">
              Ready to build your AI workspace?
            </h2>
            <p
              className="text-sm mb-8 max-w-lg mx-auto"
              style={{ color: "rgba(148,163,184,0.5)" }}
            >
              Free forever. Open source. No credit card required.
            </p>
            <button
              onClick={() => navigate("/")}
              className="group relative px-10 py-4 rounded-full overflow-hidden transition-all hover:scale-105"
              style={{
                background: "rgba(0, 229, 255, 0.1)",
                border: "1px solid rgba(0, 229, 255, 0.4)",
                boxShadow: "0 0 40px rgba(0, 229, 255, 0.15)",
              }}
            >
              <div className="relative flex items-center gap-3 font-semibold text-cyan-teal tracking-wide">
                <Zap className="w-5 h-5" />
                GET STARTED FREE
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>
          </motion.div>
        </section>

        {/* Footer */}
        <footer
          className="max-w-7xl mx-auto px-8 py-10 border-t"
          style={{ borderColor: "rgba(255,255,255,0.06)" }}
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ background: "rgba(0,229,255,0.12)" }}
              >
                <Zap className="w-3.5 h-3.5" style={{ color: "#00e5ff" }} />
              </div>
              <span
                className="font-display font-bold tracking-widest text-xs"
                style={{ color: "rgba(255,255,255,0.6)" }}
              >
                SIGNHIFY<span style={{ color: "#00e5ff" }}>.</span>AI
              </span>
            </div>
            <div className="flex items-center gap-6">
              <a
                href="https://github.com/Warriorlegacy/signhify-ai"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs hover:text-white/80 transition-colors"
                style={{ color: "rgba(148,163,184,0.4)" }}
              >
                GitHub
              </a>
              <span
                className="text-xs"
                style={{ color: "rgba(148,163,184,0.3)" }}
              >
                MIT License
              </span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
