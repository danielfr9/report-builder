import { createBlock } from "../dexie/dao/blocks";
import { createObservation } from "../dexie/dao/observations";
import {
  archiveReport,
  createReport,
  getReportById,
} from "../dexie/dao/reports";
import { createTask } from "../dexie/dao/tasks";
import { InsertReport } from "../dexie/models/report";
import { ApiResponse } from "../interfaces/api-response.interface";
import {
  archiveReportSchema,
  createReportSchema,
  ReportDto,
  ReportDtoSchema,
} from "../schemas/report.schema";

const createReportAction = async (
  report: unknown
): Promise<ApiResponse<ReportDto>> => {
  const parsedReport = createReportSchema.safeParse(report);
  if (!parsedReport.success) {
    return {
      success: false,
      error: parsedReport.error.message,
    };
  }

  // Convert the report to an InsertReport
  const insertReport: InsertReport = {
    ...parsedReport.data,
    sprintId: parsedReport.data.sprintId ?? null,
  };

  const newReportId = await createReport(insertReport);

  // Insert the tasks, observations, blocks
  for (const task of parsedReport.data.tasks) {
    await createTask(task);
  }

  for (const observation of parsedReport.data.observations) {
    await createObservation(observation);
  }

  for (const block of parsedReport.data.blocks) {
    await createBlock(block);
  }

  // Return the new report
  const newReport = await getReportById(newReportId);
  if (!newReport) {
    return {
      success: false,
      error: "Something went wrong while creating the report",
    };
  }

  return {
    success: true,
    data: newReport,
  };
};

const archiveReportAction = async (
  report: unknown
): Promise<ApiResponse<null>> => {
  const parsedReport = archiveReportSchema.safeParse(report);
  if (!parsedReport.success) {
    return {
      success: false,
      error: parsedReport.error.message,
    };
  }

  const res = await archiveReport(parsedReport.data.id);
  if (!res) {
    return {
      success: false,
      error: "Error al archivar el reporte",
    };
  }

  return {
    success: true,
    data: null,
  };
};

export { createReportAction, archiveReportAction };
