"""
Unit Tests for Python Task Logic & Scheduling Algorithms.
Runs with standard Python: python3 -m unittest python_backend/test_task_logic.py
"""

import unittest
from python_backend.models import (
    Task, 
    TaskPriority, 
    TaskStatus, 
    TaskCategory, 
    EnergyLevel
)
from python_backend.task_logic import (
    parse_time_minutes,
    format_minutes_to_time,
    detect_schedule_conflicts,
    calculate_task_urgency,
    calculate_workflow_stats,
    generate_heuristic_suggestions
)


class TestTaskLogicPython(unittest.TestCase):

    def test_parse_time_minutes(self):
        self.assertEqual(parse_time_minutes("00:00"), 0)
        self.assertEqual(parse_time_minutes("09:30"), 570)
        self.assertEqual(parse_time_minutes("14:45"), 885)
        self.assertEqual(parse_time_minutes("23:59"), 1439)
        self.assertEqual(parse_time_minutes(""), -1)
        self.assertEqual(parse_time_minutes("invalid"), -1)

    def test_format_minutes_to_time(self):
        self.assertEqual(format_minutes_to_time(0), "00:00")
        self.assertEqual(format_minutes_to_time(570), "09:30")
        self.assertEqual(format_minutes_to_time(885), "14:45")
        self.assertEqual(format_minutes_to_time(1439), "23:59")
        self.assertEqual(format_minutes_to_time(-10), "00:00")
        self.assertEqual(format_minutes_to_time(2000), "23:59")

    def test_detect_schedule_conflicts(self):
        tasks = [
            Task(
                id="task-1",
                title="Design Review",
                priority=TaskPriority.HIGH,
                status=TaskStatus.TODO,
                category=TaskCategory.DEEP_WORK,
                energy=EnergyLevel.HIGH_FOCUS,
                date="2026-10-16",
                startTime="10:00",
                endTime="11:30",
                estimatedMinutes=90
            ),
            Task(
                id="task-2",
                title="Client Sync",
                priority=TaskPriority.CRITICAL,
                status=TaskStatus.TODO,
                category=TaskCategory.CLIENT,
                energy=EnergyLevel.MODERATE,
                date="2026-10-16",
                startTime="11:00",
                endTime="12:00",
                estimatedMinutes=60
            ),
            Task(
                id="task-3",
                title="Admin Emails",
                priority=TaskPriority.LOW,
                status=TaskStatus.TODO,
                category=TaskCategory.OPERATIONS,
                energy=EnergyLevel.LOW_ENERGY,
                date="2026-10-16",
                startTime="14:00",
                endTime="14:30",
                estimatedMinutes=30
            ),
        ]

        conflicts = detect_schedule_conflicts(tasks, "2026-10-16")
        self.assertEqual(len(conflicts), 1)
        self.assertEqual(conflicts[0].task1Id, "task-1")
        self.assertEqual(conflicts[0].task2Id, "task-2")
        self.assertEqual(conflicts[0].overlapMinutes, 30)
        self.assertEqual(conflicts[0].timeRange, "11:00 - 11:30")

    def test_calculate_task_urgency(self):
        critical_task = Task(
            id="crit-1",
            title="Server Hotfix",
            priority=TaskPriority.CRITICAL,
            status=TaskStatus.TODO,
            date="2026-10-16",
            startTime="09:30",
            endTime="10:00",
            estimatedMinutes=30
        )
        low_task = Task(
            id="low-1",
            title="Archive Old Files",
            priority=TaskPriority.LOW,
            status=TaskStatus.TODO,
            date="2026-10-17",
            estimatedMinutes=20
        )

        urgency_critical = calculate_task_urgency(critical_task, "2026-10-16", "09:00")
        urgency_low = calculate_task_urgency(low_task, "2026-10-16", "09:00")

        self.assertGreater(urgency_critical, urgency_low)
        self.assertGreaterEqual(urgency_critical, 80)

    def test_calculate_workflow_stats(self):
        tasks = [
            Task(
                id="t1",
                title="Coding Session",
                priority=TaskPriority.HIGH,
                status=TaskStatus.DONE,
                category=TaskCategory.DEEP_WORK,
                date="2026-10-16",
                estimatedMinutes=120
            ),
            Task(
                id="t2",
                title="Sprint Planning",
                priority=TaskPriority.CRITICAL,
                status=TaskStatus.IN_PROGRESS,
                category=TaskCategory.OPERATIONS,
                date="2026-10-16",
                estimatedMinutes=60
            ),
        ]

        stats = calculate_workflow_stats(tasks, "2026-10-16")
        self.assertEqual(stats.completedToday, 1)
        self.assertEqual(stats.pendingToday, 1)
        self.assertEqual(stats.criticalPending, 1)
        self.assertEqual(stats.totalFocusHours, 3.0)
        self.assertEqual(stats.completionRate, 50)

    def test_generate_heuristic_suggestions(self):
        tasks = [
            Task(
                id="huge-task",
                title="Build Architecture Blueprint",
                priority=TaskPriority.HIGH,
                status=TaskStatus.TODO,
                category=TaskCategory.DEEP_WORK,
                date="2026-10-16",
                estimatedMinutes=120,
                subtasks=[]
            )
        ]

        suggestions = generate_heuristic_suggestions(tasks, "2026-10-16")
        self.assertTrue(any(s.type == "breakdown" for s in suggestions))


if __name__ == "__main__":
    unittest.main()
