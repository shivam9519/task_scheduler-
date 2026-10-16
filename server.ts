import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

// Initialize Google GenAI client if GEMINI_API_KEY is present
let ai: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

/**
 * POST /api/smart-suggestions
 * Generates workflow optimizations and smart suggestions based on user tasks and schedule.
 */
app.post('/api/smart-suggestions', async (req, res) => {
  try {
    const { tasks, todayStr } = req.body;

    if (!Array.isArray(tasks)) {
      return res.status(400).json({ error: 'Tasks array is required' });
    }

    if (!ai) {
      // Return heuristic response when no API key is provided
      return res.json({
        source: 'heuristic',
        briefing: 'Focus on high-leverage deep work tasks during the morning and maintain a 15-minute buffer between scheduled blocks.',
        suggestions: [
          {
            id: `ai-heuristic-1`,
            type: 'buffer',
            title: 'Protect 15m Transition Buffers',
            reasoning: 'Consecutive scheduled blocks increase context-switching fatigue. A 15-minute break improves focus continuity.',
            actionLabel: 'Add 15m Buffer',
          },
          {
            id: `ai-heuristic-2`,
            type: 'daily_focus',
            title: 'Prioritize Top 3 Critical Items',
            reasoning: 'Concentrating on your top 3 highest priority items before mid-day guarantees 80% of daily impact.',
            actionLabel: 'Focus Critical Only',
          }
        ]
      });
    }

    const prompt = `Analyze this user's task workflow and calendar schedule for today (${todayStr}):
Tasks list (JSON):
${JSON.stringify(tasks, null, 2)}

Provide tailored workflow optimization recommendations. Return JSON with:
1. "briefing": A concise 2-sentence executive summary of today's workload and best strategy.
2. "suggestions": An array of 2 to 4 actionable suggestions. Each item must have:
   - "id": string unique id
   - "type": one of "buffer", "breakdown", "rebalance", "energy_alignment", "daily_focus"
   - "title": short compelling title (e.g. "Shift 'Deep Work' to Peak Morning Slot")
   - "reasoning": 1-2 sentence evidence-based reasoning explaining why this improves their workflow
   - "actionLabel": short action button label (e.g. "Apply Reschedule", "Split Into Milestones")
   - "targetTaskId": optional id of the task this targets
   - "recommendedChanges": optional object with suggested property adjustments like newStartTime, newEndTime, newDate, newPriority, or subtasksToAdd (array of strings).`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            briefing: {
              type: Type.STRING,
              description: 'Executive summary briefing of today schedule and workload',
            },
            suggestions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  type: { type: Type.STRING },
                  title: { type: Type.STRING },
                  reasoning: { type: Type.STRING },
                  actionLabel: { type: Type.STRING },
                  targetTaskId: { type: Type.STRING },
                  recommendedChanges: {
                    type: Type.OBJECT,
                    properties: {
                      newStartTime: { type: Type.STRING },
                      newEndTime: { type: Type.STRING },
                      newDate: { type: Type.STRING },
                      newPriority: { type: Type.STRING },
                      subtasksToAdd: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING },
                      },
                    },
                  },
                },
                required: ['id', 'type', 'title', 'reasoning', 'actionLabel'],
              },
            },
          },
          required: ['briefing', 'suggestions'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json({ source: 'gemini', ...parsed });
  } catch (err: any) {
    console.warn('Gemini API call failed, falling back to heuristic engine:', err?.message);
    // Graceful seamless fallback so app works flawlessly
    return res.json({
      source: 'heuristic_fallback',
      briefing: 'Schedule buffer recommended between back-to-back blocks to sustain focus and task completion velocity.',
      suggestions: [
        {
          id: `ai-fallback-1`,
          type: 'buffer',
          title: 'Protect 15m Transition Buffers',
          reasoning: 'Consecutive scheduled blocks increase context-switching fatigue. A 15-minute break improves focus continuity.',
          actionLabel: 'Add 15m Buffer',
        },
        {
          id: `ai-fallback-2`,
          type: 'daily_focus',
          title: 'Prioritize Top 3 Critical Items',
          reasoning: 'Concentrating on your top 3 highest priority items before mid-day guarantees 80% of daily impact.',
          actionLabel: 'Focus Critical Only',
        }
      ]
    });
  }
});

/**
 * POST /api/task-breakdown
 * Automatically decomposes a complex task into concrete, time-estimated subtasks.
 */
app.post('/api/task-breakdown', async (req, res) => {
  try {
    const { title, description, estimatedMinutes } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Task title is required' });
    }

    if (!ai) {
      // Heuristic fallback breakdown
      return res.json({
        subtasks: [
          `Review requirements & clarify scope (${Math.round((estimatedMinutes || 60) * 0.2)}m)`,
          `Draft primary structure or prototype (${Math.round((estimatedMinutes || 60) * 0.5)}m)`,
          `Refine details, test, and document (${Math.round((estimatedMinutes || 60) * 0.3)}m)`,
        ],
      });
    }

    const prompt = `Break down this task into 3 to 5 clear, concrete, actionable sequential steps with realistic time estimates:
Task: "${title}"
Details: "${description || 'None provided'}"
Total Time Budget: ${estimatedMinutes || 60} minutes

Return a JSON array of strings, each string being an actionable subtask name with time in parentheses.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            subtasks: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
          },
          required: ['subtasks'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{"subtasks":[]}');
    return res.json(parsed);
  } catch (err: any) {
    console.warn('Error generating task breakdown, using fallback:', err?.message);
    const { estimatedMinutes } = req.body;
    return res.json({
      subtasks: [
        `Review requirements & clarify scope (${Math.round((estimatedMinutes || 60) * 0.2)}m)`,
        `Draft primary structure or prototype (${Math.round((estimatedMinutes || 60) * 0.5)}m)`,
        `Refine details, test, and document (${Math.round((estimatedMinutes || 60) * 0.3)}m)`,
      ],
    });
  }
});

/**
 * POST /api/daily-briefing
 * Creates a focused morning/midday briefing.
 */
app.post('/api/daily-briefing', async (req, res) => {
  try {
    const { completedCount, pendingCount, criticalCount, totalHours } = req.body;

    if (!ai) {
      return res.json({
        briefing: `You have ${pendingCount} tasks remaining (${criticalCount} critical) spanning ${totalHours}h. Tackle critical tasks first during high focus windows.`,
      });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `Provide an inspiring, crisp, realistic 2-sentence productivity briefing for someone with ${completedCount} completed tasks, ${pendingCount} pending tasks (${criticalCount} critical), totaling ${totalHours} planned focus hours. Keep it practical and motivating.`,
    });

    return res.json({ briefing: response.text?.trim() });
  } catch (err: any) {
    return res.json({
      briefing: 'Prioritize your critical deep work tasks first and protect buffer zones between meetings.',
    });
  }
});

// Mount Vite or static server
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
