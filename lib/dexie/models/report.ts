import { REPORT_STATUS } from "@/lib/constants/report-status";
import { REPORT_TYPE } from "@/lib/constants/report-type";
import { z } from "zod";

export const reportModelSchema = z.object({
  id: z.string().min(1, { message: "ID es requerido" }),
  date: z.date({
    required_error: "La fecha es requerida",
  }),
  owner: z.string().min(1, { message: "El dueño es requerido" }),
  name: z.string().min(1, { message: "El nombre es requerido" }),
  hoursWorked: z.number(),
  additionalNotes: z.string(),
  type: z.nativeEnum(REPORT_TYPE),
  sprintId: z.string().nullable(),
  status: z.nativeEnum(REPORT_STATUS).default(REPORT_STATUS.DRAFT),
});
export type ReportModel = z.infer<typeof reportModelSchema>;
export type InsertReport = Omit<ReportModel, "id">;
