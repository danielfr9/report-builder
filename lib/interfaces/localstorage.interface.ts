import { DraftDailyReport, DraftWeeklyReport } from "../schemas/report.schema";
import { TaskDto } from "../schemas/tasks.schema";
import { SprintDto } from "../schemas/sprint.schema";

export interface LocalStorageTask extends Omit<TaskDto, "finishDate"> {
  finishDate: string | null;
}

export interface LocalStorageSprint
  extends Omit<SprintDto, "startDate" | "endDate"> {
  startDate: string;
  endDate: string;
}

export interface LocalStorageDailyReport
  extends Omit<DraftDailyReport, "date" | "tasks" | "sprint"> {
  date: string;
  tasks: LocalStorageTask[];
  sprint: LocalStorageSprint | undefined;
}

export interface LocalStorageWeeklyReport
  extends Omit<DraftWeeklyReport, "date" | "tasks" | "sprint"> {
  date: string;
  tasks: LocalStorageTask[];
  sprint: LocalStorageSprint | undefined;
}
