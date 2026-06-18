import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, Trash2, Clock } from "lucide-react";
import { MemoryEntry } from "../../stores/memoryStore";

interface MemoryCardProps {
  entry: MemoryEntry;
  onDelete: (id: string) => void;
}

export function MemoryCard({ entry, onDelete }: MemoryCardProps) {
  const [hovering, setHovering] = useState(false);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ y: -2 }}
      onHoverStart={() => setHovering(true)}
      onHoverEnd={() => setHovering(false)}
      className="relative rounded-xl p-4 overflow-hidden transition-all duration-200"
      style={{
        background: hovering ? "rgba(17, 17, 24, 0.9)" : "rgba(13, 13, 20, 0.7)",
        border: `1px solid ${hovering ? "rgba(0, 229, 255, 0.2)" : "rgba(30, 30, 46, 0.7)"}`,
        backdropFilter: "blur(12px)",
        boxShadow: hovering ? "0 4px 24px rgba(0,0,0,0.3), 0 0 20px rgba(0,229,255,0.05)" : "none",
      }}
    >
      <AnimatePresence>
        {hovering && (
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            exit={{ scaleX: 0 }}
            className="absolute top-0 inset-x-0 h-px origin-left"
            style={{ background: "linear-gradient(90deg, #00e5ff, transparent)" }}
          />
        )}
      </AnimatePresence>

      <div className="flex items-start gap-3">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
          style={{ background: "rgba(0,229,255,0.08)", border: "1px solid rgba(0,229,255,0.15)" }}
        >
          <Brain className="w-4 h-4" style={{ color: "rgba(0,229,255,0.6)" }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-sm font-semibold truncate" style={{ color: "rgba(255,255,255,0.85)" }}>
              {entry.key || entry.title || "Untitled"}
            </h3>
            <AnimatePresence>
              {hovering && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(entry._id);
                  }}
                  className="p-1 rounded-md flex-shrink-0 transition-colors hover:text-red-400"
                  style={{ color: "rgba(148,163,184,0.4)" }}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </motion.button>
              )}
            </AnimatePresence>
          </div>
          <p
            className="text-xs mt-1 leading-relaxed line-clamp-3"
            style={{ color: "rgba(148,163,184,0.55)" }}
          >
            {entry.value || entry.content}
          </p>

          <div className="flex items-center gap-3 mt-3">
            <div className="flex items-center gap-1 flex-wrap">
              {(entry.tags ?? []).slice(0, 3).map((tag) => (
                <span key={tag} className="tag-pill">
                  {tag}
                </span>
              ))}
            </div>
            <div className="flex items-center gap-1 ml-auto flex-shrink-0">
              <Clock className="w-2.5 h-2.5" style={{ color: "rgba(148,163,184,0.3)" }} />
              <span className="text-[10px]" style={{ color: "rgba(148,163,184,0.3)" }}>
                {new Date(entry.createdAt || entry.updatedAt || "").toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
