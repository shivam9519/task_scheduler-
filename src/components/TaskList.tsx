import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Plus, 
  Calendar, 
  AlertTriangle, 
  CheckCircle2, 
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Task, TaskPriority, TaskCategory, ScheduleConflict } from '../types.ts';
import { TaskCard } from './TaskCard.tsx';
import { getTodayDateString, getRelativeDateString } from '../utils/storage.ts';

interface TaskListProps {
  tasks: Task[];
  conflicts: ScheduleConflict[];
  selectedCategory: TaskCategory | 'all';
  onSelectCategory: (cat: TaskCategory | 'all') => void;
  onToggleStatus: (taskId: string) => void;
  onToggleSubtask: (taskId: string, subtaskId: string) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onOpenNewTaskModal: (initialDate?: string) => void;
}

export const TaskList: React.FC<TaskListProps> = ({
  tasks,
  conflicts,
  selectedCategory,
  onSelectCategory,
  onToggleStatus,
  onToggleSubtask,
  onEditTask,
  onDeleteTask,
  onOpenNewTaskModal,
}) => {
  const todayStr = getTodayDateString();
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [statusFilter, setStatusFilter] = useState<'all' | 'todo' | 'in_progress' | 'high_priority' | 'done'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Conflict task ids set
  const conflictTaskIds = useMemo(() => {
    const ids = new Set<string>();
    for (const c of conflicts) {
      ids.add(c.task1Id);
      ids.add(c.task2Id);
    }
    return ids;
  }, [conflicts]);

  // Filter tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter(t => {
      // Date filter (unless 'all_dates' is chosen)
      if (selectedDate !== 'all' && t.date !== selectedDate) {
        return false;
      }

      // Stream category filter
      if (selectedCategory !== 'all' && t.category !== selectedCategory) {
        return false;
      }

      // Status/priority filter
      if (statusFilter === 'todo' && t.status !== 'todo') return false;
      if (statusFilter === 'in_progress' && t.status !== 'in_progress') return false;
      if (statusFilter === 'done' && t.status !== 'done') return false;
      if (statusFilter === 'high_priority') {
        if (t.status === 'done' || (t.priority !== 'critical' && t.priority !== 'high')) {
          return false;
        }
      }

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = t.title.toLowerCase().includes(query);
        const matchesDesc = (t.description || '').toLowerCase().includes(query);
        const matchesTags = t.tags.some(tag => tag.toLowerCase().includes(query));
        if (!matchesTitle && !matchesDesc && !matchesTags) return false;
      }

      return true;
    }).sort((a, b) => {
      // Pinned first
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;

      // Done tasks go to bottom
      if (a.status === 'done' && b.status !== 'done') return 1;
      if (a.status !== 'done' && b.status === 'done') return -1;

      // Start time if both have it
      if (a.startTime && b.startTime) {
        return a.startTime.localeCompare(b.startTime);
      }
      if (a.startTime) return -1;
      if (b.startTime) return 1;

      // Urgency priority fallback
      const pWeights: Record<TaskPriority, number> = { critical: 4, high: 3, medium: 2, low: 1 };
      return pWeights[b.priority] - pWeights[a.priority];
    });
  }, [tasks, selectedDate, selectedCategory, statusFilter, searchQuery]);

  // Date offset helper
  const changeDateByOffset = (offset: number) => {
    if (selectedDate === 'all') {
      setSelectedDate(todayStr);
      return;
    }
    const current = new Date(selectedDate);
    current.setDate(current.getDate() + offset);
    const y = current.getFullYear();
    const m = String(current.getMonth() + 1).padStart(2, '0');
    const d = String(current.getDate()).padStart(2, '0');
    setSelectedDate(`${y}-${m}-${d}`);
  };

  const isToday = selectedDate === todayStr;
  const isTomorrow = selectedDate === getRelativeDateString(1);
  const isYesterday = selectedDate === getRelativeDateString(-1);

  const formattedDateTitle = isToday
    ? 'Today'
    : isTomorrow
    ? 'Tomorrow'
    : isYesterday
    ? 'Yesterday'
    : selectedDate === 'all'
    ? 'All Scheduled Tasks'
    : selectedDate;

  return (
    <div className="flex-1 max-w-5xl mx-auto px-4 sm:px-8 py-6 w-full space-y-6">
      {/* Top Section: Date Navigator and Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              {formattedDateTitle}
            </h1>
            {selectedDate !== 'all' && (
              <span className="text-xs font-mono tabular-nums text-slate-500 pt-1">
                {selectedDate}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Organize daily tasks, manage priority alerts, and balance cognitive focus.
          </p>
        </div>

        {/* Date Selector Navigation */}
        <div className="flex items-center gap-2">
          <div className="inline-flex items-center rounded-lg border border-slate-200 p-0.5 bg-slate-50 text-xs font-medium">
            <button
              type="button"
              onClick={() => changeDateByOffset(-1)}
              aria-label="Previous day"
              className="p-1.5 hover:bg-white rounded-md text-slate-600 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => setSelectedDate(todayStr)}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                selectedDate === todayStr ? 'bg-white text-indigo-700 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Today
            </button>

            <button
              type="button"
              onClick={() => setSelectedDate(getRelativeDateString(1))}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                selectedDate === getRelativeDateString(1) ? 'bg-white text-indigo-700 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Tomorrow
            </button>

            <button
              type="button"
              onClick={() => setSelectedDate('all')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                selectedDate === 'all' ? 'bg-white text-indigo-700 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Dates
            </button>

            <button
              type="button"
              onClick={() => changeDateByOffset(1)}
              aria-label="Next day"
              className="p-1.5 hover:bg-white rounded-md text-slate-600 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            type="button"
            onClick={() => onOpenNewTaskModal(selectedDate === 'all' ? todayStr : selectedDate)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add Task</span>
          </button>
        </div>
      </div>

      {/* Conflicts Alert Banner if Overlaps detected on this date */}
      {conflicts.length > 0 && selectedDate === todayStr && (
        <div className="rounded-xl border border-amber-300 bg-amber-50/70 p-4 text-amber-900 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1 text-xs">
            <span className="font-semibold text-sm block mb-0.5">
              {conflicts.length} Calendar Schedule Overlap Detected
            </span>
            <p className="text-amber-800 leading-relaxed">
              "{conflicts[0].task1Title}" and "{conflicts[0].task2Title}" overlap at {conflicts[0].timeRange}.
              Head to <strong>Smart Advisor</strong> to auto-resolve or adjust time slots in the Calendar.
            </p>
          </div>
        </div>
      )}

      {/* Filter and Search Bar Controls (Real buttons, no static pills) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Status segmented buttons */}
        <div className="inline-flex items-center gap-1 p-1 bg-slate-100 rounded-lg overflow-x-auto max-w-full">
          <button
            type="button"
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
              statusFilter === 'all'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Tasks
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter('todo')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
              statusFilter === 'todo'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            To Do
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter('in_progress')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
              statusFilter === 'in_progress'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            In Progress
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter('high_priority')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
              statusFilter === 'high_priority'
                ? 'bg-white text-rose-700 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            High Priority
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter('done')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
              statusFilter === 'done'
                ? 'bg-white text-emerald-700 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Completed
          </button>
        </div>

        {/* Search input with functional affordance */}
        <div className="relative min-w-[220px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search tasks or tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-slate-900 placeholder-slate-400"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-2 text-xs text-slate-400 hover:text-slate-600"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* Stream Category Active Indicator Bar if filtered */}
      {selectedCategory !== 'all' && (
        <div className="flex items-center justify-between text-xs text-slate-600 bg-slate-50 px-3 py-2 rounded-lg border border-slate-200">
          <span>Filtering by Stream: <strong className="text-slate-900 capitalize">{selectedCategory.replace('_', ' ')}</strong></span>
          <button
            type="button"
            onClick={() => onSelectCategory('all')}
            className="text-indigo-600 hover:text-indigo-800 font-medium"
          >
            Clear Filter
          </button>
        </div>
      )}

      {/* Task List Grid / Rows */}
      {filteredTasks.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 p-12 text-center bg-white space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h4 className="text-base font-semibold text-slate-800">No tasks match your criteria</h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {searchQuery
              ? `No items found matching "${searchQuery}". Clear your search or create a new task.`
              : 'You have cleared all items in this view. Enjoy the mental clarity or schedule your next high-impact goal.'}
          </p>
          <button
            type="button"
            onClick={() => onOpenNewTaskModal(selectedDate === 'all' ? todayStr : selectedDate)}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Task</span>
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              hasConflict={conflictTaskIds.has(task.id)}
              onToggleStatus={onToggleStatus}
              onToggleSubtask={onToggleSubtask}
              onEditTask={onEditTask}
              onDeleteTask={onDeleteTask}
            />
          ))}
        </div>
      )}
    </div>
  );
};
