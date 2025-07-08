import { db } from "../db";
import { REPORT_STATUS } from "@/lib/constants/report-status";
import { v4 as uuidv4 } from "uuid";
import { InsertReport, ReportModel } from "../models/report";
import { ReportDto } from "@/lib/schemas/report.schema";
import { getAllTasksByReportId } from "./tasks";
import { getAllBlocksByReportId } from "./blocks";
import { getAllObservationsByReportId } from "./observations";
import { getSprintById } from "./sprint";

export const createReport = async (
  report: InsertReport
): Promise<ReportModel["id"]> => {
  const id = await db.reports.add({
    ...report,
    id: uuidv4(),
  });
  return id;
};

export const archiveReport = async (report: ReportModel) => {
  await db.reports.put({
    ...report,
    status: REPORT_STATUS.ARCHIVED,
  });
};

export const updateReport = async (report: ReportModel) => {
  await db.reports.put(report);
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
    ...report,
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
