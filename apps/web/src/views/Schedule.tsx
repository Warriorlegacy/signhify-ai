import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useScheduleStore, ScheduledTask } from "../stores/scheduleStore";
import { Plus, Calendar, Clock, Play, Pause, Trash2, X, Zap, CheckCircle, AlertCircle } from "lucide-react";

const CRON_PRESETS = [
  { label: "Every hour", value: "0 * * * *" },
  { label: "Daily 9AM", value: "0 9 * * *" },
  { label: "Daily 8PM", value: "0 20 * * *" },
  { label: "Mon-Fri 9AM", value: "0 9 * * 1-5" },
  { label: "Weekly Monday", value: "0 9 * * 1" },
  { label: "Every 30 min", value: "*/30 * * * *" },
];

function ScheduleCard({ task, onToggle, onDelete }: {
  task: ScheduledTask;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const [hovering, setHovering] = useState(false);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -2 }}
      onHoverStart={() => setHovering(true)}
      onHoverEnd={() => setHovering(false)}
      className="rounded-xl p-4 transition-all duration-200"
      style={{
        background: hovering ? 'rgba(17, 17, 24, 0.9)' : 'rgba(13, 13, 20, 0.7)',
        border: `1px solid ${task.enabled
          ? (hovering ? 'rgba(0, 229, 255, 0.2)' : 'rgba(0, 229, 255, 0.1)')
          : (hovering ? 'rgba(42, 42, 64, 0.8)' : 'rgba(30, 30, 46, 0.6)')}`,
        backdropFilter: 'blur(12px)',
        opacity: task.enabled ? 1 : 0.6,
      }}
    >
      <div className="flex items-start gap-3">
        {/* Status icon */}
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{
            background: task.enabled ? 'rgba(0, 229, 255, 0.1)' : 'rgba(71, 85, 105, 0.1)',
            border: `1px solid ${task.enabled ? 'rgba(0, 229, 255, 0.2)' : 'rgba(71, 85, 105, 0.2)'}`,
          }}
        >
          <Calendar className="w-4 h-4" style={{ color: task.enabled ? '#00e5ff' : 'rgba(71, 85, 105, 0.6)' }} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-sm font-semibold truncate" style={{ color: 'rgba(255,255,255,0.85)' }}>
              {task.name}
            </h3>
            {task.enabled
              ? <CheckCircle className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#10b981' }} />
              : <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" style={{ color: 'rgba(71, 85, 105, 0.6)' }} />
            }
          </div>

          {task.description && (
            <p className="text-xs mb-2 truncate" style={{ color: 'rgba(148,163,184,0.5)' }}>
              {task.description}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-3 text-[10px]" style={{ color: 'rgba(148,163,184,0.4)' }}>
            <div className="flex items-center gap-1">
              <Clock className="w-2.5 h-2.5" />
              <span className="font-mono">{task.cronExpression}</span>
            </div>
            {task.runCount > 0 && (
              <span>{task.runCount} runs</span>
            )}
            {task.lastRun && (
              <span>Last: {new Date(task.lastRun).toLocaleDateString()}</span>
            )}
          </div>

          {task.lastResult && (
            <p className="text-[10px] mt-2 truncate" style={{ color: 'rgba(148,163,184,0.35)' }}>
              Result: {task.lastResult.slice(0, 80)}...
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            onClick={() => onToggle(task._id)}
            className="p-1.5 rounded-lg transition-all hover:scale-110"
            style={{
              background: task.enabled ? 'rgba(0,229,255,0.08)' : 'rgba(71,85,105,0.08)',
              border: `1px solid ${task.enabled ? 'rgba(0,229,255,0.15)' : 'rgba(71,85,105,0.15)'}`,
              color: task.enabled ? '#00e5ff' : 'rgba(71, 85, 105, 0.6)',
            }}
            title={task.enabled ? "Pause" : "Resume"}
          >
            {task.enabled ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={() => onDelete(task._id)}
            className="p-1.5 rounded-lg transition-all hover:scale-110"
            style={{
              background: 'transparent',
              border: '1px solid transparent',
              color: 'rgba(148,163,184,0.3)',
            }}
            onMouseEnter={e => (e.currentTarget.style.color = '#ef4444')}
            onMouseLeave={e => (e.currentTarget.style.color = 'rgba(148,163,184,0.3)')}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function NewTaskForm({ onAdd, onClose }: { onAdd: (task: any) => void; onClose: () => void }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [cronExpression, setCronExpression] = useState("0 9 * * *");
  const [prompt, setPrompt] = useState("");

  const handleSubmit = () => {
    if (!name.trim() || !cronExpression.trim() || !prompt.trim()) return;
    onAdd({ name, description, cronExpression, prompt });
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: -10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="rounded-2xl p-5 mb-6"
      style={{ background: 'rgba(0,229,255,0.04)', border: '1px solid rgba(0,229,255,0.15)' }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold" style={{ color: 'rgba(255,255,255,0.85)' }}>
          New Scheduled Task
        </h3>
        <button onClick={onClose} className="text-slate-500 hover:text-slate-300 transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-3">
        <input className="input-base" placeholder="Task name" value={name} onChange={e => setName(e.target.value)} autoFocus />
        <input className="input-base" placeholder="Description (optional)" value={description} onChange={e => setDescription(e.target.value)} />

        <div>
          <label className="section-label block mb-2">Cron Schedule</label>
          <div className="flex flex-wrap gap-1.5 mb-2">
            {CRON_PRESETS.map(preset => (
              <button
                key={preset.value}
                onClick={() => setCronExpression(preset.value)}
                className="px-2.5 py-1 rounded-full text-[11px] font-medium transition-all"
                style={{
                  background: cronExpression === preset.value ? 'rgba(0,229,255,0.15)' : 'rgba(255,255,255,0.05)',
                  border: `1px solid ${cronExpression === preset.value ? 'rgba(0,229,255,0.3)' : 'rgba(255,255,255,0.08)'}`,
                  color: cronExpression === preset.value ? '#00e5ff' : 'rgba(148,163,184,0.6)',
                }}
              >
                {preset.label}
              </button>
            ))}
          </div>
          <input
            className="input-base font-mono"
            placeholder="Custom cron: * * * * *"
            value={cronExpression}
            onChange={e => setCronExpression(e.target.value)}
          />
        </div>

        <textarea
          className="input-base resize-none"
          placeholder="What should the AI do? e.g. 'Send me a morning summary of today's AI news'"
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
          rows={3}
        />
        <button onClick={handleSubmit} className="btn-primary w-full justify-center">
          <Zap className="w-4 h-4" />
          Create Scheduled Task
        </button>
      </div>
    </motion.div>
  );
}

export function ScheduleView() {
  const { tasks, isLoading, loadTasks, createTask, deleteTask, toggleTask } = useScheduleStore();
  const [showAdd, setShowAdd] = useState(false);

  useEffect(() => { loadTasks(); }, []);

  const activeTasks = tasks.filter(t => t.enabled);
  const pausedTasks = tasks.filter(t => !t.enabled);

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-6"
        >
          <div>
            <h1 className="font-display text-xl font-bold gradient-text mb-1">Scheduler</h1>
            <p className="text-xs" style={{ color: 'rgba(148,163,184,0.5)' }}>
              {activeTasks.length} active · {pausedTasks.length} paused
            </p>
          </div>
          <button onClick={() => setShowAdd(!showAdd)} className="btn-primary" id="add-task-btn">
            <Plus className="w-4 h-4" />
            New Task
          </button>
        </motion.div>

        {/* Add form */}
        <AnimatePresence>
          {showAdd && <NewTaskForm onAdd={createTask} onClose={() => setShowAdd(false)} />}
        </AnimatePresence>

        {/* Tasks */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="flex gap-1">
              {[0,1,2].map(i => <div key={i} className="w-2 h-2 rounded-full streaming-dot" style={{ background: '#00e5ff' }} />)}
            </div>
          </div>
        ) : tasks.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20 rounded-2xl"
            style={{ background: 'rgba(0,229,255,0.02)', border: '1px solid rgba(0,229,255,0.06)' }}
          >
            <Calendar className="w-12 h-12 mx-auto mb-4" style={{ color: 'rgba(0,229,255,0.3)' }} />
            <p className="text-sm font-medium mb-2" style={{ color: 'rgba(148,163,184,0.5)' }}>No scheduled tasks</p>
            <p className="text-xs" style={{ color: 'rgba(148,163,184,0.3)' }}>
              Create automated tasks that run on a schedule — reports, research, summaries
            </p>
          </motion.div>
        ) : (
          <div className="space-y-3">
            {activeTasks.length > 0 && (
              <div>
                <p className="section-label mb-3">Active ({activeTasks.length})</p>
                <AnimatePresence mode="popLayout">
                  {activeTasks.map(task => (
                    <ScheduleCard key={task._id} task={task} onToggle={toggleTask} onDelete={deleteTask} />
                  ))}
                </AnimatePresence>
              </div>
            )}
            {pausedTasks.length > 0 && (
              <div className="mt-4">
                <p className="section-label mb-3">Paused ({pausedTasks.length})</p>
                <AnimatePresence mode="popLayout">
                  {pausedTasks.map(task => (
                    <ScheduleCard key={task._id} task={task} onToggle={toggleTask} onDelete={deleteTask} />
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
