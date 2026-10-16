"""
FlowPulse - Data Models (Python 3)
Type annotations and dataclasses representing tasks, schedules, conflicts, and metrics.
"""

from dataclasses import dataclass, field
from enum import Enum
from typing import List, Optional, Dict, Any
from datetime import datetime


class TaskPriority(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class TaskStatus(str, Enum):
    TODO = "todo"
    IN_PROGRESS = "in_progress"
    BLOCKED = "blocked"
    DONE = "done"


class TaskCategory(str, Enum):
    DEEP_WORK = "deep_work"
    CLIENT = "client"
    OPERATIONS = "operations"
    LEARNING = "learning"
    HEALTH = "health"


class EnergyLevel(str, Enum):
    HIGH_FOCUS = "high_focus"
    MODERATE = "moderate"
    LOW_ENERGY = "low_energy"


@dataclass
class SubTask:
    id: str
    title: str
    completed: bool = False

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "title": self.title,
            "completed": self.completed,
        }


@dataclass
class Task:
    id: str
    title: str
    priority: TaskPriority = TaskPriority.MEDIUM
    status: TaskStatus = TaskStatus.TODO
    category: TaskCategory = TaskCategory.DEEP_WORK
    energy: EnergyLevel = EnergyLevel.HIGH_FOCUS
    date: str = field(default_factory=lambda: datetime.now().strftime("%Y-%m-%d"))
    description: Optional[str] = None
    startTime: Optional[str] = None  # HH:mm
    endTime: Optional[str] = None    # HH:mm
    estimatedMinutes: int = 60
    actualMinutes: Optional[int] = None
    subtasks: List[SubTask] = field(default_factory=list)
    tags: List[str] = field(default_factory=list)
    isPinned: bool = False
    reminderMinutesBefore: int = 15
    createdAt: str = field(default_factory=lambda: datetime.now().isoformat())
    completedAt: Optional[str] = None

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "title": self.title,
            "description": self.description,
            "priority": self.priority.value if isinstance(self.priority, Enum) else self.priority,
            "status": self.status.value if isinstance(self.status, Enum) else self.status,
            "category": self.category.value if isinstance(self.category, Enum) else self.category,
            "energy": self.energy.value if isinstance(self.energy, Enum) else self.energy,
            "date": self.date,
            "startTime": self.startTime,
            "endTime": self.endTime,
            "estimatedMinutes": self.estimatedMinutes,
            "actualMinutes": self.actualMinutes,
            "subtasks": [s.to_dict() if hasattr(s, "to_dict") else s for s in self.subtasks],
            "tags": self.tags,
            "isPinned": self.isPinned,
            "reminderMinutesBefore": self.reminderMinutesBefore,
            "createdAt": self.createdAt,
            "completedAt": self.completedAt,
        }

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "Task":
        subtasks_data = data.get("subtasks", [])
        subtasks = [
            SubTask(**s) if isinstance(s, dict) else s for s in subtasks_data
        ]
        return cls(
            id=data.get("id", ""),
            title=data.get("title", "Untitled Task"),
            description=data.get("description"),
            priority=TaskPriority(data.get("priority", "medium")),
            status=TaskStatus(data.get("status", "todo")),
            category=TaskCategory(data.get("category", "deep_work")),
            energy=EnergyLevel(data.get("energy", "high_focus")),
            date=data.get("date", datetime.now().strftime("%Y-%m-%d")),
            startTime=data.get("startTime"),
            endTime=data.get("endTime"),
            estimatedMinutes=data.get("estimatedMinutes", 60),
            actualMinutes=data.get("actualMinutes"),
            subtasks=subtasks,
            tags=data.get("tags", []),
            isPinned=data.get("isPinned", False),
            reminderMinutesBefore=data.get("reminderMinutesBefore", 15),
            createdAt=data.get("createdAt", datetime.now().isoformat()),
            completedAt=data.get("completedAt"),
        )


@dataclass
class ScheduleConflict:
    task1Id: str
    task2Id: str
    task1Title: str
    task2Title: str
    overlapMinutes: int
    timeRange: str

    def to_dict(self) -> Dict[str, Any]:
        return {
            "task1Id": self.task1Id,
            "task2Id": self.task2Id,
            "task1Title": self.task1Title,
            "task2Title": self.task2Title,
            "overlapMinutes": self.overlapMinutes,
            "timeRange": self.timeRange,
        }


@dataclass
class SmartSuggestion:
    id: str
    type: str  # "buffer" | "breakdown" | "rebalance" | "energy_alignment" | "daily_focus"
    title: str
    reasoning: str
    actionLabel: str
    targetTaskId: Optional[str] = None
    recommendedChanges: Optional[Dict[str, Any]] = None
    applied: bool = False

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "type": self.type,
            "title": self.title,
            "reasoning": self.reasoning,
            "actionLabel": self.actionLabel,
            "targetTaskId": self.targetTaskId,
            "recommendedChanges": self.recommendedChanges,
            "applied": self.applied,
        }


@dataclass
class WorkflowMetrics:
    totalTasks: int
    completedToday: int
    pendingToday: int
    criticalPending: int
    highPriorityPending: int
    totalFocusHours: float
    completionRate: int
    deepWorkRatio: int
    conflictsCount: int

    def to_dict(self) -> Dict[str, Any]:
        return {
            "totalTasks": self.totalTasks,
            "completedToday": self.completedToday,
            "pendingToday": self.pendingToday,
            "criticalPending": self.criticalPending,
            "highPriorityPending": self.highPriorityPending,
            "totalFocusHours": self.totalFocusHours,
            "completionRate": self.completionRate,
            "deepWorkRatio": self.deepWorkRatio,
            "conflictsCount": self.conflictsCount,
        }
