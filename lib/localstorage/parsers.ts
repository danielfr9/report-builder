import {
  LocalStorageDailyReport,
  LocalStorageSprint,
  LocalStorageWeeklyReport,
} from "../interfaces/localstorage.interface";
import { DraftDailyReport, DraftWeeklyReport } from "../schemas/report.schema";
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
): LocalStorageDailyReport => {
  return {
    ...report,
    date: report.date.toISOString(),
    tasks: report.tasks.map((t) => formatTask(t)),
    sprint: report.sprint ? formatSprint(report.sprint) : undefined,
  };
};

export const formatWeeklyReport = (
  report: DraftWeeklyReport
): LocalStorageWeeklyReport => {
  return {
    ...report,
    date: report.date.toISOString(),
    tasks: report.tasks.map((t) => formatTask(t)),
    blocks: report.blocks,
    observations: report.observations,
    sprint: report.sprint ? formatSprint(report.sprint) : undefined,
  };
};
