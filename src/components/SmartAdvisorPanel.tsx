import React, { useState } from 'react';
import { 
  Sparkles, 
  Check, 
  ArrowRight, 
  AlertCircle, 
  Clock, 
  Layers, 
  RotateCcw, 
  Zap,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';
import { Task, SmartSuggestion, WorkflowMetrics } from '../types.ts';
import { soundService } from '../utils/audio.ts';

interface SmartAdvisorPanelProps {
  tasks: Task[];
  suggestions: SmartSuggestion[];
  metrics: WorkflowMetrics;
  onApplySuggestion: (suggestion: SmartSuggestion) => void;
  onRefreshSuggestions: () => void;
  isLoading: boolean;
  briefingText: string;
}

export const SmartAdvisorPanel: React.FC<SmartAdvisorPanelProps> = ({
  tasks,
  suggestions,
  metrics,
  onApplySuggestion,
  onRefreshSuggestions,
  isLoading,
  briefingText,
}) => {
  const [appliedIds, setAppliedIds] = useState<Set<string>>(new Set());

  const handleApply = (suggestion: SmartSuggestion) => {
    soundService.playChime('complete');
    setAppliedIds((prev) => new Set(prev).add(suggestion.id));
    onApplySuggestion(suggestion);
  };

  const getIconForType = (type: SmartSuggestion['type']) => {
    switch (type) {
      case 'buffer':
        return <Clock className="w-4 h-4 text-amber-600" />;
      case 'breakdown':
        return <Layers className="w-4 h-4 text-indigo-600" />;
      case 'energy_alignment':
        return <Zap className="w-4 h-4 text-emerald-600" />;
      case 'rebalance':
        return <RotateCcw className="w-4 h-4 text-purple-600" />;
      case 'daily_focus':
      default:
        return <ShieldCheck className="w-4 h-4 text-blue-600" />;
    }
  };

  const getTypeBadgeLabel = (type: SmartSuggestion['type']) => {
    switch (type) {
      case 'buffer':
        return 'Schedule Buffer';
      case 'breakdown':
        return 'Task Decomposition';
      case 'energy_alignment':
        return 'Cognitive Energy Alignment';
      case 'rebalance':
        return 'Priority Rebalance';
      case 'daily_focus':
      default:
        return 'Focus Strategy';
    }
  };

  return (
    <div className="flex-1 max-w-5xl mx-auto px-4 sm:px-8 py-6 w-full space-y-6">
      {/* Header and Refresh Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Smart Workflow Advisor
            </h1>
            <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
              AI Powered
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Intelligent recommendations derived from your schedule density, cognitive energy curves, and task priorities.
          </p>
        </div>

        <button
          type="button"
          onClick={onRefreshSuggestions}
          disabled={isLoading}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors border border-indigo-200/80 disabled:opacity-60 shrink-0 self-start sm:self-center"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>{isLoading ? 'Analyzing Workflow...' : 'Re-Analyze Workflow'}</span>
        </button>
      </div>

      {/* Executive Daily Briefing Card */}
      <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-slate-900 text-white rounded-xl p-5 sm:p-6 shadow-sm border border-slate-800">
        <div className="flex items-start gap-4">
          <div className="w-9 h-9 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-400/30 flex items-center justify-center shrink-0 mt-0.5">
            <Sparkles className="w-5 h-5 text-indigo-300" />
          </div>
          <div className="space-y-2">
            <span className="text-xs font-semibold tracking-wider text-indigo-300 uppercase">
              Executive Workflow Briefing
            </span>
            <p className="text-sm leading-relaxed text-slate-200">
              {briefingText || 'Analyzing current workload velocity. High focus blocks scheduled in the morning yield optimal outcomes.'}
            </p>
            <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-slate-400">
              <span>{metrics.pendingToday} active tasks planned</span>
              <span aria-hidden="true">·</span>
              <span>{metrics.totalFocusHours} total focus hours</span>
              <span aria-hidden="true">·</span>
              <span>{metrics.deepWorkRatio}% deep work ratio</span>
            </div>
          </div>
        </div>
      </div>

      {/* Smart Suggestions List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold tracking-tight text-slate-900 uppercase">
            Actionable Optimization Recommendations ({suggestions.length})
          </h2>
          <span className="text-xs text-slate-500">
            Click 'Apply' to automatically update your schedule & tasks
          </span>
        </div>

        {suggestions.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 p-10 text-center bg-white space-y-2">
            <ShieldCheck className="w-8 h-8 text-emerald-600 mx-auto" />
            <h4 className="text-base font-semibold text-slate-800">Workflow is Well-Balanced</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              No immediate bottlenecks, overlaps, or scheduling conflicts detected for today. You are set up for optimal productivity!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {suggestions.map((suggestion) => {
              const isApplied = appliedIds.has(suggestion.id) || suggestion.applied;
              const targetTask = suggestion.targetTaskId 
                ? tasks.find(t => t.id === suggestion.targetTaskId)
                : undefined;

              return (
                <div
                  key={suggestion.id}
                  className={`rounded-xl border p-5 transition-all bg-white ${
                    isApplied
                      ? 'border-emerald-200 bg-emerald-50/20'
                      : 'border-slate-200 hover:border-slate-300 shadow-xs hover:shadow-sm'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="space-y-2 flex-1">
                      {/* Unboxed type metadata */}
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        {getIconForType(suggestion.type)}
                        <span className="font-medium text-slate-700">
                          {getTypeBadgeLabel(suggestion.type)}
                        </span>
                        {targetTask && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span className="text-slate-500 font-mono tabular-nums">
                              Targets: {targetTask.title}
                            </span>
                          </>
                        )}
                      </div>

                      {/* Suggestion Title */}
                      <h3 className="text-base font-semibold text-slate-900">
                        {suggestion.title}
                      </h3>

                      {/* Evidence / Reasoning */}
                      <p className="text-xs text-slate-600 leading-relaxed">
                        {suggestion.reasoning}
                      </p>

                      {/* Detailed Preview of Changes if any */}
                      {suggestion.recommendedChanges && (
                        <div className="pt-2 text-xs text-slate-500 space-y-1">
                          {suggestion.recommendedChanges.newStartTime && (
                            <div className="font-mono tabular-nums text-indigo-700 flex items-center gap-1.5">
                              <ArrowRight className="w-3 h-3" />
                              <span>
                                Recommended Time: {suggestion.recommendedChanges.newStartTime}
                                {suggestion.recommendedChanges.newEndTime ? ` - ${suggestion.recommendedChanges.newEndTime}` : ''}
                              </span>
                            </div>
                          )}
                          {suggestion.recommendedChanges.subtasksToAdd && (
                            <div className="space-y-0.5 pt-1">
                              <span className="font-semibold text-slate-700">Milestones to be generated:</span>
                              <ul className="list-disc pl-4 space-y-0.5 text-slate-600">
                                {suggestion.recommendedChanges.subtasksToAdd.map((s, i) => (
                                  <li key={i}>{s}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Apply Action Button */}
                    <div className="shrink-0 sm:self-center">
                      {isApplied ? (
                        <div className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-emerald-700 bg-emerald-50 rounded-lg border border-emerald-200">
                          <Check className="w-4 h-4" />
                          <span>Applied</span>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleApply(suggestion)}
                          className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-xs whitespace-nowrap"
                        >
                          <span>{suggestion.actionLabel}</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
