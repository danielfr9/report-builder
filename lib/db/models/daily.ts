import { Sprint, Block, Observation } from "./common";

export interface DailyHeader {
  date: string;
  name: string;
  project: string;
  sprint: Sprint;
}

export interface DailyTask {
  id: string;
  reportId?: number;
  name: string;
  storyPoints: number;
  status: string;
  comments: string;
}

export interface DailyPendingTask {
  id: string;
  reportId?: number;
  name: string;
  storyPoints: number;
  actionPlan: string;
}

export interface DailyReportMeta {
  id?: number;
  date: string;
  name: string;
  project: string;
  sprint: Sprint;
  sprintFrom: string;
  sprintTo: string;
  hoursWorked: number;
  additionalNotes: string;
  lastModified: string;
}

export interface DailyReport {
  header: DailyHeader;
  completedTasks: DailyTask[];
  pendingTasks: DailyPendingTask[];
  blocks: Block[];
  observations: Observation[];
  hoursWorked: number;
  additionalNotes: string;
}
