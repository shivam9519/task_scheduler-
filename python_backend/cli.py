"""
FlowPulse - Python CLI (Command-Line Interface)
Run with: python3 python_backend/cli.py
Allows developers to interact with tasks, calculate conflicts, and run AI suggestions via the terminal.
"""

import sys
import os

# Ensure project root is in sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from datetime import datetime
from python_backend.models import Task, TaskPriority, TaskStatus, TaskCategory, EnergyLevel
from python_backend.task_logic import (
    calculate_workflow_stats,
    detect_schedule_conflicts,
    generate_heuristic_suggestions,
    calculate_task_urgency
)


def get_demo_tasks():
    today = datetime.now().strftime("%Y-%m-%d")
    return [
        Task(
            id="t-1",
            title="Deep Architecture & Data Schema Review",
            priority=TaskPriority.CRITICAL,
            status=TaskStatus.IN_PROGRESS,
            category=TaskCategory.DEEP_WORK,
            energy=EnergyLevel.HIGH_FOCUS,
            date=today,
            startTime="09:00",
            endTime="10:30",
            estimatedMinutes=90
        ),
        Task(
            id="t-2",
            title="Q4 Product Roadmap Sync with Stakeholders",
            priority=TaskPriority.HIGH,
            status=TaskStatus.TODO,
            category=TaskCategory.CLIENT,
            energy=EnergyLevel.MODERATE,
            date=today,
            startTime="11:00",
            endTime="12:00",
            estimatedMinutes=60
        ),
        Task(
            id="t-3",
            title="Customer Feedback & Bug Triage",
            priority=TaskPriority.MEDIUM,
            status=TaskStatus.TODO,
            category=TaskCategory.OPERATIONS,
            energy=EnergyLevel.MODERATE,
            date=today,
            startTime="13:30",
            endTime="14:30",
            estimatedMinutes=60
        ),
        Task(
            id="t-4",
            title="Sprint Retrospective & Team Sync",
            priority=TaskPriority.HIGH,
            status=TaskStatus.TODO,
            category=TaskCategory.OPERATIONS,
            energy=EnergyLevel.MODERATE,
            date=today,
            startTime="14:00",  # Deliberate conflict with t-3 for demo
            endTime="15:00",
            estimatedMinutes=60
        ),
    ]


def main():
    today = datetime.now().strftime("%Y-%m-%d")
    tasks = get_demo_tasks()

    print("=" * 60)
    print("  FlowPulse Python CLI - Workflow & Task Engine")
    print(f"  Current Date: {today}")
    print("=" * 60)

    # 1. Workflow Stats
    stats = calculate_workflow_stats(tasks, today)
    print("\n[1] Today's Workflow Pulse:")
    print(f"    - Total Tasks: {stats.totalTasks}")
    print(f"    - Active Pending: {stats.pendingToday} ({stats.criticalPending} critical)")
    print(f"    - Planned Focus Hours: {stats.totalFocusHours} hrs")
    print(f"    - Deep Work Ratio: {stats.deepWorkRatio}%")
    print(f"    - Completion Rate: {stats.completionRate}%")

    # 2. Tasks & Urgency Scores
    print("\n[2] Scheduled Tasks (with calculated urgency scores):")
    for t in tasks:
        urgency = calculate_task_urgency(t, today)
        time_slot = f"{t.startTime} - {t.endTime}" if t.startTime else "Flexible"
        print(f"    * [{t.priority.value.upper()}] {t.title}")
        print(f"      Time: {time_slot} | Category: {t.category.value} | Urgency Score: {urgency}/100")

    # 3. Schedule Conflicts
    conflicts = detect_schedule_conflicts(tasks, today)
    print("\n[3] Schedule Conflict Detection:")
    if conflicts:
        for c in conflicts:
            print(f"    ! OVERLAP: '{c.task1Title}' and '{c.task2Title}'")
            print(f"      Collision Time: {c.timeRange} ({c.overlapMinutes} min overlap)")
    else:
        print("    ✔ No calendar schedule conflicts detected.")

    # 4. Smart Suggestions
    suggestions = generate_heuristic_suggestions(tasks, today)
    print("\n[4] Smart Workflow Advisor Recommendations:")
    for s in suggestions:
        print(f"    > {s.title} [{s.type.upper()}]")
        print(f"      Reason: {s.reasoning}")
        print(f"      Action: {s.actionLabel}")

    print("\n" + "=" * 60)
    print("  End of report. Run `python3 -m unittest python_backend/test_task_logic.py` for unit tests.")
    print("=" * 60)


if __name__ == "__main__":
    main()
