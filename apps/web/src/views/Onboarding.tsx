import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSettingsStore } from "../stores/settingsStore";
import { useAuthStore } from "../stores/authStore";
import {
  Zap,
  Key,
  Bot,
  BrainCircuit,
  Shield,
  ArrowRight,
  ArrowLeft,
  Check,
  Sparkles,
  Globe,
  MessageSquare,
  Calendar,
  Mic,
  Search,
  Terminal,
} from "lucide-react";

interface OnboardingProps {
  onComplete: () => void;
}

const STEPS = [
  {
    id: "welcome",
    title: "Welcome to Signhify",
    subtitle: "Your personal AI workspace that gets smarter over time",
  },
  {
    id: "provider",
    title: "Connect an AI Provider",
    subtitle: "Choose at least one LLM provider to power your agents",
  },
  {
    id: "agents",
    title: "Meet Your Agents",
    subtitle: "7 specialized agents working in unison for you",
  },
  {
    id: "channels",
    title: "Stay Connected Everywhere",
    subtitle: "Connect Telegram, Discord, or use the built-in chat",
  },
  {
    id: "ready",
    title: "You're All Set",
    subtitle: "Your workspace is initialized. Let's build something.",
  },
];

const PROVIDERS = [
  {
    id: "gemini",
    name: "Google Gemini",
    color: "#4285f4",
    free: true,
    placeholder: "AIza...",
  },
  {
    id: "groq",
    name: "Groq",
    color: "#f55036",
    free: true,
    placeholder: "gsk_...",
  },
  {
    id: "openai",
    name: "OpenAI",
    color: "#10a37f",
    free: false,
    placeholder: "sk-...",
  },
  {
    id: "anthropic",
    name: "Anthropic",
    color: "#d97757",
    free: false,
    placeholder: "sk-ant-...",
  },
  {
    id: "openrouter",
    name: "OpenRouter",
    color: "#6366f1",
    free: true,
    placeholder: "sk-or-...",
  },
];

const AGENTS = [
  {
    name: "Nexus",
    role: "Intent Router",
    color: "#00e5ff",
    icon: Zap,
    desc: "Classifies your intent and routes to the right specialist",
  },
  {
    name: "Scribe",
    role: "Writing & Summaries",
    color: "#a78bfa",
    icon: BrainCircuit,
    desc: "Long-form content, editing, and summaries",
  },
  {
    name: "Scout",
    role: "Web Research",
    color: "#34d399",
    icon: Search,
    desc: "Real-time web search with citations",
  },
  {
    name: "Forge",
    role: "Code Generation",
    color: "#f59e0b",
    icon: Terminal,
    desc: "Write, debug, and refactor code",
  },
  {
    name: "Vault",
    role: "Knowledge Base",
    color: "#fb7185",
    icon: Shield,
    desc: "Save, retrieve, and search your data",
  },
  {
    name: "Herald",
    role: "Communication",
    color: "#60a5fa",
    icon: MessageSquare,
    desc: "Draft messages, reminders, and notifications",
  },
  {
    name: "Vision",
    role: "Image Analysis",
    color: "#e879f9",
    icon: Bot,
    desc: "Describe and analyze images",
  },
];

const CHANNELS = [
  {
    name: "Built-in Chat",
    desc: "Start chatting right here",
    icon: MessageSquare,
    status: "active" as const,
  },
  {
    name: "Telegram Bot",
    desc: "Connect your Telegram bot",
    icon: Globe,
    status: "available" as const,
  },
  {
    name: "Discord Bot",
    desc: "Add to your Discord server",
    icon: Globe,
    status: "available" as const,
  },
];

function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className="h-1 rounded-full transition-all duration-500"
          style={{
            width: i === current ? 24 : 8,
            background:
              i === current
                ? "#00e5ff"
                : i < current
                  ? "rgba(0,229,255,0.4)"
                  : "rgba(255,255,255,0.1)",
          }}
        />
      ))}
    </div>
  );
}

function WelcomeStep() {
  return (
    <div className="flex flex-col items-center text-center max-w-lg mx-auto">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-24 h-24 rounded-3xl mb-8 flex items-center justify-center relative"
        style={{
          background: "rgba(0,229,255,0.08)",
          border: "1px solid rgba(0,229,255,0.2)",
          boxShadow: "0 0 60px rgba(0,229,255,0.15)",
        }}
      >
        <Zap className="w-12 h-12" style={{ color: "#00e5ff" }} />
        <div
          className="absolute -inset-3 rounded-3xl"
          style={{ background: "rgba(0,229,255,0.04)", filter: "blur(12px)" }}
        />
      </motion.div>

      <h2 className="font-display text-3xl font-bold mb-3 gradient-text">
        Welcome to Signhify
      </h2>
      <p
        className="text-sm leading-relaxed mb-8"
        style={{ color: "rgba(148,163,184,0.6)" }}
      >
        A self-improving AI workspace powered by 7 specialized agents. It learns
        your patterns, builds skills automatically, and gets better the more you
        use it.
      </p>

      <div className="grid grid-cols-3 gap-4 w-full">
        {[
          {
            icon: BrainCircuit,
            label: "Self-Learning",
            desc: "Agents create skills from your conversations",
          },
          {
            icon: Shield,
            label: "Persistent Memory",
            desc: "Remembers everything across sessions",
          },
          {
            icon: Calendar,
            label: "Always On",
            desc: "Scheduled tasks and proactive automation",
          },
        ].map(({ icon: Icon, label, desc }) => (
          <div
            key={label}
            className="text-center p-3 rounded-xl"
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <Icon
              className="w-5 h-5 mx-auto mb-2"
              style={{ color: "#00e5ff" }}
            />
            <p
              className="text-xs font-semibold mb-1"
              style={{ color: "rgba(255,255,255,0.8)" }}
            >
              {label}
            </p>
            <p
              className="text-[10px]"
              style={{ color: "rgba(148,163,184,0.4)" }}
            >
              {desc}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProviderStep({
  onKeySave,
}: {
  onKeySave: (provider: string, key: string) => void;
}) {
  const [selectedProvider, setSelectedProvider] = useState("gemini");
  const [keyInput, setKeyInput] = useState("");
  const [saved, setSaved] = useState<Record<string, boolean>>({});

  const handleSave = () => {
    if (keyInput.trim()) {
      onKeySave(selectedProvider, keyInput.trim());
      setSaved((s) => ({ ...s, [selectedProvider]: true }));
      setKeyInput("");
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto">
      <div className="space-y-2 mb-6">
        {PROVIDERS.map((p) => (
          <button
            key={p.id}
            onClick={() => setSelectedProvider(p.id)}
            className="w-full flex items-center gap-3 p-3 rounded-xl transition-all"
            style={{
              background:
                selectedProvider === p.id
                  ? `${p.color}10`
                  : "rgba(255,255,255,0.02)",
              border: `1px solid ${selectedProvider === p.id ? p.color + "40" : "rgba(255,255,255,0.06)"}`,
            }}
          >
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: `${p.color}20` }}
            >
              <span className="text-xs font-bold" style={{ color: p.color }}>
                {p.name[0]}
              </span>
            </div>
            <div className="flex-1 text-left">
              <p
                className="text-sm font-medium"
                style={{ color: "rgba(255,255,255,0.85)" }}
              >
                {p.name}
              </p>
              {p.free && (
                <span
                  className="text-[10px] px-1.5 py-0.5 rounded-full"
                  style={{
                    background: "rgba(16,185,129,0.15)",
                    color: "#34d399",
                  }}
                >
                  Free tier
                </span>
              )}
            </div>
            {saved[p.id] && (
              <Check className="w-4 h-4" style={{ color: "#34d399" }} />
            )}
          </button>
        ))}
      </div>

      <div className="flex gap-2">
        <input
          type="password"
          value={keyInput}
          onChange={(e) => setKeyInput(e.target.value)}
          placeholder={
            PROVIDERS.find((p) => p.id === selectedProvider)?.placeholder
          }
          className="input-base flex-1 text-sm"
          onKeyDown={(e) => e.key === "Enter" && handleSave()}
        />
        <button onClick={handleSave} className="btn-primary text-sm px-4">
          <Key className="w-3.5 h-3.5" />
          Save
        </button>
      </div>

      {Object.keys(saved).length > 0 && (
        <motion.p
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xs mt-3 text-center"
          style={{ color: "#34d399" }}
        >
          {Object.keys(saved).length} provider
          {Object.keys(saved).length > 1 ? "s" : ""} connected
        </motion.p>
      )}
    </div>
  );
}

function AgentsStep() {
  return (
    <div className="w-full max-w-lg mx-auto">
      <div className="grid grid-cols-2 gap-3">
        {AGENTS.map((agent, i) => (
          <motion.div
            key={agent.name}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="p-3 rounded-xl"
            style={{
              background: `${agent.color}06`,
              border: `1px solid ${agent.color}15`,
            }}
          >
            <div className="flex items-center gap-2 mb-2">
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ background: `${agent.color}20` }}
              >
                <agent.icon
                  className="w-3.5 h-3.5"
                  style={{ color: agent.color }}
                />
              </div>
              <div>
                <p
                  className="text-xs font-semibold"
                  style={{ color: agent.color }}
                >
                  {agent.name}
                </p>
                <p
                  className="text-[10px]"
                  style={{ color: "rgba(148,163,184,0.4)" }}
                >
                  {agent.role}
                </p>
              </div>
            </div>
            <p
              className="text-[11px] leading-relaxed"
              style={{ color: "rgba(148,163,184,0.5)" }}
            >
              {agent.desc}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function ChannelsStep() {
  return (
    <div className="w-full max-w-lg mx-auto space-y-3">
      {CHANNELS.map((ch) => (
        <div
          key={ch.name}
          className="flex items-center gap-3 p-4 rounded-xl"
          style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: "rgba(0,229,255,0.1)" }}
          >
            <ch.icon className="w-5 h-5" style={{ color: "#00e5ff" }} />
          </div>
          <div className="flex-1">
            <p
              className="text-sm font-medium"
              style={{ color: "rgba(255,255,255,0.85)" }}
            >
              {ch.name}
            </p>
            <p className="text-xs" style={{ color: "rgba(148,163,184,0.4)" }}>
              {ch.desc}
            </p>
          </div>
          {ch.status === "active" ? (
            <span
              className="text-[10px] px-2 py-1 rounded-full"
              style={{ background: "rgba(16,185,129,0.15)", color: "#34d399" }}
            >
              Active
            </span>
          ) : (
            <button
              className="text-xs px-3 py-1.5 rounded-lg"
              style={{
                background: "rgba(0,229,255,0.08)",
                border: "1px solid rgba(0,229,255,0.2)",
                color: "#00e5ff",
              }}
            >
              Connect
            </button>
          )}
        </div>
      ))}

      <div
        className="mt-6 p-4 rounded-xl text-center"
        style={{
          background: "rgba(0,229,255,0.04)",
          border: "1px dashed rgba(0,229,255,0.2)",
        }}
      >
        <Mic
          className="w-5 h-5 mx-auto mb-2"
          style={{ color: "rgba(0,229,255,0.5)" }}
        />
        <p className="text-xs" style={{ color: "rgba(148,163,184,0.5)" }}>
          Voice mode coming soon — speak directly to your agents
        </p>
      </div>
    </div>
  );
}

function ReadyStep() {
  return (
    <div className="flex flex-col items-center text-center max-w-md mx-auto">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 15 }}
        className="w-20 h-20 rounded-3xl mb-6 flex items-center justify-center"
        style={{
          background: "rgba(16,185,129,0.1)",
          border: "1px solid rgba(16,185,129,0.3)",
          boxShadow: "0 0 40px rgba(16,185,129,0.15)",
        }}
      >
        <Check className="w-10 h-10" style={{ color: "#34d399" }} />
      </motion.div>

      <h2
        className="font-display text-2xl font-bold mb-3"
        style={{ color: "rgba(255,255,255,0.9)" }}
      >
        Workspace Initialized
      </h2>
      <p
        className="text-sm leading-relaxed mb-6"
        style={{ color: "rgba(148,163,184,0.5)" }}
      >
        Your agent team is ready. Start chatting and watch your workspace
        evolve. Signhify learns from every interaction to become your perfect AI
        companion.
      </p>

      <div
        className="flex items-center gap-2 text-xs"
        style={{ color: "rgba(148,163,184,0.3)" }}
      >
        <Sparkles className="w-3 h-3" />
        <span>Tip: Press Cmd+K to open the command palette anytime</span>
      </div>
    </div>
  );
}

export function Onboarding({ onComplete }: OnboardingProps) {
  const [step, setStep] = useState(0);
  const { saveKeys } = useSettingsStore();
  const { user } = useAuthStore();

  const handleKeySave = (provider: string, key: string) => {
    const currentKeys = useSettingsStore.getState().keys;
    saveKeys({ ...currentKeys, [provider]: key });
  };

  const canNext =
    step === 1
      ? Object.keys(useSettingsStore.getState().keys).length > 0
      : true;

  return (
    <div className="relative flex h-screen w-full overflow-hidden bg-obsidian text-slate-200">
      {/* Background */}
      <div className="absolute inset-0 neural-mesh" />

      <div className="relative z-10 flex flex-col w-full h-full">
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6">
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{
                background: "rgba(0,229,255,0.12)",
                border: "1px solid rgba(0,229,255,0.25)",
              }}
            >
              <Zap className="w-4 h-4" style={{ color: "#00e5ff" }} />
            </div>
            <span
              className="font-display font-bold tracking-widest text-sm"
              style={{ color: "rgba(255,255,255,0.9)" }}
            >
              SIGNHIFY<span style={{ color: "#00e5ff" }}>.</span>AI
            </span>
          </div>

          <StepIndicator current={step} total={STEPS.length} />

          <button
            onClick={onComplete}
            className="text-xs px-3 py-1.5 rounded-lg transition-all"
            style={{
              color: "rgba(148,163,184,0.5)",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            Skip setup
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 flex items-center justify-center px-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="w-full"
            >
              {step === 0 && <WelcomeStep />}
              {step === 1 && <ProviderStep onKeySave={handleKeySave} />}
              {step === 2 && <AgentsStep />}
              {step === 3 && <ChannelsStep />}
              {step === 4 && <ReadyStep />}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-8 py-6">
          <button
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0}
            className="flex items-center gap-2 text-sm px-4 py-2.5 rounded-xl transition-all disabled:opacity-30"
            style={{
              color: "rgba(148,163,184,0.7)",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>

          <button
            onClick={() => {
              if (step === STEPS.length - 1) {
                onComplete();
              } else {
                setStep((s) => Math.min(STEPS.length - 1, s + 1));
              }
            }}
            className="flex items-center gap-2 text-sm font-medium px-6 py-2.5 rounded-xl transition-all"
            style={{
              background: "rgba(0,229,255,0.1)",
              border: "1px solid rgba(0,229,255,0.3)",
              color: "#00e5ff",
            }}
          >
            {step === STEPS.length - 1 ? "Enter Workspace" : "Continue"}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
