import { motion } from "framer-motion";

const logs = [
  { agent: "Scout", color: "#34d399", task: "Research quantum computing breakthroughs 2025" },
  { agent: "Scribe", color: "#a78bfa", task: "Write a technical blog post about the findings" },
  { agent: "Forge", color: "#f59e0b", task: "Generate Python code for data visualization" },
  { agent: "Vault", color: "#fb7185", task: "Save key insights to memory vault" },
];

export default function CommandPreview() {
  return (
    <div className="glass-panel overflow-hidden rounded-2xl text-left neon-glow">
      <div className="flex items-center gap-3 border-b border-border px-4 py-3">
        <div className="flex gap-1.5">
          <span className="h-3 w-3 rounded-full bg-[#ff5f56]" />
          <span className="h-3 w-3 rounded-full bg-[#ffbd2e]" />
          <span className="h-3 w-3 rounded-full bg-[#27c93f]" />
        </div>
        <span className="font-mono text-xs text-muted-foreground">
          signhify — command center
        </span>
      </div>
      <div className="space-y-3 p-4">
        {logs.map((log, i) => (
          <motion.div
            key={log.agent}
            initial={{ opacity: 0, x: -10 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.15 }}
            className="flex items-center gap-3 rounded-xl border border-border bg-carbon/60 px-3 py-2.5"
          >
            <span
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg font-display text-xs font-bold"
              style={{
                color: log.color,
                background: `${log.color}1a`,
                boxShadow: `0 0 14px ${log.color}40`,
              }}
            >
              {log.agent[0]}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span
                  className="font-mono text-xs font-semibold"
                  style={{ color: log.color }}
                >
                  {log.agent}
                </span>
                <span
                  className="h-1.5 w-1.5 rounded-full pulse-dot"
                  style={{ background: log.color }}
                />
              </div>
              <p className="truncate text-sm text-muted-foreground">{log.task}</p>
            </div>
            <span
              className="rounded-full px-2 py-0.5 font-mono text-[10px]"
              style={{ color: log.color, background: `${log.color}1a` }}
            >
              running
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
