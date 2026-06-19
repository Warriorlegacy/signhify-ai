import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore } from "../stores/authStore";
import { useThreadStore } from "../stores/threadStore";
import { useSettingsStore } from "../stores/settingsStore";
import { useThemeStore, THEMES } from "../stores/themeStore";
import { ThreadList } from "../components/chat/ThreadList";
import { ChatView } from "./Chat";
import { SettingsView } from "./Settings";
import { AgentsView } from "./Agents";
import { MemoryView } from "./Memory";
import { ScheduleView } from "./Schedule";
import { SkillsView } from "./Skills";
import { CommandPalette } from "../components/shared/CommandPalette";
import {
  LayoutDashboard,
  BrainCircuit,
  Bot,
  Settings,
  LogOut,
  Key,
  Zap,
  Search,
  Calendar,
  ChevronRight,
  Plus,
  Activity,
  Cpu,
  Shield,
  Terminal,
  Menu,
  X,
  Palette,
} from "lucide-react";
import { useAgentStore } from "../stores/agentStore";

export type View =
  | "chat"
  | "agents"
  | "memory"
  | "skills"
  | "schedule"
  | "settings";

interface NavItemProps {
  icon: any;
  label: string;
  active: boolean;
  onClick: () => void;
  badge?: number;
}

function NavItem({ icon: Icon, label, active, onClick, badge }: NavItemProps) {
  return (
    <button
      onClick={onClick}
      className="group w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 relative overflow-hidden"
      style={{
        background: active ? "rgba(0, 229, 255, 0.08)" : "transparent",
        border: active
          ? "1px solid rgba(0, 229, 255, 0.15)"
          : "1px solid transparent",
        boxShadow: active ? "inset 0 0 15px rgba(0, 229, 255, 0.04)" : "none",
      }}
    >
      {active && (
        <div
          className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 rounded-r-full"
          style={{ background: "#00e5ff", boxShadow: "0 0 8px #00e5ff" }}
        />
      )}
      <Icon
        className="w-4 h-4 flex-shrink-0 transition-colors"
        style={{ color: active ? "#00e5ff" : "rgba(148,163,184,0.7)" }}
      />
      <span
        className="text-sm font-medium transition-colors"
        style={{ color: active ? "#00e5ff" : "rgba(148,163,184,0.8)" }}
      >
        {label}
      </span>
      {badge !== undefined && badge > 0 && (
        <span
          className="ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded-full"
          style={{ background: "rgba(0, 229, 255, 0.15)", color: "#00e5ff" }}
        >
          {badge}
        </span>
      )}
    </button>
  );
}

function IntelligencePanel() {
  const { agents, orchestrationEvents } = useAgentStore();
  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        <div>
          <p className="section-label mb-3">Agent Status</p>
          <div className="space-y-1.5">
            {agents.map((agent) => (
              <div
                key={agent.id}
                className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg transition-all duration-200"
                style={{
                  background:
                    agent.status === "active"
                      ? `${agent.color}08`
                      : "transparent",
                  border: `1px solid ${agent.status === "active" ? agent.color + "20" : "transparent"}`,
                }}
              >
                <div className="relative flex-shrink-0">
                  <div
                    className="w-2 h-2 rounded-full transition-all duration-300"
                    style={{
                      background:
                        agent.status === "idle"
                          ? "rgba(71, 85, 105, 0.6)"
                          : agent.color,
                      boxShadow:
                        agent.status !== "idle"
                          ? `0 0 8px ${agent.color}`
                          : "none",
                    }}
                  />
                  {agent.status === "active" && (
                    <div
                      className="absolute inset-0 rounded-full pulse-ring"
                      style={{ background: agent.color, opacity: 0.4 }}
                    />
                  )}
                </div>
                <span
                  className="text-xs font-medium flex-1"
                  style={{
                    color:
                      agent.status === "idle"
                        ? "rgba(148,163,184,0.5)"
                        : agent.color,
                  }}
                >
                  {agent.label}
                </span>
                {agent.tasksCompleted > 0 && (
                  <span
                    className="text-[10px]"
                    style={{ color: "rgba(148,163,184,0.3)" }}
                  >
                    {agent.tasksCompleted}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {orchestrationEvents.length > 0 && (
          <div>
            <p className="section-label mb-3">Recent Activity</p>
            <div className="space-y-2">
              {orchestrationEvents.slice(0, 5).map((event) => (
                <div
                  key={event.id}
                  className="text-xs p-2 rounded-lg"
                  style={{
                    background: "rgba(0,229,255,0.04)",
                    border: "1px solid rgba(0,229,255,0.08)",
                  }}
                >
                  <span style={{ color: "rgba(148,163,184,0.6)" }}>
                    {event.fromAgent} → {event.toAgent}
                  </span>
                  <p
                    className="mt-0.5 truncate"
                    style={{ color: "rgba(148,163,184,0.4)" }}
                  >
                    {event.message}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div>
          <p className="section-label mb-3">Quick Actions</p>
          <div className="space-y-1.5">
            {[
              { label: "New Research", icon: Search, color: "#34d399" },
              { label: "Write Content", icon: BrainCircuit, color: "#a78bfa" },
              { label: "Generate Code", icon: Cpu, color: "#f59e0b" },
              { label: "Save to Vault", icon: Shield, color: "#fb7185" },
            ].map(({ label, icon: Icon, color }) => (
              <button
                key={label}
                className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg transition-all duration-200 text-left hover:scale-[1.02]"
                style={{
                  background: `${color}08`,
                  border: `1px solid ${color}15`,
                  color: "rgba(148,163,184,0.7)",
                }}
              >
                <Icon className="w-3.5 h-3.5 flex-shrink-0" style={{ color }} />
                <span className="text-xs font-medium">{label}</span>
                <ChevronRight className="w-3 h-3 ml-auto opacity-40" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ThemePicker({ onClose }: { onClose: () => void }) {
  const { currentTheme, setTheme } = useThemeStore();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <div
        className="w-80 rounded-2xl p-5"
        style={{
          background: "rgba(11, 11, 17, 0.95)",
          border: "1px solid rgba(30, 30, 46, 0.8)",
          boxShadow: "0 25px 80px rgba(0,0,0,0.5)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <p
            className="text-sm font-semibold"
            style={{ color: "rgba(255,255,255,0.9)" }}
          >
            Theme
          </p>
          <button onClick={onClose}>
            <X className="w-4 h-4" style={{ color: "rgba(148,163,184,0.5)" }} />
          </button>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {Object.values(THEMES).map((t) => (
            <button
              key={t.id}
              onClick={() => {
                setTheme(t.id);
                onClose();
              }}
              className="flex flex-col items-center gap-2 p-3 rounded-xl transition-all"
              style={{
                background:
                  currentTheme === t.id
                    ? `${t.accent}15`
                    : "rgba(255,255,255,0.02)",
                border: `1px solid ${currentTheme === t.id ? t.accent + "40" : "rgba(255,255,255,0.06)"}`,
              }}
            >
              <div
                className="w-8 h-8 rounded-full"
                style={{
                  background: t.accent,
                  boxShadow: `0 0 12px ${t.accent}40`,
                }}
              />
              <span
                className="text-[10px] font-medium"
                style={{
                  color:
                    currentTheme === t.id ? t.accent : "rgba(148,163,184,0.6)",
                }}
              >
                {t.name}
              </span>
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

export function Dashboard() {
  const [currentView, setCurrentView] = useState<View>("chat");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [cmdPaletteOpen, setCmdPaletteOpen] = useState(false);
  const [themePickerOpen, setThemePickerOpen] = useState(false);
  const { user, logout } = useAuthStore();
  const {
    threads,
    activeThread,
    isLoading,
    loadThreads,
    setActiveThread,
    createThread,
    deleteThread,
  } = useThreadStore();
  const { hasKeys, activeProvider } = useSettingsStore();

  useEffect(() => {
    loadThreads();
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setCmdPaletteOpen((o) => !o);
      }
      if ((e.metaKey || e.ctrlKey) && e.key === "1") {
        e.preventDefault();
        setCurrentView("chat");
      }
      if ((e.metaKey || e.ctrlKey) && e.key === "2") {
        e.preventDefault();
        setCurrentView("agents");
      }
      if ((e.metaKey || e.ctrlKey) && e.key === "3") {
        e.preventDefault();
        setCurrentView("memory");
      }
      if ((e.metaKey || e.ctrlKey) && e.key === "4") {
        e.preventDefault();
        setCurrentView("skills");
      }
      if ((e.metaKey || e.ctrlKey) && e.key === "5") {
        e.preventDefault();
        setCurrentView("schedule");
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const handleNewThread = async () => {
    setActiveThread(null);
    setCurrentView("chat");
  };

  const handleSelectThread = (id: string) => {
    const thread = threads.find((t) => t._id === id);
    if (thread) {
      setActiveThread(thread);
      setCurrentView("chat");
    }
    setSidebarOpen(false);
  };

  const navItems: { icon: any; label: string; view: View }[] = [
    { icon: LayoutDashboard, label: "Command Center", view: "chat" },
    { icon: Bot, label: "Agents", view: "agents" },
    { icon: BrainCircuit, label: "Memory Vault", view: "memory" },
    { icon: Terminal, label: "Skills", view: "skills" },
    { icon: Calendar, label: "Scheduler", view: "schedule" },
  ];

  return (
    <div className="relative flex h-screen w-full overflow-hidden bg-obsidian text-slate-200">
      <div className="absolute inset-0 z-0 neural-mesh pointer-events-none" />
      <div
        className="absolute inset-0 z-0 pointer-events-none"
        style={{ background: "rgba(3,3,5,0.82)", backdropFilter: "blur(2px)" }}
      />

      <div className="relative z-10 flex h-full w-full p-2 gap-2">
        {/* Mobile hamburger */}
        <button
          onClick={() => setSidebarOpen(true)}
          className="md:hidden fixed top-3 left-3 z-30 w-10 h-10 rounded-xl flex items-center justify-center"
          style={{
            background: "rgba(11, 11, 17, 0.9)",
            border: "1px solid rgba(30, 30, 46, 0.7)",
          }}
        >
          <Menu
            className="w-5 h-5"
            style={{ color: "rgba(148,163,184,0.7)" }}
          />
        </button>

        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div
            className="md:hidden fixed inset-0 z-40"
            style={{ background: "rgba(0,0,0,0.6)" }}
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Left Navigation Rail */}
        <motion.aside
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className={`flex w-60 flex-col rounded-2xl overflow-hidden flex-shrink-0
            max-md:fixed max-md:inset-y-0 max-md:left-0 max-md:z-50 max-md:h-full max-md:rounded-none
            ${sidebarOpen ? "max-md:translate-x-0" : "max-md:-translate-x-full"} max-md:transition-transform`}
          style={{
            background: "rgba(11, 11, 17, 0.95)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(30, 30, 46, 0.7)",
          }}
        >
          {/* Mobile close */}
          <div className="md:hidden flex items-center justify-end px-3 pt-3">
            <button onClick={() => setSidebarOpen(false)}>
              <X
                className="w-5 h-5"
                style={{ color: "rgba(148,163,184,0.5)" }}
              />
            </button>
          </div>

          {/* Logo */}
          <div
            className="flex items-center gap-3 px-5 py-4 border-b"
            style={{ borderColor: "rgba(30, 30, 46, 0.6)" }}
          >
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{
                background: "rgba(0, 229, 255, 0.12)",
                border: "1px solid rgba(0, 229, 255, 0.25)",
                boxShadow: "0 0 12px rgba(0, 229, 255, 0.15)",
              }}
            >
              <Zap className="h-4 w-4 text-cyan-teal" />
            </div>
            <div className="flex-1">
              <span
                className="text-xs font-display font-bold tracking-widest"
                style={{ color: "rgba(255,255,255,0.9)" }}
              >
                SIGNHIFY
              </span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <div className="status-dot-active scale-75" />
                <span
                  className="text-[9px] font-medium"
                  style={{ color: "#00e5ff", opacity: 0.7 }}
                >
                  {activeProvider} Active
                </span>
              </div>
            </div>
          </div>

          {/* Search / Cmd+K trigger */}
          <div className="px-3 pt-3">
            <button
              onClick={() => setCmdPaletteOpen(true)}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs transition-all"
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.06)",
                color: "rgba(148,163,184,0.5)",
              }}
            >
              <Search className="w-3.5 h-3.5" />
              <span className="flex-1 text-left">Search commands...</span>
              <kbd
                className="text-[9px] px-1 py-0.5 rounded"
                style={{ background: "rgba(255,255,255,0.05)" }}
              >
                ⌘K
              </kbd>
            </button>
          </div>

          {/* Nav */}
          <nav className="flex-1 flex flex-col overflow-hidden p-3 gap-1">
            {navItems.map((item) => (
              <NavItem
                key={item.view}
                icon={item.icon}
                label={item.label}
                active={currentView === item.view}
                onClick={() => {
                  setCurrentView(item.view);
                  setSidebarOpen(false);
                }}
              />
            ))}

            {currentView === "chat" && (
              <div className="mt-3">
                <div className="flex items-center justify-between px-3 mb-2">
                  <p className="section-label">Threads</p>
                  <button
                    onClick={handleNewThread}
                    className="w-5 h-5 rounded-md flex items-center justify-center transition-all hover:scale-110"
                    style={{
                      background: "rgba(0,229,255,0.1)",
                      border: "1px solid rgba(0,229,255,0.2)",
                    }}
                  >
                    <Plus className="w-3 h-3 text-cyan-teal" />
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto max-h-52">
                  <ThreadList
                    threads={threads}
                    activeId={activeThread?._id}
                    isLoading={isLoading}
                    onSelect={handleSelectThread}
                    onNew={handleNewThread}
                    onDelete={deleteThread}
                  />
                </div>
              </div>
            )}
          </nav>

          {/* User footer */}
          <div
            className="p-3 border-t"
            style={{ borderColor: "rgba(30, 30, 46, 0.5)" }}
          >
            {!hasKeys && (
              <button
                onClick={() => setCurrentView("settings")}
                className="mb-2 flex w-full items-center justify-center gap-2 rounded-lg py-2 text-xs font-medium transition-all hover:scale-[1.02]"
                style={{
                  background: "rgba(245, 166, 35, 0.08)",
                  border: "1px solid rgba(245, 166, 35, 0.25)",
                  color: "#f5a623",
                }}
              >
                <Key className="h-3 w-3" />
                Initialize API Keys
              </button>
            )}

            <div
              className="flex items-center gap-2.5 p-2 rounded-xl mb-2"
              style={{ background: "rgba(255,255,255,0.03)" }}
            >
              <div
                className="h-8 w-8 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0"
                style={{
                  background: "rgba(0,229,255,0.12)",
                  border: "1px solid rgba(0,229,255,0.2)",
                  color: "#00e5ff",
                }}
              >
                {user?.displayName?.[0]?.toUpperCase() ?? "?"}
              </div>
              <div className="flex-1 overflow-hidden">
                <p
                  className="text-xs font-semibold truncate"
                  style={{ color: "rgba(255,255,255,0.85)" }}
                >
                  {user?.displayName ?? "Operative"}
                </p>
                <p
                  className="text-[10px] truncate"
                  style={{ color: "rgba(148,163,184,0.4)" }}
                >
                  {user?.plan?.toUpperCase() ?? "FREE"}
                </p>
              </div>
            </div>

            <div className="flex gap-1">
              <button
                onClick={() => setThemePickerOpen(true)}
                className="flex items-center justify-center rounded-lg p-2 transition-all"
                style={{ color: "rgba(148,163,184,0.5)" }}
                title="Theme"
              >
                <Palette className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => setCurrentView("settings")}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs transition-all"
                style={{
                  background:
                    currentView === "settings"
                      ? "rgba(0,229,255,0.08)"
                      : "transparent",
                  border:
                    currentView === "settings"
                      ? "1px solid rgba(0,229,255,0.15)"
                      : "1px solid transparent",
                  color:
                    currentView === "settings"
                      ? "#00e5ff"
                      : "rgba(148,163,184,0.5)",
                }}
              >
                <Settings className="h-3.5 w-3.5" />
                Settings
              </button>
              <button
                onClick={logout}
                className="flex items-center justify-center rounded-lg p-2 transition-all hover:text-red-400"
                style={{ color: "rgba(148,163,184,0.4)" }}
                title="Sign Out"
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </motion.aside>

        {/* Central Command Canvas */}
        <motion.main
          initial={{ opacity: 0, scale: 0.99 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="flex-1 flex flex-col rounded-2xl overflow-hidden min-w-0"
          style={{
            background: "rgba(11, 11, 17, 0.8)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(30, 30, 46, 0.7)",
          }}
        >
          {/* Top Status Bar */}
          <header
            className="h-14 flex items-center justify-between px-5 flex-shrink-0"
            style={{ borderBottom: "1px solid rgba(30, 30, 46, 0.5)" }}
          >
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="status-dot-active" />
                <span
                  className="text-xs font-medium"
                  style={{ color: "rgba(148,163,184,0.7)" }}
                >
                  Nexus Online
                </span>
              </div>
              <div
                className="hidden md:flex items-center gap-1.5 px-2 py-1 rounded-lg"
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <Activity
                  className="w-3 h-3"
                  style={{ color: "rgba(148,163,184,0.4)" }}
                />
                <span
                  className="text-[11px]"
                  style={{ color: "rgba(148,163,184,0.4)" }}
                >
                  {navItems.find((n) => n.view === currentView)?.label}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setCmdPaletteOpen(true)}
                className="hidden md:flex items-center gap-1.5 px-2 py-1.5 rounded-lg transition-all"
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  color: "rgba(148,163,184,0.4)",
                }}
              >
                <Search className="w-3 h-3" />
                <span className="text-[11px]">⌘K</span>
              </button>
            </div>
          </header>

          <div className="flex-1 overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentView}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                className="h-full"
              >
                {currentView === "chat" && <ChatView />}
                {currentView === "agents" && <AgentsView />}
                {currentView === "memory" && <MemoryView />}
                {currentView === "skills" && <SkillsView />}
                {currentView === "schedule" && <ScheduleView />}
                {currentView === "settings" && <SettingsView />}
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.main>

        {/* Right Intelligence Panel */}
        {(currentView === "chat" || currentView === "agents") && (
          <motion.aside
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="w-64 hidden xl:flex flex-col rounded-2xl overflow-hidden flex-shrink-0"
            style={{
              background: "rgba(11, 11, 17, 0.85)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(30, 30, 46, 0.7)",
            }}
          >
            <div
              className="h-14 flex items-center px-4 flex-shrink-0"
              style={{ borderBottom: "1px solid rgba(30, 30, 46, 0.5)" }}
            >
              <span className="section-label">Intelligence Feed</span>
            </div>
            <IntelligencePanel />
          </motion.aside>
        )}
      </div>

      {/* Command Palette */}
      <CommandPalette
        isOpen={cmdPaletteOpen}
        onClose={() => setCmdPaletteOpen(false)}
        onNavigate={(v) => setCurrentView(v as View)}
        onCommand={(cmd) => {
          if (cmd === "new-thread") handleNewThread();
        }}
      />

      {/* Theme Picker */}
      <AnimatePresence>
        {themePickerOpen && (
          <ThemePicker onClose={() => setThemePickerOpen(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}
