import { create } from "zustand";

export type AgentType = "nexus" | "scribe" | "scout" | "forge" | "herald" | "vault" | "vision" | "general";

export interface AgentStatus {
  id: AgentType;
  label: string;
  description: string;
  color: string;
  glowColor: string;
  status: "idle" | "active" | "thinking" | "done" | "error";
  lastActive?: Date;
  tasksCompleted: number;
}

export interface OrchestrationEvent {
  id: string;
  fromAgent: AgentType;
  toAgent: AgentType;
  message: string;
  timestamp: Date;
}

const AGENT_DEFINITIONS: Omit<AgentStatus, "status" | "lastActive" | "tasksCompleted">[] = [
  {
    id: "nexus",
    label: "Nexus",
    description: "Orchestrator — routes tasks to the right specialist",
    color: "#00e5ff",
    glowColor: "rgba(0, 229, 255, 0.4)",
  },
  {
    id: "scribe",
    label: "Scribe",
    description: "Writing, editing, summarization, content generation",
    color: "#a78bfa",
    glowColor: "rgba(167, 139, 250, 0.4)",
  },
  {
    id: "scout",
    label: "Scout",
    description: "Web research, fact-checking, live intelligence",
    color: "#34d399",
    glowColor: "rgba(52, 211, 153, 0.4)",
  },
  {
    id: "forge",
    label: "Forge",
    description: "Code generation, debugging, technical execution",
    color: "#f59e0b",
    glowColor: "rgba(245, 158, 11, 0.4)",
  },
  {
    id: "herald",
    label: "Herald",
    description: "Communication — email, messages, scheduling",
    color: "#60a5fa",
    glowColor: "rgba(96, 165, 250, 0.4)",
  },
  {
    id: "vault",
    label: "Vault",
    description: "Memory management, note-taking, knowledge base",
    color: "#fb7185",
    glowColor: "rgba(251, 113, 133, 0.4)",
  },
  {
    id: "vision",
    label: "Vision",
    description: "Image analysis, OCR, visual intelligence",
    color: "#e879f9",
    glowColor: "rgba(232, 121, 249, 0.4)",
  },
];

interface AgentState {
  agents: AgentStatus[];
  activeAgentId: AgentType | null;
  orchestrationEvents: OrchestrationEvent[];
  setAgentStatus: (id: AgentType, status: AgentStatus["status"]) => void;
  setActiveAgent: (id: AgentType | null) => void;
  addOrchestrationEvent: (event: Omit<OrchestrationEvent, "id" | "timestamp">) => void;
  clearEvents: () => void;
}

export const useAgentStore = create<AgentState>((set) => ({
  agents: AGENT_DEFINITIONS.map((def) => ({
    ...def,
    status: "idle",
    tasksCompleted: 0,
  })),
  activeAgentId: null,
  orchestrationEvents: [],

  setAgentStatus: (id, status) =>
    set((state) => ({
      agents: state.agents.map((a) =>
        a.id === id
          ? {
              ...a,
              status,
              lastActive: status === "active" ? new Date() : a.lastActive,
              tasksCompleted: status === "done" ? a.tasksCompleted + 1 : a.tasksCompleted,
            }
          : a
      ),
    })),

  setActiveAgent: (id) => set({ activeAgentId: id }),

  addOrchestrationEvent: (event) =>
    set((state) => ({
      orchestrationEvents: [
        {
          id: crypto.randomUUID(),
          timestamp: new Date(),
          ...event,
        },
        ...state.orchestrationEvents.slice(0, 49), // keep last 50
      ],
    })),

  clearEvents: () => set({ orchestrationEvents: [] }),
}));
