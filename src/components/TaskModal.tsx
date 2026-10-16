import React, { useState, useEffect } from 'react';
import { 
  X, 
  Sparkles, 
  Plus, 
  Trash2, 
  Clock, 
  Calendar, 
  Tag, 
  Zap, 
  Pin,
  CheckCircle2
} from 'lucide-react';
import { Task, TaskPriority, TaskCategory, EnergyLevel, SubTask } from '../types.ts';
import { getTodayDateString } from '../utils/storage.ts';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveTask: (task: Partial<Task>) => void;
  initialTask?: Task | null;
  initialDate?: string;
  initialStartTime?: string;
}

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  onSaveTask,
  initialTask,
  initialDate,
  initialStartTime,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(initialDate || getTodayDateString());
  const [startTime, setStartTime] = useState(initialStartTime || '');
  const [endTime, setEndTime] = useState('');
  const [estimatedMinutes, setEstimatedMinutes] = useState(60);
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [category, setCategory] = useState<TaskCategory>('deep_work');
  const [energy, setEnergy] = useState<EnergyLevel>('high_focus');
  const [tagsInput, setTagsInput] = useState('');
  const [isPinned, setIsPinned] = useState(false);
  const [reminderMinutesBefore, setReminderMinutesBefore] = useState(15);
  const [subtasks, setSubtasks] = useState<SubTask[]>([]);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [isDecomposing, setIsDecomposing] = useState(false);
  const [error, setError] = useState('');

  // Sync state when modal opens or initialTask changes
  useEffect(() => {
    if (initialTask) {
      setTitle(initialTask.title);
      setDescription(initialTask.description || '');
      setDate(initialTask.date);
      setStartTime(initialTask.startTime || '');
      setEndTime(initialTask.endTime || '');
      setEstimatedMinutes(initialTask.estimatedMinutes);
      setPriority(initialTask.priority);
      setCategory(initialTask.category);
      setEnergy(initialTask.energy);
      setTagsInput(initialTask.tags.join(', '));
      setIsPinned(!!initialTask.isPinned);
      setReminderMinutesBefore(initialTask.reminderMinutesBefore || 15);
      setSubtasks(initialTask.subtasks || []);
    } else {
      setTitle('');
      setDescription('');
      setDate(initialDate || getTodayDateString());
      setStartTime(initialStartTime || '');
      setEndTime(initialStartTime ? calculateDefaultEndTime(initialStartTime, 60) : '');
      setEstimatedMinutes(60);
      setPriority('medium');
      setCategory('deep_work');
      setEnergy('high_focus');
      setTagsInput('');
      setIsPinned(false);
      setReminderMinutesBefore(15);
      setSubtasks([]);
    }
    setError('');
  }, [initialTask, initialDate, initialStartTime, isOpen]);

  if (!isOpen) return null;

  function calculateDefaultEndTime(startStr: string, minutes: number): string {
    const [h, m] = startStr.split(':').map(Number);
    if (isNaN(h) || isNaN(m)) return '';
    const total = h * 60 + m + minutes;
    const endH = Math.floor(total / 60) % 24;
    const endM = total % 60;
    return `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;
  }

  const handleStartTimeChange = (newStart: string) => {
    setStartTime(newStart);
    if (newStart && !endTime) {
      setEndTime(calculateDefaultEndTime(newStart, estimatedMinutes));
    }
  };

  const handleAddSubtask = () => {
    if (!newSubtaskTitle.trim()) return;
    const newSub: SubTask = {
      id: `sub-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      title: newSubtaskTitle.trim(),
      completed: false,
    };
    setSubtasks([...subtasks, newSub]);
    setNewSubtaskTitle('');
  };

  const handleRemoveSubtask = (id: string) => {
    setSubtasks(subtasks.filter(s => s.id !== id));
  };

  const handleAIDecompose = async () => {
    if (!title.trim()) {
      setError('Please enter a task title first before generating AI subtasks.');
      return;
    }
    setError('');
    setIsDecomposing(true);

    try {
      const res = await fetch('/api/task-breakdown', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          estimatedMinutes,
        }),
      });

      if (!res.ok) throw new Error('Failed to generate breakdown');
      const data = await res.json();
      if (Array.isArray(data.subtasks)) {
        const generatedSubs: SubTask[] = data.subtasks.map((st: string) => ({
          id: `sub-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          title: st,
          completed: false,
        }));
        setSubtasks([...subtasks, ...generatedSubs]);
      }
    } catch (e: any) {
      // Local fallback subtask generator
      const fallbackSubs: SubTask[] = [
        { id: `sub-${Date.now()}-1`, title: 'Define scope, objectives, and success metrics (15m)', completed: false },
        { id: `sub-${Date.now()}-2`, title: 'Execute primary implementation / draft (40m)', completed: false },
        { id: `sub-${Date.now()}-3`, title: 'Verify deliverables, polish, and document (15m)', completed: false },
      ];
      setSubtasks([...subtasks, ...fallbackSubs]);
    } finally {
      setIsDecomposing(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Task title is required.');
      return;
    }

    const tags = tagsInput
      .split(',')
      .map(t => t.trim())
      .filter(t => t.length > 0);

    onSaveTask({
      id: initialTask?.id,
      title: title.trim(),
      description: description.trim(),
      date,
      startTime: startTime || undefined,
      endTime: endTime || undefined,
      estimatedMinutes: Number(estimatedMinutes) || 30,
      priority,
      category,
      energy,
      tags,
      isPinned,
      reminderMinutesBefore,
      subtasks,
      status: initialTask?.status || 'todo',
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity" onClick={onClose} />

      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 z-10 overflow-hidden my-8">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <h2 className="text-base font-bold text-slate-900">
            {initialTask ? 'Edit Task & Schedule' : 'Create New Task'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close task modal"
            className="p-1 text-slate-400 hover:text-slate-700 rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 text-xs bg-rose-50 border border-rose-200 text-rose-700 rounded-lg">
              {error}
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Task Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Conduct Architecture & API Review"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-slate-900 placeholder-slate-400"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Description & Notes
            </label>
            <textarea
              rows={2}
              placeholder="Key objectives, links, or context..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-slate-900 placeholder-slate-400"
            />
          </div>

          {/* Date & Time Scheduling Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Scheduled Date
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Start Time (Optional)
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => handleStartTimeChange(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                End Time
              </label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 font-mono"
              />
            </div>
          </div>

          {/* Priority, Category, and Energy Profile Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Priority Level
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 font-medium"
              >
                <option value="critical">Critical (Highest Alert)</option>
                <option value="high">High Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="low">Low Priority</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Stream / Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as TaskCategory)}
                className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 font-medium"
              >
                <option value="deep_work">Deep Work</option>
                <option value="client">Client Delivery</option>
                <option value="operations">Admin & Ops</option>
                <option value="learning">Learning & R&D</option>
                <option value="health">Health & Habits</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Cognitive Energy Required
              </label>
              <select
                value={energy}
                onChange={(e) => setEnergy(e.target.value as EnergyLevel)}
                className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 font-medium"
              >
                <option value="high_focus">High Focus Peak</option>
                <option value="moderate">Moderate Energy</option>
                <option value="low_energy">Low Energy Quick Win</option>
              </select>
            </div>
          </div>

          {/* Estimated Minutes & Reminder */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Estimated Duration (Minutes)
              </label>
              <input
                type="number"
                min="5"
                max="480"
                step="5"
                value={estimatedMinutes}
                onChange={(e) => setEstimatedMinutes(Number(e.target.value))}
                className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 font-mono tabular-nums"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Priority Notification Alert
              </label>
              <select
                value={reminderMinutesBefore}
                onChange={(e) => setReminderMinutesBefore(Number(e.target.value))}
                className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 font-medium"
              >
                <option value={5}>5 minutes before</option>
                <option value={10}>10 minutes before</option>
                <option value={15}>15 minutes before</option>
                <option value={30}>30 minutes before</option>
                <option value={60}>1 hour before</option>
              </select>
            </div>
          </div>

          {/* Subtasks Builder Section */}
          <div className="pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-700">
                Action Checkpoints & Subtasks ({subtasks.length})
              </label>
              <button
                type="button"
                onClick={handleAIDecompose}
                disabled={isDecomposing}
                className="flex items-center gap-1 text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 disabled:opacity-50 transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isDecomposing ? 'Decomposing...' : 'AI Auto-Breakdown'}</span>
              </button>
            </div>

            {/* Subtask list */}
            {subtasks.length > 0 && (
              <div className="space-y-1.5 mb-2.5 max-h-36 overflow-y-auto pr-1">
                {subtasks.map((st) => (
                  <div
                    key={st.id}
                    className="flex items-center justify-between gap-2 p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  >
                    <span className="text-slate-800 truncate flex-1">{st.title}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSubtask(st.id)}
                      className="text-slate-400 hover:text-rose-600 p-0.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Add subtask input */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Add actionable step..."
                value={newSubtaskTitle}
                onChange={(e) => setNewSubtaskTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSubtask();
                  }
                }}
                className="flex-1 px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 placeholder-slate-400"
              />
              <button
                type="button"
                onClick={handleAddSubtask}
                className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors shrink-0"
              >
                Add
              </button>
            </div>
          </div>

          {/* Tags and Pin */}
          <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex-1">
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                Tags (Comma-separated)
              </label>
              <input
                type="text"
                placeholder="Engineering, Client, Q4..."
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900"
              />
            </div>

            <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer self-start sm:self-end pb-1.5">
              <input
                type="checkbox"
                checked={isPinned}
                onChange={(e) => setIsPinned(e.target.checked)}
                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
              />
              <span className="font-medium flex items-center gap-1">
                <Pin className="w-3.5 h-3.5 text-slate-500" />
                Pin to Top of Day
              </span>
            </label>
          </div>

          {/* Form Actions */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-xs"
            >
              {initialTask ? 'Save Changes' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
