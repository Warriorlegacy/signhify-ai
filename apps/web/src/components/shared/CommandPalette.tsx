import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Bot,
  BrainCircuit,
  Terminal,
  Calendar,
  Settings,
  Shield,
  Zap,
  MessageSquare,
  ArrowRight,
  Hash,
  X,
} from "lucide-react";

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (view: string) => void;
  onCommand: (command: string) => void;
}

interface Command {
  id: string;
  label: string;
  description?: string;
  icon: any;
  color: string;
  category: string;
  action: () => void;
  shortcut?: string;
}

export function CommandPalette({
  isOpen,
  onClose,
  onNavigate,
  onCommand,
}: CommandPaletteProps) {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const commands: Command[] = [
    // Navigation
    {
      id: "nav-chat",
      label: "Command Center",
      description: "Open chat interface",
      icon: MessageSquare,
      color: "#00e5ff",
      category: "Navigate",
      action: () => {
        onNavigate("chat");
        onClose();
      },
      shortcut: "⌘1",
    },
    {
      id: "nav-agents",
      label: "Agents",
      description: "View agent status and orchestration",
      icon: Bot,
      color: "#a78bfa",
      category: "Navigate",
      action: () => {
        onNavigate("agents");
        onClose();
      },
      shortcut: "⌘2",
    },
    {
      id: "nav-memory",
      label: "Memory Vault",
      description: "Search and manage your knowledge",
      icon: BrainCircuit,
      color: "#34d399",
      category: "Navigate",
      action: () => {
        onNavigate("memory");
        onClose();
      },
      shortcut: "⌘3",
    },
    {
      id: "nav-skills",
      label: "Skills",
      description: "Reusable prompt templates",
      icon: Terminal,
      color: "#f59e0b",
      category: "Navigate",
      action: () => {
        onNavigate("skills");
        onClose();
      },
      shortcut: "⌘4",
    },
    {
      id: "nav-schedule",
      label: "Scheduler",
      description: "Manage cron tasks",
      icon: Calendar,
      color: "#60a5fa",
      category: "Navigate",
      action: () => {
        onNavigate("schedule");
        onClose();
      },
      shortcut: "⌘5",
    },
    {
      id: "nav-settings",
      label: "Settings",
      description: "API keys, providers, profile",
      icon: Settings,
      color: "#94a3b8",
      category: "Navigate",
      action: () => {
        onNavigate("settings");
        onClose();
      },
      shortcut: "⌘,",
    },

    // Quick Actions
    {
      id: "new-thread",
      label: "New Thread",
      description: "Start a fresh conversation",
      icon: Zap,
      color: "#00e5ff",
      category: "Actions",
      action: () => {
        onNavigate("chat");
        onCommand("new-thread");
        onClose();
      },
    },
    {
      id: "clear-memory",
      label: "Clear Memory Cache",
      description: "Reset local memory cache",
      icon: Shield,
      color: "#fb7185",
      category: "Actions",
      action: () => {
        onCommand("clear-memory");
        onClose();
      },
    },
    {
      id: "export-data",
      label: "Export Data",
      description: "Download threads and memories",
      icon: ArrowRight,
      color: "#34d399",
      category: "Actions",
      action: () => {
        onCommand("export-data");
        onClose();
      },
    },
  ];

  const filtered = query
    ? commands.filter(
        (c) =>
          c.label.toLowerCase().includes(query.toLowerCase()) ||
          c.description?.toLowerCase().includes(query.toLowerCase()) ||
          c.category.toLowerCase().includes(query.toLowerCase()),
      )
    : commands;

  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((i) => Math.min(filtered.length - 1, i + 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((i) => Math.max(0, i - 1));
      } else if (e.key === "Enter" && filtered[selectedIndex]) {
        filtered[selectedIndex].action();
      } else if (e.key === "Escape") {
        onClose();
      }
    },
    [filtered, selectedIndex, onClose],
  );

  const grouped = filtered.reduce(
    (acc, cmd) => {
      (acc[cmd.category] = acc[cmd.category] || []).push(cmd);
      return acc;
    },
    {} as Record<string, Command[]>,
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50"
            style={{
              background: "rgba(0,0,0,0.6)",
              backdropFilter: "blur(8px)",
            }}
            onClick={onClose}
          />

          {/* Palette */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="fixed top-[15%] left-1/2 -translate-x-1/2 z-50 w-full max-w-lg"
          >
            <div
              className="rounded-2xl overflow-hidden"
              style={{
                background: "rgba(11, 11, 17, 0.95)",
                border: "1px solid rgba(30, 30, 46, 0.8)",
                boxShadow:
                  "0 25px 80px rgba(0,0,0,0.5), 0 0 40px rgba(0,229,255,0.05)",
                backdropFilter: "blur(24px)",
              }}
            >
              {/* Search input */}
              <div
                className="flex items-center gap-3 px-4 py-3"
                style={{ borderBottom: "1px solid rgba(30, 30, 46, 0.6)" }}
              >
                <Search
                  className="w-4 h-4 flex-shrink-0"
                  style={{ color: "rgba(148,163,184,0.4)" }}
                />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Search commands, navigate, actions..."
                  className="flex-1 bg-transparent text-sm outline-none"
                  style={{ color: "rgba(255,255,255,0.9)" }}
                />
                <kbd
                  className="text-[10px] px-1.5 py-0.5 rounded"
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    color: "rgba(148,163,184,0.4)",
                  }}
                >
                  ESC
                </kbd>
              </div>

              {/* Results */}
              <div className="max-h-80 overflow-y-auto p-2">
                {Object.entries(grouped).map(([category, cmds]) => (
                  <div key={category} className="mb-2">
                    <p
                      className="text-[10px] font-bold tracking-widest uppercase px-3 py-1.5"
                      style={{ color: "rgba(148,163,184,0.3)" }}
                    >
                      {category}
                    </p>
                    {cmds.map((cmd) => {
                      const idx = filtered.indexOf(cmd);
                      return (
                        <button
                          key={cmd.id}
                          onClick={cmd.action}
                          onMouseEnter={() => setSelectedIndex(idx)}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-left"
                          style={{
                            background:
                              idx === selectedIndex
                                ? `${cmd.color}10`
                                : "transparent",
                            border:
                              idx === selectedIndex
                                ? `1px solid ${cmd.color}20`
                                : "1px solid transparent",
                          }}
                        >
                          <div
                            className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                            style={{ background: `${cmd.color}15` }}
                          >
                            <cmd.icon
                              className="w-3.5 h-3.5"
                              style={{ color: cmd.color }}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p
                              className="text-sm font-medium"
                              style={{ color: "rgba(255,255,255,0.85)" }}
                            >
                              {cmd.label}
                            </p>
                            {cmd.description && (
                              <p
                                className="text-[11px] truncate"
                                style={{ color: "rgba(148,163,184,0.4)" }}
                              >
                                {cmd.description}
                              </p>
                            )}
                          </div>
                          {cmd.shortcut && (
                            <kbd
                              className="text-[10px] px-1.5 py-0.5 rounded flex-shrink-0"
                              style={{
                                background: "rgba(255,255,255,0.05)",
                                color: "rgba(148,163,184,0.3)",
                              }}
                            >
                              {cmd.shortcut}
                            </kbd>
                          )}
                        </button>
                      );
                    })}
                  </div>
                ))}

                {filtered.length === 0 && (
                  <div className="text-center py-8">
                    <p
                      className="text-sm"
                      style={{ color: "rgba(148,163,184,0.4)" }}
                    >
                      No commands found
                    </p>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div
                className="flex items-center justify-between px-4 py-2.5"
                style={{ borderTop: "1px solid rgba(30, 30, 46, 0.5)" }}
              >
                <div className="flex items-center gap-3">
                  <span
                    className="text-[10px]"
                    style={{ color: "rgba(148,163,184,0.3)" }}
                  >
                    <kbd
                      className="px-1 py-0.5 rounded"
                      style={{ background: "rgba(255,255,255,0.05)" }}
                    >
                      ↑↓
                    </kbd>{" "}
                    navigate
                  </span>
                  <span
                    className="text-[10px]"
                    style={{ color: "rgba(148,163,184,0.3)" }}
                  >
                    <kbd
                      className="px-1 py-0.5 rounded"
                      style={{ background: "rgba(255,255,255,0.05)" }}
                    >
                      ↵
                    </kbd>{" "}
                    select
                  </span>
                </div>
                <span
                  className="text-[10px]"
                  style={{ color: "rgba(148,163,184,0.2)" }}
                >
                  {filtered.length} commands
                </span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
