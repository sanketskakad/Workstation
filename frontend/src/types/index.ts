export type TaskPriority = "low" | "medium" | "high";
export type TaskStatus = "todo" | "inprogress" | "done";

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignee: string;
  dueDate: string;
  project: string;
  projectId?: string;
  sprintId?: string;
  subtasks?: string[];
}

export interface User {
  id?: string;
  _id?: string;
  name: string;
  email: string;
  bio?: string;
  role?: string;
  team?: string[];
  settings?: {
    defaultView?: string;
    timezone?: string;
    autoSave?: boolean;
    compactMode?: boolean;
    theme?: string;
  };
}

export interface AnalyticsSummary {
  weeklyCompleted: Array<{ week: string; count: number }>;
  overdueTasks: number;
  productivityScore: number;
  teamProductivity: Array<{ developer: string; efficiency: number }>;
}
