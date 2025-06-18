import { Sprint, Block, Observation } from "./common";

export interface WeeklyHeader {
  date: string;
  name: string;
  project: string;
  sprint: Sprint;
}

export interface WeeklyTask {
  id: string;
  reportId?: number;
  name: string;
  storyPoints: number;
  status: string;
  comments: string;
  finishDate: string | null;
}

export interface WeeklyPendingTask {
  id: string;
  reportId?: number;
  name: string;
  storyPoints: number;
  actionPlan: string;
}

export interface WeeklyReportMeta {
  id?: number;
  date: string;
  name: string;
  project: string;
  sprint: Sprint;
  sprintFrom: string;
  sprintTo: string;
  hoursWorked: number;
  additionalNotes: string;
}

export interface WeeklyReport {
  header: WeeklyHeader;
  completedTasks: WeeklyTask[];
  pendingTasks: WeeklyPendingTask[];
  blocks: Block[];
  observations: Observation[];
  hoursWorked: number;
  additionalNotes: string;
}
