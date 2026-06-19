import { motion, AnimatePresence } from "framer-motion";
import { X, Instagram, Linkedin, Github, Globe, Award, Shield, CheckCircle, Code } from "lucide-react";

interface CreditsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreditsModal({ isOpen, onClose }: CreditsModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-obsidian/85 backdrop-blur-md cursor-pointer"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: "spring", duration: 0.5, bounce: 0.15 }}
            className="glass-panel relative z-10 flex max-h-[85vh] w-full max-w-2xl flex-col rounded-3xl p-6 md:p-8 neon-glow overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div className="flex items-center gap-2">
                <div
                  className="w-2.5 h-2.5 rounded-full bg-primary"
                  style={{ boxShadow: "0 0 10px #00e5ff" }}
                />
                <span className="font-display text-sm font-bold tracking-widest text-muted-foreground uppercase">
                  Platform Credits
                </span>
              </div>
              <button
                onClick={onClose}
                className="rounded-xl border border-border bg-carbon/50 p-2 text-muted-foreground hover:text-foreground transition-all hover:scale-105 active:scale-95 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto pr-1 mt-6 space-y-8 scrollbar-thin">
              {/* Creator Card */}
              <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-primary/5 p-5 md:p-6">
                <div
                  className="absolute -top-12 -right-12 h-32 w-32 rounded-full opacity-10 blur-2xl"
                  style={{ background: "#00e5ff" }}
                />
                <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-[10px] font-bold tracking-widest text-primary uppercase border border-primary/20">
                  <Award className="h-3 w-3" />
                  Creator & Godfather
                </span>
                <h3 className="mt-3 font-display text-2xl font-bold tracking-tight">
                  Piyush Raj Singh
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  Sole architect, developer, and visionary behind Signhify AI. 
                  Piyush conceived, designed, and built this entire multi-agent AI platform from the ground up—covering the backend infrastructure, the multi-provider fallback orchestration, the frontend experience, the memory architecture, and the CLI suite.
                </p>

                {/* Social Links */}
                <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {[
                    {
                      label: "Instagram",
                      icon: Instagram,
                      url: "https://www.instagram.com/piyushrajsingh.golu?igsh=eHFnNnhwZjJyYmo2&utm_source=qr",
                      color: "hover:text-[#e1306c] hover:bg-[#e1306c]/10 hover:border-[#e1306c]/30",
                    },
                    {
                      label: "LinkedIn",
                      icon: Linkedin,
                      url: "https://linkedin.com/in/piyushraj-singh",
                      color: "hover:text-[#0a66c2] hover:bg-[#0a66c2]/10 hover:border-[#0a66c2]/30",
                    },
                    {
                      label: "GitHub",
                      icon: Github,
                      url: "https://github.com/Warriorlegacy",
                      color: "hover:text-[#ffffff] hover:bg-[#ffffff]/10 hover:border-[#ffffff]/30",
                    },
                    {
                      label: "Studio",
                      icon: Globe,
                      url: "https://signhify.lovable.app",
                      color: "hover:text-primary hover:bg-primary/10 hover:border-primary/30",
                    },
                  ].map((link) => (
                    <a
                      key={link.label}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`flex items-center gap-2 rounded-xl border border-border bg-carbon/40 px-3 py-2 text-xs font-semibold text-muted-foreground transition-all duration-200 hover:scale-[1.03] active:scale-95 ${link.color}`}
                    >
                      <link.icon className="h-4 w-4 shrink-0" />
                      {link.label}
                    </a>
                  ))}
                </div>
              </div>

              {/* What was built */}
              <div className="space-y-4">
                <h4 className="font-display text-sm font-bold tracking-widest text-muted-foreground uppercase flex items-center gap-2">
                  <Code className="h-4 w-4 text-primary" />
                  Engineering Achievements
                </h4>
                
                <div className="grid gap-3 sm:grid-cols-2">
                  {[
                    {
                      title: "Multi-Agent System",
                      desc: "7 specialized AI agents collaborating dynamically via smart classification and routing.",
                    },
                    {
                      title: "10+ LLM Providers",
                      desc: "Integrated OpenAI, Anthropic, Groq, Gemini, OpenRouter, Mistral, and more with instant BYOK setup.",
                    },
                    {
                      title: "BYOK & Security",
                      desc: "User-managed API keys stored securely with local state protection and zero data lock-in.",
                    },
                    {
                      title: "Fact & Profile Vault",
                      desc: "Durable episodic memory and session profiling that updates automatically in the background.",
                    },
                    {
                      title: "Skill Auto-Generation",
                      desc: "Automatic detection of user workflow patterns to stream reusable prompt skill suggestions.",
                    },
                    {
                      title: "Responsive Web & 3D UI",
                      desc: "React 19 + Tailwind v4 + React Three Fiber for a stunning, performance-optimized visual canvas.",
                    },
                  ].map((feat) => (
                    <div
                      key={feat.title}
                      className="rounded-xl border border-border bg-carbon/30 p-4 hover:border-border-bright transition-colors"
                    >
                      <div className="flex items-start gap-2.5">
                        <CheckCircle className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs font-bold text-foreground">{feat.title}</p>
                          <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">{feat.desc}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Open Source Philosophy */}
              <div className="rounded-xl border border-border bg-carbon/20 p-5 flex flex-col sm:flex-row gap-4 items-start">
                <div className="p-2.5 rounded-xl bg-[#10b981]/10 border border-[#10b981]/25 text-[#10b981] shrink-0">
                  <Shield className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">
                    Open Source & MIT License
                  </h4>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                    Signhify AI is released under the permissive MIT License. Piyush believes in democratizing advanced AI interfaces through full transparency, zero hidden subscriptions, and local-first privacy.
                  </p>
                </div>
              </div>

              {/* Special Thanks */}
              <div className="space-y-3 pb-4">
                <h4 className="font-display text-xs font-bold tracking-widest text-muted-foreground uppercase">
                  Special Thanks to Projects
                </h4>
                <div className="flex flex-wrap gap-2">
                  {["React 19", "Vite", "Tailwind CSS v4", "ThreeJS", "Zustand", "LangChain", "MongoDB", "Render", "Vercel"].map(
                    (tech) => (
                      <span
                        key={tech}
                        className="rounded-lg border border-border bg-carbon/50 px-2.5 py-1 text-[10px] font-mono text-muted-foreground"
                      >
                        {tech}
                      </span>
                    )
                  )}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-4 border-t border-border pt-4 text-center">
              <span className="text-[10px] font-mono text-muted-foreground">
                © {new Date().getFullYear()} Signhify.AI — Crafted with passion by Piyush Raj Singh
              </span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
