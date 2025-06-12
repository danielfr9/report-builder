export interface Task {
  id: string;
  name: string;
  storyPoints: number;
  status: "Completado" | "En Proceso" | "Pendiente";
  comments: string;
}

export interface PendingTask {
  id: string;
  name: string;
  storyPoints: number;
  actionPlan: string;
}

export interface DailyReportData {
  date: Date | null;
  name: string;
  project: string;
  sprint: {
    from: Date | null;
    to: Date | null;
  };
  completedTasks: Task[];
  pendingTasks: PendingTask[];
  blocks: string[]; // Changed from string to string[]
  observations: string[]; // Changed from string to string[]
  hoursWorked: number;
  additionalNotes: string;
}

export interface DailyReportLocalStorageData {
  name?: string;
  project?: string;
  sprint?: {
    from?: string | null;
    to?: string | null;
  };
  completedTasks?: Task[];
  pendingTasks?: PendingTask[];
  blocks?: string[];
  observations?: string[];
  hoursWorked?: number;
  additionalNotes?: string;
}
