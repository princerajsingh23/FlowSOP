export type WorkdayShift = 'Morning' | 'Workday' | 'Closing' | 'Always On';

export interface ChecklistItem {
  id: string;
  order: number;
  title: string;
  note?: string;
  completed: boolean;
  completedAt?: string | null;
}

export interface Checklist {
  id: string;
  title: string;
  shift: WorkdayShift;
  assignee: string;
  role: string;
  description: string;
  updatedAt: string;
  items: ChecklistItem[];
}

export interface ApiStats {
  totalChecklists: number;
  totalSteps: number;
  completedSteps: number;
  completionRate: number;
  pendingSteps: number;
}

export interface ChecklistsResponse {
  checklists: Checklist[];
  stats: ApiStats;
}
