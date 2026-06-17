import { useEffect } from "react";
import { useAuthStore } from "../stores/authStore";
import { useThreadStore } from "../stores/threadStore";
import { useSettingsStore } from "../stores/settingsStore";
import { ThreadList } from "../components/chat/ThreadList";
import { ChatView } from "./Chat";
import { SettingsView } from "./Settings";
import { Bot, Settings, LogOut, Key, Zap, LayoutDashboard, BrainCircuit, Search, Database } from "lucide-react";
import { BackgroundScene } from "../components/3d/Scene";

type View = "chat" | "settings";

interface DashboardProps {
  currentView: View;
  onViewChange: (view: View) => void;
}

export function Dashboard({ currentView, onViewChange }: DashboardProps) {
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
  const { loadKeys, hasKeys } = useSettingsStore();

  useEffect(() => {
    loadThreads();
    loadKeys();
  }, []);

  const handleNewThread = async () => {
    setActiveThread(null);
    onViewChange("chat");
  };

  const handleSelectThread = (id: string) => {
    const thread = threads.find((t) => t._id === id);
    if (thread) {
      setActiveThread(thread);
      onViewChange("chat");
    }
  };

  return (
    <div className="relative flex h-screen w-full overflow-hidden bg-obsidian text-slate-200">
      {/* 3D Background with overlay for better readability */}
      <BackgroundScene />
      <div className="absolute inset-0 bg-obsidian/80 backdrop-blur-[2px] z-0 pointer-events-none"></div>

      {/* Main UI Layer */}
      <div className="relative z-10 flex h-full w-full p-2 gap-2">
        
        {/* Left Navigation Rail */}
        <aside className="flex w-64 flex-col rounded-2xl border border-slate-800/60 bg-slate-900/40 backdrop-blur-md shadow-lg overflow-hidden">
          <div className="flex items-center gap-3 border-b border-slate-800/50 px-5 py-4">
            <div className="w-6 h-6 rounded-full bg-cyan-teal/20 flex items-center justify-center border border-cyan-teal/40">
              <Zap className="h-3 w-3 text-cyan-teal" />
            </div>
            <span className="text-sm font-display font-semibold tracking-wide text-slate-100">SIGNHIFY</span>
          </div>

          <nav className="flex-1 flex flex-col pt-4 overflow-hidden">
            <div className="px-3 mb-2 flex flex-col gap-1">
              <NavButton icon={LayoutDashboard} label="Command Center" active={currentView === "chat"} onClick={() => onViewChange("chat")} />
              <NavButton icon={BrainCircuit} label="Memory Vault" active={false} onClick={() => {}} />
              <NavButton icon={Database} label="Agents & Models" active={false} onClick={() => {}} />
            </div>

            <div className="px-4 py-2 mt-2">
              <p className="text-[10px] font-semibold tracking-widest text-slate-500 uppercase mb-2">Active Threads</p>
            </div>
            
            <div className="flex-1 overflow-y-auto px-2 pb-4">
              <ThreadList
                threads={threads}
                activeId={activeThread?._id}
                isLoading={isLoading}
                onSelect={handleSelectThread}
                onNew={handleNewThread}
                onDelete={deleteThread}
              />
            </div>
          </nav>

          <div className="border-t border-slate-800/50 p-3 bg-slate-900/20">
            <div className="mb-3 flex items-center gap-2 px-2">
              <div className="h-7 w-7 rounded-lg bg-slate-800 flex items-center justify-center text-xs font-medium text-cyan-teal border border-slate-700/50">
                {user?.displayName?.[0] ?? "?"}
              </div>
              <div className="flex-1 overflow-hidden flex flex-col">
                <span className="truncate text-xs font-semibold text-slate-300">
                  {user?.displayName ?? "User"}
                </span>
                <span className="truncate text-[10px] text-slate-500">
                  Operative
                </span>
              </div>
            </div>

            {!hasKeys && (
              <button
                onClick={() => onViewChange("settings")}
                className="mb-2 flex w-full items-center justify-center gap-2 rounded-lg bg-plasma-gold/10 border border-plasma-gold/30 px-3 py-2 text-xs font-medium text-plasma-gold hover:bg-plasma-gold/20 transition-colors"
              >
                <Key className="h-3 w-3" />
                Initialize API Keys
              </button>
            )}

            <div className="flex gap-1 px-1">
              <button
                onClick={() => onViewChange("settings")}
                className={`flex flex-1 justify-center items-center gap-2 rounded-lg px-3 py-2 text-xs transition-colors ${
                  currentView === "settings"
                    ? "bg-slate-800/80 text-cyan-teal border border-slate-700/50"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                }`}
              >
                <Settings className="h-3.5 w-3.5" />
                Settings
              </button>
              <button
                onClick={logout}
                title="Sign Out"
                className="flex items-center justify-center rounded-lg px-3 py-2 text-slate-400 hover:text-red-400 hover:bg-slate-800/50 transition-colors"
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </aside>

        {/* Central Command Canvas */}
        <main className="flex-1 flex flex-col rounded-2xl border border-slate-800/60 bg-slate-900/40 backdrop-blur-md shadow-lg overflow-hidden relative">
          {/* Top Status Bar */}
          <header className="h-14 flex items-center justify-between px-6 border-b border-slate-800/50 bg-slate-900/20">
            <div className="flex items-center gap-4">
              <span className="text-xs font-medium text-slate-400 tracking-wide uppercase">Workspace Context</span>
              <div className="flex items-center gap-2">
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-teal opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-teal"></span>
                </span>
                <span className="text-xs text-slate-300">Nexus Online</span>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input 
                  type="text" 
                  placeholder="Search memory..."
                  className="w-48 bg-slate-950/50 border border-slate-800 rounded-full pl-8 pr-3 py-1 text-xs text-slate-300 focus:outline-none focus:border-cyan-teal/50"
                />
              </div>
            </div>
          </header>

          <div className="flex-1 overflow-hidden">
            {currentView === "chat" ? <ChatView /> : <SettingsView />}
          </div>
        </main>
        
        {/* Right Intelligence Panel (Placeholder for now) */}
        {currentView === "chat" && (
          <aside className="w-72 hidden lg:flex flex-col rounded-2xl border border-slate-800/60 bg-slate-900/40 backdrop-blur-md shadow-lg overflow-hidden">
            <div className="h-14 flex items-center px-4 border-b border-slate-800/50 bg-slate-900/20">
              <span className="text-xs font-medium text-slate-400 tracking-wide uppercase">Intelligence Feed</span>
            </div>
            <div className="flex-1 p-4 overflow-y-auto">
              {/* Intelligence content will go here */}
              <div className="flex flex-col items-center justify-center h-full text-center opacity-50">
                <BrainCircuit className="w-8 h-8 text-slate-500 mb-3" />
                <p className="text-xs text-slate-400">Awaiting context to populate research and citations.</p>
              </div>
            </div>
          </aside>
        )}

      </div>
    </div>
  );
}

function NavButton({ icon: Icon, label, active, onClick }: { icon: any, label: string, active: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all text-sm ${
        active 
          ? 'bg-cyan-teal/10 text-cyan-teal font-medium border border-cyan-teal/20 shadow-[inset_0_0_10px_rgba(0,229,255,0.05)]' 
          : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 border border-transparent'
      }`}
    >
      <Icon className={`w-4 h-4 ${active ? 'text-cyan-teal' : 'text-slate-500'}`} />
      {label}
    </button>
  );
}
