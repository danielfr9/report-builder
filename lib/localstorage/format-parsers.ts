import {
  LocalStorageBlock,
  LocalStorageDailyReport,
  LocalStorageObservation,
  LocalStorageSprint,
  LocalStorageWeeklyReport,
} from "../interfaces/localstorage.interface";
import {
  DraftDailyReport,
  DraftWeeklyReport,
  ReportDto,
  ReportDtoSchema,
  DailyReport,
  WeeklyReport,
} from "../schemas/report.schema";
import { TaskDto } from "../schemas/tasks.schema";
import { SprintDto } from "../schemas/sprint.schema";
import { BlockDto } from "../schemas/block.schema";
import { ObservationDto } from "../schemas/observation.schema";
import { parseISO } from "date-fns";

type ParseResult<T> =
  | {
      success: true;
      data: T;
    }
  | {
      success: false;
      error: string;
    };

export const formatTask = (task: TaskDto) => {
  return {
    ...task,
    finishDate: task.finishDate?.toISOString() ?? null,
  };
};

export const formatSprint = (sprint: SprintDto): LocalStorageSprint => {
  return {
    ...sprint,
    startDate: sprint.startDate.toISOString(),
    endDate: sprint.endDate.toISOString(),
  };
};

export const formatBlock = (block: BlockDto): LocalStorageBlock => {
  return {
    ...block,
    description: block.description,
    reportId: block.reportId,
  };
};

export const formatObservation = (
  observation: ObservationDto
): LocalStorageObservation => {
  return {
    ...observation,
    description: observation.description,
    reportId: observation.reportId,
  };
};

export const formatDailyReport = (
  report: DraftDailyReport
): LocalStorageDailyReport => {
  return {
    ...report,
    date: report.date.toISOString(),
    tasks: report.tasks.map((t) => formatTask(t)),
    sprint: report.sprint ? formatSprint(report.sprint) : null,
  };
};

export const formatWeeklyReport = (
  report: DraftWeeklyReport
): LocalStorageWeeklyReport => {
  return {
    ...report,
    date: report.date.toISOString(),
    tasks: report.tasks.map((t) => formatTask(t)),
    blocks: report.blocks.map((b) => formatBlock(b)),
    observations: report.observations.map((o) => formatObservation(o)),
    sprint: report.sprint ? formatSprint(report.sprint) : null,
  };
};

/// Parsers

export const parseDailyReport = (
  rawReport: LocalStorageDailyReport
): ParseResult<DailyReport> => {
  // Validate the report
  const validReport = ReportDtoSchema.omit({
    id: true,
    date: true,
  }).safeParse(rawReport);

  // If the report is valid, load the report
  if (validReport.success) {
    const report: ReportDto = {
      ...validReport.data,
      date: parseISO(rawReport.date),
      id: "",
    };

    return {
      success: true,
      data: report as DailyReport,
    };
  }

  return {
    success: false,
    error: validReport.error.message,
  };
};

export const parseWeeklyReport = (
  rawReport: LocalStorageWeeklyReport
): ParseResult<WeeklyReport> => {
  // Validate the report
  const validReport = ReportDtoSchema.omit({
    id: true,
    date: true,
  }).safeParse(rawReport);

  // If the report is valid, load the report
  if (validReport.success) {
    const report: ReportDto = {
      ...validReport.data,
      date: parseISO(rawReport.date),
      id: "",
    };

    return {
      success: true,
      data: report as WeeklyReport,
    };
  }

  return {
    success: false,
    error: validReport.error.message,
  };
};
