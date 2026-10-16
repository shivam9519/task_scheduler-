import React, { useState, useMemo } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  Plus, 
  AlertTriangle,
  Calendar as CalendarIcon,
  CheckCircle2,
  CalendarDays
} from 'lucide-react';
import { Task, ScheduleConflict, TaskCategory } from '../types.ts';
import { 
  getCalendarDaysForMonth, 
  getWeekDays, 
  parseTimeMinutes, 
  formatMinutesToTime 
} from '../utils/taskLogic.ts';
import { getTodayDateString } from '../utils/storage.ts';

interface CalendarViewProps {
  tasks: Task[];
  conflicts: ScheduleConflict[];
  selectedCategory: TaskCategory | 'all';
  onOpenNewTaskModal: (initialDate?: string, initialStartTime?: string) => void;
  onEditTask: (task: Task) => void;
  onToggleStatus: (taskId: string) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  tasks,
  conflicts,
  selectedCategory,
  onOpenNewTaskModal,
  onEditTask,
  onToggleStatus,
}) => {
  const todayStr = getTodayDateString();
  const [calendarMode, setCalendarMode] = useState<'day' | 'week' | 'month'>('day');
  const [currentDate, setCurrentDate] = useState<Date>(new Date());

  const currentDateStr = useMemo(() => {
    const y = currentDate.getFullYear();
    const m = String(currentDate.getMonth() + 1).padStart(2, '0');
    const d = String(currentDate.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }, [currentDate]);

  // Navigate dates
  const handlePrev = () => {
    const next = new Date(currentDate);
    if (calendarMode === 'day') next.setDate(next.getDate() - 1);
    else if (calendarMode === 'week') next.setDate(next.getDate() - 7);
    else if (calendarMode === 'month') next.setMonth(next.getMonth() - 1);
    setCurrentDate(next);
  };

  const handleNext = () => {
    const next = new Date(currentDate);
    if (calendarMode === 'day') next.setDate(next.getDate() + 1);
    else if (calendarMode === 'week') next.setDate(next.getDate() + 7);
    else if (calendarMode === 'month') next.setMonth(next.getMonth() + 1);
    setCurrentDate(next);
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  // Filter tasks by stream category if active
  const streamFilteredTasks = useMemo(() => {
    if (selectedCategory === 'all') return tasks;
    return tasks.filter(t => t.category === selectedCategory);
  }, [tasks, selectedCategory]);

  // Hours for day and week views: 08:00 to 20:00
  const hours = useMemo(() => {
    const list: string[] = [];
    for (let h = 8; h <= 20; h++) {
      list.push(`${String(h).padStart(2, '0')}:00`);
    }
    return list;
  }, []);

  // Priority color borders and styles
  const getTaskStyle = (task: Task, hasConflict: boolean) => {
    if (task.status === 'done') {
      return 'bg-slate-100 text-slate-500 border-slate-200 opacity-70';
    }
    if (hasConflict) {
      return 'bg-amber-50 text-amber-900 border-amber-400 font-medium';
    }
    switch (task.priority) {
      case 'critical':
        return 'bg-rose-50 text-rose-900 border-rose-300';
      case 'high':
        return 'bg-amber-50 text-amber-900 border-amber-300';
      case 'medium':
        return 'bg-indigo-50 text-indigo-900 border-indigo-200';
      case 'low':
      default:
        return 'bg-slate-50 text-slate-800 border-slate-200';
    }
  };

  const conflictTaskIds = useMemo(() => {
    const set = new Set<string>();
    for (const c of conflicts) {
      set.add(c.task1Id);
      set.add(c.task2Id);
    }
    return set;
  }, [conflicts]);

  // Day view tasks for current selected date
  const dayTasks = useMemo(() => {
    return streamFilteredTasks.filter(t => t.date === currentDateStr);
  }, [streamFilteredTasks, currentDateStr]);

  // Month grid
  const monthDays = useMemo(() => {
    return getCalendarDaysForMonth(currentDate.getFullYear(), currentDate.getMonth());
  }, [currentDate]);

  // Week days
  const weekDays = useMemo(() => {
    return getWeekDays(currentDate);
  }, [currentDate]);

  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  return (
    <div className="flex-1 max-w-6xl mx-auto px-4 sm:px-8 py-6 w-full space-y-5">
      {/* Calendar Header with Navigation and Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Integrated Calendar
            </h1>
            <span className="text-xs font-mono tabular-nums text-slate-500 pt-1">
              {monthName}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Visualize daily commitments, resolve overlapping time windows, and schedule high-impact work.
          </p>
        </div>

        {/* View Switcher & Date Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Day / Week / Month Mode Segmented Control */}
          <div className="inline-flex items-center rounded-lg border border-slate-200 p-0.5 bg-slate-50 text-xs font-medium">
            <button
              type="button"
              onClick={() => setCalendarMode('day')}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                calendarMode === 'day' ? 'bg-white text-indigo-700 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Day
            </button>
            <button
              type="button"
              onClick={() => setCalendarMode('week')}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                calendarMode === 'week' ? 'bg-white text-indigo-700 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Week
            </button>
            <button
              type="button"
              onClick={() => setCalendarMode('month')}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                calendarMode === 'month' ? 'bg-white text-indigo-700 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Month
            </button>
          </div>

          {/* Navigation buttons */}
          <div className="inline-flex items-center rounded-lg border border-slate-200 p-0.5 bg-slate-50 text-xs font-medium">
            <button
              type="button"
              onClick={handlePrev}
              aria-label="Previous period"
              className="p-1.5 hover:bg-white rounded-md text-slate-600 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleToday}
              className="px-2.5 py-1 text-slate-700 hover:bg-white rounded-md transition-colors"
            >
              Today
            </button>
            <button
              type="button"
              onClick={handleNext}
              aria-label="Next period"
              className="p-1.5 hover:bg-white rounded-md text-slate-600 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            type="button"
            onClick={() => onOpenNewTaskModal(currentDateStr)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Schedule</span>
          </button>
        </div>
      </div>

      {/* Conflicts Indicator */}
      {conflicts.length > 0 && calendarMode === 'day' && currentDateStr === todayStr && (
        <div className="rounded-xl border border-amber-300 bg-amber-50/70 p-3.5 text-amber-900 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>{conflicts.length} Overlapping Task Window:</strong> {conflicts[0].task1Title} and {conflicts[0].task2Title} ({conflicts[0].timeRange})
            </span>
          </div>
          <button
            type="button"
            onClick={() => onEditTask(tasks.find(t => t.id === conflicts[0].task2Id)!)}
            className="px-3 py-1 bg-white border border-amber-300 rounded text-amber-800 hover:bg-amber-100/50 font-medium whitespace-nowrap shrink-0"
          >
            Adjust Time Slot
          </button>
        </div>
      )}

      {/* --- DAY VIEW --- */}
      {calendarMode === 'day' && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
          {/* Day header */}
          <div className="px-6 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <CalendarIcon className="w-4 h-4 text-indigo-600" />
              <span className="font-semibold text-sm text-slate-900">
                {currentDate.toLocaleDateString('default', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
              {currentDateStr === todayStr && (
                <span className="text-xs text-indigo-600 font-medium">· Today</span>
              )}
            </div>
            <span className="text-xs font-mono tabular-nums text-slate-500">
              {dayTasks.length} scheduled items
            </span>
          </div>

          {/* Time Slot Timeline Grid */}
          <div className="divide-y divide-slate-100">
            {hours.map((hourStr) => {
              const hourMins = parseTimeMinutes(hourStr);
              // Find tasks starting in this hour (e.g. 09:00 - 09:59)
              const slotTasks = dayTasks.filter(t => {
                if (!t.startTime) return false;
                const taskStartMins = parseTimeMinutes(t.startTime);
                return taskStartMins >= hourMins && taskStartMins < hourMins + 60;
              });

              return (
                <div key={hourStr} className="flex min-h-[64px] group/slot">
                  {/* Time label */}
                  <div className="w-20 px-4 py-3 text-xs font-mono tabular-nums text-slate-400 border-r border-slate-100 shrink-0 text-right select-none">
                    {hourStr}
                  </div>

                  {/* Slot content */}
                  <div 
                    className="flex-1 p-2 flex flex-col gap-2 relative transition-colors hover:bg-slate-50/60 cursor-pointer"
                    onClick={() => {
                      if (slotTasks.length === 0) {
                        onOpenNewTaskModal(currentDateStr, hourStr);
                      }
                    }}
                  >
                    {slotTasks.length === 0 ? (
                      <div className="h-full w-full opacity-0 group-hover/slot:opacity-100 transition-opacity flex items-center pl-2 text-xs text-slate-400">
                        <Plus className="w-3.5 h-3.5 mr-1" />
                        <span>Click to schedule at {hourStr}</span>
                      </div>
                    ) : (
                      slotTasks.map((t) => {
                        const hasConflict = conflictTaskIds.has(t.id);
                        return (
                          <div
                            key={t.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              onEditTask(t);
                            }}
                            className={`p-3 rounded-lg border transition-all text-xs flex items-center justify-between gap-3 ${getTaskStyle(t, hasConflict)}`}
                          >
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-semibold text-sm truncate">
                                  {t.title}
                                </span>
                                {hasConflict && (
                                  <span className="text-[11px] text-amber-700 font-bold flex items-center gap-0.5">
                                    <AlertTriangle className="w-3 h-3" /> Overlap
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] text-slate-600 flex items-center gap-2">
                                <span className="font-mono tabular-nums">
                                  {t.startTime} - {t.endTime || `${t.estimatedMinutes}m`}
                                </span>
                                <span aria-hidden="true">·</span>
                                <span className="capitalize">{t.category.replace('_', ' ')}</span>
                                <span aria-hidden="true">·</span>
                                <span>{t.priority}</span>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onToggleStatus(t.id);
                              }}
                              className="shrink-0 p-1 rounded hover:bg-black/5 text-slate-600 transition-colors"
                              title={t.status === 'done' ? 'Mark Incomplete' : 'Mark Done'}
                            >
                              <CheckCircle2 className={`w-4 h-4 ${t.status === 'done' ? 'text-emerald-600' : 'text-slate-400'}`} />
                            </button>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Unscheduled or Flexible Tasks for this day */}
          {dayTasks.filter(t => !t.startTime).length > 0 && (
            <div className="p-4 bg-slate-50 border-t border-slate-200">
              <span className="text-xs font-semibold text-slate-600 block mb-2">
                Flexible / All-Day Tasks ({dayTasks.filter(t => !t.startTime).length})
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {dayTasks.filter(t => !t.startTime).map(t => (
                  <div
                    key={t.id}
                    onClick={() => onEditTask(t)}
                    className="p-2.5 bg-white border border-slate-200 rounded-lg text-xs cursor-pointer hover:border-slate-300 transition-colors flex items-center justify-between"
                  >
                    <span className={`font-medium truncate ${t.status === 'done' ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                      {t.title}
                    </span>
                    <span className="text-slate-400 font-mono tabular-nums shrink-0 ml-2">
                      {t.estimatedMinutes}m
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* --- WEEK VIEW --- */}
      {calendarMode === 'week' && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-x-auto shadow-xs">
          <div className="min-w-[700px] grid grid-cols-7 divide-x divide-slate-100 border-b border-slate-200 bg-slate-50">
            {weekDays.map((d) => (
              <div
                key={d.dateStr}
                onClick={() => {
                  setCurrentDate(new Date(d.dateStr));
                  setCalendarMode('day');
                }}
                className={`p-3 text-center cursor-pointer transition-colors hover:bg-slate-100 ${
                  d.isToday ? 'bg-indigo-50/60' : ''
                }`}
              >
                <div className="text-xs font-medium text-slate-500 uppercase">{d.dayName}</div>
                <div className={`text-base font-bold font-mono tabular-nums mt-0.5 ${d.isToday ? 'text-indigo-600' : 'text-slate-800'}`}>
                  {d.dayNumber}
                </div>
              </div>
            ))}
          </div>

          <div className="min-w-[700px] grid grid-cols-7 divide-x divide-slate-100 min-h-[380px]">
            {weekDays.map((d) => {
              const dayTasksForCol = streamFilteredTasks.filter(t => t.date === d.dateStr);
              return (
                <div
                  key={d.dateStr}
                  className="p-2 space-y-2 flex flex-col justify-start hover:bg-slate-50/40 transition-colors"
                >
                  <button
                    type="button"
                    onClick={() => onOpenNewTaskModal(d.dateStr)}
                    className="w-full py-1 text-[11px] text-slate-400 hover:text-indigo-600 border border-dashed border-transparent hover:border-slate-300 rounded text-center transition-colors"
                  >
                    + Add
                  </button>

                  {dayTasksForCol.map((t) => (
                    <div
                      key={t.id}
                      onClick={() => onEditTask(t)}
                      className={`p-2 rounded-lg border text-xs cursor-pointer transition-colors shadow-2xs ${getTaskStyle(t, conflictTaskIds.has(t.id))}`}
                    >
                      <div className="font-semibold truncate">{t.title}</div>
                      {t.startTime && (
                        <div className="text-[10px] font-mono tabular-nums opacity-80 mt-0.5">
                          {t.startTime} ({t.estimatedMinutes}m)
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* --- MONTH VIEW --- */}
      {calendarMode === 'month' && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50 text-center py-2 text-xs font-semibold text-slate-500 uppercase">
            <div>Sun</div>
            <div>Mon</div>
            <div>Tue</div>
            <div>Wed</div>
            <div>Thu</div>
            <div>Fri</div>
            <div>Sat</div>
          </div>

          <div className="grid grid-cols-7 divide-x divide-y divide-slate-100">
            {monthDays.map((item) => {
              const tasksOnDay = streamFilteredTasks.filter(t => t.date === item.dateStr);
              const isToday = item.dateStr === todayStr;

              return (
                <div
                  key={item.dateStr}
                  onClick={() => {
                    setCurrentDate(new Date(item.dateStr));
                    setCalendarMode('day');
                  }}
                  className={`min-h-[92px] p-2 flex flex-col justify-between transition-colors hover:bg-slate-50 cursor-pointer ${
                    !item.isCurrentMonth ? 'bg-slate-50/50 opacity-40' : ''
                  } ${isToday ? 'bg-indigo-50/40' : ''}`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-mono tabular-nums font-semibold ${
                        isToday ? 'text-indigo-600 font-bold' : 'text-slate-700'
                      }`}
                    >
                      {item.dayNumber}
                    </span>
                    {tasksOnDay.length > 0 && (
                      <span className="text-[10px] font-mono tabular-nums text-slate-400">
                        {tasksOnDay.length}
                      </span>
                    )}
                  </div>

                  {/* Tasks preview chips */}
                  <div className="space-y-1 mt-1">
                    {tasksOnDay.slice(0, 2).map((t) => (
                      <div
                        key={t.id}
                        className={`text-[10px] truncate px-1.5 py-0.5 rounded border ${getTaskStyle(t, false)}`}
                      >
                        {t.title}
                      </div>
                    ))}
                    {tasksOnDay.length > 2 && (
                      <div className="text-[10px] text-slate-500 pl-1">
                        +{tasksOnDay.length - 2} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
