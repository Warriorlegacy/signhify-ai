import { motion, AnimatePresence } from "framer-motion";
import { Mic, X, Volume2, ShieldAlert, Check } from "lucide-react";
import { useEffect, useState } from "react";

interface VoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function VoiceModal({ isOpen, onClose }: VoiceModalProps) {
  const [state, setState] = useState<"idle" | "listening" | "thinking" | "speaking">("listening");
  const [waveformBars, setWaveformBars] = useState<number[]>(Array(15).fill(10));

  useEffect(() => {
    if (!isOpen) return;

    // Simulate states
    const listeningTimer = setTimeout(() => setState("thinking"), 5000);
    const thinkingTimer = setTimeout(() => setState("speaking"), 8000);
    const speakingTimer = setTimeout(() => setState("idle"), 13000);

    return () => {
      clearTimeout(listeningTimer);
      clearTimeout(thinkingTimer);
      clearTimeout(speakingTimer);
    };
  }, [isOpen]);

  // Waveform animation loop
  useEffect(() => {
    if (state !== "listening" && state !== "speaking") return;

    const interval = setInterval(() => {
      setWaveformBars(
        Array(15)
          .fill(0)
          .map(() => Math.floor(Math.random() * 50) + 10)
      );
    }, 120);

    return () => clearInterval(interval);
  }, [state]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-md p-6 rounded-2xl border border-slate-800 text-center shadow-[0_8px_32px_rgba(0,0,0,0.6)]"
        style={{
          background: "rgba(10, 10, 16, 0.95)",
        }}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-900 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mt-8 mb-6 flex justify-center">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center relative"
            style={{
              background:
                state === "listening"
                  ? "rgba(0, 229, 255, 0.1)"
                  : state === "thinking"
                    ? "rgba(167, 139, 250, 0.1)"
                    : "rgba(52, 211, 153, 0.1)",
              border: `1px solid ${
                state === "listening"
                  ? "rgba(0, 229, 255, 0.2)"
                  : state === "thinking"
                    ? "rgba(167, 139, 250, 0.2)"
                    : "rgba(52, 211, 153, 0.2)"
              }`,
            }}
          >
            {state === "listening" && <Mic className="w-6 h-6 text-cyan-teal animate-pulse" />}
            {state === "thinking" && <Volume2 className="w-6 h-6 text-purple-400 animate-bounce" />}
            {state === "speaking" && <Check className="w-6 h-6 text-emerald-400" />}
            {state === "idle" && <Mic className="w-6 h-6 text-slate-500" />}

            {/* Pulse waves */}
            {state === "listening" && (
              <div className="absolute inset-0 rounded-full border border-cyan-teal/30 pulse-ring" />
            )}
          </div>
        </div>

        <h3 className="text-base font-semibold text-white mb-2">
          {state === "listening" && "Listening to query..."}
          {state === "thinking" && "Orchestrating agents..."}
          {state === "speaking" && "Responding..."}
          {state === "idle" && "Workspace Sync Ready"}
        </h3>
        <p className="text-xs text-slate-400 mb-8 px-4 leading-relaxed">
          {state === "listening" && "Speak clearly. Nexus is currently listening to route your command."}
          {state === "thinking" && "Tuning Forge, Scribe, and Scout to prepare response."}
          {state === "speaking" && "Transcribing output back into workspace."}
          {state === "idle" && "Finished processing. Click close to return to command center."}
        </p>

        {/* Waveform Visualizer */}
        {(state === "listening" || state === "speaking") && (
          <div className="flex justify-center items-center gap-1 h-16 mb-4">
            {waveformBars.map((height, i) => (
              <motion.div
                key={i}
                className="w-1.5 rounded-full"
                style={{
                  height: `${height}px`,
                  background: state === "listening" ? "#00e5ff" : "#34d399",
                }}
                animate={{ height: `${height}px` }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              />
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
