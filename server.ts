import express, { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import type { ApiStats, Checklist, ChecklistItem, WorkdayShift } from './src/types/checklist.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.resolve(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'checklists.json');
const PORT = Number(process.env.PORT) || 3000;

const VALID_SHIFTS: WorkdayShift[] = ['Morning', 'Workday', 'Closing', 'Always On'];

function makeId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}

function getInitialSeed(): Checklist[] {
  const now = new Date().toISOString();
  return [
    {
      id: 'sop_order_processing',
      title: 'Order Processing',
      shift: 'Workday',
      assignee: 'Aarav Mehta',
      role: 'Fulfillment Lead',
      description: 'End-to-end customer order verification, quality inspection, packing, and dispatch.',
      updatedAt: now,
      items: [
        { id: 'step_op_1', order: 1, title: 'Verify payment confirmation in gateway', note: 'Match transaction ID with order invoice', completed: true, completedAt: now },
        { id: 'step_op_2', order: 2, title: 'Check inventory availability in bin locations', note: 'Confirm SKU count before picking', completed: true, completedAt: now },
        { id: 'step_op_3', order: 3, title: 'Prepare order items at packing station', completed: false, completedAt: null },
        { id: 'step_op_4', order: 4, title: 'Perform two-point quality check', note: 'Inspect packaging seal and item condition', completed: false, completedAt: null },
        { id: 'step_op_5', order: 5, title: 'Pack order with protective insert and invoice', completed: false, completedAt: null },
        { id: 'step_op_6', order: 6, title: 'Dispatch with courier manifest scan', completed: false, completedAt: null },
      ],
    },
    {
      id: 'sop_morning_opening',
      title: 'Morning Opening Checklist',
      shift: 'Morning',
      assignee: 'Priya Nair',
      role: 'Store Supervisor',
      description: 'Daily opening readiness, POS verification, staff shift briefing, and shelf check.',
      updatedAt: now,
      items: [
        { id: 'step_mo_1', order: 1, title: 'Unlock facility and disarm security panel', completed: true, completedAt: now },
        { id: 'step_mo_2', order: 2, title: 'Boot POS terminals and verify cash drawer float', completed: true, completedAt: now },
        { id: 'step_mo_3', order: 3, title: 'Run morning inventory spot check on top 10 SKUs', completed: true, completedAt: now },
        { id: 'step_mo_4', order: 4, title: 'Confirm staff shift assignments and workstation readiness', completed: false, completedAt: null },
      ],
    },
    {
      id: 'sop_closing_procedures',
      title: 'Closing & Inventory Reconciliation',
      shift: 'Closing',
      assignee: 'Rohan Kulkarni',
      role: 'Shift Manager',
      description: 'End-of-day cash reconciliation, stock ledger update, and daily operations report.',
      updatedAt: now,
      items: [
        { id: 'step_cl_1', order: 1, title: 'Reconcile daily sales receipts against POS summary', completed: false, completedAt: null },
        { id: 'step_cl_2', order: 2, title: 'Log damaged or returned inventory items', completed: false, completedAt: null },
        { id: 'step_cl_3', order: 3, title: 'Sanitize workstations and power down non-essential equipment', completed: false, completedAt: null },
        { id: 'step_cl_4', order: 4, title: 'Submit daily manager summary before lockup', completed: false, completedAt: null },
      ],
    },
    {
      id: 'sop_onboarding_training',
      title: 'New Employee SOP Training',
      shift: 'Always On',
      assignee: 'Neha Sharma',
      role: 'Operations Trainer',
      description: 'Standardized onboarding modules for customer service etiquette and refund handling.',
      updatedAt: now,
      items: [
        { id: 'step_tr_1', order: 1, title: 'Review approved refund & exchange policy threshold', completed: true, completedAt: now },
        { id: 'step_tr_2', order: 2, title: 'Shadow one full Order Processing workflow run', completed: true, completedAt: now },
        { id: 'step_tr_3', order: 3, title: 'Complete supervised closing inventory log', completed: false, completedAt: null },
      ],
    },
  ];
}

function ensureStore(): Checklist[] {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(DATA_FILE)) {
    const seed = getInitialSeed();
    fs.writeFileSync(DATA_FILE, JSON.stringify(seed, null, 2), 'utf-8');
    return seed;
  }
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
  } catch {
    // Re-seed if corrupted
  }
  const seed = getInitialSeed();
  fs.writeFileSync(DATA_FILE, JSON.stringify(seed, null, 2), 'utf-8');
  return seed;
}

function saveStore(checklists: Checklist[]): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  fs.writeFileSync(DATA_FILE, JSON.stringify(checklists, null, 2), 'utf-8');
}

function computeStats(checklists: Checklist[]): ApiStats {
  const totalChecklists = checklists.length;
  let totalSteps = 0;
  let completedSteps = 0;
  for (const list of checklists) {
    totalSteps += list.items.length;
    completedSteps += list.items.filter((i) => i.completed).length;
  }
  const pendingSteps = totalSteps - completedSteps;
  const completionRate = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;
  return {
    totalChecklists,
    totalSteps,
    completedSteps,
    completionRate,
    pendingSteps,
  };
}

function parseProcessDescriptionToSteps(processText: string): string[] {
  const cleaned = processText
    .replace(/\band\s+then\b/gi, ',')
    .replace(/\bthen\b/gi, ',')
    .replace(/\band\b(?![^()]*\))/gi, ',')
    .replace(/[.!?]+$/g, '')
    .trim();

  // Split by commas, semicolons, arrows, or newlines
  const rawParts = cleaned
    .split(/[,;\n→>-]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 2);

  // Strip common conversational lead-in clauses from the first step if it contains "when a customer..."
  const normalized = rawParts.map((part, idx) => {
    let text = part;
    if (idx === 0) {
      text = text.replace(/^when\s+[^,]+$/i, (match) => match);
    }
    return text.charAt(0).toUpperCase() + text.slice(1);
  });

  if (normalized.length === 0) {
    return ['Document initial process requirements', 'Verify execution step', 'Confirm completion'];
  }
  return normalized.slice(0, 12);
}

async function startServer() {
  const app = express();
  app.use(express.json());

  // Health check
  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({ ok: true, service: 'FlowSOP Checklist API', timestamp: new Date().toISOString() });
  });

  // GET all checklists with optional shift and search filtering
  app.get('/api/checklists', (req: Request, res: Response) => {
    const all = ensureStore();
    const shiftParam = typeof req.query.shift === 'string' ? req.query.shift : undefined;
    const searchParam = typeof req.query.search === 'string' ? req.query.search.trim().toLowerCase() : '';

    let filtered = all;
    if (shiftParam && shiftParam !== 'All') {
      filtered = filtered.filter((c) => c.shift === shiftParam);
    }
    if (searchParam) {
      filtered = filtered.filter(
        (c) =>
          c.title.toLowerCase().includes(searchParam) ||
          c.assignee.toLowerCase().includes(searchParam) ||
          c.description.toLowerCase().includes(searchParam) ||
          c.items.some((item) => item.title.toLowerCase().includes(searchParam))
      );
    }

    res.json({
      checklists: filtered,
      stats: computeStats(all),
    });
  });

  // GET single checklist
  app.get('/api/checklists/:id', (req: Request, res: Response) => {
    const all = ensureStore();
    const found = all.find((c) => c.id === req.params.id);
    if (!found) {
      res.status(404).json({ error: 'Checklist not found' });
      return;
    }
    res.json({ checklist: found });
  });

  // POST create new checklist
  app.post('/api/checklists', (req: Request, res: Response) => {
    const { title, shift, assignee, role, description, steps } = req.body ?? {};
    if (typeof title !== 'string' || !title.trim()) {
      res.status(400).json({ error: 'Checklist title is required' });
      return;
    }

    const safeShift: WorkdayShift = VALID_SHIFTS.includes(shift) ? shift : 'Workday';
    const stepList: string[] = Array.isArray(steps)
      ? steps.map((s) => String(s).trim()).filter(Boolean)
      : [];

    if (stepList.length === 0) {
      res.status(400).json({ error: 'At least one checklist step is required' });
      return;
    }

    const now = new Date().toISOString();
    const newChecklist: Checklist = {
      id: makeId('sop'),
      title: title.trim(),
      shift: safeShift,
      assignee: typeof assignee === 'string' && assignee.trim() ? assignee.trim() : 'Operations Team',
      role: typeof role === 'string' && role.trim() ? role.trim() : 'Staff Member',
      description: typeof description === 'string' ? description.trim() : '',
      updatedAt: now,
      items: stepList.map((stepTitle, index) => ({
        id: makeId('step'),
        order: index + 1,
        title: stepTitle,
        completed: false,
        completedAt: null,
      })),
    };

    const all = ensureStore();
    const updated = [newChecklist, ...all];
    saveStore(updated);

    res.status(201).json({
      checklist: newChecklist,
      stats: computeStats(updated),
    });
  });

  // POST convert natural-language process text into structured checklist
  app.post('/api/checklists/from-process', (req: Request, res: Response) => {
    const { title, shift, assignee, processText } = req.body ?? {};
    if (typeof processText !== 'string' || processText.trim().length < 5) {
      res.status(400).json({ error: 'Please provide a process description with at least 5 characters.' });
      return;
    }

    const safeShift: WorkdayShift = VALID_SHIFTS.includes(shift) ? shift : 'Workday';
    const extractedSteps = parseProcessDescriptionToSteps(processText);
    const derivedTitle =
      typeof title === 'string' && title.trim()
        ? title.trim()
        : extractedSteps[0]?.slice(0, 42) || 'Structured Operations SOP';

    const now = new Date().toISOString();
    const newChecklist: Checklist = {
      id: makeId('sop'),
      title: derivedTitle,
      shift: safeShift,
      assignee: typeof assignee === 'string' && assignee.trim() ? assignee.trim() : 'Assigned Staff',
      role: 'Process Execution',
      description: processText.trim(),
      updatedAt: now,
      items: extractedSteps.map((stepTitle, index) => ({
        id: makeId('step'),
        order: index + 1,
        title: stepTitle,
        completed: false,
        completedAt: null,
      })),
    };

    const all = ensureStore();
    const updated = [newChecklist, ...all];
    saveStore(updated);

    res.status(201).json({
      checklist: newChecklist,
      stats: computeStats(updated),
    });
  });

  // PATCH update checklist metadata
  app.patch('/api/checklists/:id', (req: Request, res: Response) => {
    const all = ensureStore();
    const index = all.findIndex((c) => c.id === req.params.id);
    if (index === -1) {
      res.status(404).json({ error: 'Checklist not found' });
      return;
    }

    const current = all[index];
    const { title, shift, assignee, description } = req.body ?? {};
    const updatedChecklist: Checklist = {
      ...current,
      title: typeof title === 'string' && title.trim() ? title.trim() : current.title,
      shift: VALID_SHIFTS.includes(shift) ? shift : current.shift,
      assignee: typeof assignee === 'string' && assignee.trim() ? assignee.trim() : current.assignee,
      description: typeof description === 'string' ? description.trim() : current.description,
      updatedAt: new Date().toISOString(),
    };

    all[index] = updatedChecklist;
    saveStore(all);

    res.json({
      checklist: updatedChecklist,
      stats: computeStats(all),
    });
  });

  // DELETE checklist
  app.delete('/api/checklists/:id', (req: Request, res: Response) => {
    const all = ensureStore();
    const exists = all.some((c) => c.id === req.params.id);
    if (!exists) {
      res.status(404).json({ error: 'Checklist not found' });
      return;
    }
    const updated = all.filter((c) => c.id !== req.params.id);
    saveStore(updated);

    res.json({
      deletedId: req.params.id,
      stats: computeStats(updated),
    });
  });

  // POST add step item to checklist
  app.post('/api/checklists/:id/items', (req: Request, res: Response) => {
    const all = ensureStore();
    const index = all.findIndex((c) => c.id === req.params.id);
    if (index === -1) {
      res.status(404).json({ error: 'Checklist not found' });
      return;
    }

    const { title, note } = req.body ?? {};
    if (typeof title !== 'string' || !title.trim()) {
      res.status(400).json({ error: 'Step title is required' });
      return;
    }

    const current = all[index];
    const newItem: ChecklistItem = {
      id: makeId('step'),
      order: current.items.length + 1,
      title: title.trim(),
      note: typeof note === 'string' && note.trim() ? note.trim() : undefined,
      completed: false,
      completedAt: null,
    };

    const updatedChecklist: Checklist = {
      ...current,
      updatedAt: new Date().toISOString(),
      items: [...current.items, newItem],
    };

    all[index] = updatedChecklist;
    saveStore(all);

    res.status(201).json({
      checklist: updatedChecklist,
      item: newItem,
      stats: computeStats(all),
    });
  });

  // PATCH toggle or edit step item
  app.patch('/api/checklists/:id/items/:itemId', (req: Request, res: Response) => {
    const all = ensureStore();
    const checklistIndex = all.findIndex((c) => c.id === req.params.id);
    if (checklistIndex === -1) {
      res.status(404).json({ error: 'Checklist not found' });
      return;
    }

    const checklist = all[checklistIndex];
    const itemIndex = checklist.items.findIndex((item) => item.id === req.params.itemId);
    if (itemIndex === -1) {
      res.status(404).json({ error: 'Checklist step not found' });
      return;
    }

    const { completed, title, note } = req.body ?? {};
    const existingItem = checklist.items[itemIndex];
    const nextCompleted = typeof completed === 'boolean' ? completed : existingItem.completed;
    const now = new Date().toISOString();

    const updatedItem: ChecklistItem = {
      ...existingItem,
      title: typeof title === 'string' && title.trim() ? title.trim() : existingItem.title,
      note: typeof note === 'string' ? (note.trim() || undefined) : existingItem.note,
      completed: nextCompleted,
      completedAt: nextCompleted ? (existingItem.completedAt || now) : null,
    };

    const nextItems = [...checklist.items];
    nextItems[itemIndex] = updatedItem;

    const updatedChecklist: Checklist = {
      ...checklist,
      updatedAt: now,
      items: nextItems,
    };

    all[checklistIndex] = updatedChecklist;
    saveStore(all);

    res.json({
      checklist: updatedChecklist,
      item: updatedItem,
      stats: computeStats(all),
    });
  });

  // DELETE step item
  app.delete('/api/checklists/:id/items/:itemId', (req: Request, res: Response) => {
    const all = ensureStore();
    const checklistIndex = all.findIndex((c) => c.id === req.params.id);
    if (checklistIndex === -1) {
      res.status(404).json({ error: 'Checklist not found' });
      return;
    }

    const checklist = all[checklistIndex];
    const filteredItems = checklist.items
      .filter((item) => item.id !== req.params.itemId)
      .map((item, idx) => ({ ...item, order: idx + 1 }));

    if (filteredItems.length === checklist.items.length) {
      res.status(404).json({ error: 'Checklist step not found' });
      return;
    }

    const updatedChecklist: Checklist = {
      ...checklist,
      updatedAt: new Date().toISOString(),
      items: filteredItems,
    };

    all[checklistIndex] = updatedChecklist;
    saveStore(all);

    res.json({
      checklist: updatedChecklist,
      stats: computeStats(all),
    });
  });

  // POST reset checklist run
  app.post('/api/checklists/:id/reset', (req: Request, res: Response) => {
    const all = ensureStore();
    const checklistIndex = all.findIndex((c) => c.id === req.params.id);
    if (checklistIndex === -1) {
      res.status(404).json({ error: 'Checklist not found' });
      return;
    }

    const checklist = all[checklistIndex];
    const updatedChecklist: Checklist = {
      ...checklist,
      updatedAt: new Date().toISOString(),
      items: checklist.items.map((item) => ({
        ...item,
        completed: false,
        completedAt: null,
      })),
    };

    all[checklistIndex] = updatedChecklist;
    saveStore(all);

    res.json({
      checklist: updatedChecklist,
      stats: computeStats(all),
    });
  });

  // Vite dev middleware or production static assets
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`FlowSOP server listening on http://localhost:${PORT}`);
  });
}

startServer();
