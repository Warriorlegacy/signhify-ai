import { motion } from 'framer-motion';
import { BackgroundScene } from '../components/3d/Scene';
import { Bot, TerminalSquare, Workflow, Zap, ArrowRight, ShieldCheck, Cpu } from 'lucide-react';

interface LandingProps {
  onEnter: () => void;
}

export function Landing({ onEnter }: LandingProps) {
  return (
    <div className="relative w-full h-screen overflow-hidden bg-obsidian text-slate-200">
      <BackgroundScene />
      
      {/* Overlay UI */}
      <div className="relative z-10 w-full h-full flex flex-col justify-between p-8 md:p-16 pointer-events-auto">
        
        {/* Header */}
        <header className="flex justify-between items-center w-full max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-cyan-teal/20 flex items-center justify-center border border-cyan-teal/40 shadow-[0_0_15px_rgba(0,229,255,0.3)]">
              <Zap className="w-4 h-4 text-cyan-teal" />
            </div>
            <span className="font-display font-semibold tracking-wider text-lg">SIGNHIFY</span>
          </div>
          <button 
            onClick={onEnter}
            className="px-6 py-2 rounded-full border border-slate-700 bg-slate-900/50 backdrop-blur-md hover:bg-slate-800 transition-all text-sm font-medium hover:border-cyan-teal/50 hover:shadow-[0_0_20px_rgba(0,229,255,0.2)]"
          >
            Launch Command Center
          </button>
        </header>

        {/* Hero Content */}
        <main className="flex-1 flex flex-col items-center justify-center text-center max-w-4xl mx-auto mt-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <h1 className="font-display text-5xl md:text-7xl font-bold leading-tight tracking-tight bg-clip-text text-transparent bg-gradient-to-br from-white via-slate-300 to-slate-500 mb-6 drop-shadow-lg">
              Type less. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-teal to-lucid-aqua drop-shadow-[0_0_25px_rgba(0,229,255,0.5)]">
                Orchestrate more.
              </span>
            </h1>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="text-lg md:text-xl text-slate-400 mb-10 max-w-2xl font-light"
          >
            One command. A team of specialized AI agents moves in unison. 
            Your workspace, upgraded into a living intelligence layer.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <button 
              onClick={onEnter}
              className="group relative px-8 py-4 bg-transparent border border-cyan-teal/50 rounded-full overflow-hidden transition-all hover:scale-105"
            >
              <div className="absolute inset-0 bg-cyan-teal/10 group-hover:bg-cyan-teal/20 transition-all blur-md" />
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-teal/0 via-cyan-teal/20 to-cyan-teal/0 group-hover:translate-x-full duration-1000 transition-transform ease-in-out" />
              <div className="relative flex items-center gap-3 font-semibold text-cyan-teal tracking-wide">
                INITIALIZE WORKSPACE
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>
          </motion.div>
        </main>

        {/* Feature/Agent Status Bar - Bottom */}
        <motion.footer 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="w-full max-w-6xl mx-auto flex flex-wrap justify-center gap-4 md:gap-12 pb-8 border-t border-slate-800/50 pt-8 mt-12"
        >
          <FeatureItem icon={Bot} title="Multi-Agent" desc="Nexus, Scribe, Forge" />
          <FeatureItem icon={TerminalSquare} title="Execution" desc="Live Code Generation" />
          <FeatureItem icon={Workflow} title="Orchestration" desc="Parallel Tasks" />
          <FeatureItem icon={Cpu} title="Ambient UI" desc="Spatial Intelligence" />
          <FeatureItem icon={ShieldCheck} title="Private Vault" desc="Encrypted Memory" />
        </motion.footer>
      </div>
    </div>
  );
}

function FeatureItem({ icon: Icon, title, desc }: { icon: any, title: string, desc: string }) {
  return (
    <div className="flex items-center gap-3 bg-slate-900/30 px-4 py-2 rounded-xl border border-slate-800/50 backdrop-blur-sm">
      <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center">
        <Icon className="w-4 h-4 text-slate-400" />
      </div>
      <div className="flex flex-col text-left">
        <span className="text-xs font-semibold text-slate-200">{title}</span>
        <span className="text-[10px] text-slate-500">{desc}</span>
      </div>
    </div>
  );
}
