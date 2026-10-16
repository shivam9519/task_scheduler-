import React from 'react';
import { Bell, Plus, Sparkles, Calendar, CheckSquare, BarChart3 } from 'lucide-react';

interface HeaderProps {
  currentTab: 'tasks' | 'calendar' | 'advisor' | 'analytics';
  onSelectTab: (tab: 'tasks' | 'calendar' | 'advisor' | 'analytics') => void;
  onOpenNewTaskModal: () => void;
  unreadNotificationsCount: number;
  onToggleNotificationCenter: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onSelectTab,
  onOpenNewTaskModal,
  unreadNotificationsCount,
  onToggleNotificationCenter,
}) => {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-8 px-6 py-3.5 bg-white border-b border-slate-200">
      {/* Zone 1: Single element brand wordmark */}
      <div className="flex items-center gap-3 shrink-0">
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            onSelectTab('tasks');
          }}
          className="text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0 flex items-center gap-2"
        >
          <span className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
            FP
          </span>
          <span>FlowPulse</span>
        </a>
      </div>

      {/* Zone 2: Concise single-line navigation links */}
      <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
        <button
          onClick={() => onSelectTab('tasks')}
          className={`flex items-center gap-2 transition-colors whitespace-nowrap shrink-0 ${
            currentTab === 'tasks'
              ? 'text-indigo-600 font-semibold'
              : 'hover:text-slate-900'
          }`}
        >
          <CheckSquare className="w-4 h-4" />
          <span>Today's Tasks</span>
        </button>

        <button
          onClick={() => onSelectTab('calendar')}
          className={`flex items-center gap-2 transition-colors whitespace-nowrap shrink-0 ${
            currentTab === 'calendar'
              ? 'text-indigo-600 font-semibold'
              : 'hover:text-slate-900'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Calendar</span>
        </button>

        <button
          onClick={() => onSelectTab('advisor')}
          className={`flex items-center gap-2 transition-colors whitespace-nowrap shrink-0 ${
            currentTab === 'advisor'
              ? 'text-indigo-600 font-semibold'
              : 'hover:text-slate-900'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Smart Advisor</span>
        </button>

        <button
          onClick={() => onSelectTab('analytics')}
          className={`flex items-center gap-2 transition-colors whitespace-nowrap shrink-0 ${
            currentTab === 'analytics'
              ? 'text-indigo-600 font-semibold'
              : 'hover:text-slate-900'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Analytics</span>
        </button>
      </nav>

      {/* Zone 3: 1 primary action + notification affordance */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          type="button"
          onClick={onToggleNotificationCenter}
          aria-label={`Priority Notifications (${unreadNotificationsCount} unread)`}
          className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <Bell className="w-5 h-5" />
          {unreadNotificationsCount > 0 && (
            <span className="absolute top-1 right-1 flex items-center justify-center min-w-4.5 h-4.5 px-1 text-[11px] font-semibold text-white bg-rose-600 rounded-full tabular-nums">
              {unreadNotificationsCount}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={onOpenNewTaskModal}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-xs whitespace-nowrap shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>New Task</span>
        </button>
      </div>
    </header>
  );
};
