import { useCallback, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Check,
  Code2,
  Plus,
  RefreshCw,
  RotateCcw,
  Search,
  Trash2,
  Wand2,
  X,
} from 'lucide-react';
import { checklistApi, type ApiExchangeLog } from '../lib/checklistApi';
import type { ApiStats, Checklist, WorkdayShift } from '../types/checklist';

interface ChecklistWorkspaceProps {
  externalShiftFilter: WorkdayShift | 'All';
  onExternalShiftConsumed?: () => void;
  incomingProcessText: string | null;
  onIncomingProcessConsumed: () => void;
}

const SHIFTS: (WorkdayShift | 'All')[] = ['All', 'Morning', 'Workday', 'Closing', 'Always On'];
const ASSIGNABLE_SHIFTS: WorkdayShift[] = ['Morning', 'Workday', 'Closing', 'Always On'];

const API_ENDPOINTS = [
  { method: 'GET', path: '/api/checklists', purpose: 'List & filter checklists with live stats' },
  { method: 'POST', path: '/api/checklists', purpose: 'Create a custom checklist' },
  { method: 'POST', path: '/api/checklists/from-process', purpose: 'Convert process text into ordered steps' },
  { method: 'POST', path: '/api/checklists/:id/items', purpose: 'Add a step to an existing checklist' },
  { method: 'PATCH', path: '/api/checklists/:id/items/:itemId', purpose: 'Toggle step completion or update text' },
  { method: 'DELETE', path: '/api/checklists/:id/items/:itemId', purpose: 'Remove a step' },
  { method: 'POST', path: '/api/checklists/:id/reset', purpose: 'Reset all steps for a fresh shift' },
  { method: 'DELETE', path: '/api/checklists/:id', purpose: 'Delete a checklist' },
];

export function ChecklistWorkspace({
  externalShiftFilter,
  incomingProcessText,
  onIncomingProcessConsumed,
}: ChecklistWorkspaceProps) {
  const [checklists, setChecklists] = useState<Checklist[]>([]);
  const [stats, setStats] = useState<ApiStats>({
    totalChecklists: 0,
    totalSteps: 0,
    completedSteps: 0,
    completionRate: 0,
    pendingSteps: 0,
  });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [shiftFilter, setShiftFilter] = useState<WorkdayShift | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'employee' | 'manager'>('employee');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyAction, setBusyAction] = useState<string | null>(null);

  // Builder / Process Converter panel
  const [composerOpen, setComposerOpen] = useState(false);
  const [composerTab, setComposerTab] = useState<'process' | 'manual'>('process');
  const [newTitle, setNewTitle] = useState('');
  const [newShift, setNewShift] = useState<WorkdayShift>('Workday');
  const [newAssignee, setNewAssignee] = useState('');
  const [processInput, setProcessInput] = useState('');
  const [manualStepsInput, setManualStepsInput] = useState('');

  // Add step inline
  const [newStepTitle, setNewStepTitle] = useState('');
  const [newStepNote, setNewStepNote] = useState('');

  // API Inspector drawer
  const [apiInspectorOpen, setApiInspectorOpen] = useState(false);
  const [lastExchange, setLastExchange] = useState<ApiExchangeLog | null>(null);

  const loadChecklists = useCallback(
    async (shiftOverride?: WorkdayShift | 'All', searchOverride?: string) => {
      setLoading(true);
      setError(null);
      try {
        const activeShift = shiftOverride ?? shiftFilter;
        const activeSearch = searchOverride ?? searchQuery;
        const res = await checklistApi.list(
          { shift: activeShift, search: activeSearch },
          (log) => setLastExchange(log)
        );
        setChecklists(res.checklists);
        setStats(res.stats);
        setSelectedId((prev) => {
          if (prev && res.checklists.some((c) => c.id === prev)) return prev;
          return res.checklists[0]?.id ?? null;
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unable to load checklists from API');
      } finally {
        setLoading(false);
      }
    },
    [shiftFilter, searchQuery]
  );

  useEffect(() => {
    loadChecklists();
  }, [loadChecklists]);

  useEffect(() => {
    if (externalShiftFilter) {
      setShiftFilter(externalShiftFilter);
    }
  }, [externalShiftFilter]);

  useEffect(() => {
    if (incomingProcessText) {
      setComposerOpen(true);
      setComposerTab('process');
      setNewTitle('Custom Order Fulfillment');
      setNewShift('Workday');
      setNewAssignee('Fulfillment Desk');
      setProcessInput(incomingProcessText);
      onIncomingProcessConsumed();
    }
  }, [incomingProcessText, onIncomingProcessConsumed]);

  const activeChecklist = checklists.find((c) => c.id === selectedId) ?? checklists[0] ?? null;

  async function handleToggleStep(checklistId: string, itemId: string, currentCompleted: boolean) {
    setBusyAction(itemId);
    setError(null);
    // Optimistic update
    setChecklists((prev) =>
      prev.map((list) =>
        list.id !== checklistId
          ? list
          : {
              ...list,
              items: list.items.map((item) =>
                item.id === itemId ? { ...item, completed: !currentCompleted } : item
              ),
            }
      )
    );

    try {
      const res = await checklistApi.updateItem(
        checklistId,
        itemId,
        { completed: !currentCompleted },
        (log) => setLastExchange(log)
      );
      setChecklists((prev) => prev.map((c) => (c.id === checklistId ? res.checklist : c)));
      setStats(res.stats);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update step');
      loadChecklists();
    } finally {
      setBusyAction(null);
    }
  }

  async function handleAddStep(e: React.FormEvent) {
    e.preventDefault();
    if (!activeChecklist || !newStepTitle.trim()) return;
    setBusyAction('add-step');
    setError(null);
    try {
      const res = await checklistApi.addItem(
        activeChecklist.id,
        { title: newStepTitle.trim(), note: newStepNote.trim() || undefined },
        (log) => setLastExchange(log)
      );
      setChecklists((prev) => prev.map((c) => (c.id === activeChecklist.id ? res.checklist : c)));
      setStats(res.stats);
      setNewStepTitle('');
      setNewStepNote('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add checklist step');
    } finally {
      setBusyAction(null);
    }
  }

  async function handleDeleteStep(checklistId: string, itemId: string) {
    setBusyAction(`del_${itemId}`);
    setError(null);
    try {
      const res = await checklistApi.deleteItem(checklistId, itemId, (log) => setLastExchange(log));
      setChecklists((prev) => prev.map((c) => (c.id === checklistId ? res.checklist : c)));
      setStats(res.stats);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove step');
    } finally {
      setBusyAction(null);
    }
  }

  async function handleResetChecklist(checklistId: string) {
    setBusyAction('reset');
    setError(null);
    try {
      const res = await checklistApi.resetRun(checklistId, (log) => setLastExchange(log));
      setChecklists((prev) => prev.map((c) => (c.id === checklistId ? res.checklist : c)));
      setStats(res.stats);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reset checklist');
    } finally {
      setBusyAction(null);
    }
  }

  async function handleDeleteChecklist(checklistId: string) {
    setBusyAction('delete-checklist');
    setError(null);
    try {
      const res = await checklistApi.remove(checklistId, (log) => setLastExchange(log));
      const remaining = checklists.filter((c) => c.id !== checklistId);
      setChecklists(remaining);
      setStats(res.stats);
      setSelectedId(remaining[0]?.id ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete checklist');
    } finally {
      setBusyAction(null);
    }
  }

  async function handleComposerSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusyAction('create');
    setError(null);
    try {
      if (composerTab === 'process') {
        const res = await checklistApi.fromProcess(
          {
            title: newTitle.trim() || 'Structured SOP',
            shift: newShift,
            assignee: newAssignee.trim() || 'Assigned Staff',
            processText: processInput,
          },
          (log) => setLastExchange(log)
        );
        setShiftFilter('All');
        setSearchQuery('');
        setChecklists((prev) => [res.checklist, ...prev]);
        setStats(res.stats);
        setSelectedId(res.checklist.id);
      } else {
        const steps = manualStepsInput
          .split('\n')
          .map((s) => s.trim())
          .filter(Boolean);
        const res = await checklistApi.create(
          {
            title: newTitle.trim(),
            shift: newShift,
            assignee: newAssignee.trim() || 'Operations Team',
            description: 'Custom operational checklist',
            steps,
          },
          (log) => setLastExchange(log)
        );
        setShiftFilter('All');
        setSearchQuery('');
        setChecklists((prev) => [res.checklist, ...prev]);
        setStats(res.stats);
        setSelectedId(res.checklist.id);
      }
      setComposerOpen(false);
      setNewTitle('');
      setNewAssignee('');
      setProcessInput('');
      setManualStepsInput('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to create checklist');
    } finally {
      setBusyAction(null);
    }
  }

  return (
    <section id="workspace" className="py-24 bg-white border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-6">
        {/* Section Heading & View Switcher */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10">
          <div>
            <p className="text-xs font-medium tracking-wide text-blue-700 mb-3">
              03 · Live Checklist Workspace & REST API
            </p>
            <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 text-balance">
              Execute SOPs. Track every step in real time.
            </h2>
            <p className="mt-3 text-base text-slate-600 max-w-2xl">
              Backed by a live Express REST API (<code className="font-mono text-xs bg-slate-100 px-1.5 py-0.5 rounded">/api/checklists</code>).
              Switch between Employee Execution and Manager Visibility, or convert plain-text
              procedures into structured checklists.
            </p>
          </div>

          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg border border-slate-200 self-start lg:self-auto shrink-0">
            <button
              type="button"
              onClick={() => setViewMode('employee')}
              className={`px-3.5 py-2 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 ${
                viewMode === 'employee'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Employee Execution
            </button>
            <button
              type="button"
              onClick={() => setViewMode('manager')}
              className={`px-3.5 py-2 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 ${
                viewMode === 'manager'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Manager Visibility
            </button>
          </div>
        </div>

        {/* Live API Computed Operational KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 border border-slate-200 rounded-xl bg-slate-50 divide-y lg:divide-y-0 lg:divide-x divide-slate-200 mb-8">
          <div className="p-5">
            <p className="text-xs text-slate-500 font-medium">Active Checklists</p>
            <p className="font-display text-2xl font-bold text-slate-900 tabular-nums mt-1">
              {stats.totalChecklists}
            </p>
          </div>
          <div className="p-5">
            <p className="text-xs text-slate-500 font-medium">Total Workflow Steps</p>
            <p className="font-display text-2xl font-bold text-slate-900 tabular-nums mt-1">
              {stats.totalSteps}
            </p>
          </div>
          <div className="p-5">
            <p className="text-xs text-slate-500 font-medium">Completion Rate</p>
            <p className="font-display text-2xl font-bold text-emerald-700 tabular-nums mt-1">
              {stats.completionRate}%
            </p>
          </div>
          <div className="p-5">
            <p className="text-xs text-slate-500 font-medium">Pending Steps</p>
            <p className="font-display text-2xl font-bold text-amber-700 tabular-nums mt-1">
              {stats.pendingSteps}
            </p>
          </div>
        </div>

        {/* Filter & Action Toolbar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200 mb-6">
          <div className="flex flex-wrap items-center gap-3">
            <div
              className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg border border-slate-200 overflow-x-auto"
              role="tablist"
              aria-label="Filter checklists by shift"
            >
              {SHIFTS.map((shift) => {
                const active = shiftFilter === shift;
                return (
                  <button
                    key={shift}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => setShiftFilter(shift)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                      active
                        ? 'bg-white text-slate-900 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {shift}
                  </button>
                );
              })}
            </div>

            <div className="relative min-w-[210px]">
              <Search
                className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                aria-hidden="true"
              />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search checklists or steps..."
                aria-label="Search checklists"
                className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => {
                setComposerTab('process');
                setComposerOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors whitespace-nowrap shrink-0"
            >
              <Wand2 className="w-3.5 h-3.5" aria-hidden="true" />
              Convert Process
            </button>
            <button
              type="button"
              onClick={() => {
                setComposerTab('manual');
                setComposerOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors whitespace-nowrap shrink-0"
            >
              <Plus className="w-3.5 h-3.5" aria-hidden="true" />
              New Checklist
            </button>
            <button
              type="button"
              onClick={() => setApiInspectorOpen((v) => !v)}
              aria-expanded={apiInspectorOpen}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg border transition-colors whitespace-nowrap shrink-0 ${
                apiInspectorOpen
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" aria-hidden="true" />
              API Explorer
            </button>
          </div>
        </div>

        {/* Error Banner */}
        {error && (
          <div
            role="alert"
            className="mb-6 flex items-center justify-between gap-4 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-800"
          >
            <span>{error}</span>
            <button
              type="button"
              onClick={() => loadChecklists()}
              className="text-xs font-semibold underline hover:no-underline whitespace-nowrap"
            >
              Retry
            </button>
          </div>
        )}

        {/* Composer Drawer (Create Checklist or Convert Process Text) */}
        <AnimatePresence>
          {composerOpen && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
              className="mb-8 rounded-2xl border border-slate-200 bg-slate-50 p-6"
            >
              <div className="flex items-center justify-between gap-4 pb-4 border-b border-slate-200 mb-5">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setComposerTab('process')}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
                      composerTab === 'process'
                        ? 'bg-slate-900 text-white'
                        : 'bg-white text-slate-600 border border-slate-200 hover:text-slate-900'
                    }`}
                  >
                    Process Text to Checklist
                  </button>
                  <button
                    type="button"
                    onClick={() => setComposerTab('manual')}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
                      composerTab === 'manual'
                        ? 'bg-slate-900 text-white'
                        : 'bg-white text-slate-600 border border-slate-200 hover:text-slate-900'
                    }`}
                  >
                    Manual Step Builder
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => setComposerOpen(false)}
                  aria-label="Close builder"
                  className="p-1.5 text-slate-500 hover:text-slate-900 rounded-md"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleComposerSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label
                      htmlFor="sop-title"
                      className="block text-xs font-medium text-slate-700 mb-1.5"
                    >
                      Checklist Title
                    </label>
                    <input
                      id="sop-title"
                      type="text"
                      required={composerTab === 'manual'}
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      placeholder="e.g. Weekend Inventory Audit"
                      className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="sop-shift"
                      className="block text-xs font-medium text-slate-700 mb-1.5"
                    >
                      Workday Shift
                    </label>
                    <select
                      id="sop-shift"
                      value={newShift}
                      onChange={(e) => setNewShift(e.target.value as WorkdayShift)}
                      className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
                    >
                      {ASSIGNABLE_SHIFTS.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label
                      htmlFor="sop-assignee"
                      className="block text-xs font-medium text-slate-700 mb-1.5"
                    >
                      Assigned Owner
                    </label>
                    <input
                      id="sop-assignee"
                      type="text"
                      value={newAssignee}
                      onChange={(e) => setNewAssignee(e.target.value)}
                      placeholder="e.g. Priya Nair"
                      className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
                    />
                  </div>
                </div>

                {composerTab === 'process' ? (
                  <div>
                    <label
                      htmlFor="sop-process-text"
                      className="block text-xs font-medium text-slate-700 mb-1.5"
                    >
                      Owner Process Explanation (converted via POST /api/checklists/from-process)
                    </label>
                    <textarea
                      id="sop-process-text"
                      rows={3}
                      required
                      value={processInput}
                      onChange={(e) => setProcessInput(e.target.value)}
                      placeholder="Describe the workflow naturally, e.g. Verify payment, check inventory stock, pack items, apply shipping label, and dispatch courier."
                      className="w-full px-3 py-2.5 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
                    />
                  </div>
                ) : (
                  <div>
                    <label
                      htmlFor="sop-manual-steps"
                      className="block text-xs font-medium text-slate-700 mb-1.5"
                    >
                      Ordered Checklist Steps (one step per line)
                    </label>
                    <textarea
                      id="sop-manual-steps"
                      rows={4}
                      required
                      value={manualStepsInput}
                      onChange={(e) => setManualStepsInput(e.target.value)}
                      placeholder={'Verify cash float\nCheck cold storage temperature\nBrief morning floor team'}
                      className="w-full px-3 py-2.5 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 font-mono"
                    />
                  </div>
                )}

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setComposerOpen(false)}
                    className="px-4 py-2 text-xs font-medium text-slate-700 hover:text-slate-900"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={busyAction === 'create'}
                    className="px-5 py-2 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 disabled:opacity-60 rounded-lg transition-colors whitespace-nowrap"
                  >
                    {busyAction === 'create'
                      ? 'Saving via API...'
                      : composerTab === 'process'
                        ? 'Convert & Save Checklist'
                        : 'Create Checklist'}
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Live API Explorer Panel */}
        <AnimatePresence>
          {apiInspectorOpen && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
              className="mb-8 rounded-2xl border border-slate-800 bg-slate-950 text-slate-100 p-6"
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-5">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-display text-sm font-semibold text-white">
                      Checklist REST API Endpoints
                    </h3>
                    <button
                      type="button"
                      onClick={() => loadChecklists()}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-md transition-colors"
                    >
                      <RefreshCw className="w-3 h-3" aria-hidden="true" />
                      Test GET
                    </button>
                  </div>
                  <ul className="space-y-2">
                    {API_ENDPOINTS.map((ep) => (
                      <li
                        key={`${ep.method}-${ep.path}`}
                        className="flex items-start gap-2.5 text-xs border-b border-slate-800/80 pb-2 last:border-b-0"
                      >
                        <span className="font-mono font-semibold text-blue-400 w-14 shrink-0">
                          {ep.method}
                        </span>
                        <div className="min-w-0">
                          <p className="font-mono text-slate-200 truncate">{ep.path}</p>
                          <p className="text-slate-400 text-[11px] mt-0.5">{ep.purpose}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="lg:col-span-7 flex flex-col">
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <span className="font-display text-sm font-semibold text-white">
                      Latest Live API Response
                    </span>
                    {lastExchange && (
                      <span className="font-mono text-xs text-slate-300 tabular-nums">
                        {lastExchange.method} {lastExchange.endpoint} · HTTP {lastExchange.status} ·{' '}
                        {lastExchange.durationMs}ms
                      </span>
                    )}
                  </div>
                  <pre className="flex-1 max-h-64 overflow-auto rounded-xl bg-slate-900 border border-slate-800 p-4 font-mono text-xs text-emerald-300 leading-relaxed">
                    {lastExchange
                      ? JSON.stringify(lastExchange.responsePreview, null, 2)
                      : 'Interact with any checklist to inspect live API payloads.'}
                  </pre>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Workspace Content */}
        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-4 space-y-3">
              {[1, 2, 3].map((n) => (
                <div
                  key={n}
                  className="h-24 rounded-xl bg-slate-100 border border-slate-200 animate-pulse"
                />
              ))}
            </div>
            <div className="lg:col-span-8 h-96 rounded-xl bg-slate-100 border border-slate-200 animate-pulse" />
          </div>
        ) : checklists.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-12 text-center">
            <p className="font-display text-lg font-semibold text-slate-900">
              No checklists match your current filter
            </p>
            <p className="text-sm text-slate-600 mt-1 max-w-md mx-auto">
              Clear your search filter or create a new operational checklist via the API.
            </p>
            <div className="mt-6 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setShiftFilter('All');
                  setSearchQuery('');
                }}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-100"
              >
                Reset Filters
              </button>
              <button
                type="button"
                onClick={() => {
                  setComposerTab('manual');
                  setComposerOpen(true);
                }}
                className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800"
              >
                Create Checklist
              </button>
            </div>
          </div>
        ) : viewMode === 'manager' ? (
          /* Manager Operational Visibility Table */
          <div className="rounded-2xl border border-slate-200 overflow-hidden bg-white">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-600">
                    <th className="py-3.5 px-5">Checklist SOP</th>
                    <th className="py-3.5 px-4">Shift</th>
                    <th className="py-3.5 px-4">Assignee</th>
                    <th className="py-3.5 px-4 text-right">Steps</th>
                    <th className="py-3.5 px-4 text-right">Completion</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-sm">
                  {checklists.map((list) => {
                    const done = list.items.filter((i) => i.completed).length;
                    const total = list.items.length;
                    const pct = total > 0 ? Math.round((done / total) * 100) : 0;
                    const statusLabel =
                      pct === 100 ? 'Completed' : pct > 0 ? 'In Progress' : 'Pending';
                    const statusColor =
                      pct === 100
                        ? 'text-emerald-700'
                        : pct > 0
                          ? 'text-blue-700'
                          : 'text-amber-700';

                    return (
                      <tr key={list.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-5 font-medium text-slate-900">{list.title}</td>
                        <td className="py-3.5 px-4 text-slate-600">{list.shift}</td>
                        <td className="py-3.5 px-4 text-slate-600">{list.assignee}</td>
                        <td className="py-3.5 px-4 text-right font-mono text-xs text-slate-700 tabular-nums">
                          {done}/{total}
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono text-xs text-slate-900 tabular-nums">
                          {pct}%
                        </td>
                        <td className={`py-3.5 px-4 text-xs font-semibold ${statusColor}`}>
                          {statusLabel}
                        </td>
                        <td className="py-3.5 px-5 text-right">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedId(list.id);
                              setViewMode('employee');
                            }}
                            className="text-xs font-semibold text-blue-700 hover:text-blue-800 whitespace-nowrap"
                          >
                            Open Checklist
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* Employee Execution Split View */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Checklist Directory */}
            <div className="lg:col-span-4 space-y-2.5">
              {checklists.map((list) => {
                const done = list.items.filter((i) => i.completed).length;
                const total = list.items.length;
                const pct = total > 0 ? Math.round((done / total) * 100) : 0;
                const isSelected = activeChecklist?.id === list.id;

                return (
                  <button
                    key={list.id}
                    type="button"
                    onClick={() => setSelectedId(list.id)}
                    className={`w-full text-left p-4 rounded-xl border transition-colors duration-150 ${
                      isSelected
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-white text-slate-900 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <span className="font-display text-sm font-semibold leading-snug">
                        {list.title}
                      </span>
                      <span
                        className={`font-mono text-xs tabular-nums shrink-0 ${
                          isSelected ? 'text-blue-300' : 'text-slate-500'
                        }`}
                      >
                        {done}/{total}
                      </span>
                    </div>
                    <p
                      className={`text-xs mt-1.5 ${
                        isSelected ? 'text-slate-300' : 'text-slate-500'
                      }`}
                    >
                      {list.shift} · {list.assignee}
                    </p>
                    <div
                      className={`mt-3 h-1.5 w-full rounded-full overflow-hidden ${
                        isSelected ? 'bg-slate-800' : 'bg-slate-100'
                      }`}
                    >
                      <div
                        className={`h-full transition-transform duration-300 origin-left ${
                          pct === 100 ? 'bg-emerald-500' : 'bg-blue-600'
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Active Checklist Execution Panel */}
            {activeChecklist && (
              <div className="lg:col-span-8 rounded-2xl border border-slate-200 bg-white overflow-hidden">
                <div className="p-6 border-b border-slate-200 bg-slate-50/70">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div>
                      <p className="text-xs text-slate-500 font-medium mb-1">
                        {activeChecklist.shift} · {activeChecklist.assignee} · {activeChecklist.role}
                      </p>
                      <h3 className="font-display text-2xl font-bold text-slate-900 tracking-tight">
                        {activeChecklist.title}
                      </h3>
                      {activeChecklist.description && (
                        <p className="text-sm text-slate-600 mt-1.5 leading-relaxed">
                          {activeChecklist.description}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleResetChecklist(activeChecklist.id)}
                        disabled={busyAction === 'reset'}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg transition-colors whitespace-nowrap"
                      >
                        <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                        Reset Run
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteChecklist(activeChecklist.id)}
                        disabled={busyAction === 'delete-checklist'}
                        aria-label={`Delete ${activeChecklist.title}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-700 bg-white border border-slate-200 hover:bg-red-50 hover:border-red-200 rounded-lg transition-colors whitespace-nowrap"
                      >
                        <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>

                {/* Ordered Checklist Items */}
                <div className="divide-y divide-slate-200">
                  {activeChecklist.items.map((item, idx) => (
                    <motion.div
                      key={item.id}
                      layout
                      transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
                      className={`flex items-start gap-4 px-6 py-4 transition-colors ${
                        item.completed ? 'bg-emerald-50/35' : 'hover:bg-slate-50'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() =>
                          handleToggleStep(activeChecklist.id, item.id, item.completed)
                        }
                        aria-label={`Mark step ${idx + 1} as ${
                          item.completed ? 'incomplete' : 'complete'
                        }`}
                        className={`mt-0.5 w-6 h-6 rounded-md border flex items-center justify-center shrink-0 transition-colors ${
                          item.completed
                            ? 'bg-emerald-600 border-emerald-600 text-white'
                            : 'bg-white border-slate-300 text-transparent hover:border-blue-600'
                        }`}
                      >
                        <Check className="w-3.5 h-3.5 stroke-[2.5]" aria-hidden="true" />
                      </button>

                      <div
                        className="flex-1 min-w-0 cursor-pointer"
                        onClick={() =>
                          handleToggleStep(activeChecklist.id, item.id, item.completed)
                        }
                      >
                        <div className="flex items-baseline gap-2.5">
                          <span className="font-mono text-xs text-slate-400 tabular-nums shrink-0">
                            {String(idx + 1).padStart(2, '0')}
                          </span>
                          <span
                            className={`text-sm font-medium ${
                              item.completed ? 'line-through text-slate-400' : 'text-slate-900'
                            }`}
                          >
                            {item.title}
                          </span>
                        </div>
                        {item.note && (
                          <p className="text-xs text-slate-500 mt-1 pl-6">{item.note}</p>
                        )}
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <span className="font-mono text-[11px] text-slate-400 tabular-nums hidden sm:inline">
                          {item.completed ? 'Done' : 'Pending'}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleDeleteStep(activeChecklist.id, item.id)}
                          disabled={busyAction === `del_${item.id}`}
                          aria-label={`Remove step ${item.title}`}
                          className="p-1.5 text-slate-400 hover:text-red-600 rounded-md transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Add Step Inline Form */}
                <form
                  onSubmit={handleAddStep}
                  className="p-5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row gap-3"
                >
                  <input
                    type="text"
                    value={newStepTitle}
                    onChange={(e) => setNewStepTitle(e.target.value)}
                    placeholder="Add a new step to this checklist..."
                    aria-label="New checklist step title"
                    className="flex-1 px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
                  />
                  <input
                    type="text"
                    value={newStepNote}
                    onChange={(e) => setNewStepNote(e.target.value)}
                    placeholder="Optional guidance note"
                    aria-label="Optional step note"
                    className="sm:w-52 px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
                  />
                  <button
                    type="submit"
                    disabled={!newStepTitle.trim() || busyAction === 'add-step'}
                    className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 disabled:opacity-50 rounded-lg transition-colors whitespace-nowrap shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" aria-hidden="true" />
                    Add Step
                  </button>
                </form>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
