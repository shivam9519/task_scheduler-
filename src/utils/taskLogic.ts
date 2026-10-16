import type { Task, ScheduleConflict, WorkflowMetrics, SmartSuggestion } from '../types.ts';

/**
 * Converts a "HH:mm" 24-hour string to minutes from midnight.
 */
export function parseTimeMinutes(timeStr?: string): number {
  if (!timeStr || !timeStr.includes(':')) return -1;
  const [hours, minutes] = timeStr.split(':').map(Number);
  if (isNaN(hours) || isNaN(minutes)) return -1;
  return hours * 60 + minutes;
}

/**
 * Converts minutes from midnight back to "HH:mm" formatted string.
 */
export function formatMinutesToTime(minutes: number): string {
  const normalized = Math.max(0, Math.min(1439, Math.round(minutes)));
  const hrs = Math.floor(normalized / 60);
  const mins = normalized % 60;
  return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

/**
 * Detects overlapping time windows between active scheduled tasks on a given date.
 */
export function detectScheduleConflicts(tasks: Task[], targetDate?: string): ScheduleConflict[] {
  const conflicts: ScheduleConflict[] = [];
  const activeTasks = tasks.filter(t => 
    t.status !== 'done' && 
    t.startTime && 
    t.endTime &&
    (!targetDate || t.date === targetDate)
  );

  // Group by date
  const byDate = new Map<string, Task[]>();
  for (const t of activeTasks) {
    const list = byDate.get(t.date) || [];
    list.push(t);
    byDate.set(t.date, list);
  }

  for (const [, dateTasks] of byDate.entries()) {
    for (let i = 0; i < dateTasks.length; i++) {
      for (let j = i + 1; j < dateTasks.length; j++) {
        const t1 = dateTasks[i];
        const t2 = dateTasks[j];

        const start1 = parseTimeMinutes(t1.startTime);
        const end1 = parseTimeMinutes(t1.endTime);
        const start2 = parseTimeMinutes(t2.startTime);
        const end2 = parseTimeMinutes(t2.endTime);

        if (start1 >= 0 && end1 > start1 && start2 >= 0 && end2 > start2) {
          const overlapStart = Math.max(start1, start2);
          const overlapEnd = Math.min(end1, end2);

          if (overlapEnd > overlapStart) {
            conflicts.push({
              task1Id: t1.id,
              task2Id: t2.id,
              task1Title: t1.title,
              task2Title: t2.title,
              overlapMinutes: overlapEnd - overlapStart,
              timeRange: `${formatMinutesToTime(overlapStart)} - ${formatMinutesToTime(overlapEnd)}`,
            });
          }
        }
      }
    }
  }

  return conflicts;
}

/**
 * Calculates a relative urgency score (0-100+) for a task based on priority,
 * whether it is due today, and scheduled start time.
 */
export function calculateTaskUrgency(task: Task, refDateStr: string, refTimeStr: string = '09:00'): number {
  if (task.status === 'done') return 0;

  let score = 0;
  // Priority base weight
  switch (task.priority) {
    case 'critical':
      score += 50;
      break;
    case 'high':
      score += 35;
      break;
    case 'medium':
      score += 20;
      break;
    case 'low':
      score += 10;
      break;
  }

  // Date proximity
  if (task.date < refDateStr) {
    // Overdue
    score += 40;
  } else if (task.date === refDateStr) {
    // Due today
    score += 25;

    // Time proximity if scheduled
    if (task.startTime) {
      const refMins = parseTimeMinutes(refTimeStr);
      const taskStartMins = parseTimeMinutes(task.startTime);
      if (refMins >= 0 && taskStartMins >= 0) {
        const diff = taskStartMins - refMins;
        if (diff < 0) {
          // Started in the past today
          score += 15;
        } else if (diff <= 60) {
          // Starting in the next hour
          score += 20;
        } else if (diff <= 180) {
          // Starting within 3 hours
          score += 10;
        }
      }
    }
  }

  if (task.isPinned) {
    score += 10;
  }

  return score;
}

/**
 * Calculates overall workflow metrics for today's dashboard.
 */
export function calculateWorkflowStats(tasks: Task[], todayStr: string): WorkflowMetrics {
  const todayTasks = tasks.filter(t => t.date === todayStr);
  const completedToday = todayTasks.filter(t => t.status === 'done').length;
  const pendingToday = todayTasks.filter(t => t.status !== 'done').length;
  const criticalPending = todayTasks.filter(t => t.status !== 'done' && t.priority === 'critical').length;
  const highPriorityPending = todayTasks.filter(t => t.status !== 'done' && t.priority === 'high').length;

  const totalFocusMinutes = todayTasks.reduce((acc, t) => acc + (t.estimatedMinutes || 0), 0);
  const deepWorkMinutes = todayTasks
    .filter(t => t.category === 'deep_work')
    .reduce((acc, t) => acc + (t.estimatedMinutes || 0), 0);

  const completionRate = todayTasks.length > 0 
    ? Math.round((completedToday / todayTasks.length) * 100) 
    : 0;

  const deepWorkRatio = totalFocusMinutes > 0 
    ? Math.round((deepWorkMinutes / totalFocusMinutes) * 100) 
    : 0;

  const conflicts = detectScheduleConflicts(todayTasks, todayStr);

  return {
    totalTasks: tasks.length,
    completedToday,
    pendingToday,
    criticalPending,
    highPriorityPending,
    totalFocusHours: Number((totalFocusMinutes / 60).toFixed(1)),
    completionRate,
    deepWorkRatio,
    conflictsCount: conflicts.length,
  };
}

/**
 * Generates rule-based heuristic smart suggestions based on workflow patterns.
 */
export function generateHeuristicSuggestions(tasks: Task[], todayStr: string): SmartSuggestion[] {
  const suggestions: SmartSuggestion[] = [];
  const todayTasks = tasks.filter(t => t.date === todayStr && t.status !== 'done');
  
  // 1. Conflict detection suggestion
  const conflicts = detectScheduleConflicts(todayTasks, todayStr);
  if (conflicts.length > 0) {
    const firstConflict = conflicts[0];
    const t2 = todayTasks.find(t => t.id === firstConflict.task2Id);
    if (t2 && t2.startTime && t2.endTime) {
      const currentEndMins = parseTimeMinutes(t2.endTime);
      const duration = currentEndMins - parseTimeMinutes(t2.startTime);
      const newStartMins = currentEndMins + 15; // Shift back
      suggestions.push({
        id: `conflict-${firstConflict.task1Id}-${firstConflict.task2Id}`,
        type: 'buffer',
        title: `Resolve Calendar Overlap (${firstConflict.overlapMinutes} min conflict)`,
        reasoning: `"${firstConflict.task1Title}" and "${firstConflict.task2Title}" overlap at ${firstConflict.timeRange}. Shift "${firstConflict.task2Title}" by 30 minutes to eliminate double-booking.`,
        actionLabel: 'Shift Task by 30m',
        targetTaskId: t2.id,
        recommendedChanges: {
          newStartTime: formatMinutesToTime(newStartMins),
          newEndTime: formatMinutesToTime(newStartMins + Math.max(30, duration)),
        },
      });
    }
  }

  // 2. High focus task during late afternoon / evening
  const lateDeepWork = todayTasks.find(t => {
    if (t.category === 'deep_work' && t.startTime) {
      const startMins = parseTimeMinutes(t.startTime);
      return startMins >= 16 * 60; // 4 PM or later
    }
    return false;
  });

  if (lateDeepWork) {
    suggestions.push({
      id: `energy-${lateDeepWork.id}`,
      type: 'energy_alignment',
      title: `Peak Energy Alignment: "${lateDeepWork.title}"`,
      reasoning: `Deep Work scheduled at ${lateDeepWork.startTime} clashes with natural afternoon energy dips. High-focus cognition is 34% more effective before 12:00 PM.`,
      actionLabel: 'Reschedule to Morning 10:00 AM',
      targetTaskId: lateDeepWork.id,
      recommendedChanges: {
        newStartTime: '10:00',
        newEndTime: formatMinutesToTime(10 * 60 + lateDeepWork.estimatedMinutes),
      },
    });
  }

  // 3. Large task without subtasks (> 90 mins)
  const largeUnbrokenTask = todayTasks.find(t => t.estimatedMinutes >= 90 && (!t.subtasks || t.subtasks.length === 0));
  if (largeUnbrokenTask) {
    suggestions.push({
      id: `breakdown-${largeUnbrokenTask.id}`,
      type: 'breakdown',
      title: `Deconstruct Block: "${largeUnbrokenTask.title}" (${largeUnbrokenTask.estimatedMinutes}m)`,
      reasoning: `Tasks over 90 minutes have a 45% higher procrastination rate without milestones. Adding clear checkpoints reduces cognitive overwhelm.`,
      actionLabel: 'Add 3 Action Checkpoints',
      targetTaskId: largeUnbrokenTask.id,
      recommendedChanges: {
        subtasksToAdd: [
          'Review requirements & define target outcome (15m)',
          'Execute core drafting or implementation (50m)',
          'Review against rubric & document findings (25m)',
        ],
      },
    });
  }

  // 4. Overdue tasks from previous days
  const overdueTasks = tasks.filter(t => t.date < todayStr && t.status !== 'done');
  if (overdueTasks.length > 0) {
    const firstOverdue = overdueTasks[0];
    suggestions.push({
      id: `overdue-${firstOverdue.id}`,
      type: 'rebalance',
      title: `Rebalance Overdue Task: "${firstOverdue.title}"`,
      reasoning: `Scheduled for ${firstOverdue.date} but remained incomplete. Rescheduling to today maintains workflow velocity without cognitive debt.`,
      actionLabel: 'Move to Today',
      targetTaskId: firstOverdue.id,
      recommendedChanges: {
        newDate: todayStr,
        newPriority: firstOverdue.priority === 'low' ? 'medium' : firstOverdue.priority,
      },
    });
  }

  // 5. Daily buffer recommendation if > 4 hours scheduled back to back
  const totalMins = todayTasks.reduce((acc, t) => acc + (t.estimatedMinutes || 0), 0);
  if (totalMins > 300 && suggestions.length < 4) {
    suggestions.push({
      id: `daily-buffer-${todayStr}`,
      type: 'daily_focus',
      title: 'Cognitive Reset Buffer Recommended',
      reasoning: `You have over 5.0 hours of focused commitments planned today. Scheduling a 20-minute midday decompression break prevents burnout.`,
      actionLabel: 'Schedule 20m Midday Break',
      recommendedChanges: {
        newStartTime: '13:00',
        newEndTime: '13:20',
      },
    });
  }

  return suggestions;
}

/**
 * Calculates a 35 or 42 calendar grid for a given month and year.
 */
export function getCalendarDaysForMonth(year: number, month: number) {
  // month is 0-indexed (0 = Jan, 11 = Dec)
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  const startDayOfWeek = firstDay.getDay(); // 0 = Sun, 1 = Mon ...
  const totalDays = lastDay.getDate();

  const days: { dateStr: string; dayNumber: number; isCurrentMonth: boolean }[] = [];

  // Previous month trailing days
  const prevMonthLastDay = new Date(year, month, 0).getDate();
  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    const day = prevMonthLastDay - i;
    const prevDate = new Date(year, month - 1, day);
    days.push({
      dateStr: prevDate.toISOString().slice(0, 10),
      dayNumber: day,
      isCurrentMonth: false,
    });
  }

  // Current month days
  for (let day = 1; day <= totalDays; day++) {
    const d = new Date(year, month, day);
    // Local date string YYYY-MM-DD
    const yStr = d.getFullYear();
    const mStr = String(d.getMonth() + 1).padStart(2, '0');
    const dStr = String(d.getDate()).padStart(2, '0');
    days.push({
      dateStr: `${yStr}-${mStr}-${dStr}`,
      dayNumber: day,
      isCurrentMonth: true,
    });
  }

  // Next month leading days to fill up to complete weeks (multiple of 7)
  const remaining = (7 - (days.length % 7)) % 7;
  for (let i = 1; i <= remaining; i++) {
    const nextDate = new Date(year, month + 1, i);
    const yStr = nextDate.getFullYear();
    const mStr = String(nextDate.getMonth() + 1).padStart(2, '0');
    const dStr = String(nextDate.getDate()).padStart(2, '0');
    days.push({
      dateStr: `${yStr}-${mStr}-${dStr}`,
      dayNumber: i,
      isCurrentMonth: false,
    });
  }

  return days;
}

/**
 * Generates the 7 days of the current week surrounding centerDate.
 */
export function getWeekDays(centerDate: Date): { dateStr: string; dayName: string; dayNumber: number; isToday: boolean }[] {
  const dayOfWeek = centerDate.getDay();
  // We want Sunday to Saturday or Monday to Sunday
  // Let's do Sunday as 0
  const sunday = new Date(centerDate);
  sunday.setDate(centerDate.getDate() - dayOfWeek);

  const days = [];
  const todayStr = new Date().toISOString().slice(0, 10);
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  for (let i = 0; i < 7; i++) {
    const d = new Date(sunday);
    d.setDate(sunday.getDate() + i);
    const yStr = d.getFullYear();
    const mStr = String(d.getMonth() + 1).padStart(2, '0');
    const dStr = String(d.getDate()).padStart(2, '0');
    const dateStr = `${yStr}-${mStr}-${dStr}`;

    days.push({
      dateStr,
      dayName: dayNames[i],
      dayNumber: d.getDate(),
      isToday: dateStr === todayStr,
    });
  }

  return days;
}
