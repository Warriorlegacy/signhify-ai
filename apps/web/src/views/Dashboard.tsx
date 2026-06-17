import { useEffect } from "react";
import { useAuthStore } from "../stores/authStore";
import { useThreadStore } from "../stores/threadStore";
import { useSettingsStore } from "../stores/settingsStore";
import { ThreadList } from "../components/chat/ThreadList";
import { ChatView } from "./Chat";
import { SettingsView } from "./Settings";
import { Bot, Settings, LogOut, Key } from "lucide-react";

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
    <div className="flex h-screen">
      <aside className="flex w-64 flex-col border-r border-gray-800 bg-gray-950">
        <div className="flex items-center gap-2 border-b border-gray-800 px-4 py-3">
          <Bot className="h-5 w-5 text-amber-500" />
          <span className="text-sm font-bold text-gray-100">Signhify AI</span>
        </div>

        <ThreadList
          threads={threads}
          activeId={activeThread?._id}
          isLoading={isLoading}
          onSelect={handleSelectThread}
          onNew={handleNewThread}
          onDelete={deleteThread}
        />

        <div className="border-t border-gray-800 p-3">
          <div className="mb-2 flex items-center gap-2 px-2">
            <div className="h-6 w-6 rounded-full bg-gray-800 flex items-center justify-center text-xs text-gray-400">
              {user?.displayName?.[0] ?? "?"}
            </div>
            <span className="flex-1 truncate text-sm text-gray-400">
              {user?.displayName ?? "User"}
            </span>
          </div>

          {!hasKeys && (
            <button
              onClick={() => onViewChange("settings")}
              className="mb-2 flex w-full items-center gap-2 rounded-lg bg-amber-500/10 px-3 py-2 text-xs text-amber-400 hover:bg-amber-500/20"
            >
              <Key className="h-3 w-3" />
              Add API keys
            </button>
          )}

          <div className="flex gap-1">
            <button
              onClick={() => onViewChange("settings")}
              className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs transition-colors ${
                currentView === "settings"
                  ? "bg-gray-800 text-amber-400"
                  : "text-gray-500 hover:text-gray-300 hover:bg-gray-800/50"
              }`}
            >
              <Settings className="h-3.5 w-3.5" />
              Settings
            </button>
            <button
              onClick={logout}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-gray-500 hover:text-red-400 hover:bg-gray-800/50 transition-colors"
            >
              <LogOut className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 bg-gray-950">
        {currentView === "chat" ? <ChatView /> : <SettingsView />}
      </main>
    </div>
  );
}
