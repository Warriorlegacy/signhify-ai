export interface Agent {
  name: string;
  color: string;
  role: string;
  desc: string;
}

export const agents: Agent[] = [
  { name: "Nexus", color: "#00e5ff", role: "Orchestrator", desc: "Routes intent across the swarm and coordinates multi-agent workflows." },
  { name: "Scribe", color: "#a78bfa", role: "Writer", desc: "Drafts technical posts, docs, and long-form content from research." },
  { name: "Scout", color: "#34d399", role: "Researcher", desc: "Scours the web for breakthroughs and synthesizes findings." },
  { name: "Forge", color: "#f59e0b", role: "Engineer", desc: "Generates, refactors, and tests code across languages." },
  { name: "Herald", color: "#3b82f6", role: "Communicator", desc: "Delivers updates across channels — email, chat, and webhooks." },
  { name: "Vault", color: "#fb7185", role: "Memory", desc: "Persists key insights into a searchable long-term memory store." },
  { name: "Vision", color: "#08d9d6", role: "Perception", desc: "Understands images, charts, and documents with multimodal reasoning." },
];
