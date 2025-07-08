import { createBlock, updateBlock } from "../dexie/dao/blocks";
import {
  createObservation,
  updateObservation,
} from "../dexie/dao/observations";
import {
  archiveReport,
  bulkDeleteReports,
  createReport,
  deleteReport,
  getReportById,
  updateReport,
} from "../dexie/dao/reports";
import { createTask, updateTask } from "../dexie/dao/tasks";
import { InsertReport, ReportModel } from "../dexie/models/report";
import { ApiResponse } from "../interfaces/api-response.interface";
import {
  archiveReportSchema,
  createReportSchema,
  deleteReportSchema,
  ReportDto,
  updateReportSchema,
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
    await createTask({
      ...task,
      finishDate: task.finishDate.toISOString(),
    });
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
      error: "Error al crear el reporte",
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

  try {
    await archiveReport(parsedReport.data.id);

    return {
      success: true,
      data: null,
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      error: "Error al archivar el reporte",
    };
  }
};

const updateReportAction = async (
  data: unknown
): Promise<ApiResponse<ReportDto>> => {
  const parsedReport = updateReportSchema.safeParse(data);
  if (!parsedReport.success) {
    return {
      success: false,
      error: parsedReport.error.message,
    };
  }

  const updatedReportItem: ReportModel = {
    ...parsedReport.data,
    sprintId: parsedReport.data.sprint?.id ?? null,
  };

  for (const task of parsedReport.data.tasks) {
    await updateTask({
      ...task,
      finishDate: task.finishDate.toISOString(),
    });
  }

  for (const observation of parsedReport.data.observations) {
    await updateObservation(observation);
  }

  for (const block of parsedReport.data.blocks) {
    await updateBlock(block);
  }

  try {
    await updateReport(updatedReportItem);
    const report = await getReportById(parsedReport.data.id);
    if (!report) {
      return {
        success: false,
        error: "Error al obtener el reporte",
      };
    }
    return { success: true, data: report };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      error: "Error al actualizar el reporte",
    };
  }
};

const deleteReportAction = async (
  data: unknown
): Promise<ApiResponse<null>> => {
  const parsedReport = deleteReportSchema.safeParse(data);
  if (!parsedReport.success) {
    return {
      success: false,
      error: parsedReport.error.message,
    };
  }

  try {
    await deleteReport(parsedReport.data.id);
    return {
      success: true,
      data: null,
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      error: "Error al eliminar el reporte",
    };
  }
};

const bulkDeleteReportsAction = async (
  data: unknown
): Promise<ApiResponse<null>> => {
  const parsedReports = deleteReportSchema.array().safeParse(data);
  if (!parsedReports.success) {
    return {
      success: false,
      error: parsedReports.error.message,
    };
  }

  try {
    await bulkDeleteReports(parsedReports.data.map((report) => report.id));

    return {
      success: true,
      data: null,
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      error: "Error al eliminar los reportes",
    };
  }
};

export {
  createReportAction,
  archiveReportAction,
  updateReportAction,
  deleteReportAction,
  bulkDeleteReportsAction,
};
