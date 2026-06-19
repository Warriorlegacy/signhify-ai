import { motion } from "framer-motion";
import {
  Brain,
  Database,
  Layers,
  Radio,
  CalendarClock,
  Code2,
} from "lucide-react";

const features = [
  { icon: Brain, title: "Self-Learning", desc: "Agents refine prompts and strategies from every task they complete." },
  { icon: Database, title: "Memory", desc: "A persistent vault keeps context across sessions and projects." },
  { icon: Layers, title: "Multi-Provider", desc: "BYOK across OpenAI, Anthropic, Google, and local models." },
  { icon: Radio, title: "Multi-Channel", desc: "Reach your workspace via web, email, chat, and webhooks." },
  { icon: CalendarClock, title: "Scheduler", desc: "Queue recurring agent workflows that run on autopilot." },
  { icon: Code2, title: "Open Source", desc: "Fully transparent, self-hostable, and community-driven." },
];

export default function Features() {
  return (
    <section id="features" className="mx-auto max-w-6xl px-6 py-24">
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center text-4xl font-bold tracking-tight md:text-5xl"
      >
        Built to <span className="cyan-gradient-text">compound</span>
      </motion.h2>
      <p className="mx-auto mt-4 max-w-xl text-center text-muted-foreground">
        Every capability works together so your workspace grows more capable
        with each passing day.
      </p>

      <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((f, i) => (
          <motion.div
            key={f.title}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.06 }}
            whileHover={{ y: -6 }}
            className="group glass-panel rounded-2xl p-6 transition-shadow hover:[box-shadow:0_0_0_1px_rgba(0,229,255,0.4),0_0_40px_rgba(0,229,255,0.12)]"
          >
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary transition-transform group-hover:scale-110">
              <f.icon className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-semibold">{f.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
