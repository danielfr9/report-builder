import { z } from "zod";
import { blockSchema } from "./block.schema";
import { observationSchema } from "./observation.schema";
import { taskSchema } from "./tasks.schema";
import { REPORT_TYPE } from "../constants/report-type";
import { SprintSchema } from "./sprint.schema";
import { REPORT_STATUS } from "../constants/report-status";

export const ReportSchema = z.object({
  id: z.string(),
  date: z.date(),
  owner: z.string(),
  name: z.string(),
  tasks: z.array(taskSchema),
  observations: z.array(observationSchema),
  blocks: z.array(blockSchema),
  hoursWorked: z.number(),
  additionalNotes: z.string(),
  type: z.nativeEnum(REPORT_TYPE),
  sprint: SprintSchema.nullable(),
  status: z.nativeEnum(REPORT_STATUS),
});

export type Report = z.infer<typeof ReportSchema>;

export type DraftDailyReport = Omit<Report, "id" | "type"> & {
  type: (typeof REPORT_TYPE)["DAILY"];
};
export type DraftWeeklyReport = Omit<Report, "id" | "type"> & {
  type: (typeof REPORT_TYPE)["WEEKLY"];
};

export type DailyReport = Omit<Report, "type"> & {
  type: (typeof REPORT_TYPE)["DAILY"];
};
export type WeeklyReport = Omit<Report, "type"> & {
  type: (typeof REPORT_TYPE)["WEEKLY"];
};
