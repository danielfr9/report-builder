import { REPORT_TYPE } from "../constants/report-type";

export interface CurrentReport {
  id: string;
  type: (typeof REPORT_TYPE)[keyof typeof REPORT_TYPE];
}
