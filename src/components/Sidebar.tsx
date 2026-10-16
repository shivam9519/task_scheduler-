import React from 'react';
import { 
  CheckSquare, 
  Calendar, 
  Sparkles, 
  BarChart3, 
  Flame, 
  Clock, 
  AlertTriangle,
  Zap,
  Target
} from 'lucide-react';
import { WorkflowMetrics, TaskCategory } from '../types.ts';

interface SidebarProps {
  currentTab: 'tasks' | 'calendar' | 'advisor' | 'analytics';
  onSelectTab: (tab: 'tasks' | 'calendar' | 'advisor' | 'analytics') => void;
  metrics: WorkflowMetrics;
  selectedCategory: TaskCategory | 'all';
  onSelectCategory: (category: TaskCategory | 'all') => void;
  onOpenNewTaskModal: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  metrics,
  selectedCategory,
  onSelectCategory,
}) => {
  const categories: { id: TaskCategory | 'all'; label: string; count?: number }[] = [
    { id: 'all', label: 'All Streams' },
    { id: 'deep_work', label: 'Deep Work' },
    { id: 'client', label: 'Client Delivery' },
    { id: 'operations', label: 'Admin & Ops' },
    { id: 'learning', label: 'Learning & R&D' },
    { id: 'health', label: 'Health & Habits' },
  ];

  return (
    <aside className="w-64 border-r border-slate-200 bg-white flex flex-col shrink-0 min-h-[calc(100vh-57px)]">
      {/* Primary Navigation */}
      <div className="p-4 space-y-1">
        <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 px-3 py-2">
          Workspace
        </div>

        <button
          onClick={() => onSelectTab('tasks')}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            currentTab === 'tasks'
              ? 'bg-indigo-50 text-indigo-700'
              : 'text-slate-700 hover:bg-slate-50'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <CheckSquare className="w-4 h-4 text-slate-500" />
            <span>Today's Tasks</span>
          </div>
          <span className="text-xs font-mono tabular-nums text-slate-500">
            {metrics.pendingToday}
          </span>
        </button>

        <button
          onClick={() => onSelectTab('calendar')}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            currentTab === 'calendar'
              ? 'bg-indigo-50 text-indigo-700'
              : 'text-slate-700 hover:bg-slate-50'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <Calendar className="w-4 h-4 text-slate-500" />
            <span>Calendar Grid</span>
          </div>
          {metrics.conflictsCount > 0 && (
            <span className="text-xs font-semibold text-amber-600 flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span className="tabular-nums">{metrics.conflictsCount}</span>
            </span>
          )}
        </button>

        <button
          onClick={() => onSelectTab('advisor')}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            currentTab === 'advisor'
              ? 'bg-indigo-50 text-indigo-700'
              : 'text-slate-700 hover:bg-slate-50'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span>Smart Advisor</span>
          </div>
          <span className="text-xs font-mono text-indigo-600 font-semibold">AI</span>
        </button>

        <button
          onClick={() => onSelectTab('analytics')}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            currentTab === 'analytics'
              ? 'bg-indigo-50 text-indigo-700'
              : 'text-slate-700 hover:bg-slate-50'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <BarChart3 className="w-4 h-4 text-slate-500" />
            <span>Workflow Stats</span>
          </div>
          <span className="text-xs font-mono tabular-nums text-slate-500">
            {metrics.completionRate}%
          </span>
        </button>
      </div>

      <div className="border-t border-slate-100 my-2" />

      {/* Stream Categories Filter */}
      <div className="p-4 space-y-1">
        <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 px-3 py-2">
          Streams
        </div>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => {
              onSelectCategory(cat.id);
              if (currentTab !== 'tasks' && currentTab !== 'calendar') {
                onSelectTab('tasks');
              }
            }}
            className={`w-full text-left px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center justify-between ${
              selectedCategory === cat.id
                ? 'bg-slate-100 text-slate-900 font-semibold'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <span>{cat.label}</span>
          </button>
        ))}
      </div>

      <div className="mt-auto p-4 border-t border-slate-100 space-y-3">
        {/* Quick Daily Pulse Card */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-3 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-600 font-medium">
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              Planned Focus
            </span>
            <span className="font-mono tabular-nums font-semibold text-slate-900">
              {metrics.totalFocusHours} hrs
            </span>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-600 font-medium">
            <span className="flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-slate-500" />
              Completion Rate
            </span>
            <span className="font-mono tabular-nums font-semibold text-slate-900">
              {metrics.completionRate}%
            </span>
          </div>

          <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-indigo-600 h-full rounded-full transition-all duration-300"
              style={{ width: `${Math.min(100, Math.max(5, metrics.completionRate))}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
            <span className="flex items-center gap-1">
              <Zap className="w-3 h-3 text-amber-500" />
              {metrics.completedToday} of {metrics.completedToday + metrics.pendingToday} done
            </span>
            {metrics.criticalPending > 0 && (
              <span className="text-rose-600 font-semibold flex items-center gap-1">
                <Flame className="w-3 h-3" />
                {metrics.criticalPending} critical
              </span>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
};
