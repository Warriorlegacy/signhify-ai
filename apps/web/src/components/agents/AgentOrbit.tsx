import { motion } from "framer-motion";
import { Zap, Bot, Edit, Search, Code, Shield, Mail, Image } from "lucide-react";

interface AgentOrbitProps {
  activeAgent: string | null;
}

const AGENTS = [
  { name: "scribe", icon: Edit, label: "Scribe", color: "#a78bfa", angle: 0 },
  { name: "scout", icon: Search, label: "Scout", color: "#34d399", angle: 60 },
  { name: "forge", icon: Code, label: "Forge", color: "#f59e0b", angle: 120 },
  { name: "vault", icon: Shield, label: "Vault", color: "#fb7185", angle: 180 },
  { name: "herald", icon: Mail, label: "Herald", color: "#3b82f6", angle: 240 },
  { name: "vision", icon: Image, label: "Vision", color: "#38bdf8", angle: 300 },
];

export function AgentOrbit({ activeAgent }: AgentOrbitProps) {
  return (
    <div className="relative w-72 h-72 mx-auto flex items-center justify-center select-none pointer-events-none">
      {/* Orbital Circles */}
      <div className="absolute inset-0 rounded-full border border-slate-800/60 scale-[0.85] border-dashed" />
      <div className="absolute inset-0 rounded-full border border-cyan-teal/5 scale-[0.6] pulse-ring" />

      {/* Center Nexus Node */}
      <motion.div
        animate={{
          boxShadow: activeAgent
            ? "0 0 30px rgba(0, 229, 255, 0.4)"
            : "0 0 15px rgba(0, 229, 255, 0.1)",
        }}
        className="w-14 h-14 rounded-full bg-slate-900 border border-cyan-teal/30 flex items-center justify-center z-10 relative"
      >
        <Zap className="w-6 h-6 text-cyan-teal" />
        <div className="absolute -bottom-6 text-[10px] font-bold tracking-widest text-cyan-teal uppercase">
          NEXUS
        </div>
      </motion.div>

      {/* Orbiting Agents */}
      {AGENTS.map((agent) => {
        const radius = 110; // orbit radius
        const rad = (agent.angle * Math.PI) / 180;
        const x = Math.cos(rad) * radius;
        const y = Math.sin(rad) * radius;
        const isActive = activeAgent === agent.name;
        const Icon = agent.icon;

        return (
          <div
            key={agent.name}
            className="absolute flex flex-col items-center"
            style={{
              transform: `translate(${x}px, ${y}px)`,
            }}
          >
            <motion.div
              animate={{
                scale: isActive ? 1.25 : 1,
                backgroundColor: isActive ? `${agent.color}20` : "rgba(11,11,17,0.8)",
                borderColor: isActive ? agent.color : "rgba(30,30,46,0.6)",
                boxShadow: isActive ? `0 0 20px ${agent.color}40` : "none",
              }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              className="w-10 h-10 rounded-full border flex items-center justify-center backdrop-blur-md relative"
            >
              <Icon
                className="w-4 h-4"
                style={{ color: isActive ? agent.color : "rgba(148,163,184,0.6)" }}
              />

              {isActive && (
                <div
                  className="absolute inset-0 rounded-full border border-dashed animate-spin"
                  style={{ borderColor: agent.color, animationDuration: "6s" }}
                />
              )}
            </motion.div>
            <span
              className="text-[9px] font-bold mt-1 tracking-wide uppercase transition-colors"
              style={{ color: isActive ? agent.color : "rgba(148,163,184,0.4)" }}
            >
              {agent.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
