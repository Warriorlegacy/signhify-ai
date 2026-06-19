import { useState } from "react";
import { motion } from "framer-motion";
import { agents } from "./agents-data";

export default function Agents() {
  const [active, setActive] = useState(agents[0].name);

  return (
    <section id="agents" className="mx-auto max-w-6xl px-6 py-24">
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center text-4xl font-bold tracking-tight md:text-5xl"
      >
        The <span className="cyan-gradient-text">7-Agent</span> Portal
      </motion.h2>
      <p className="mx-auto mt-4 max-w-xl text-center text-muted-foreground">
        A specialized swarm, each with a distinct role — orchestrated by Nexus.
      </p>

      <div className="mt-10 flex flex-wrap justify-center gap-3">
        {agents.map((a) => (
          <button
            key={a.name}
            onClick={() => setActive(a.name)}
            className="glass-panel rounded-full px-4 py-2 text-sm font-medium transition-all"
            style={
              active === a.name
                ? {
                    color: a.color,
                    borderColor: a.color,
                    boxShadow: `0 0 18px ${a.color}55`,
                  }
                : { color: "var(--muted-foreground)" }
            }
          >
            {a.name}
          </button>
        ))}
      </div>

      <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {agents.map((a, i) => (
          <motion.div
            key={a.name}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.05 }}
            whileHover={{ y: -6 }}
            className="glass-panel rounded-2xl p-6"
            style={{
              boxShadow:
                active === a.name ? `0 0 0 1px ${a.color}66, 0 0 40px ${a.color}22` : undefined,
            }}
          >
            <div className="flex items-center gap-3">
              <span
                className="flex h-11 w-11 items-center justify-center rounded-xl font-display text-base font-bold"
                style={{
                  color: a.color,
                  background: `${a.color}1a`,
                  boxShadow: `0 0 16px ${a.color}40`,
                }}
              >
                {a.name[0]}
              </span>
              <div>
                <h3 className="text-lg font-semibold">{a.name}</h3>
                <p className="font-mono text-xs" style={{ color: a.color }}>
                  {a.role}
                </p>
              </div>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">{a.desc}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
