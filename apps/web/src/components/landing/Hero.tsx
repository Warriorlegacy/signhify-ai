import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import CommandPreview from "./CommandPreview";

export default function Hero({ onGetStarted }: { onGetStarted: () => void }) {
  return (
    <section className="relative mx-auto flex max-w-6xl flex-col items-center px-6 pt-40 pb-24 text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="glass-panel mb-8 rounded-full px-5 py-2 text-xs font-medium text-muted-foreground"
      >
        Open source · Self-learning · BYOK — no subscription required
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.1 }}
        className="max-w-4xl text-5xl font-bold leading-[1.05] tracking-tight md:text-7xl"
      >
        Your AI workspace that{" "}
        <span className="cyan-gradient-text">gets smarter every day.</span>
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.2 }}
        className="mt-6 max-w-2xl text-lg text-muted-foreground"
      >
        Seven specialized agents — Nexus, Scribe, Scout, Forge, Herald, Vault, and
        Vision — collaborate to research, write, build, and remember. Bring your own
        keys and watch your workspace learn.
      </motion.p>

      <motion.button
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.97 }}
        onClick={onGetStarted}
        className="shimmer-btn mt-10 flex items-center gap-2 rounded-2xl bg-primary px-8 py-4 text-base font-bold text-primary-foreground neon-glow"
      >
        START FOR FREE
        <ArrowRight className="h-5 w-5" />
      </motion.button>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.4 }}
        className="mt-20 w-full max-w-3xl"
      >
        <CommandPreview />
      </motion.div>
    </section>
  );
}
