import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useMemoryStore, MemoryEntry } from "../stores/memoryStore";
import { Search, Plus, Trash2, Tag, Clock, Database, X, Brain } from "lucide-react";
import { MemoryCard } from "../components/memory/MemoryCard";

// Add memory form
function AddMemoryForm({ onAdd, onClose }: { onAdd: (key: string, value: string, tags: string[]) => void; onClose: () => void }) {
  const [key, setKey] = useState("");
  const [value, setValue] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);

  const addTag = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && tagInput.trim()) {
      e.preventDefault();
      setTags(t => [...t, tagInput.trim()]);
      setTagInput("");
    }
  };

  const removeTag = (tag: string) => setTags(t => t.filter(x => x !== tag));

  const handleSubmit = () => {
    if (!key.trim() || !value.trim()) return;
    onAdd(key.trim(), value.trim(), tags);
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: -10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="rounded-2xl p-5 mb-6"
      style={{
        background: 'rgba(0,229,255,0.04)',
        border: '1px solid rgba(0,229,255,0.15)',
      }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold" style={{ color: 'rgba(255,255,255,0.85)' }}>
          Save to Vault
        </h3>
        <button onClick={onClose} className="text-slate-500 hover:text-slate-300 transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-3">
        <input
          className="input-base"
          placeholder="Key / Title"
          value={key}
          onChange={e => setKey(e.target.value)}
          autoFocus
        />
        <textarea
          className="input-base resize-none"
          placeholder="Content / Value"
          value={value}
          onChange={e => setValue(e.target.value)}
          rows={3}
        />
        <div>
          <input
            className="input-base"
            placeholder="Add tags and press Enter..."
            value={tagInput}
            onChange={e => setTagInput(e.target.value)}
            onKeyDown={addTag}
          />
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {tags.map(tag => (
                <button
                  key={tag}
                  onClick={() => removeTag(tag)}
                  className="tag-pill hover:opacity-70 transition-opacity"
                >
                  {tag} <X className="w-2 h-2" />
                </button>
              ))}
            </div>
          )}
        </div>
        <button onClick={handleSubmit} className="btn-primary w-full justify-center">
          Save to Vault
        </button>
      </div>
    </motion.div>
  );
}

export function MemoryView() {
  const { entries, isLoading, searchQuery, loadMemory, addEntry, deleteEntry, setSearch, filteredEntries } = useMemoryStore();
  const [showAdd, setShowAdd] = useState(false);

  useEffect(() => { loadMemory(); }, []);

  const results = filteredEntries();

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-6"
        >
          <div>
            <h1 className="font-display text-xl font-bold gradient-text mb-1">Memory Vault</h1>
            <p className="text-xs" style={{ color: 'rgba(148,163,184,0.5)' }}>
              {entries.length} entries · Your persistent knowledge base
            </p>
          </div>
          <button
            onClick={() => setShowAdd(!showAdd)}
            className="btn-primary"
            id="add-memory-btn"
          >
            <Plus className="w-4 h-4" />
            Save Memory
          </button>
        </motion.div>

        {/* Add form */}
        <AnimatePresence>
          {showAdd && (
            <AddMemoryForm
              onAdd={addEntry}
              onClose={() => setShowAdd(false)}
            />
          )}
        </AnimatePresence>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'rgba(148,163,184,0.4)' }} />
          <input
            className="input-base pl-10"
            placeholder="Search memories, notes, vault entries..."
            value={searchQuery}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { label: 'Total Entries', value: entries.length, icon: Database, color: '#00e5ff' },
            { label: 'Tagged', value: entries.filter(e => e.tags?.length > 0).length, icon: Tag, color: '#a78bfa' },
            { label: 'This Week', value: entries.filter(e => {
              const d = new Date(e.createdAt);
              const now = new Date();
              return (now.getTime() - d.getTime()) < 7 * 24 * 60 * 60 * 1000;
            }).length, icon: Clock, color: '#34d399' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="rounded-xl p-3 text-center"
              style={{ background: `${color}06`, border: `1px solid ${color}15` }}>
              <Icon className="w-4 h-4 mx-auto mb-1.5" style={{ color }} />
              <div className="font-display text-lg font-bold" style={{ color }}>{value}</div>
              <div className="text-[10px]" style={{ color: 'rgba(148,163,184,0.4)' }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Entries */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="flex gap-1">
              {[0,1,2].map(i => (
                <div key={i} className="w-2 h-2 rounded-full streaming-dot" style={{ background: '#00e5ff' }} />
              ))}
            </div>
          </div>
        ) : results.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20 rounded-2xl"
            style={{ background: 'rgba(0,229,255,0.02)', border: '1px solid rgba(0,229,255,0.06)' }}
          >
            <Brain className="w-12 h-12 mx-auto mb-4" style={{ color: 'rgba(0,229,255,0.3)' }} />
            <p className="text-sm font-medium mb-2" style={{ color: 'rgba(148,163,184,0.5)' }}>
              {searchQuery ? "No results found" : "Memory vault is empty"}
            </p>
            <p className="text-xs" style={{ color: 'rgba(148,163,184,0.3)' }}>
              {searchQuery ? `No entries match "${searchQuery}"` : 'Start by saving a note or asking Vault to remember something'}
            </p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <AnimatePresence mode="popLayout">
              {results.map((entry) => (
                <MemoryCard key={entry._id} entry={entry} onDelete={deleteEntry} />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
