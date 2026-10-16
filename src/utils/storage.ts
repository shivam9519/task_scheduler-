import { Task, NotificationItem, SmartSuggestion } from '../types.ts';

const TASKS_STORAGE_KEY = 'flowpulse_tasks_v1';
const NOTIFICATIONS_STORAGE_KEY = 'flowpulse_notifications_v1';
const SUGGESTIONS_STORAGE_KEY = 'flowpulse_suggestions_v1';

export function getTodayDateString(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function getRelativeDateString(offsetDays: number): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function getDefaultSeedTasks(): Task[] {
  const today = getTodayDateString();
  const tomorrow = getRelativeDateString(1);
  const yesterday = getRelativeDateString(-1);

  return [
    {
      id: 'task-seed-1',
      title: 'Deep Architecture & Data Schema Review',
      description: 'Audit database indexes, query latency, and document caching layer.',
      priority: 'critical',
      status: 'in_progress',
      category: 'deep_work',
      energy: 'high_focus',
      date: today,
      startTime: '09:00',
      endTime: '10:30',
      estimatedMinutes: 90,
      actualMinutes: 45,
      subtasks: [
        { id: 'sub-1', title: 'Analyze slow query logs (>100ms)', completed: true },
        { id: 'sub-2', title: 'Review compound index on user_tasks table', completed: true },
        { id: 'sub-3', title: 'Write migration script for partitioning', completed: false },
      ],
      tags: ['Engineering', 'Backend', 'Performance'],
      isPinned: true,
      reminderMinutesBefore: 15,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'task-seed-2',
      title: 'Q4 Product Roadmap Sync with Stakeholders',
      description: 'Review milestone commitments, engineering capacity, and deliverable dates.',
      priority: 'high',
      status: 'todo',
      category: 'client',
      energy: 'moderate',
      date: today,
      startTime: '11:00',
      endTime: '12:00',
      estimatedMinutes: 60,
      subtasks: [
        { id: 'sub-4', title: 'Prepare slide deck overview', completed: true },
        { id: 'sub-5', title: 'Align engineering deliverables with design milestones', completed: false },
      ],
      tags: ['Strategy', 'Roadmap', 'Sync'],
      isPinned: true,
      reminderMinutesBefore: 10,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'task-seed-3',
      title: 'Customer Feedback & Bug Triage',
      description: 'Sort inbound bug reports and prioritize for the upcoming sprint.',
      priority: 'medium',
      status: 'todo',
      category: 'operations',
      energy: 'moderate',
      date: today,
      startTime: '13:30',
      endTime: '14:30',
      estimatedMinutes: 60,
      subtasks: [
        { id: 'sub-6', title: 'Review high-severity triage items', completed: false },
        { id: 'sub-7', title: 'Assign ticket owners', completed: false },
      ],
      tags: ['Triage', 'Support'],
      reminderMinutesBefore: 15,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'task-seed-4',
      title: 'Sprint Retrospective & Team Sync',
      description: 'Celebrate wins, review velocity, and establish process improvements.',
      priority: 'high',
      status: 'todo',
      category: 'operations',
      energy: 'moderate',
      date: today,
      startTime: '15:00',
      endTime: '16:00',
      estimatedMinutes: 60,
      subtasks: [
        { id: 'sub-8', title: 'Gather anonymous kudos and blocker notes', completed: false },
        { id: 'sub-9', title: 'Document top 2 action items', completed: false },
      ],
      tags: ['Sprint', 'Agile'],
      reminderMinutesBefore: 15,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'task-seed-5',
      title: 'Review Machine Learning Paper on Graph Attention',
      description: 'Read the latest preprint and assess applicability to recommendation engine.',
      priority: 'low',
      status: 'todo',
      category: 'learning',
      energy: 'high_focus',
      date: today,
      startTime: '16:30',
      endTime: '17:30',
      estimatedMinutes: 60,
      subtasks: [],
      tags: ['Research', 'AI'],
      reminderMinutesBefore: 15,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'task-seed-6',
      title: 'Daily Sunlight Walk & Hydration Reset',
      description: 'Step away from screen for mental clarity and physical movement.',
      priority: 'medium',
      status: 'done',
      category: 'health',
      energy: 'low_energy',
      date: today,
      startTime: '08:00',
      endTime: '08:30',
      estimatedMinutes: 30,
      actualMinutes: 30,
      subtasks: [],
      tags: ['Habits', 'Wellness'],
      reminderMinutesBefore: 5,
      createdAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
    },
    {
      id: 'task-seed-7',
      title: 'Draft Security Compliance Documentation (SOC2)',
      description: 'Compile access logs and role privilege matrices for audit compliance.',
      priority: 'high',
      status: 'todo',
      category: 'deep_work',
      energy: 'high_focus',
      date: tomorrow,
      startTime: '10:00',
      endTime: '12:00',
      estimatedMinutes: 120,
      subtasks: [],
      tags: ['Security', 'Compliance'],
      reminderMinutesBefore: 15,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'task-seed-8',
      title: 'Clean Up Stale Feature Flags in Codebase',
      description: 'Remove legacy boolean flags for retired features.',
      priority: 'low',
      status: 'todo',
      category: 'operations',
      energy: 'low_energy',
      date: yesterday,
      estimatedMinutes: 45,
      subtasks: [],
      tags: ['Refactor', 'TechDebt'],
      createdAt: new Date().toISOString(),
    },
  ];
}

export function getDefaultSeedNotifications(tasks: Task[]): NotificationItem[] {
  const today = getTodayDateString();
  const items: NotificationItem[] = [
    {
      id: 'notif-1',
      taskId: 'task-seed-1',
      title: 'Critical Task Active: Architecture Review',
      message: 'High-focus deep work block is currently in progress. Notification silence recommended.',
      priority: 'critical',
      timestamp: 'Just now',
      isRead: false,
      scheduledTime: '09:00',
      date: today,
    },
    {
      id: 'notif-2',
      taskId: 'task-seed-2',
      title: 'Upcoming in 30 Minutes: Roadmap Sync',
      message: 'Stakeholder presentation scheduled at 11:00 AM. 1 subtask still pending.',
      priority: 'high',
      timestamp: '15m ago',
      isRead: false,
      scheduledTime: '11:00',
      date: today,
    },
    {
      id: 'notif-3',
      title: 'Daily Briefing Ready',
      message: 'You have 5 focused tasks scheduled today totaling 5.5 hours. Morning capacity looks optimal.',
      priority: 'medium',
      timestamp: '1h ago',
      isRead: true,
      date: today,
    },
  ];

  return items;
}

export function loadTasks(): Task[] {
  if (typeof window === 'undefined') return getDefaultSeedTasks();
  try {
    const raw = localStorage.getItem(TASKS_STORAGE_KEY);
    if (!raw) {
      const initial = getDefaultSeedTasks();
      saveTasks(initial);
      return initial;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : getDefaultSeedTasks();
  } catch {
    return getDefaultSeedTasks();
  }
}

export function saveTasks(tasks: Task[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));
  } catch (e) {
    console.error('Failed to save tasks', e);
  }
}

export function loadNotifications(tasks: Task[]): NotificationItem[] {
  if (typeof window === 'undefined') return getDefaultSeedNotifications(tasks);
  try {
    const raw = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
    if (!raw) {
      const initial = getDefaultSeedNotifications(tasks);
      saveNotifications(initial);
      return initial;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : getDefaultSeedNotifications(tasks);
  } catch {
    return getDefaultSeedNotifications(tasks);
  }
}

export function saveNotifications(notifications: NotificationItem[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(notifications));
  } catch (e) {
    console.error('Failed to save notifications', e);
  }
}

export function loadSuggestions(): SmartSuggestion[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(SUGGESTIONS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveSuggestions(suggestions: SmartSuggestion[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(SUGGESTIONS_STORAGE_KEY, JSON.stringify(suggestions));
  } catch (e) {
    console.error('Failed to save suggestions', e);
  }
}
