import React from 'react';
import { CheckSquare, Calendar, Sparkles, BarChart3 } from 'lucide-react';

interface MobileNavProps {
  currentTab: 'tasks' | 'calendar' | 'advisor' | 'analytics';
  onSelectTab: (tab: 'tasks' | 'calendar' | 'advisor' | 'analytics') => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ currentTab, onSelectTab }) => {
  return (
    <nav 
      aria-label="Mobile Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xs border-t border-slate-200 px-3 py-1.5 flex items-center justify-around shadow-lg"
    >
      <button
        type="button"
        onClick={() => onSelectTab('tasks')}
        className={`flex flex-col items-center justify-center py-1 px-3 rounded-lg text-[10px] font-medium transition-colors ${
          currentTab === 'tasks' ? 'text-indigo-600 font-semibold' : 'text-slate-500 hover:text-slate-900'
        }`}
      >
        <CheckSquare className="w-5 h-5 mb-0.5" />
        <span>Tasks</span>
      </button>

      <button
        type="button"
        onClick={() => onSelectTab('calendar')}
        className={`flex flex-col items-center justify-center py-1 px-3 rounded-lg text-[10px] font-medium transition-colors ${
          currentTab === 'calendar' ? 'text-indigo-600 font-semibold' : 'text-slate-500 hover:text-slate-900'
        }`}
      >
        <Calendar className="w-5 h-5 mb-0.5" />
        <span>Calendar</span>
      </button>

      <button
        type="button"
        onClick={() => onSelectTab('advisor')}
        className={`flex flex-col items-center justify-center py-1 px-3 rounded-lg text-[10px] font-medium transition-colors ${
          currentTab === 'advisor' ? 'text-indigo-600 font-semibold' : 'text-slate-500 hover:text-slate-900'
        }`}
      >
        <Sparkles className="w-5 h-5 mb-0.5" />
        <span>Advisor</span>
      </button>

      <button
        type="button"
        onClick={() => onSelectTab('analytics')}
        className={`flex flex-col items-center justify-center py-1 px-3 rounded-lg text-[10px] font-medium transition-colors ${
          currentTab === 'analytics' ? 'text-indigo-600 font-semibold' : 'text-slate-500 hover:text-slate-900'
        }`}
      >
        <BarChart3 className="w-5 h-5 mb-0.5" />
        <span>Stats</span>
      </button>
    </nav>
  );
};
