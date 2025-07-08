import { TASK_STATUS } from "@/lib/constants/task-status";
import { z } from "zod";

export const taskModelSchema = z.object({
  id: z.string().min(1, { message: "ID es requerido" }),
  reportId: z.string().min(1, { message: "ID del reporte es requerido" }),
  name: z.string().min(1, { message: "El nombre es requerido" }),
  comments: z.string(),
  storyPoints: z.coerce.number({
    required_error: "La cantidad de story points es requerida",
  }),
  status: z.nativeEnum(TASK_STATUS, {
    required_error: "El estado es requerido",
  }),
  actionPlan: z.string(),
  finishDate: z.string({
    required_error: "La fecha de finalización es requerida",
  }),
});
export type TaskModel = z.infer<typeof taskModelSchema>;
export type InsertTask = Omit<TaskModel, "id">;
