import {
  LocalStorageBlock,
  LocalStorageDailyReport,
  LocalStorageObservation,
  LocalStorageSprint,
  LocalStorageTask,
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
import { REPORT_TYPE } from "../constants/report-type";

type ParseResult<T> =
  | {
      success: true;
      data: T;
    }
  | {
      success: false;
      error: string;
    };

export const formatTask = (task: TaskDto): LocalStorageTask => {
  return {
    ...task,
    finishDate: task.finishDate ? task.finishDate.toISOString() : null,
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

export const parseTask = (task: LocalStorageTask): TaskDto => {
  return {
    id: task.id,
    reportId: task.reportId,
    name: task.name,
    comments: task.comments,
    storyPoints: task.storyPoints,
    status: task.status,
    actionPlan: task.actionPlan,
    finishDate: task.finishDate ? parseISO(task.finishDate) : new Date(),
  };
};

export const parseBlock = (block: LocalStorageBlock): BlockDto => {
  return {
    id: block.id,
    description: block.description,
    reportId: block.reportId,
  };
};
export const parseObservation = (
  observation: LocalStorageObservation
): ObservationDto => {
  return {
    id: observation.id,
    description: observation.description,
    reportId: observation.reportId,
  };
};

export const parseSprint = (sprint: LocalStorageSprint): SprintDto => {
  return {
    id: sprint.id,
    name: sprint.name,
    startDate: parseISO(sprint.startDate),
    endDate: parseISO(sprint.endDate),
  };
};

export const parseDailyReport = (
  rawReport: LocalStorageDailyReport
): ParseResult<DailyReport> => {
  // Validate the report
  const validReport = ReportDtoSchema.omit({
    date: true,
    tasks: true,
    blocks: true,
    observations: true,
    sprint: true,
  }).safeParse(rawReport);

  if (!validReport.success) {
    console.log("validReport", validReport.error.message);
    return {
      success: false,
      error: validReport.error.message,
    };
  }

  // If the report is valid, load the report
  const report: ReportDto = {
    id: rawReport.id,
    type: REPORT_TYPE.DAILY,
    owner: rawReport.owner,
    name: rawReport.name,
    status: rawReport.status,
    hoursWorked: rawReport.hoursWorked,
    additionalNotes: rawReport.additionalNotes,
    sprint: rawReport.sprint ? parseSprint(rawReport.sprint) : null,
    date: parseISO(rawReport.date),
    tasks: rawReport.tasks.map((t) => parseTask(t)),
    blocks: rawReport.blocks.map((b) => parseBlock(b)),
    observations: rawReport.observations.map((o) => parseObservation(o)),
  };

  return {
    success: true,
    data: report as DailyReport,
  };
};

export const parseWeeklyReport = (
  rawReport: LocalStorageWeeklyReport
): ParseResult<WeeklyReport> => {
  // Validate the report
  const validReport = ReportDtoSchema.omit({
    date: true,
    tasks: true,
    blocks: true,
    observations: true,
    sprint: true,
  }).safeParse(rawReport);
  if (!validReport.success) {
    console.log("validReport", validReport.error.message);
    return {
      success: false,
      error: validReport.error.message,
    };
  }

  // If the report is valid, load the report

  const report: ReportDto = {
    id: rawReport.id,
    type: REPORT_TYPE.WEEKLY,
    owner: rawReport.owner,
    name: rawReport.name,
    status: rawReport.status,
    hoursWorked: rawReport.hoursWorked,
    additionalNotes: rawReport.additionalNotes,
    sprint: rawReport.sprint ? parseSprint(rawReport.sprint) : null,
    date: parseISO(rawReport.date),
    tasks: rawReport.tasks.map((t) => parseTask(t)),
    blocks: rawReport.blocks.map((b) => parseBlock(b)),
    observations: rawReport.observations.map((o) => parseObservation(o)),
  };

  return {
    success: true,
    data: report as WeeklyReport,
  };
};
