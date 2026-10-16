import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Header } from './components/Header.tsx';
import { Sidebar } from './components/Sidebar.tsx';
import { TaskList } from './components/TaskList.tsx';
import { CalendarView } from './components/CalendarView.tsx';
import { SmartAdvisorPanel } from './components/SmartAdvisorPanel.tsx';
import { NotificationCenter } from './components/NotificationCenter.tsx';
import { WorkflowAnalytics } from './components/WorkflowAnalytics.tsx';
import { TaskModal } from './components/TaskModal.tsx';
import { MobileNav } from './components/MobileNav.tsx';
import { 
  Task, 
  NotificationItem, 
  SmartSuggestion, 
  TaskCategory 
} from './types.ts';
import { 
  loadTasks, 
  saveTasks, 
  loadNotifications, 
  saveNotifications, 
  getTodayDateString 
} from './utils/storage.ts';
import { 
  detectScheduleConflicts, 
  calculateWorkflowStats, 
  generateHeuristicSuggestions,
  calculateTaskUrgency,
  formatMinutesToTime,
  parseTimeMinutes
} from './utils/taskLogic.ts';
import { soundService } from './utils/audio.ts';

export default function App() {
  const todayStr = getTodayDateString();

  // Primary State
  const [tasks, setTasks] = useState<Task[]>(() => loadTasks());
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => loadNotifications(loadTasks()));
  const [currentTab, setCurrentTab] = useState<'tasks' | 'calendar' | 'advisor' | 'analytics'>('tasks');
  const [selectedCategory, setSelectedCategory] = useState<TaskCategory | 'all'>('all');
  
  // Modals & Panels
  const [isNotificationCenterOpen, setIsNotificationCenterOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [modalTask, setModalTask] = useState<Task | null>(null);
  const [modalDate, setModalDate] = useState<string>(todayStr);
  const [modalStartTime, setModalStartTime] = useState<string>('');

  // Suggestions state
  const [suggestions, setSuggestions] = useState<SmartSuggestion[]>(() => generateHeuristicSuggestions(loadTasks(), todayStr));
  const [isSuggestionsLoading, setIsSuggestionsLoading] = useState(false);
  const [briefingText, setBriefingText] = useState('Organizing daily focus around high-leverage outcomes. Start with high-priority items before midday.');

  // Persistence effects
  useEffect(() => {
    saveTasks(tasks);
  }, [tasks]);

  useEffect(() => {
    saveNotifications(notifications);
  }, [notifications]);

  // Derived metrics and conflicts
  const conflicts = useMemo(() => {
    return detectScheduleConflicts(tasks, todayStr);
  }, [tasks, todayStr]);

  const metrics = useMemo(() => {
    return calculateWorkflowStats(tasks, todayStr);
  }, [tasks, todayStr]);

  const unreadNotificationsCount = useMemo(() => {
    return notifications.filter(n => !n.isRead).length;
  }, [notifications]);

  // Request AI suggestions from backend
  const fetchSmartSuggestions = useCallback(async () => {
    setIsSuggestionsLoading(true);
    try {
      const res = await fetch('/api/smart-suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tasks: tasks.filter(t => t.date === todayStr),
          todayStr,
        }),
      });

      if (!res.ok) throw new Error('Failed to fetch smart suggestions');
      const data = await res.json();

      if (data.briefing) {
        setBriefingText(data.briefing);
      }

      if (Array.isArray(data.suggestions) && data.suggestions.length > 0) {
        setSuggestions(data.suggestions);
      } else {
        setSuggestions(generateHeuristicSuggestions(tasks, todayStr));
      }
    } catch {
      // Graceful fallback to heuristic suggestions
      setSuggestions(generateHeuristicSuggestions(tasks, todayStr));
      setBriefingText('Schedule buffer recommended between back-to-back blocks to sustain focus and task completion velocity.');
    } finally {
      setIsSuggestionsLoading(false);
    }
  }, [tasks, todayStr]);

  // Initial suggestions sync
  useEffect(() => {
    fetchSmartSuggestions();
  }, []);

  // Periodic notification generator: checks for upcoming tasks and overdue items
  useEffect(() => {
    const checkUpcomingTasks = () => {
      const now = new Date();
      const currentH = now.getHours();
      const currentM = now.getMinutes();
      const currentTotalMins = currentH * 60 + currentM;

      const upcomingNotifications: NotificationItem[] = [];

      for (const t of tasks) {
        if (t.status === 'done') continue;
        if (t.date === todayStr && t.startTime) {
          const taskStartMins = parseTimeMinutes(t.startTime);
          const reminderBefore = t.reminderMinutesBefore || 15;
          const diff = taskStartMins - currentTotalMins;

          // If within reminder window (0 to reminderBefore minutes)
          if (diff >= 0 && diff <= reminderBefore) {
            const notifId = `alert-${t.id}-${t.startTime}`;
            const alreadyExists = notifications.some(n => n.id === notifId);
            if (!alreadyExists) {
              upcomingNotifications.push({
                id: notifId,
                taskId: t.id,
                title: `Upcoming in ${diff}m: ${t.title}`,
                message: `Scheduled at ${t.startTime} (${t.estimatedMinutes}m duration). Category: ${t.category.replace('_', ' ')}.`,
                priority: t.priority,
                timestamp: 'Just now',
                isRead: false,
                scheduledTime: t.startTime,
                date: t.date,
              });
            }
          }
        }
      }

      if (upcomingNotifications.length > 0) {
        soundService.playChime('upcoming');
        setNotifications(prev => [...upcomingNotifications, ...prev]);
      }
    };

    const interval = setInterval(checkUpcomingTasks, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [tasks, todayStr, notifications]);

  // Handlers
  const handleToggleTaskStatus = (taskId: string) => {
    setTasks(prev =>
      prev.map(t => {
        if (t.id === taskId) {
          const isDone = t.status === 'done';
          return {
            ...t,
            status: isDone ? 'todo' : 'done',
            completedAt: isDone ? undefined : new Date().toISOString(),
          };
        }
        return t;
      })
    );
  };

  const handleToggleSubtask = (taskId: string, subtaskId: string) => {
    setTasks(prev =>
      prev.map(t => {
        if (t.id === taskId) {
          const updatedSubtasks = t.subtasks.map(st => {
            if (st.id === subtaskId) {
              return { ...st, completed: !st.completed };
            }
            return st;
          });
          return { ...t, subtasks: updatedSubtasks };
        }
        return t;
      })
    );
  };

  const handleSaveTask = (taskData: Partial<Task>) => {
    if (taskData.id) {
      // Edit existing task
      setTasks(prev =>
        prev.map(t => (t.id === taskData.id ? ({ ...t, ...taskData } as Task) : t))
      );
    } else {
      // Create new task
      const newTask: Task = {
        id: `task-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        title: taskData.title || 'Untitled Task',
        description: taskData.description,
        date: taskData.date || todayStr,
        startTime: taskData.startTime,
        endTime: taskData.endTime,
        estimatedMinutes: taskData.estimatedMinutes || 60,
        priority: taskData.priority || 'medium',
        category: taskData.category || 'deep_work',
        energy: taskData.energy || 'high_focus',
        tags: taskData.tags || [],
        isPinned: taskData.isPinned || false,
        reminderMinutesBefore: taskData.reminderMinutesBefore || 15,
        subtasks: taskData.subtasks || [],
        status: 'todo',
        createdAt: new Date().toISOString(),
      };

      setTasks(prev => [newTask, ...prev]);

      // If critical priority, add priority notification
      if (newTask.priority === 'critical') {
        const notif: NotificationItem = {
          id: `crit-${newTask.id}-${Date.now()}`,
          taskId: newTask.id,
          title: `Critical Priority Task Created: ${newTask.title}`,
          message: `Scheduled for ${newTask.date}${newTask.startTime ? ` at ${newTask.startTime}` : ''}. High focus recommended.`,
          priority: 'critical',
          timestamp: 'Just now',
          isRead: false,
          scheduledTime: newTask.startTime,
          date: newTask.date,
        };
        setNotifications(prev => [notif, ...prev]);
        soundService.playChime('critical');
      }
    }
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks(prev => prev.filter(t => t.id !== taskId));
    setNotifications(prev => prev.filter(n => n.taskId !== taskId));
  };

  const handleOpenNewTaskModal = (initialDate?: string, initialStartTime?: string) => {
    setModalTask(null);
    setModalDate(initialDate || todayStr);
    setModalStartTime(initialStartTime || '');
    setIsTaskModalOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setModalTask(task);
    setModalDate(task.date);
    setModalStartTime(task.startTime || '');
    setIsTaskModalOpen(true);
  };

  const handleApplySuggestion = (suggestion: SmartSuggestion) => {
    if (suggestion.targetTaskId) {
      setTasks(prev =>
        prev.map(t => {
          if (t.id === suggestion.targetTaskId) {
            const changes = suggestion.recommendedChanges || {};
            let updatedSubtasks = [...t.subtasks];

            if (changes.subtasksToAdd && changes.subtasksToAdd.length > 0) {
              const newSubs = changes.subtasksToAdd.map((titleStr, idx) => ({
                id: `sub-ai-${Date.now()}-${idx}`,
                title: titleStr,
                completed: false,
              }));
              updatedSubtasks = [...updatedSubtasks, ...newSubs];
            }

            return {
              ...t,
              startTime: changes.newStartTime !== undefined ? changes.newStartTime : t.startTime,
              endTime: changes.newEndTime !== undefined ? changes.newEndTime : t.endTime,
              date: changes.newDate !== undefined ? changes.newDate : t.date,
              priority: changes.newPriority !== undefined ? changes.newPriority : t.priority,
              subtasks: updatedSubtasks,
            };
          }
          return t;
        })
      );
    } else if (suggestion.type === 'daily_focus' && suggestion.recommendedChanges?.newStartTime) {
      // Add a buffer break task
      const bufferTask: Task = {
        id: `break-${Date.now()}`,
        title: 'Midday Cognitive Recharge & Walk',
        description: 'Scheduled buffer break to prevent afternoon cognitive fatigue.',
        date: todayStr,
        startTime: suggestion.recommendedChanges.newStartTime,
        endTime: suggestion.recommendedChanges.newEndTime || '13:30',
        estimatedMinutes: 20,
        priority: 'medium',
        category: 'health',
        energy: 'low_energy',
        tags: ['Wellness', 'Buffer'],
        subtasks: [],
        status: 'todo',
        createdAt: new Date().toISOString(),
      };
      setTasks(prev => [...prev, bufferTask]);
    }

    // Mark applied
    setSuggestions(prev =>
      prev.map(s => (s.id === suggestion.id ? { ...s, applied: true } : s))
    );
  };

  const handleMarkNotifAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const handleClearAllNotifications = () => {
    setNotifications([]);
  };

  const handleSnoozeNotification = (id: string, minutes: number) => {
    soundService.playChime('click');
    setNotifications(prev =>
      prev.map(n => {
        if (n.id === id) {
          return {
            ...n,
            isRead: true,
            timestamp: `Snoozed for ${minutes}m`,
          };
        }
        return n;
      })
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {/* Top Bar Contract (Wordmark, Nav Links, Primary CTA) */}
      <Header
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        onOpenNewTaskModal={() => handleOpenNewTaskModal(todayStr)}
        unreadNotificationsCount={unreadNotificationsCount}
        onToggleNotificationCenter={() => setIsNotificationCenterOpen(!isNotificationCenterOpen)}
      />

      {/* Main Workspace Frame */}
      <div className="flex-1 flex overflow-hidden">
        {/* Workspace Sidebar (Desktop) */}
        <div className="hidden md:block">
          <Sidebar
            currentTab={currentTab}
            onSelectTab={setCurrentTab}
            metrics={metrics}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            onOpenNewTaskModal={() => handleOpenNewTaskModal(todayStr)}
          />
        </div>

        {/* Dynamic Main Content Viewport */}
        <main className="flex-1 overflow-y-auto min-h-[calc(100vh-57px)] pb-12">
          {currentTab === 'tasks' && (
            <TaskList
              tasks={tasks}
              conflicts={conflicts}
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
              onToggleStatus={handleToggleTaskStatus}
              onToggleSubtask={handleToggleSubtask}
              onEditTask={handleEditTask}
              onDeleteTask={handleDeleteTask}
              onOpenNewTaskModal={handleOpenNewTaskModal}
            />
          )}

          {currentTab === 'calendar' && (
            <CalendarView
              tasks={tasks}
              conflicts={conflicts}
              selectedCategory={selectedCategory}
              onOpenNewTaskModal={handleOpenNewTaskModal}
              onEditTask={handleEditTask}
              onToggleStatus={handleToggleTaskStatus}
            />
          )}

          {currentTab === 'advisor' && (
            <SmartAdvisorPanel
              tasks={tasks}
              suggestions={suggestions}
              metrics={metrics}
              onApplySuggestion={handleApplySuggestion}
              onRefreshSuggestions={fetchSmartSuggestions}
              isLoading={isSuggestionsLoading}
              briefingText={briefingText}
            />
          )}

          {currentTab === 'analytics' && (
            <WorkflowAnalytics
              tasks={tasks}
              metrics={metrics}
            />
          )}
        </main>
      </div>

      {/* Priority Notifications Drawer */}
      <NotificationCenter
        isOpen={isNotificationCenterOpen}
        onClose={() => setIsNotificationCenterOpen(false)}
        notifications={notifications}
        tasks={tasks}
        onMarkAsRead={handleMarkNotifAsRead}
        onClearAll={handleClearAllNotifications}
        onSnoozeNotification={handleSnoozeNotification}
        onNavigateToTask={(taskId) => {
          const t = tasks.find(item => item.id === taskId);
          if (t) handleEditTask(t);
        }}
      />

      {/* Task Creation & Editing Modal */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onSaveTask={handleSaveTask}
        initialTask={modalTask}
        initialDate={modalDate}
        initialStartTime={modalStartTime}
      />

      {/* Mobile Bottom Navigation */}
      <MobileNav
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
      />
    </div>
  );
}
