import { motion } from "framer-motion";

export default function Navbar({ onGetStarted }: { onGetStarted: () => void }) {
  return (
    <motion.header
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="fixed top-4 left-1/2 z-50 w-[min(1100px,92%)] -translate-x-1/2"
    >
      <nav className="glass-panel flex items-center justify-between rounded-2xl px-5 py-3">
        <div className="flex items-center gap-2 font-display text-lg font-bold tracking-tight">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full rounded-full bg-primary opacity-60 pulse-dot" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-primary neon-glow" />
          </span>
          SIGNHIFY<span className="text-primary">.AI</span>
        </div>
        <div className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
          <a href="#features" className="transition-colors hover:text-foreground">Features</a>
          <a href="#agents" className="transition-colors hover:text-foreground">Agents</a>
          <a href="#opensource" className="transition-colors hover:text-foreground">Open Source</a>
        </div>
        <button
          onClick={onGetStarted}
          className="shimmer-btn rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground neon-glow transition-transform hover:scale-105"
        >
          Get Started Free
        </button>
      </nav>
    </motion.header>
  );
}
