# FlowPulse — Intelligent Task & Calendar Planner

> A unified daily workflow system integrating task management, interactive calendar time-blocking, priority notifications, and AI-powered workflow optimizations.

---

## 📌 Why This Project Was Built

Modern knowledge workers and engineers frequently juggle separate applications for their to-do lists, calendar schedules, and communication reminders. This fragmented workflow introduces critical productivity pain points:

1. **Disconnected Lists & Schedules**: Tasks written in a traditional list lack time context, leading to over-commitment and double-booking.
2. **Cognitive Fatigue & Lack of Energy Alignment**: High-focus, mentally demanding tasks ("Deep Work") often get pushed to late afternoons when cognitive energy is depleted, while trivial tasks consume peak morning hours.
3. **Double-Booking & Schedule Collisions**: Calendars and task managers rarely communicate overlapping time slots or missing transition buffers between back-to-back blocks.
4. **Vague, Overwhelming Tasks**: Large, monolithic tasks (>90 minutes) trigger procrastination because they lack clear, actionable milestones.

**FlowPulse was built to solve these challenges in a single, cohesive workspace.** It combines daily task organization, an interactive timeline calendar, real-time schedule conflict detection, priority alerts with audio cues, and an AI-driven **Smart Workflow Advisor** that analyzes your daily load to recommend realistic rebalancing, buffer protection, and milestone breakdowns.

---

## 🛠️ Tech Stack

### Frontend
- **React 19**: Modern component architecture using hooks, functional design, and reactive state management.
- **TypeScript**: End-to-end type safety for tasks, calendar events, notifications, and workflow metrics.
- **Tailwind CSS v4**: Utility-first styling following strict design guidelines (60-30-10 color discipline, unboxed metadata, accessible focus rings).
- **Lucide React**: Clean, consistent icon set for navigation and interactive affordances.
- **Web Audio API**: Pure in-browser synthesized chimes for priority notifications and completions (zero external audio file dependencies).

### Backend
- **Node.js & Express**: Lightweight backend server serving API endpoints and mounting Vite development middleware.
- **tsx**: Direct TypeScript execution for the full-stack server runtime.

### AI & Intelligence
- **Google GenAI SDK (`@google/genai`)**: Integrated with `gemini-3.8-flash` to power:
  - **Smart Suggestions**: Analyzes schedule density and suggests buffer protection and slot optimization.
  - **Executive Daily Briefings**: Formulates morning productivity summaries and strategy advice.
  - **Task Decomposition**: Automatically decomposes complex tasks into 3–5 time-estimated subtasks.
  - **Resilient Fallback Engine**: If an API key is not supplied, the built-in deterministic heuristic engine seamlessly provides optimization suggestions without interrupting user workflows.

### Testing & Quality
- **Node.js Native Test Runner (`node:test` & `node:assert/strict`)**: Fast unit tests for schedule conflict detection, task urgency scoring, metrics aggregation, and calendar grid math.

---

## 🚀 Getting Started (Step-by-Step)

Follow these steps to clone, configure, and run the project locally.

### Prerequisites
- **Node.js**: Version 20.x or 22.x or higher
- **npm**: Version 9.x or higher (comes bundled with Node.js)
- **Git** installed on your machine

---

### Step 1: Clone the Repository

Clone this repository from GitHub and navigate into the project directory:

```bash
git clone https://github.com/your-username/flowpulse.git
cd flowpulse
```

---

### Step 2: Install Dependencies

Install all required npm packages:

```bash
npm install
```

---

### Step 3: Configure Environment Variables

Create a local `.env` file by copying the provided `.env.example`:

```bash
cp .env.example .env
```

Open `.env` in your text editor:

```env
# Optional: Provide your Google Gemini API Key for live AI suggestions & task breakdown.
# If omitted or left empty, the application runs using its built-in heuristic workflow engine!
GEMINI_API_KEY="your_gemini_api_key_here"

# Application host URL
APP_URL="http://localhost:3000"
```

> **Note**: An API key is **optional**. FlowPulse includes a built-in heuristic analysis engine, so the app is fully functional right out of the box even without external credentials!

---

### Step 4: Run the Unit Test Suite

Verify that pure scheduling and conflict detection logic passes all unit tests:

```bash
npm test
```

You should see all test suites pass with zero failures:
```text
✔ parseTimeMinutes correctly parses valid 24h times
✔ formatMinutesToTime formats minutes to HH:mm string
✔ detectScheduleConflicts finds overlapping tasks on the same day
✔ calculateTaskUrgency prioritizes critical tasks and approaching times
✔ calculateWorkflowStats accurately tallies completion and focus hours
✔ generateHeuristicSuggestions identifies breakdown and conflict opportunities
✔ getCalendarDaysForMonth creates correct month grid structure
✔ getWeekDays produces 7 days with day names
```

---

### Step 5: Start the Development Server

Start the full-stack Express and Vite development server:

```bash
npm run dev
```

The server will initialize on port 3000:
```text
Server running on http://0.0.0.0:3000
```

---

### Step 6: Open the Application in Your Browser

Visit **[http://localhost:3000](http://localhost:3000)** in your web browser.

---

## 📦 Available Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts the full-stack server with Vite middleware in development mode on port 3000 |
| `npm test` | Runs the Node.js native unit test suite (`src/utils/taskLogic.test.ts`) |
| `npm run build` | Compiles and builds production-ready static assets into `dist/` |
| `npm start` | Runs the production Node.js Express server serving the built assets |
| `npm run lint` | Runs TypeScript type-checking (`tsc --noEmit`) to verify code integrity |

---

## ✨ Key Features & User Workflows

### 1. Daily Task Management
- **Stream Categories**: Organize tasks across *Deep Work*, *Client Delivery*, *Admin & Ops*, *Learning & R&D*, and *Health & Habits*.
- **Urgency Tiers**: Assign *Critical*, *High*, *Medium*, or *Low* priority levels.
- **Cognitive Energy Alignment**: Match tasks to energy levels (*High Focus Peak*, *Moderate Energy*, *Low Energy Quick Win*).
- **Interactive Checkpoints**: Add subtasks, expand/collapse task details, and track completion progress inline.

### 2. Integrated Calendar
- **Day Timeline**: Hourly view (08:00 to 20:00) with color-coded time blocks and instant conflict detection. Click any empty slot to quick-schedule.
- **Week View**: 7-day multi-column timeline to balance weekly capacity.
- **Month Grid**: Monthly calendar overview with daily scheduled item counters.

### 3. Priority Notifications
- **Real-Time Notification Drawer**: Shows impending deadlines, active deep work sessions, and overdue alerts.
- **Audible Chimes**: Subtle, pleasant audio cues synthesized via Web Audio API (*Critical Alert*, *Upcoming Reminder*, *Task Completed*).
- **Actions**: Direct *Snooze 15m*, *Mark Read*, and *Jump to Task* controls.

### 4. Smart Workflow Advisor
- **Executive Daily Briefing**: High-level summary of your planned focus hours, deep work ratio, and pacing advice.
- **Overlap & Conflict Warnings**: Highlights double-booked time windows and offers a 1-click button to shift tasks.
- **1-Click Apply**: Accept recommendations to automatically update task schedules, add 15-minute buffers, or decompose large tasks.

### 5. Workflow Analytics
- **Live Productivity Metrics**: Visualizes planned vs. completed focus hours, deep work ratio (&ge; 40% target), completion velocity, and backlog priority distribution.

---

## 📂 Project Structure

```text
├── server.ts                       # Express server hosting Gemini API routes & Vite middleware
├── src/
│   ├── App.tsx                     # Main application layout, state coordination, and navigation
│   ├── main.tsx                    # React client entry point
│   ├── types.ts                    # TypeScript types (Task, Notification, Suggestion, Metrics)
│   ├── index.css                   # Tailwind CSS imports and typography styling
│   ├── components/
│   │   ├── Header.tsx              # Top navigation bar (Brand, views, notifications, new task CTA)
│   │   ├── Sidebar.tsx             # Desktop workspace navigation & daily pulse KPI card
│   │   ├── MobileNav.tsx           # Compact bottom navigation bar for mobile viewports
│   │   ├── TaskList.tsx            # Daily task view with date navigation, filters, and search
│   │   ├── TaskCard.tsx            # Individual task card with zero-pill metadata and subtasks
│   │   ├── CalendarView.tsx        # Integrated Day, Week, and Month calendar with time slots
│   │   ├── SmartAdvisorPanel.tsx   # AI workflow analysis, executive briefing & 1-click apply
│   │   ├── NotificationCenter.tsx  # Priority alerts flyout drawer with sound toggle & snooze
│   │   ├── TaskModal.tsx           # Task creation/editing modal with AI auto-breakdown
│   │   └── WorkflowAnalytics.tsx   # Visual charts for focus hours, streams, and completion rate
│   └── utils/
│       ├── taskLogic.ts            # Pure functions for conflicts, urgency, metrics & calendar math
│       ├── taskLogic.test.ts       # Node.js native unit tests
│       ├── storage.ts              # LocalStorage persistence & initial realistic seed dataset
│       └── audio.ts                # Web Audio API notification sound synthesizer
├── package.json                    # Project metadata, scripts, and dependencies
├── tsconfig.json                   # TypeScript compiler configuration
└── vite.config.ts                  # Vite build tool and Tailwind configuration
```

---

## 📄 License

This project is open-source and available under the Apache-2.0 License.
