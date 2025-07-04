import { DraftDailyReport } from "../schemas/report.schema";
import { Task } from "../schemas/tasks.schema";
import { Sprint } from "../schemas/sprint.schema";

export interface LocalStorageTask extends Omit<Task, "finishDate"> {
  finishDate: string | null;
}

export interface LocalStorageSprint
  extends Omit<Sprint, "startDate" | "endDate"> {
  startDate: string;
  endDate: string;
}

export interface LocalStorageReport
  extends Omit<DraftDailyReport, "date" | "tasks" | "sprint"> {
  date: string;
  tasks: LocalStorageTask[];
  sprint: LocalStorageSprint | undefined;
}
