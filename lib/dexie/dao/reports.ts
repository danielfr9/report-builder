import { db } from "../db";
import { Report } from "../../schemas/report.schema";
import { REPORT_STATUS } from "@/lib/constants/report-status";
import { v4 as uuidv4 } from "uuid";

export const getReports = async () => {
  const reports = await db.reports.toArray();
  return reports;
};

export const getReportById = async (id: string) => {
  const report = await db.reports.get(id);
  return report;
};

export const archiveReport = async (report: Omit<Report, "id">) => {
  const id = await db.reports.add({
    ...report,
    id: uuidv4(),
    status: REPORT_STATUS.ARCHIVED,
  });
  const newReport = await getReportById(id);
  return newReport;
};

export const updateReport = async (report: Report) => {
  await db.reports.put(report);
};

export const deleteReport = async (id: string) => {
  await db.reports.delete(id);
};
