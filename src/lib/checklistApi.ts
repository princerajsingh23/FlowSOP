import type { ApiStats, Checklist, ChecklistsResponse, WorkdayShift } from '../types/checklist';

export interface ApiExchangeLog {
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  endpoint: string;
  status: number;
  durationMs: number;
  responsePreview: unknown;
}

async function requestJson<T>(
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE',
  endpoint: string,
  body?: unknown,
  onExchange?: (log: ApiExchangeLog) => void
): Promise<T> {
  const started = performance.now();
  const res = await fetch(endpoint, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => ({}));
  const durationMs = Math.max(1, Math.round(performance.now() - started));

  if (onExchange) {
    onExchange({
      method,
      endpoint,
      status: res.status,
      durationMs,
      responsePreview: data,
    });
  }

  if (!res.ok) {
    throw new Error(typeof data?.error === 'string' ? data.error : `Request failed (${res.status})`);
  }

  return data as T;
}

export const checklistApi = {
  list(params?: { shift?: string; search?: string }, onExchange?: (log: ApiExchangeLog) => void) {
    const qs = new URLSearchParams();
    if (params?.shift && params.shift !== 'All') qs.set('shift', params.shift);
    if (params?.search?.trim()) qs.set('search', params.search.trim());
    const query = qs.toString();
    const endpoint = query ? `/api/checklists?${query}` : '/api/checklists';
    return requestJson<ChecklistsResponse>('GET', endpoint, undefined, onExchange);
  },

  create(
    payload: {
      title: string;
      shift: WorkdayShift;
      assignee: string;
      description: string;
      steps: string[];
    },
    onExchange?: (log: ApiExchangeLog) => void
  ) {
    return requestJson<{ checklist: Checklist; stats: ApiStats }>(
      'POST',
      '/api/checklists',
      payload,
      onExchange
    );
  },

  fromProcess(
    payload: {
      title: string;
      shift: WorkdayShift;
      assignee: string;
      processText: string;
    },
    onExchange?: (log: ApiExchangeLog) => void
  ) {
    return requestJson<{ checklist: Checklist; stats: ApiStats }>(
      'POST',
      '/api/checklists/from-process',
      payload,
      onExchange
    );
  },

  remove(id: string, onExchange?: (log: ApiExchangeLog) => void) {
    return requestJson<{ deletedId: string; stats: ApiStats }>(
      'DELETE',
      `/api/checklists/${encodeURIComponent(id)}`,
      undefined,
      onExchange
    );
  },

  addItem(
    checklistId: string,
    payload: { title: string; note?: string },
    onExchange?: (log: ApiExchangeLog) => void
  ) {
    return requestJson<{ checklist: Checklist; stats: ApiStats }>(
      'POST',
      `/api/checklists/${encodeURIComponent(checklistId)}/items`,
      payload,
      onExchange
    );
  },

  updateItem(
    checklistId: string,
    itemId: string,
    payload: { completed?: boolean; title?: string; note?: string },
    onExchange?: (log: ApiExchangeLog) => void
  ) {
    return requestJson<{ checklist: Checklist; stats: ApiStats }>(
      'PATCH',
      `/api/checklists/${encodeURIComponent(checklistId)}/items/${encodeURIComponent(itemId)}`,
      payload,
      onExchange
    );
  },

  deleteItem(
    checklistId: string,
    itemId: string,
    onExchange?: (log: ApiExchangeLog) => void
  ) {
    return requestJson<{ checklist: Checklist; stats: ApiStats }>(
      'DELETE',
      `/api/checklists/${encodeURIComponent(checklistId)}/items/${encodeURIComponent(itemId)}`,
      undefined,
      onExchange
    );
  },

  resetRun(checklistId: string, onExchange?: (log: ApiExchangeLog) => void) {
    return requestJson<{ checklist: Checklist; stats: ApiStats }>(
      'POST',
      `/api/checklists/${encodeURIComponent(checklistId)}/reset`,
      undefined,
      onExchange
    );
  },
};
