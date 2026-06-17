import { Plus, Trash2, Loader2, Workflow } from "lucide-react";

interface Thread {
  _id: string;
  title: string;
  updatedAt: string;
}

interface ThreadListProps {
  threads: Thread[];
  activeId?: string;
  isLoading: boolean;
  onSelect: (id: string) => void;
  onNew: () => void;
  onDelete: (id: string) => void;
}

export function ThreadList({
  threads,
  activeId,
  isLoading,
  onSelect,
  onNew,
  onDelete,
}: ThreadListProps) {
  return (
    <div className="flex flex-col gap-1 w-full">
      <button
        onClick={onNew}
        className="flex items-center justify-center gap-2 mb-2 w-full py-2 rounded-xl border border-cyan-teal/30 bg-cyan-teal/10 text-cyan-teal text-xs font-semibold hover:bg-cyan-teal/20 transition-all shadow-[0_0_10px_rgba(0,229,255,0.1)] hover:shadow-[0_0_15px_rgba(0,229,255,0.2)]"
      >
        <Plus className="h-4 w-4" />
        NEW WORKSPACE
      </button>

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-5 w-5 animate-spin text-cyan-teal/50" />
        </div>
      ) : threads.length === 0 ? (
        <div className="py-6 text-center text-xs text-slate-500 font-light">
          No active workspaces
        </div>
      ) : (
        threads.map((thread) => (
          <div
            key={thread._id}
            onClick={() => onSelect(thread._id)}
            className={`group flex cursor-pointer items-center gap-3 px-3 py-2.5 rounded-xl text-xs transition-all ${
              activeId === thread._id
                ? "bg-slate-800/80 text-cyan-teal border border-slate-700 shadow-sm"
                : "text-slate-400 hover:bg-slate-800/40 border border-transparent hover:text-slate-300"
            }`}
          >
            <Workflow className={`h-3.5 w-3.5 shrink-0 ${activeId === thread._id ? 'text-cyan-teal' : 'text-slate-500'}`} />
            <span className="flex-1 truncate font-medium">{thread.title}</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(thread._id);
              }}
              className={`shrink-0 transition-opacity ${activeId === thread._id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
            >
              <Trash2 className="h-3.5 w-3.5 text-slate-500 hover:text-red-400 transition-colors" />
            </button>
          </div>
        ))
      )}
    </div>
  );
}
