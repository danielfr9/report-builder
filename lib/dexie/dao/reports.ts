import { db } from "../db";
import { REPORT_STATUS } from "@/lib/constants/report-status";
import { v4 as uuidv4 } from "uuid";
import { InsertReport, ReportModel } from "../models/report";
import { ReportDto } from "@/lib/schemas/report.schema";
import { getAllTasksByReportId } from "./tasks";
import { getAllBlocksByReportId } from "./blocks";
import { getAllObservationsByReportId } from "./observations";
import { getSprintById } from "./sprint";
import { SprintModel } from "../models/sprint";

export const createReport = async (
  report: InsertReport
): Promise<ReportModel["id"]> => {
  const id = await db.reports.add({
    ...report,
    id: uuidv4(),
  });
  return id;
};

export const archiveReport = async (
  reportId: ReportModel["id"]
): Promise<void> => {
  const res = await db.reports.where("id").equals(reportId).modify({
    status: REPORT_STATUS.ARCHIVED,
  });
  if (res === 0) {
    throw new Error("Error al archivar el reporte");
  }
};

export const updateReport = async (report: ReportModel) => {
  await db.reports.put(report);
};

export const unlinkSprintFromReport = async (
  sprintIds: SprintModel["id"][]
) => {
  await db.reports.where("sprintId").anyOf(sprintIds).modify({
    sprintId: null,
  });
};

export const deleteReport = async (id: ReportModel["id"]) => {
  await db.reports.delete(id);
};

export const bulkDeleteReports = async (ids: ReportModel["id"][]) => {
  await db.reports.bulkDelete(ids);
};

export const getReportById = async (
  id: ReportModel["id"]
): Promise<ReportDto | null> => {
  const report = await db.reports.get(id);
  if (!report) return null;

  const tasks = await getAllTasksByReportId(id);
  const observations = await getAllObservationsByReportId(id);
  const blocks = await getAllBlocksByReportId(id);
  const sprint = report?.sprintId ? await getSprintById(report.sprintId) : null;

  return {
    id: report.id,
    date: report.date,
    owner: report.owner,
    name: report.name,
    hoursWorked: report.hoursWorked,
    additionalNotes: report.additionalNotes,
    type: report.type,
    status: report.status,
    tasks,
    observations,
    blocks,
    sprint,
  };
};

export const getAllReports = async (): Promise<ReportDto[]> => {
  const reports = await db.reports.toArray();
  const reportDtos: ReportDto[] = [];
  for (const report of reports) {
    const reportDto = await getReportById(report.id);
    if (!reportDto) continue;
    reportDtos.push(reportDto);
  }
  return reportDtos;
};

export const getAllReportsBySprintId = async (
  sprintId: NonNullable<ReportModel["sprintId"]>
): Promise<ReportDto[]> => {
  const reports = await db.reports.where("sprintId").equals(sprintId).toArray();
  const reportDtos: ReportDto[] = [];
  for (const report of reports) {
    const reportDto = await getReportById(report.id);
    if (!reportDto) continue;
    reportDtos.push(reportDto);
  }
  return reportDtos;
};
