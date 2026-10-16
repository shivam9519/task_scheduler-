"""
FlowPulse - Python HTTP API Server
Runs with standard Python: python3 python_backend/app.py [port]
Provides REST API endpoints for smart suggestions, task decomposition, and daily briefings.
"""

import sys
import os

# Ensure project root is in sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import json
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse
from typing import Dict, Any

from python_backend.models import Task
from python_backend.task_logic import (
    calculate_workflow_stats,
    generate_heuristic_suggestions,
    detect_schedule_conflicts,
    format_minutes_to_time
)


class FlowPulseAPIHandler(BaseHTTPRequestHandler):

    def _set_cors_headers(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization")

    def do_OPTIONS(self):
        self.send_response(204)
        self._set_cors_headers()
        self.end_headers()

    def _send_json(self, status_code: int, data: Dict[str, Any]):
        response_bytes = json.dumps(data).encode("utf-8")
        self.send_response(status_code)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(response_bytes)))
        self._set_cors_headers()
        self.end_headers()
        self.wfile.write(response_bytes)

    def do_POST(self):
        url = urlparse(self.path)
        content_length = int(self.headers.get("Content-Length", 0))
        post_data = self.rfile.read(content_length)

        try:
            body = json.loads(post_data.decode("utf-8")) if post_data else {}
        except Exception:
            self._send_json(400, {"error": "Invalid JSON body"})
            return

        # 1. Smart Suggestions Endpoint
        if url.path == "/api/smart-suggestions":
            tasks_data = body.get("tasks", [])
            today_str = body.get("todayStr", "2026-10-16")
            tasks = [Task.from_dict(t) for t in tasks_data]

            # Generate heuristic suggestions
            suggestions = generate_heuristic_suggestions(tasks, today_str)
            briefing = "Focus on high-leverage deep work tasks during the morning and maintain a 15-minute buffer between scheduled blocks."

            self._send_json(200, {
                "source": "python_heuristic_engine",
                "briefing": briefing,
                "suggestions": [s.to_dict() for s in suggestions]
            })
            return

        # 2. Task Breakdown Endpoint
        elif url.path == "/api/task-breakdown":
            title = body.get("title", "Untitled Task")
            est = body.get("estimatedMinutes", 60)
            subtasks = [
                f"Review requirements & clarify scope ({int(round(est * 0.2))}m)",
                f"Draft primary structure or prototype ({int(round(est * 0.5))}m)",
                f"Refine details, test, and document ({int(round(est * 0.3))}m)",
            ]
            self._send_json(200, {
                "source": "python_engine",
                "subtasks": subtasks
            })
            return

        # 3. Daily Briefing Endpoint
        elif url.path == "/api/daily-briefing":
            pending = body.get("pendingCount", 0)
            critical = body.get("criticalCount", 0)
            hours = body.get("totalHours", 0)
            briefing = (
                f"You have {pending} tasks remaining ({critical} critical) spanning {hours}h. "
                "Tackle critical tasks first during high-focus morning windows."
            )
            self._send_json(200, {
                "briefing": briefing
            })
            return

        else:
            self._send_json(404, {"error": "Endpoint not found"})


def run(port: int = 8000):
    server_address = ("0.0.0.0", port)
    httpd = HTTPServer(server_address, FlowPulseAPIHandler)
    print(f"FlowPulse Python Backend running on http://0.0.0.0:{port}")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nShutting down server.")
        httpd.server_close()


if __name__ == "__main__":
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8000
    run(port)
