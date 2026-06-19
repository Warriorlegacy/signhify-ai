import { motion } from "framer-motion";

export default function Footer({ onGetStarted }: { onGetStarted: () => void }) {
  return (
    <footer id="opensource" className="mx-auto max-w-6xl px-6 pb-24">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="glass-panel rounded-3xl px-8 py-16 text-center neon-glow"
      >
        <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
          Open source. <span className="cyan-gradient-text">Yours forever.</span>
        </h2>
        <p className="mx-auto mt-4 max-w-lg text-muted-foreground">
          Self-host, inspect every line, and bring your own keys. No subscription,
          no lock-in.
        </p>
        <button
          onClick={onGetStarted}
          className="shimmer-btn mt-8 rounded-2xl bg-primary px-8 py-4 font-bold text-primary-foreground neon-glow transition-transform hover:scale-105"
        >
          Get Started Free
        </button>
      </motion.div>
      <p className="mt-10 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Signhify.AI — Built for the open future.
      </p>
    </footer>
  );
}
