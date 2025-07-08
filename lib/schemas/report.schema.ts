import { z } from "zod";
import { BlockDtoSchema } from "./block.schema";
import { ObservationDtoSchema } from "./observation.schema";
import { TaskDtoSchema } from "./tasks.schema";
import { REPORT_TYPE } from "../constants/report-type";
import { SprintDtoSchema } from "./sprint.schema";
import { REPORT_STATUS } from "../constants/report-status";

export const ReportDtoSchema = z.object({
  id: z.string(),
  date: z.date(),
  owner: z.string(),
  name: z.string(),
  tasks: z.array(TaskDtoSchema),
  observations: z.array(ObservationDtoSchema),
  blocks: z.array(BlockDtoSchema),
  hoursWorked: z.number(),
  additionalNotes: z.string(),
  type: z.nativeEnum(REPORT_TYPE),
  sprint: SprintDtoSchema.nullable(),
  status: z.nativeEnum(REPORT_STATUS).default(REPORT_STATUS.DRAFT),
});
export type ReportDto = z.infer<typeof ReportDtoSchema>;

export const createReportSchema = ReportDtoSchema.omit({
  id: true,
  sprint: true,
}).extend({
  sprintId: z.string().nullable(),
});
export type CreateReport = z.infer<typeof createReportSchema>;
export type UpdateReport = z.infer<typeof ReportDtoSchema>;

export const deleteReportSchema = ReportDtoSchema.pick({
  id: true,
});
export type DeleteReport = z.infer<typeof deleteReportSchema>;

export const localStorageReportSchema = ReportDtoSchema.omit({
  date: true,
  sprint: true,
  observations: true,
  blocks: true,
}).extend({
  date: z.string(),
  sprint: z.string().nullable(),
  observations: z.array(z.string()).default([]),
  blocks: z.array(z.string()).default([]),
});
export type LocalStorageReport = z.infer<typeof localStorageReportSchema>;

export type DraftDailyReport = Omit<ReportDto, "id" | "type"> & {
  type: (typeof REPORT_TYPE)["DAILY"];
};
export type DraftWeeklyReport = Omit<ReportDto, "id" | "type"> & {
  type: (typeof REPORT_TYPE)["WEEKLY"];
};

export type DailyReport = Omit<ReportDto, "type"> & {
  type: (typeof REPORT_TYPE)["DAILY"];
};
export type WeeklyReport = Omit<ReportDto, "type"> & {
  type: (typeof REPORT_TYPE)["WEEKLY"];
};
