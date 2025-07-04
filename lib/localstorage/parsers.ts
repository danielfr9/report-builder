import {
  LocalStorageReport,
  LocalStorageSprint,
} from "../interfaces/localstorage.interface";
import { DraftDailyReport } from "../schemas/report.schema";
import { Task } from "../schemas/tasks.schema";
import { Sprint } from "../schemas/sprint.schema";

export const formatTask = (task: Task) => {
  return {
    ...task,
    finishDate: task.finishDate?.toISOString() ?? null,
  };
};

export const formatSprint = (sprint: Sprint): LocalStorageSprint => {
  return {
    ...sprint,
    startDate: sprint.startDate.toISOString(),
    endDate: sprint.endDate.toISOString(),
  };
};

export const formatDailyReport = (
  report: DraftDailyReport
): LocalStorageReport => {
  return {
    ...report,
    date: report.date.toISOString(),
    tasks: report.tasks.map((t) => formatTask(t)),
    sprint: report.sprint ? formatSprint(report.sprint) : undefined,
  };
};
