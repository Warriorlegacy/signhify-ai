import { motion, AnimatePresence } from "framer-motion";
import { useAgentStore, AgentStatus } from "../stores/agentStore";
import {
  Bot, Search, Code, Shield, Mail, Eye, Sparkles, Zap,
  Activity, CheckCircle, Loader2, AlertCircle
} from "lucide-react";
import { AgentOrbit } from "../components/agents/AgentOrbit";

const AGENT_ICONS: Record<string, any> = {
  nexus: Zap,
  scribe: Sparkles,
  scout: Search,
  forge: Code,
  herald: Mail,
  vault: Shield,
  vision: Eye,
};

function AgentCard({ agent }: { agent: AgentStatus }) {
  const Icon = AGENT_ICONS[agent.id] ?? Bot;
  const isActive = agent.status === "active" || agent.status === "thinking";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="relative rounded-2xl overflow-hidden cursor-pointer"
      style={{
        background: isActive
          ? `linear-gradient(135deg, ${agent.color}10 0%, ${agent.color}05 100%)`
          : 'rgba(13, 13, 20, 0.7)',
        border: `1px solid ${isActive ? agent.color + '30' : 'rgba(30, 30, 46, 0.7)'}`,
        boxShadow: isActive ? `0 0 30px ${agent.color}15, inset 0 0 20px ${agent.color}05` : 'none',
        backdropFilter: 'blur(16px)',
      }}
    >
      {/* Status glow bar */}
      {isActive && (
        <div
          className="absolute top-0 inset-x-0 h-px"
          style={{ background: `linear-gradient(90deg, transparent, ${agent.color}, transparent)` }}
        />
      )}

      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="relative">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center"
              style={{
                background: `${agent.color}15`,
                border: `1px solid ${agent.color}30`,
                boxShadow: isActive ? `0 0 20px ${agent.color}30` : 'none',
              }}
            >
              <Icon className="w-6 h-6" style={{ color: agent.color }} />
            </div>

            {/* Activity pulse */}
            {isActive && (
              <>
                <div
                  className="absolute -inset-1 rounded-2xl opacity-30"
                  style={{
                    background: agent.color,
                    filter: 'blur(6px)',
                    animation: 'pulse 2s ease-in-out infinite',
                  }}
                />
                <div
                  className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center"
                  style={{ background: '#030305', borderColor: agent.color }}
                >
                  <div className="w-1.5 h-1.5 rounded-full"
                    style={{ background: agent.color, animation: 'pulse 1s ease-in-out infinite' }}
                  />
                </div>
              </>
            )}
          </div>

          {/* Status indicator */}
          <div className="flex flex-col items-end gap-1">
            <StatusBadge status={agent.status} color={agent.color} />
            {agent.tasksCompleted > 0 && (
              <span className="text-[10px]" style={{ color: 'rgba(148,163,184,0.4)' }}>
                {agent.tasksCompleted} tasks
              </span>
            )}
          </div>
        </div>

        {/* Name & description */}
        <h3 className="font-display text-sm font-semibold mb-1" style={{ color: isActive ? agent.color : 'rgba(255,255,255,0.85)' }}>
          {agent.label}
        </h3>
        <p className="text-xs leading-relaxed" style={{ color: 'rgba(148,163,184,0.5)' }}>
          {agent.description}
        </p>

        {/* Thinking animation */}
        {agent.status === "thinking" && (
          <div className="flex items-center gap-1 mt-3">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-1.5 h-1.5 rounded-full streaming-dot"
                style={{ background: agent.color }}
              />
            ))}
            <span className="text-[10px] ml-1" style={{ color: agent.color }}>Processing...</span>
          </div>
        )}

        {/* Last active */}
        {agent.lastActive && agent.status !== "thinking" && (
          <p className="text-[10px] mt-3" style={{ color: 'rgba(148,163,184,0.3)' }}>
            Last active: {new Date(agent.lastActive).toLocaleTimeString()}
          </p>
        )}
      </div>
    </motion.div>
  );
}

function StatusBadge({ status, color }: { status: AgentStatus["status"]; color: string }) {
  const configs = {
    idle: { label: "Idle", icon: null, textColor: 'rgba(148,163,184,0.4)', bg: 'rgba(148,163,184,0.06)' },
    active: { label: "Active", icon: Activity, textColor: color, bg: `${color}12` },
    thinking: { label: "Thinking", icon: Loader2, textColor: color, bg: `${color}12` },
    done: { label: "Done", icon: CheckCircle, textColor: '#10b981', bg: 'rgba(16,185,129,0.12)' },
    error: { label: "Error", icon: AlertCircle, textColor: '#ef4444', bg: 'rgba(239,68,68,0.12)' },
  };

  const cfg = configs[status];
  const Icon = cfg.icon;

  return (
    <div
      className="flex items-center gap-1 px-2 py-0.5 rounded-full"
      style={{ background: cfg.bg }}
    >
      {Icon && (
        <Icon
          className="w-2.5 h-2.5"
          style={{
            color: cfg.textColor,
            animation: status === "thinking" ? "spin 1s linear infinite" : "none"
          }}
        />
      )}
      <span className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: cfg.textColor }}>
        {cfg.label}
      </span>
    </div>
  );
}

// Orchestration flow visualization
function OrchestrationFlow() {
  const { orchestrationEvents } = useAgentStore();

  if (orchestrationEvents.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="rounded-2xl p-5 mt-6"
      style={{
        background: 'rgba(0, 229, 255, 0.03)',
        border: '1px solid rgba(0, 229, 255, 0.08)',
      }}
    >
      <h3 className="section-label mb-4">Orchestration Flow</h3>
      <div className="space-y-2">
        {orchestrationEvents.slice(0, 6).map((event, i) => (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="flex items-center gap-3 text-xs"
          >
            <span className="font-medium" style={{ color: '#00e5ff' }}>{event.fromAgent}</span>
            <div className="flex-1 h-px relative overflow-hidden" style={{ background: 'rgba(0,229,255,0.12)' }}>
              <div
                className="absolute inset-y-0 left-0 w-1/3"
                style={{
                  background: 'linear-gradient(90deg, transparent, rgba(0,229,255,0.5), transparent)',
                  animation: 'shimmer 1.5s ease-in-out infinite',
                  backgroundSize: '200% 100%',
                }}
              />
            </div>
            <span className="font-medium" style={{ color: 'rgba(148,163,184,0.7)' }}>{event.toAgent}</span>
            <span className="text-[10px] truncate max-w-32" style={{ color: 'rgba(148,163,184,0.4)' }}>
              {event.message}
            </span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

export function AgentsView() {
  const { agents } = useAgentStore();
  const activeCount = agents.filter(a => a.status !== 'idle').length;
  const activeAgent = agents.find(a => a.status === 'active' || a.status === 'thinking')?.id ?? null;

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div>
            <h1 className="font-display text-xl font-bold gradient-text mb-1">
              Agent Workspace
            </h1>
            <p className="text-xs" style={{ color: 'rgba(148,163,184,0.5)' }}>
              {activeCount > 0
                ? `${activeCount} agent${activeCount > 1 ? 's' : ''} currently active`
                : '7 specialized agents ready to deploy'}
            </p>
          </div>

          {activeCount > 0 && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full"
              style={{ background: 'rgba(0,229,255,0.08)', border: '1px solid rgba(0,229,255,0.2)' }}>
              <div className="status-dot-active scale-75" />
              <span className="text-xs font-medium" style={{ color: '#00e5ff' }}>
                Orchestration Active
              </span>
            </div>
          )}
        </motion.div>

        {/* Agent Orbit Visualization */}
        <div className="mb-8 p-6 rounded-2xl border border-slate-800/60 bg-slate-900/10 backdrop-blur-md flex justify-center items-center">
          <AgentOrbit activeAgent={activeAgent} />
        </div>

        {/* Agent Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {agents.map((agent, i) => (
            <motion.div
              key={agent.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06, ease: [0.16, 1, 0.3, 1] }}
            >
              <AgentCard agent={agent} />
            </motion.div>
          ))}
        </div>

        {/* Orchestration flow */}
        <OrchestrationFlow />

        {/* Empty state if all idle */}
        {activeCount === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center mt-10 py-8 rounded-2xl"
            style={{ background: 'rgba(0,229,255,0.02)', border: '1px solid rgba(0,229,255,0.06)' }}
          >
            <Bot className="w-10 h-10 mx-auto mb-3" style={{ color: 'rgba(0,229,255,0.3)' }} />
            <p className="text-sm font-medium mb-1" style={{ color: 'rgba(148,163,184,0.5)' }}>
              All agents standing by
            </p>
            <p className="text-xs" style={{ color: 'rgba(148,163,184,0.3)' }}>
              Send a message to activate your agent team
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
