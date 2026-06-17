import { MessageSquare, Plus, Trash2, Loader2 } from "lucide-react";

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
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-gray-800 p-4">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
          Threads
        </h2>
        <button
          onClick={onNew}
          className="flex h-7 w-7 items-center justify-center rounded-lg bg-gray-800 text-gray-400 transition-colors hover:bg-gray-700 hover:text-amber-400"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-gray-500" />
          </div>
        ) : threads.length === 0 ? (
          <div className="px-4 py-6 text-center text-sm text-gray-600">
            No conversations yet
          </div>
        ) : (
          threads.map((thread) => (
            <div
              key={thread._id}
              onClick={() => onSelect(thread._id)}
              className={`group flex cursor-pointer items-center gap-3 border-b border-gray-800/50 px-4 py-3 text-sm transition-colors hover:bg-gray-800/50 ${
                activeId === thread._id
                  ? "bg-gray-800/70 text-amber-400"
                  : "text-gray-400"
              }`}
            >
              <MessageSquare className="h-4 w-4 shrink-0" />
              <span className="flex-1 truncate">{thread.title}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(thread._id);
                }}
                className="shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
              >
                <Trash2 className="h-3.5 w-3.5 text-gray-600 hover:text-red-400" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
