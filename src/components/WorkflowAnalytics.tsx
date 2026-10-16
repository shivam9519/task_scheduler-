import React, { useMemo } from 'react';
import { 
  BarChart3, 
  Target, 
  Clock, 
  Flame, 
  Zap, 
  CheckCircle2, 
  TrendingUp, 
  AlertCircle 
} from 'lucide-react';
import { Task, WorkflowMetrics } from '../types.ts';

interface WorkflowAnalyticsProps {
  tasks: Task[];
  metrics: WorkflowMetrics;
}

export const WorkflowAnalytics: React.FC<WorkflowAnalyticsProps> = ({
  tasks,
  metrics,
}) => {
  // Category distribution
  const categoryStats = useMemo(() => {
    const cats: Record<string, { label: string; count: number; minutes: number }> = {
      deep_work: { label: 'Deep Work', count: 0, minutes: 0 },
      client: { label: 'Client Delivery', count: 0, minutes: 0 },
      operations: { label: 'Admin & Operations', count: 0, minutes: 0 },
      learning: { label: 'Learning & R&D', count: 0, minutes: 0 },
      health: { label: 'Health & Habits', count: 0, minutes: 0 },
    };

    let totalMins = 0;
    for (const t of tasks) {
      if (cats[t.category]) {
        cats[t.category].count += 1;
        cats[t.category].minutes += (t.estimatedMinutes || 0);
        totalMins += (t.estimatedMinutes || 0);
      }
    }

    return Object.entries(cats).map(([key, data]) => ({
      key,
      ...data,
      percent: totalMins > 0 ? Math.round((data.minutes / totalMins) * 100) : 0,
      hours: (data.minutes / 60).toFixed(1),
    }));
  }, [tasks]);

  // Priority breakdown
  const priorityStats = useMemo(() => {
    const counts = { critical: 0, high: 0, medium: 0, low: 0 };
    for (const t of tasks) {
      if (t.status !== 'done') {
        counts[t.priority] += 1;
      }
    }
    return counts;
  }, [tasks]);

  return (
    <div className="flex-1 max-w-5xl mx-auto px-4 sm:px-8 py-6 w-full space-y-6">
      {/* Title */}
      <div className="pb-2 border-b border-slate-200">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Workflow & Productivity Analytics
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Objective metrics reflecting focus hours distribution, completion velocity, and cognitive workload balance.
        </p>
      </div>

      {/* Top 4 KPI Metrics Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1 */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Completion Rate</span>
            <Target className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
            {metrics.completionRate}%
          </div>
          <div className="text-[11px] text-slate-500 flex items-center gap-1 font-mono tabular-nums">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>{metrics.completedToday} completed today</span>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Focus Time Planned</span>
            <Clock className="w-4 h-4 text-slate-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
            {metrics.totalFocusHours}h
          </div>
          <div className="text-[11px] text-slate-500 flex items-center gap-1">
            <span>{metrics.pendingToday} active tasks scheduled</span>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Deep Work Ratio</span>
            <Zap className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
            {metrics.deepWorkRatio}%
          </div>
          <div className="text-[11px] text-slate-500">
            <span>Target: &ge; 40% high focus</span>
          </div>
        </div>

        {/* KPI 4 */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Schedule Health</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
            {metrics.conflictsCount === 0 ? 'Clear' : `${metrics.conflictsCount} Overlaps`}
          </div>
          <div className="text-[11px] text-slate-500 font-mono tabular-nums">
            {metrics.criticalPending > 0 ? (
              <span className="text-rose-600 font-semibold flex items-center gap-1">
                <Flame className="w-3.5 h-3.5" />
                {metrics.criticalPending} critical pending
              </span>
            ) : (
              <span className="text-emerald-700">Zero critical bottlenecks</span>
            )}
          </div>
        </div>
      </div>

      {/* Stream Distribution & Priority Backlog */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Stream Breakdown */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900">
            Focus Distribution by Work Stream
          </h3>

          <div className="space-y-3">
            {categoryStats.map((item) => (
              <div key={item.key} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-700 font-medium">{item.label}</span>
                  <span className="font-mono tabular-nums text-slate-500">
                    {item.hours}h ({item.percent}%)
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-indigo-600 h-full rounded-full"
                    style={{ width: `${Math.min(100, Math.max(2, item.percent))}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pending Priority Tiers */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900">
            Active Backlog by Urgency Priority
          </h3>

          <div className="space-y-3 pt-1">
            <div className="p-3 rounded-lg border border-rose-200 bg-rose-50/40 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-rose-600" />
                <span className="text-xs font-semibold text-rose-900">Critical Priority</span>
              </div>
              <span className="text-sm font-bold font-mono tabular-nums text-rose-900">
                {priorityStats.critical}
              </span>
            </div>

            <div className="p-3 rounded-lg border border-amber-200 bg-amber-50/40 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                <span className="text-xs font-semibold text-amber-900">High Priority</span>
              </div>
              <span className="text-sm font-bold font-mono tabular-nums text-amber-900">
                {priorityStats.high}
              </span>
            </div>

            <div className="p-3 rounded-lg border border-slate-200 bg-slate-50/60 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-600" />
                <span className="text-xs font-semibold text-slate-800">Medium Priority</span>
              </div>
              <span className="text-sm font-bold font-mono tabular-nums text-slate-800">
                {priorityStats.medium}
              </span>
            </div>

            <div className="p-3 rounded-lg border border-slate-200 bg-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-slate-400" />
                <span className="text-xs font-medium text-slate-600">Low Priority (Flexible)</span>
              </div>
              <span className="text-sm font-bold font-mono tabular-nums text-slate-600">
                {priorityStats.low}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
