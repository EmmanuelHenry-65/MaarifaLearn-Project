import { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { subjects } from '../../data/subjects';
import type { StudyTask, TaskInput } from '../../services/studyPlanner.service';
import { TASK_TYPE_OPTIONS, PRIORITY_OPTIONS } from './taskTypeConfig';

interface TaskModalProps {
  defaultDate: string;
  editingTask: StudyTask | null;
  onSave: (input: TaskInput) => Promise<void>;
  onClose: () => void;
}

function toFormState(task: StudyTask | null, defaultDate: string): TaskInput {
  if (!task) {
    return { title: '', subject: '', taskType: 'task', dueDate: defaultDate, startTime: '', endTime: '', priority: 'medium' };
  }
  return {
    title: task.title,
    subject: task.subject ?? '',
    taskType: task.taskType,
    dueDate: task.dueDate ?? defaultDate,
    startTime: task.startTime ?? '',
    endTime: task.endTime ?? '',
    priority: task.priority,
  };
}

// Shared create/edit form for a study task, rendered as a centered modal
// over a dimmed backdrop.
export default function TaskModal({ defaultDate, editingTask, onSave, onClose }: TaskModalProps) {
  const { theme } = useTheme();
  const [form, setForm] = useState<TaskInput>(() => toFormState(editingTask, defaultDate));
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const inputBg = theme === 'light'
    ? 'bg-white border-slate-200 text-slate-900 focus:border-cyan-500'
    : 'bg-[rgba(17,24,50,0.6)] border-[rgba(56,78,135,0.3)] text-white focus:border-cyan-500/50';
  const labelColor = theme === 'light' ? 'text-slate-500' : 'text-gray-400';
  const panelBg = theme === 'light' ? 'bg-white' : 'bg-[#0f1526]';
  const textColor = theme === 'light' ? 'text-slate-900' : 'text-white';

  function update<K extends keyof TaskInput>(key: K, value: TaskInput[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!form.title.trim()) {
      setError('Title is required.');
      return;
    }
    if (!form.dueDate) {
      setError('Date is required.');
      return;
    }
    if ((form.startTime && !form.endTime) || (!form.startTime && form.endTime)) {
      setError('Provide both a start and end time, or leave both blank.');
      return;
    }
    if (form.startTime && form.endTime && form.endTime <= form.startTime) {
      setError('End time must be after start time.');
      return;
    }

    setSaving(true);
    try {
      await onSave({
        ...form,
        subject: form.subject?.trim() || null,
        startTime: form.startTime || null,
        endTime: form.endTime || null,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save the task.');
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <div
        className={`w-full max-w-md rounded-2xl p-5 sm:p-6 shadow-xl max-h-[90vh] overflow-y-auto ${panelBg}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className={`font-bold text-lg ${textColor}`}>{editingTask ? 'Edit Task' : 'Add Task'}</h3>
          <button type="button" onClick={onClose} className={`${labelColor} hover:opacity-70 text-xl leading-none`} aria-label="Close">
            ×
          </button>
        </div>

        {error && (
          <div className="mb-4 px-3 py-2.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-500 text-xs font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={`block text-xs font-medium mb-1.5 ${labelColor}`}>Title</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => update('title', e.target.value)}
              placeholder="e.g. Chemical Bonding"
              className={`w-full px-3 py-2.5 rounded-lg border text-sm outline-none ${inputBg}`}
            />
          </div>

          <div>
            <label className={`block text-xs font-medium mb-1.5 ${labelColor}`}>Subject (optional)</label>
            <input
              type="text"
              list="study-planner-subjects"
              value={form.subject ?? ''}
              onChange={(e) => update('subject', e.target.value)}
              placeholder="e.g. Chemistry"
              className={`w-full px-3 py-2.5 rounded-lg border text-sm outline-none ${inputBg}`}
            />
            <datalist id="study-planner-subjects">
              {Object.values(subjects).map((s) => (
                <option key={s.id} value={s.name} />
              ))}
            </datalist>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={`block text-xs font-medium mb-1.5 ${labelColor}`}>Type</label>
              <select
                value={form.taskType}
                onChange={(e) => update('taskType', e.target.value as TaskInput['taskType'])}
                className={`w-full px-3 py-2.5 rounded-lg border text-sm outline-none ${inputBg}`}
              >
                {TASK_TYPE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={`block text-xs font-medium mb-1.5 ${labelColor}`}>Priority</label>
              <select
                value={form.priority}
                onChange={(e) => update('priority', e.target.value as TaskInput['priority'])}
                className={`w-full px-3 py-2.5 rounded-lg border text-sm outline-none ${inputBg}`}
              >
                {PRIORITY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className={`block text-xs font-medium mb-1.5 ${labelColor}`}>Date</label>
            <input
              type="date"
              value={form.dueDate}
              onChange={(e) => update('dueDate', e.target.value)}
              className={`w-full px-3 py-2.5 rounded-lg border text-sm outline-none ${inputBg}`}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={`block text-xs font-medium mb-1.5 ${labelColor}`}>Start time (optional)</label>
              <input
                type="time"
                value={form.startTime ?? ''}
                onChange={(e) => update('startTime', e.target.value)}
                className={`w-full px-3 py-2.5 rounded-lg border text-sm outline-none ${inputBg}`}
              />
            </div>
            <div>
              <label className={`block text-xs font-medium mb-1.5 ${labelColor}`}>End time (optional)</label>
              <input
                type="time"
                value={form.endTime ?? ''}
                onChange={(e) => update('endTime', e.target.value)}
                className={`w-full px-3 py-2.5 rounded-lg border text-sm outline-none ${inputBg}`}
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-4 py-2.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-sm font-bold hover:shadow-lg hover:shadow-cyan-500/20 transition-all disabled:opacity-60"
            >
              {saving ? 'Saving…' : editingTask ? 'Save Changes' : 'Add Task'}
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={onClose}
              className={`px-4 py-2.5 rounded-lg border text-sm font-bold transition-colors disabled:opacity-60 ${
                theme === 'light' ? 'border-slate-200 text-slate-600 hover:bg-slate-100' : 'border-[rgba(56,78,135,0.3)] text-gray-300 hover:bg-[rgba(56,78,135,0.1)]'
              }`}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
