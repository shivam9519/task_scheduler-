"""
FlowPulse - Task & Scheduling Logic (Python 3)
Pure algorithms for time conversions, conflict detection, urgency scoring,
workflow statistics, and heuristic suggestions.
"""

from typing import List, Optional, Dict, Any
from datetime import datetime, date, timedelta
from python_backend.models import (
    Task, 
    ScheduleConflict, 
    WorkflowMetrics, 
    SmartSuggestion, 
    TaskPriority,
    TaskStatus,
    TaskCategory
)


def parse_time_minutes(time_str: Optional[str]) -> int:
    """Converts a 'HH:mm' 24-hour string to minutes from midnight."""
    if not time_str or ":" not in time_str:
        return -1
    try:
        parts = time_str.split(":")
        hours, minutes = int(parts[0]), int(parts[1])
        if 0 <= hours < 24 and 0 <= minutes < 60:
            return hours * 60 + minutes
        return -1
    except (ValueError, IndexError):
        return -1


def format_minutes_to_time(minutes: int) -> str:
    """Converts minutes from midnight back to 'HH:mm' string."""
    normalized = max(0, min(1439, int(round(minutes))))
    hrs = normalized // 60
    mins = normalized % 60
    return f"{hrs:02d}:{mins:02d}"


def detect_schedule_conflicts(tasks: List[Task], target_date: Optional[str] = None) -> List[ScheduleConflict]:
    """Detects overlapping time windows between scheduled active tasks."""
    conflicts: List[ScheduleConflict] = []
    
    active_tasks = [
        t for t in tasks
        if t.status != TaskStatus.DONE
        and t.startTime
        and t.endTime
        and (target_date is None or t.date == target_date)
    ]

    # Group by date
    by_date: Dict[str, List[Task]] = {}
    for t in active_tasks:
        by_date.setdefault(t.date, []).append(t)

    for d, date_tasks in by_date.items():
        n = len(date_tasks)
        for i in range(n):
            for j in range(i + 1, n):
                t1 = date_tasks[i]
                t2 = date_tasks[j]

                start1 = parse_time_minutes(t1.startTime)
                end1 = parse_time_minutes(t1.endTime)
                start2 = parse_time_minutes(t2.startTime)
                end2 = parse_time_minutes(t2.endTime)

                if start1 >= 0 and end1 > start1 and start2 >= 0 and end2 > start2:
                    overlap_start = max(start1, start2)
                    overlap_end = min(end1, end2)

                    if overlap_end > overlap_start:
                        conflicts.append(ScheduleConflict(
                            task1Id=t1.id,
                            task2Id=t2.id,
                            task1Title=t1.title,
                            task2Title=t2.title,
                            overlapMinutes=overlap_end - overlap_start,
                            timeRange=f"{format_minutes_to_time(overlap_start)} - {format_minutes_to_time(overlap_end)}"
                        ))

    return conflicts


def calculate_task_urgency(task: Task, ref_date_str: str, ref_time_str: str = "09:00") -> int:
    """Calculates a numerical urgency score for a task."""
    if task.status == TaskStatus.DONE:
        return 0

    score = 0
    # Base priority weight
    priority_weights = {
        TaskPriority.CRITICAL: 50,
        TaskPriority.HIGH: 35,
        TaskPriority.MEDIUM: 20,
        TaskPriority.LOW: 10,
    }
    score += priority_weights.get(task.priority, 20)

    # Date proximity
    if task.date < ref_date_str:
        score += 40  # Overdue
    elif task.date == ref_date_str:
        score += 25  # Due today

        if task.startTime:
            ref_mins = parse_time_minutes(ref_time_str)
            task_start_mins = parse_time_minutes(task.startTime)
            if ref_mins >= 0 and task_start_mins >= 0:
                diff = task_start_mins - ref_mins
                if diff < 0:
                    score += 15
                elif diff <= 60:
                    score += 20
                elif diff <= 180:
                    score += 10

    if task.isPinned:
        score += 10

    return score


def calculate_workflow_stats(tasks: List[Task], today_str: str) -> WorkflowMetrics:
    """Aggregates focus hours, completion percentage, and deep work ratios."""
    today_tasks = [t for t in tasks if t.date == today_str]
    completed_today = len([t for t in today_tasks if t.status == TaskStatus.DONE])
    pending_today = len([t for t in today_tasks if t.status != TaskStatus.DONE])
    critical_pending = len([t for t in today_tasks if t.status != TaskStatus.DONE and t.priority == TaskPriority.CRITICAL])
    high_pending = len([t for t in today_tasks if t.status != TaskStatus.DONE and t.priority == TaskPriority.HIGH])

    total_focus_minutes = sum(t.estimatedMinutes for t in today_tasks)
    deep_work_minutes = sum(t.estimatedMinutes for t in today_tasks if t.category == TaskCategory.DEEP_WORK)

    completion_rate = int(round((completed_today / len(today_tasks)) * 100)) if today_tasks else 0
    deep_work_ratio = int(round((deep_work_minutes / total_focus_minutes) * 100)) if total_focus_minutes > 0 else 0

    conflicts = detect_schedule_conflicts(today_tasks, today_str)

    return WorkflowMetrics(
        totalTasks=len(tasks),
        completedToday=completed_today,
        pendingToday=pending_today,
        criticalPending=critical_pending,
        highPriorityPending=high_pending,
        totalFocusHours=round(total_focus_minutes / 60.0, 1),
        completionRate=completion_rate,
        deepWorkRatio=deep_work_ratio,
        conflictsCount=len(conflicts),
    )


def generate_heuristic_suggestions(tasks: List[Task], today_str: str) -> List[SmartSuggestion]:
    """Generates rule-based optimization suggestions from task patterns."""
    suggestions: List[SmartSuggestion] = []
    today_tasks = [t for t in tasks if t.date == today_str and t.status != TaskStatus.DONE]

    # 1. Schedule Conflict Detection
    conflicts = detect_schedule_conflicts(today_tasks, today_str)
    if conflicts:
        first = conflicts[0]
        t2 = next((t for t in today_tasks if t.id == first.task2Id), None)
        if t2 and t2.startTime and t2.endTime:
            curr_end = parse_time_minutes(t2.endTime)
            duration = curr_end - parse_time_minutes(t2.startTime)
            new_start = curr_end + 15
            suggestions.append(SmartSuggestion(
                id=f"conflict-{first.task1Id}-{first.task2Id}",
                type="buffer",
                title=f"Resolve Calendar Overlap ({first.overlapMinutes} min conflict)",
                reasoning=f"'{first.task1Title}' and '{first.task2Title}' overlap at {first.timeRange}. Shift '{first.task2Title}' by 30 minutes to eliminate double-booking.",
                actionLabel="Shift Task by 30m",
                targetTaskId=t2.id,
                recommendedChanges={
                    "newStartTime": format_minutes_to_time(new_start),
                    "newEndTime": format_minutes_to_time(new_start + max(30, duration)),
                }
            ))

    # 2. Late Afternoon Deep Work Alignment
    late_deep_work = next((
        t for t in today_tasks 
        if t.category == TaskCategory.DEEP_WORK and t.startTime and parse_time_minutes(t.startTime) >= 16 * 60
    ), None)

    if late_deep_work:
        suggestions.append(SmartSuggestion(
            id=f"energy-{late_deep_work.id}",
            type="energy_alignment",
            title=f"Peak Energy Alignment: '{late_deep_work.title}'",
            reasoning=f"Deep Work scheduled at {late_deep_work.startTime} clashes with natural afternoon energy dips. High-focus cognition is 34% more effective before 12:00 PM.",
            actionLabel="Reschedule to Morning 10:00 AM",
            targetTaskId=late_deep_work.id,
            recommendedChanges={
                "newStartTime": "10:00",
                "newEndTime": format_minutes_to_time(10 * 60 + late_deep_work.estimatedMinutes),
            }
        ))

    # 3. Monolithic Unbroken Tasks (> 90m)
    large_task = next((t for t in today_tasks if t.estimatedMinutes >= 90 and not t.subtasks), None)
    if large_task:
        suggestions.append(SmartSuggestion(
            id=f"breakdown-{large_task.id}",
            type="breakdown",
            title=f"Deconstruct Block: '{large_task.title}' ({large_task.estimatedMinutes}m)",
            reasoning="Tasks over 90 minutes have a 45% higher procrastination rate without milestones. Adding clear checkpoints reduces cognitive overwhelm.",
            actionLabel="Add 3 Action Checkpoints",
            targetTaskId=large_task.id,
            recommendedChanges={
                "subtasksToAdd": [
                    "Review requirements & define target outcome (15m)",
                    "Execute core drafting or implementation (50m)",
                    "Review against rubric & document findings (25m)",
                ]
            }
        ))

    return suggestions
