import React from 'react';
import { 
  CheckCircle2, 
  Circle, 
  Clock, 
  MoreVertical, 
  AlertCircle, 
  Check, 
  ChevronDown, 
  ChevronUp, 
  Edit3, 
  Trash2,
  CalendarDays
} from 'lucide-react';
import { Task, SubTask } from '../types.ts';
import { soundService } from '../utils/audio.ts';

interface TaskCardProps {
  task: Task;
  onToggleStatus: (taskId: string) => void;
  onToggleSubtask: (taskId: string, subtaskId: string) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  hasConflict?: boolean;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onToggleStatus,
  onToggleSubtask,
  onEditTask,
  onDeleteTask,
  hasConflict = false,
}) => {
  const [expanded, setExpanded] = React.useState(false);
  const [showMenu, setShowMenu] = React.useState(false);

  const isDone = task.status === 'done';

  const categoryLabels: Record<string, string> = {
    deep_work: 'Deep Work',
    client: 'Client Delivery',
    operations: 'Admin & Ops',
    learning: 'Learning & R&D',
    health: 'Health & Habits',
  };

  const priorityLabels: Record<string, { label: string; textClass: string }> = {
    critical: { label: 'Critical', textClass: 'text-rose-600 font-semibold' },
    high: { label: 'High Priority', textClass: 'text-amber-600 font-medium' },
    medium: { label: 'Medium Priority', textClass: 'text-slate-600' },
    low: { label: 'Low Priority', textClass: 'text-slate-500' },
  };

  const energyLabels: Record<string, string> = {
    high_focus: 'High Focus Peak',
    moderate: 'Moderate Energy',
    low_energy: 'Low Energy Win',
  };

  const priorityMeta = priorityLabels[task.priority] || priorityLabels.medium;

  const completedSubtasks = task.subtasks.filter((s: SubTask) => s.completed).length;

  return (
    <div
      className={`group relative rounded-xl border transition-all duration-150 bg-white ${
        hasConflict
          ? 'border-amber-400/80 shadow-xs'
          : isDone
          ? 'border-slate-200/70 bg-slate-50/50 opacity-75'
          : 'border-slate-200 hover:border-slate-300 shadow-xs hover:shadow-sm'
      }`}
    >
      <div className="p-4 sm:p-5">
        <div className="flex items-start gap-3.5">
          {/* Completion Checkbox Button */}
          <button
            type="button"
            onClick={() => {
              if (!isDone) soundService.playChime('complete');
              onToggleStatus(task.id);
            }}
            aria-label={isDone ? `Mark "${task.title}" incomplete` : `Mark "${task.title}" completed`}
            className="mt-0.5 shrink-0 text-slate-400 hover:text-indigo-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded"
          >
            {isDone ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 fill-emerald-50" />
            ) : (
              <Circle className="w-5 h-5" />
            )}
          </button>

          {/* Task Info */}
          <div className="flex-1 min-w-0">
            {/* Header unboxed metadata line */}
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mb-1.5">
              <span className={priorityMeta.textClass}>{priorityMeta.label}</span>
              <span aria-hidden="true" className="text-slate-300">·</span>
              <span>{categoryLabels[task.category] || task.category}</span>
              <span aria-hidden="true" className="text-slate-300">·</span>
              <span>{energyLabels[task.energy] || task.energy}</span>

              {hasConflict && (
                <>
                  <span aria-hidden="true" className="text-slate-300">·</span>
                  <span className="text-amber-700 font-semibold flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    Schedule Conflict
                  </span>
                </>
              )}
            </div>

            {/* Task Title */}
            <h3
              onClick={() => onEditTask(task)}
              className={`text-base font-semibold leading-snug cursor-pointer transition-colors ${
                isDone
                  ? 'text-slate-500 line-through'
                  : 'text-slate-900 hover:text-indigo-600'
              }`}
            >
              {task.title}
            </h3>

            {/* Description */}
            {task.description && (
              <p className="mt-1 text-sm text-slate-600 line-clamp-2 leading-relaxed">
                {task.description}
              </p>
            )}

            {/* Timing & Subtask Counter Metadata (Unboxed text with dots) */}
            <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-500">
              {task.startTime ? (
                <span className="flex items-center gap-1.5 font-mono tabular-nums text-slate-700">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  {task.startTime} - {task.endTime || `${task.estimatedMinutes}m`}
                </span>
              ) : (
                <span className="flex items-center gap-1.5 font-mono tabular-nums text-slate-500">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  {task.estimatedMinutes}m estimate
                </span>
              )}

              <span aria-hidden="true" className="text-slate-300">·</span>

              <span className="flex items-center gap-1.5 text-slate-600">
                <CalendarDays className="w-3.5 h-3.5 text-slate-400" />
                <span>{task.date}</span>
              </span>

              {task.subtasks.length > 0 && (
                <>
                  <span aria-hidden="true" className="text-slate-300">·</span>
                  <button
                    type="button"
                    onClick={() => setExpanded(!expanded)}
                    className="flex items-center gap-1 text-indigo-600 hover:text-indigo-700 font-medium transition-colors"
                  >
                    <span>
                      {completedSubtasks}/{task.subtasks.length} subtasks
                    </span>
                    {expanded ? (
                      <ChevronUp className="w-3.5 h-3.5" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5" />
                    )}
                  </button>
                </>
              )}

              {task.tags.length > 0 && (
                <>
                  <span aria-hidden="true" className="text-slate-300">·</span>
                  <span className="text-slate-400">
                    {task.tags.map(t => `#${t}`).join(' ')}
                  </span>
                </>
              )}
            </div>

            {/* Subtasks Accordion */}
            {expanded && task.subtasks.length > 0 && (
              <div className="mt-3.5 pt-3 border-t border-slate-100 space-y-2">
                {task.subtasks.map((sub: SubTask) => (
                  <label
                    key={sub.id}
                    className="flex items-center gap-2.5 text-xs text-slate-700 cursor-pointer group/sub"
                  >
                    <input
                      type="checkbox"
                      checked={sub.completed}
                      onChange={() => onToggleSubtask(task.id, sub.id)}
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5 cursor-pointer"
                    />
                    <span
                      className={`leading-normal transition-colors ${
                        sub.completed ? 'text-slate-400 line-through' : 'group-hover/sub:text-slate-900'
                      }`}
                    >
                      {sub.title}
                    </span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Context Action Menu */}
          <div className="relative shrink-0">
            <button
              type="button"
              onClick={() => setShowMenu(!showMenu)}
              aria-label={`Options for ${task.title}`}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {showMenu && (
              <>
                <div
                  className="fixed inset-0 z-20"
                  onClick={() => setShowMenu(false)}
                />
                <div className="absolute right-0 top-8 z-30 w-36 py-1 bg-white border border-slate-200 rounded-lg shadow-lg text-xs font-medium">
                  <button
                    type="button"
                    onClick={() => {
                      setShowMenu(false);
                      onEditTask(task);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-slate-500" />
                    <span>Edit Task</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setShowMenu(false);
                      onToggleStatus(task.id);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <Check className="w-3.5 h-3.5 text-slate-500" />
                    <span>{isDone ? 'Mark Todo' : 'Mark Done'}</span>
                  </button>

                  <div className="border-t border-slate-100 my-1" />

                  <button
                    type="button"
                    onClick={() => {
                      setShowMenu(false);
                      onDeleteTask(task.id);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-rose-600 hover:bg-rose-50 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
