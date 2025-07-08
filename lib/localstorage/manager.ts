import {
  CURRENT_DAILY_REPORT_KEY,
  CURRENT_WEEKLY_REPORT_KEY,
} from "../constants/localstorage-keys";
import {
  LocalStorageDailyReport,
  LocalStorageWeeklyReport,
} from "../interfaces/localstorage.interface";
import { parseDailyReport, parseWeeklyReport } from "./format-parsers";

const getRawCurrentDailytReport = () => {
  const currentReport = localStorage.getItem(CURRENT_DAILY_REPORT_KEY);
  if (currentReport) {
    return JSON.parse(currentReport) as LocalStorageDailyReport;
  }

  return null;
};

const getCurrentDailytReport = () => {
  const rawReport = getRawCurrentDailytReport();
  if (rawReport) {
    const parsedReport = parseDailyReport(rawReport);
    if (parsedReport.success) {
      return parsedReport.data;
    }
  }
  return null;
};

const getRawCurrentWeeklyReport = () => {
  const currentReport = localStorage.getItem(CURRENT_WEEKLY_REPORT_KEY);
  if (currentReport) {
    return JSON.parse(currentReport) as LocalStorageWeeklyReport;
  }

  return null;
};

const getCurrentWeeklyReport = () => {
  const rawReport = getRawCurrentWeeklyReport();
  if (rawReport) {
    const parsedReport = parseWeeklyReport(rawReport);
    if (parsedReport.success) {
      return parsedReport.data;
    }
  }
  return null;
};

const removeCurrentDailyReport = () => {
  localStorage.removeItem(CURRENT_DAILY_REPORT_KEY);
};

const removeCurrentWeeklyReport = () => {
  localStorage.removeItem(CURRENT_WEEKLY_REPORT_KEY);
};

const setCurrentDailyReport = (report: LocalStorageDailyReport) => {
  localStorage.setItem(CURRENT_DAILY_REPORT_KEY, JSON.stringify(report));
};

const setCurrentWeeklyReport = (report: LocalStorageWeeklyReport) => {
  localStorage.setItem(CURRENT_WEEKLY_REPORT_KEY, JSON.stringify(report));
};

export {
  getRawCurrentDailytReport,
  getRawCurrentWeeklyReport,
  getCurrentDailytReport,
  getCurrentWeeklyReport,
  setCurrentDailyReport,
  setCurrentWeeklyReport,
  removeCurrentDailyReport,
  removeCurrentWeeklyReport,
};
