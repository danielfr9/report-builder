import { TASK_STATUS } from "../constants/task-status";

export interface ReportHeader {
  date: Date | null;
  name: string;
  project: string;
  sprint: {
    from: Date | null;
    to: Date | null;
  };
}

export interface ReportHeaderLocalStorage {
  date: string | null;
  name?: string;
  project?: string;
  sprint?: {
    from: string | null;
    to: string | null;
  };
}

export interface DailyTask {
  id: string;
  name: string;
  storyPoints: number;
  status: (typeof TASK_STATUS)[keyof typeof TASK_STATUS];
  comments: string;
}

export interface DailyPendingTask {
  id: string;
  name: string;
  storyPoints: number;
  actionPlan: string;
}

export interface DailyBlock {
  id: string;
  name: string;
}

export interface DailyObservation {
  id: string;
  name: string;
}

export interface DailyReportData {
  header: ReportHeader;
  completedTasks: DailyTask[];
  pendingTasks: DailyPendingTask[];
  blocks: DailyBlock[];
  observations: DailyObservation[];
  hoursWorked: number;
  additionalNotes: string;
}

export interface DailyReportLocalStorageData {
  header?: ReportHeaderLocalStorage;
  completedTasks?: DailyTask[];
  pendingTasks?: DailyPendingTask[];
  blocks?: DailyBlock[];
  observations?: DailyObservation[];
  hoursWorked?: number;
  additionalNotes?: string;
}

// Weekly Report Specific Interfaces
export interface WeeklyTask {
  id: string;
  name: string;
  storyPoints: number;
  status: (typeof TASK_STATUS)[keyof typeof TASK_STATUS];
  comments: string;
  finishDate: Date | null;
}

type WeeklyTaskLocalStorage = Omit<WeeklyTask, "finishDate"> & {
  finishDate: string | null;
};

export interface WeeklyPendingTask {
  id: string;
  name: string;
  storyPoints: number;
  actionPlan: string;
}

export interface WeeklyBlock {
  id: string;
  name: string;
}

export interface WeeklyObservation {
  id: string;
  name: string;
}

export interface WeeklyReportData {
  header: ReportHeader;
  completedTasks: WeeklyTask[];
  pendingTasks: WeeklyPendingTask[];
  blocks: WeeklyBlock[];
  observations: WeeklyObservation[];
  hoursWorked: number;
  additionalNotes: string;
}

export interface WeeklyReportLocalStorageData {
  header?: ReportHeaderLocalStorage;
  completedTasks?: WeeklyTaskLocalStorage[];
  pendingTasks?: WeeklyPendingTask[];
  blocks?: WeeklyBlock[];
  observations?: WeeklyObservation[];
  hoursWorked?: number;
  additionalNotes?: string;
}
