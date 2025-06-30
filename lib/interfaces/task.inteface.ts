import { TASK_STATUS } from "../constants/task-status";

export interface Task {
  id: string;
  name: string;
  comments?: string;
  storyPoints: number;
  status: (typeof TASK_STATUS)[keyof typeof TASK_STATUS];
  actionPlan?: string;
  finishDate: Date;
}
