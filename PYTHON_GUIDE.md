# FlowPulse — Python Architecture & Developer Guide

Welcome! If you are comfortable in **Python**, this guide explains how FlowPulse is structured, how the Python backend and algorithms operate, and how you can run and extend everything using pure Python.

---

## 1. Web Architecture: Frontend vs. Backend

In full-stack web applications:
- **The Interactive Web Interface** (Calendar grid, drag-and-drop, audio notifications, responsive layout) must run inside the user's **web browser**. Web browsers natively execute JavaScript/HTML/CSS (bundled here via React/Vite).
- **The Core Business Logic & Backend** (Task scheduling algorithms, conflict detection, urgency scoring, AI workflow suggestions, and REST APIs) can be written and executed in **Python**.

FlowPulse provides a **complete, first-class Python implementation** of the entire business logic, algorithms, test suite, REST API server, and an interactive terminal CLI.

---

## 2. Python Package Structure (`python_backend/`)

```text
python_backend/
├── __init__.py               # Python package marker
├── models.py                 # Dataclasses & Enums (Task, ScheduleConflict, WorkflowMetrics)
├── task_logic.py             # Pure Python scheduling algorithms & conflict detection
├── test_task_logic.py        # Python unittest test suite (runs in milliseconds)
├── app.py                    # Python HTTP REST API server
└── cli.py                    # Interactive Command-Line Interface tool
```

---

## 3. How to Run the Python Tools

### A. Run the Interactive Python CLI
Run the interactive terminal CLI to inspect today's tasks, calculate schedule conflicts, evaluate urgency scores, and generate smart workflow suggestions:

```bash
python3 python_backend/cli.py
```

**Sample Output:**
```text
============================================================
  FlowPulse Python CLI - Workflow & Task Engine
  Current Date: 2026-10-16
============================================================

[1] Today's Workflow Pulse:
    - Total Tasks: 4
    - Active Pending: 4 (1 critical)
    - Planned Focus Hours: 4.5 hrs
    - Deep Work Ratio: 33%
    - Completion Rate: 0%

[2] Scheduled Tasks (with calculated urgency scores):
    * [CRITICAL] Deep Architecture & Data Schema Review
      Time: 09:00 - 10:30 | Category: deep_work | Urgency Score: 95/100
    * [HIGH] Q4 Product Roadmap Sync with Stakeholders
      Time: 11:00 - 12:00 | Category: client | Urgency Score: 70/100
    * [MEDIUM] Customer Feedback & Bug Triage
      Time: 13:30 - 14:30 | Category: operations | Urgency Score: 45/100
    * [HIGH] Sprint Retrospective & Team Sync
      Time: 14:00 - 15:00 | Category: operations | Urgency Score: 60/100

[3] Schedule Conflict Detection:
    ! OVERLAP: 'Customer Feedback & Bug Triage' and 'Sprint Retrospective & Team Sync'
      Collision Time: 14:00 - 14:30 (30 min overlap)

[4] Smart Workflow Advisor Recommendations:
    > Resolve Calendar Overlap (30 min conflict) [BUFFER]
      Reason: 'Customer Feedback & Bug Triage' and 'Sprint Retrospective & Team Sync' overlap at 14:00 - 14:30.
      Action: Shift Task by 30m
    > Deconstruct Block: 'Deep Architecture & Data Schema Review' (90m) [BREAKDOWN]
      Reason: Tasks over 90 minutes have a 45% higher procrastination rate without milestones.
      Action: Add 3 Action Checkpoints
============================================================
```

---

### B. Run the Python Unit Tests
Verify all pure algorithms (time conversions, conflict detection, urgency metrics, and heuristic advice):

```bash
python3 -m unittest python_backend/test_task_logic.py
```

Output:
```text
......
----------------------------------------------------------------------
Ran 6 tests in 0.010s

OK
```

---

### C. Run the Python HTTP REST API Server
Start the standalone Python HTTP server:

```bash
python3 python_backend/app.py 8000
```

The server exposes standard REST endpoints:
- `POST /api/smart-suggestions`: Analyzes JSON task arrays and returns actionable workflow recommendations.
- `POST /api/task-breakdown`: Decomposes large tasks into concrete subtasks with estimated time budgets.
- `POST /api/daily-briefing`: Returns an executive workload summary.

You can test it via `curl` in another terminal:
```bash
curl -X POST http://localhost:8000/api/task-breakdown \
  -H "Content-Type: application/json" \
  -d '{"title": "Implement Database Migration", "estimatedMinutes": 90}'
```

---

## 4. Mapping TypeScript to Python

| Feature | TypeScript File | Python File |
| :--- | :--- | :--- |
| **Data Models** | `src/types.ts` | `python_backend/models.py` |
| **Algorithms & Conflict Logic** | `src/utils/taskLogic.ts` | `python_backend/task_logic.py` |
| **Unit Tests** | `src/utils/taskLogic.test.ts` | `python_backend/test_task_logic.py` |
| **API Endpoints** | `server.ts` | `python_backend/app.py` |
| **CLI Runner** | N/A | `python_backend/cli.py` |

---

## 5. Integrating with Google GenAI in Python

If you want to use the official Google GenAI Python SDK in your Python scripts:

```bash
pip install google-genai
```

```python
import os
from google import genai

client = genai.Client(api_key=os.environ.get("GEMINI_API_KEY"))

response = client.models.generate_content(
    model="gemini-3.8-flash",
    contents="Analyze my schedule and suggest how to optimize deep work blocks."
)

print(response.text)
```
