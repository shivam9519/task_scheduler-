export type TaskPriority = 'low' | 'medium' | 'high' | 'critical';
export type TaskStatus = 'todo' | 'in_progress' | 'blocked' | 'done';
export type TaskCategory = 'deep_work' | 'client' | 'operations' | 'learning' | 'health';
export type EnergyLevel = 'high_focus' | 'moderate' | 'low_energy';

export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: TaskPriority;
  status: TaskStatus;
  category: TaskCategory;
  energy: EnergyLevel;
  date: string; // YYYY-MM-DD
  startTime?: string; // HH:mm (24hr)
  endTime?: string; // HH:mm (24hr)
  estimatedMinutes: number;
  actualMinutes?: number;
  subtasks: SubTask[];
  tags: string[];
  isPinned?: boolean;
  reminderMinutesBefore?: number;
  createdAt: string;
  completedAt?: string;
}

export interface ScheduleConflict {
  task1Id: string;
  task2Id: string;
  task1Title: string;
  task2Title: string;
  overlapMinutes: number;
  timeRange: string;
}

export interface NotificationItem {
  id: string;
  taskId?: string;
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  timestamp: string;
  isRead: boolean;
  scheduledTime?: string;
  date?: string;
}

export interface SmartSuggestion {
  id: string;
  type: 'buffer' | 'breakdown' | 'rebalance' | 'energy_alignment' | 'daily_focus';
  title: string;
  reasoning: string;
  actionLabel: string;
  targetTaskId?: string;
  recommendedChanges?: {
    subtasksToAdd?: string[];
    newStartTime?: string;
    newEndTime?: string;
    newDate?: string;
    newPriority?: TaskPriority;
    newStatus?: TaskStatus;
  };
  applied?: boolean;
}

export interface WorkflowMetrics {
  totalTasks: number;
  completedToday: number;
  pendingToday: number;
  criticalPending: number;
  highPriorityPending: number;
  totalFocusHours: number;
  completionRate: number; // percentage 0-100
  deepWorkRatio: number; // percentage 0-100
  conflictsCount: number;
}
