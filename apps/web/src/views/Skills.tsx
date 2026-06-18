import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSkillsStore, Skill } from "../stores/skillsStore";
import { Search, Plus, Trash2, Tag, Terminal, Sparkles, X, Code, BookOpen, ChevronRight, Activity, Cpu, Shield, Zap } from "lucide-react";

const AGENT_COLORS: Record<string, string> = {
  scribe: "#a78bfa",
  scout: "#34d399",
  forge: "#f59e0b",
  vault: "#fb7185",
  herald: "#3b82f6",
  vision: "#38bdf8",
  general: "#64748b",
};

function SkillCard({ skill, onDelete, onView }: { skill: Skill; onDelete: (id: string) => void; onView: (skill: Skill) => void }) {
  const [hovering, setHovering] = useState(false);
  const color = AGENT_COLORS[skill.agentType] || AGENT_COLORS.general;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ y: -2 }}
      onHoverStart={() => setHovering(true)}
      onHoverEnd={() => setHovering(false)}
      onClick={() => onView(skill)}
      className="relative rounded-xl p-4 overflow-hidden transition-all duration-200 cursor-pointer"
      style={{
        background: hovering ? 'rgba(17, 17, 24, 0.9)' : 'rgba(13, 13, 20, 0.7)',
        border: `1px solid ${hovering ? `${color}40` : 'rgba(30, 30, 46, 0.7)'}`,
        backdropFilter: 'blur(12px)',
        boxShadow: hovering ? `0 4px 24px rgba(0,0,0,0.3), 0 0 20px ${color}10` : 'none',
      }}
    >
      {/* Top accent line on hover */}
      <AnimatePresence>
        {hovering && (
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            exit={{ scaleX: 0 }}
            className="absolute top-0 inset-x-0 h-px origin-left"
            style={{ background: `linear-gradient(90deg, ${color}, transparent)` }}
          />
        )}
      </AnimatePresence>

      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
          style={{ background: `${color}15`, border: `1px solid ${color}30` }}>
          <Terminal className="w-4 h-4" style={{ color }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-sm font-semibold truncate" style={{ color: 'rgba(255,255,255,0.85)' }}>
              {skill.name}
            </h3>
            <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded"
              style={{ background: `${color}15`, color }}>
              {skill.agentType}
            </span>
          </div>
          <p className="text-xs mt-1 leading-relaxed line-clamp-2"
            style={{ color: 'rgba(148,163,184,0.55)' }}>
            {skill.description}
          </p>

          <div className="flex items-center gap-3 mt-3">
            <div className="flex items-center gap-1">
              {(skill.tags ?? []).slice(0, 2).map((tag) => (
                <span key={tag} className="tag-pill">{tag}</span>
              ))}
            </div>
            <div className="flex items-center gap-1 ml-auto flex-shrink-0">
              <Zap className="w-2.5 h-2.5 text-cyan-teal" />
              <span className="text-[10px]" style={{ color: 'rgba(148,163,184,0.4)' }}>
                {skill.usageCount || 0} runs
              </span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function SkillDetailModal({ skill, onClose, onDelete }: { skill: Skill; onClose: () => void; onDelete: (id: string) => void }) {
  const color = AGENT_COLORS[skill.agentType] || AGENT_COLORS.general;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-2xl rounded-2xl overflow-hidden shadow-[0_10px_50px_rgba(0,0,0,0.8)] border border-slate-800"
        style={{ background: 'rgba(10, 10, 16, 0.95)', backdropFilter: 'blur(20px)' }}
      >
        {/* Header */}
        <div className="p-5 flex items-center justify-between border-b border-slate-800/60"
          style={{ background: `${color}05` }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center"
              style={{ background: `${color}15`, border: `1px solid ${color}30` }}>
              <Terminal className="w-5 h-5" style={{ color }} />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                {skill.name}
                <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded"
                  style={{ background: `${color}15`, color }}>
                  {skill.agentType}
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">{skill.description}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Prompt Template */}
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block mb-1.5">Prompt Template</span>
            <pre className="p-4 rounded-xl bg-slate-950 text-xs font-mono border border-slate-800 leading-relaxed text-slate-300 whitespace-pre-wrap select-all">
              {skill.promptTemplate}
            </pre>
          </div>

          {/* Examples */}
          {skill.examples && skill.examples.length > 0 && (
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block mb-1.5">Examples</span>
              <div className="space-y-2.5">
                {skill.examples.map((ex, idx) => (
                  <div key={idx} className="p-3 rounded-xl border border-slate-850" style={{ background: 'rgba(255,255,255,0.01)' }}>
                    <div className="text-xs font-semibold text-cyan-teal mb-1">Input Task:</div>
                    <div className="text-xs text-slate-300 mb-2">{ex.input}</div>
                    <div className="text-xs font-semibold text-purple-400 mb-1">Sample Output:</div>
                    <div className="text-xs text-slate-400 leading-relaxed truncate max-w-full block">{ex.output}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tags & Metadata */}
          <div className="flex items-center gap-3 pt-2">
            <div className="flex items-center gap-1">
              {(skill.tags ?? []).map((t) => (
                <span key={t} className="tag-pill">{t}</span>
              ))}
            </div>
            <div className="text-xs text-slate-500 ml-auto">
              Created {new Date(skill.createdAt).toLocaleDateString()}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950/60 border-t border-slate-850 flex items-center justify-between">
          <button
            onClick={() => {
              onDelete(skill._id);
              onClose();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-red-400 hover:bg-red-500/10 transition-all"
          >
            <Trash2 className="w-4 h-4" />
            Delete Skill
          </button>
          <button onClick={onClose} className="px-4 py-2 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 transition-all text-white">
            Close
          </button>
        </div>
      </motion.div>
    </div>
  );
}

function CreateSkillForm({ onClose, onSave }: { onClose: () => void; onSave: (skill: any) => void }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [agentType, setAgentType] = useState("general");
  const [promptTemplate, setPromptTemplate] = useState("");
  const [tagsInput, setTagsInput] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !description.trim() || !promptTemplate.trim()) return;

    onSave({
      name: name.toUpperCase().replace(/\s+/g, "_"),
      description,
      agentType,
      promptTemplate,
      tags: tagsInput.split(",").map((t) => t.trim()).filter(Boolean),
      examples: [],
    });
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
        <h3 className="text-sm font-semibold text-white">Create Reusable Skill</h3>
        <button onClick={onClose} className="text-slate-500 hover:text-slate-300 transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input
            className="input-base"
            placeholder="Skill Name (e.g. GENERATE_API_CLIENT)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <select
            className="input-base bg-slate-900 border border-slate-800 text-slate-300 text-xs h-10 px-3 rounded-lg outline-none"
            value={agentType}
            onChange={(e) => setAgentType(e.target.value)}
          >
            <option value="general">General Router</option>
            <option value="scribe">Scribe (Writer)</option>
            <option value="scout">Scout (Researcher)</option>
            <option value="forge">Forge (Developer)</option>
            <option value="vault">Vault (Memory)</option>
            <option value="herald">Herald (Communicator)</option>
            <option value="vision">Vision (Image)</option>
          </select>
        </div>

        <input
          className="input-base"
          placeholder="Short description of what the skill is used for"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />

        <textarea
          className="input-base resize-none font-mono text-xs"
          placeholder="Prompt template. Use {{variables}} for dynamic slots (e.g. Write a script that executes {{task}} in {{language}})"
          value={promptTemplate}
          onChange={(e) => setPromptTemplate(e.target.value)}
          rows={4}
          required
        />

        <input
          className="input-base"
          placeholder="Tags (comma-separated, e.g. code, api, writing)"
          value={tagsInput}
          onChange={(e) => setTagsInput(e.target.value)}
        />

        <button type="submit" className="btn-primary w-full justify-center">
          Save Reusable Skill
        </button>
      </form>
    </motion.div>
  );
}

export function SkillsView() {
  const { skills, suggestedSkills, isLoading, searchQuery, loadSkills, addSkill, deleteSkill, removeSuggestedSkill, setSearch, filteredSkills } = useSkillsStore();
  const [showAdd, setShowAdd] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);

  useEffect(() => {
    loadSkills();
  }, []);

  const handleSaveSuggested = async (suggested: any) => {
    await addSkill(suggested);
    removeSuggestedSkill(suggested.name);
  };

  const results = filteredSkills();

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
            <h1 className="font-display text-xl font-bold gradient-text mb-1">Reusable Skills</h1>
            <p className="text-xs" style={{ color: 'rgba(148,163,184,0.5)' }}>
              {skills.length} skills · Agent prompt templates & automated workflows
            </p>
          </div>
          <button
            onClick={() => setShowAdd(!showAdd)}
            className="btn-primary"
          >
            <Plus className="w-4 h-4" />
            Create Skill
          </button>
        </motion.div>

        {/* Suggested Skills Banner / Alert */}
        <AnimatePresence>
          {suggestedSkills.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6 overflow-hidden rounded-xl border border-amber-500/20 bg-amber-500/5 backdrop-blur-md p-4 space-y-3"
            >
              <div className="flex items-center gap-2 text-amber-400 font-semibold text-xs">
                <Sparkles className="w-4 h-4 animate-pulse" />
                <span>AI Detected Reusable Patterns! Save these suggested skills:</span>
              </div>
              <div className="grid grid-cols-1 gap-2.5">
                {suggestedSkills.map((sug) => {
                  const agentCol = AGENT_COLORS[sug.agentType] || AGENT_COLORS.general;
                  return (
                    <div key={sug.name} className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-3 rounded-lg bg-slate-900/60 border border-slate-800">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white">{sug.name}</span>
                          <span className="text-[9px] uppercase px-1 py-0.2 rounded font-bold" style={{ background: `${agentCol}15`, color: agentCol }}>
                            {sug.agentType}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5 truncate">{sug.description}</p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleSaveSuggested(sug)}
                          className="px-2.5 py-1 rounded bg-amber-600 hover:bg-amber-500 text-white text-[11px] font-semibold transition-all shadow-[0_0_10px_rgba(245,158,11,0.2)]"
                        >
                          Save Skill
                        </button>
                        <button
                          onClick={() => removeSuggestedSkill(sug.name)}
                          className="px-2 py-1 rounded hover:bg-slate-800 text-slate-500 hover:text-slate-300 text-[11px] transition-all"
                        >
                          Dismiss
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Add Skill Form */}
        <AnimatePresence>
          {showAdd && (
            <CreateSkillForm
              onClose={() => setShowAdd(false)}
              onSave={addSkill}
            />
          )}
        </AnimatePresence>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'rgba(148,163,184,0.4)' }} />
          <input
            className="input-base pl-10"
            placeholder="Search skills, agent types, templates..."
            value={searchQuery}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { label: 'Total Skills', value: skills.length, icon: Cpu, color: '#00e5ff' },
            { label: 'Auto-Generated', value: skills.filter(s => s.tags?.includes('auto-generated') || s.usageCount > 0).length, icon: Sparkles, color: '#a78bfa' },
            { label: 'Total Executions', value: skills.reduce((acc, curr) => acc + (curr.usageCount || 0), 0), icon: Zap, color: '#34d399' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="rounded-xl p-3 text-center"
              style={{ background: `${color}06`, border: `1px solid ${color}15` }}>
              <Icon className="w-4 h-4 mx-auto mb-1.5" style={{ color }} />
              <div className="font-display text-lg font-bold" style={{ color }}>{value}</div>
              <div className="text-[10px]" style={{ color: 'rgba(148,163,184,0.4)' }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Skills Cards Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="flex gap-1">
              {[0, 1, 2].map((i) => (
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
            <Terminal className="w-12 h-12 mx-auto mb-4" style={{ color: 'rgba(0,229,255,0.3)' }} />
            <p className="text-sm font-medium mb-2" style={{ color: 'rgba(148,163,184,0.5)' }}>
              {searchQuery ? "No matching skills found" : "No skills saved yet"}
            </p>
            <p className="text-xs" style={{ color: 'rgba(148,163,184,0.3)' }}>
              {searchQuery ? `Try modifying your search criteria` : 'Create a skill manually, or let agents auto-detect patterns from your chat sessions.'}
            </p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <AnimatePresence mode="popLayout">
              {results.map((skill) => (
                <SkillCard
                  key={skill._id}
                  skill={skill}
                  onDelete={deleteSkill}
                  onView={setSelectedSkill}
                />
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Skill Details Modal */}
        <AnimatePresence>
          {selectedSkill && (
            <SkillDetailModal
              skill={selectedSkill}
              onClose={() => setSelectedSkill(null)}
              onDelete={deleteSkill}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
