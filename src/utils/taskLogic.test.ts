import test from 'node:test';
import assert from 'node:assert/strict';
import {
  parseTimeMinutes,
  formatMinutesToTime,
  detectScheduleConflicts,
  calculateTaskUrgency,
  calculateWorkflowStats,
  generateHeuristicSuggestions,
  getCalendarDaysForMonth,
  getWeekDays,
} from './taskLogic.ts';
import type { Task } from '../types.ts';

test('parseTimeMinutes correctly parses valid 24h times', () => {
  assert.equal(parseTimeMinutes('00:00'), 0);
  assert.equal(parseTimeMinutes('09:30'), 570);
  assert.equal(parseTimeMinutes('14:45'), 885);
  assert.equal(parseTimeMinutes('23:59'), 1439);
  assert.equal(parseTimeMinutes(''), -1);
  assert.equal(parseTimeMinutes('invalid'), -1);
});

test('formatMinutesToTime formats minutes to HH:mm string', () => {
  assert.equal(formatMinutesToTime(0), '00:00');
  assert.equal(formatMinutesToTime(570), '09:30');
  assert.equal(formatMinutesToTime(885), '14:45');
  assert.equal(formatMinutesToTime(1439), '23:59');
  assert.equal(formatMinutesToTime(-10), '00:00');
  assert.equal(formatMinutesToTime(2000), '23:59');
});

test('detectScheduleConflicts finds overlapping tasks on the same day', () => {
  const tasks: Task[] = [
    {
      id: 'task-1',
      title: 'Design Review',
      priority: 'high',
      status: 'todo',
      category: 'deep_work',
      energy: 'high_focus',
      date: '2026-10-16',
      startTime: '10:00',
      endTime: '11:30',
      estimatedMinutes: 90,
      subtasks: [],
      tags: ['design'],
      createdAt: '2026-10-15T10:00:00Z',
    },
    {
      id: 'task-2',
      title: 'Client Sync',
      priority: 'critical',
      status: 'todo',
      category: 'client',
      energy: 'moderate',
      date: '2026-10-16',
      startTime: '11:00',
      endTime: '12:00',
      estimatedMinutes: 60,
      subtasks: [],
      tags: ['client'],
      createdAt: '2026-10-15T10:00:00Z',
    },
    {
      id: 'task-3',
      title: 'Admin Emails',
      priority: 'low',
      status: 'todo',
      category: 'operations',
      energy: 'low_energy',
      date: '2026-10-16',
      startTime: '14:00',
      endTime: '14:30',
      estimatedMinutes: 30,
      subtasks: [],
      tags: ['email'],
      createdAt: '2026-10-15T10:00:00Z',
    },
  ];

  const conflicts = detectScheduleConflicts(tasks, '2026-10-16');
  assert.equal(conflicts.length, 1);
  assert.equal(conflicts[0].task1Id, 'task-1');
  assert.equal(conflicts[0].task2Id, 'task-2');
  assert.equal(conflicts[0].overlapMinutes, 30);
  assert.equal(conflicts[0].timeRange, '11:00 - 11:30');
});

test('calculateTaskUrgency prioritizes critical tasks and approaching times', () => {
  const criticalTask: Task = {
    id: 'crit-1',
    title: 'Server Hotfix',
    priority: 'critical',
    status: 'todo',
    category: 'operations',
    energy: 'high_focus',
    date: '2026-10-16',
    startTime: '09:30',
    endTime: '10:00',
    estimatedMinutes: 30,
    subtasks: [],
    tags: [],
    createdAt: '2026-10-15T10:00:00Z',
  };

  const lowTask: Task = {
    id: 'low-1',
    title: 'Archive Old Files',
    priority: 'low',
    status: 'todo',
    category: 'operations',
    energy: 'low_energy',
    date: '2026-10-17',
    estimatedMinutes: 20,
    subtasks: [],
    tags: [],
    createdAt: '2026-10-15T10:00:00Z',
  };

  const urgencyCritical = calculateTaskUrgency(criticalTask, '2026-10-16', '09:00');
  const urgencyLow = calculateTaskUrgency(lowTask, '2026-10-16', '09:00');

  assert.ok(urgencyCritical > urgencyLow, 'Critical upcoming task should have higher urgency');
  assert.ok(urgencyCritical >= 80, 'Critical task scheduled in 30 mins should score high');
});

test('calculateWorkflowStats accurately tallies completion and focus hours', () => {
  const tasks: Task[] = [
    {
      id: 't1',
      title: 'Coding Session',
      priority: 'high',
      status: 'done',
      category: 'deep_work',
      energy: 'high_focus',
      date: '2026-10-16',
      estimatedMinutes: 120,
      subtasks: [],
      tags: [],
      createdAt: '2026-10-15T10:00:00Z',
    },
    {
      id: 't2',
      title: 'Sprint Planning',
      priority: 'critical',
      status: 'in_progress',
      category: 'operations',
      energy: 'moderate',
      date: '2026-10-16',
      estimatedMinutes: 60,
      subtasks: [],
      tags: [],
      createdAt: '2026-10-15T10:00:00Z',
    },
  ];

  const stats = calculateWorkflowStats(tasks, '2026-10-16');
  assert.equal(stats.completedToday, 1);
  assert.equal(stats.pendingToday, 1);
  assert.equal(stats.criticalPending, 1);
  assert.equal(stats.totalFocusHours, 3.0);
  assert.equal(stats.completionRate, 50);
});

test('generateHeuristicSuggestions identifies breakdown and conflict opportunities', () => {
  const tasks: Task[] = [
    {
      id: 'huge-task',
      title: 'Build Architecture Blueprint',
      priority: 'high',
      status: 'todo',
      category: 'deep_work',
      energy: 'high_focus',
      date: '2026-10-16',
      estimatedMinutes: 120,
      subtasks: [],
      tags: [],
      createdAt: '2026-10-15T10:00:00Z',
    },
  ];

  const suggestions = generateHeuristicSuggestions(tasks, '2026-10-16');
  assert.ok(suggestions.some(s => s.type === 'breakdown'), 'Should suggest breaking down 120min task');
});

test('getCalendarDaysForMonth creates correct month grid structure', () => {
  const days = getCalendarDaysForMonth(2026, 9); // October 2026
  assert.ok(days.length >= 28 && days.length <= 42);
  assert.equal(days.length % 7, 0, 'Grid should always be multiples of 7 days');
  assert.ok(days.some(d => d.dateStr === '2026-10-15'));
});

test('getWeekDays produces 7 days with day names', () => {
  const days = getWeekDays(new Date('2026-10-16T12:00:00Z'));
  assert.equal(days.length, 7);
  assert.equal(days[0].dayName, 'Sun');
  assert.equal(days[6].dayName, 'Sat');
});
