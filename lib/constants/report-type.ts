export const REPORT_TYPE = {
  DAILY: "daily",
  WEEKLY: "weekly",
} as const;

export type ReportType = (typeof REPORT_TYPE)[keyof typeof REPORT_TYPE];
