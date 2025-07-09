import { TASK_STATUS } from "../constants/task-status";
import { z } from "zod";

export const TaskDtoSchema = z.object({
  id: z.string().min(1, { message: "ID es requerido" }),
  reportId: z.string().min(1, { message: "ID del reporte es requerido" }),
  name: z.string().min(1, { message: "El nombre es requerido" }),
  comments: z.string().default(""),
  storyPoints: z.coerce.number({
    required_error: "La cantidad de story points es requerida",
  }),
  status: z.nativeEnum(TASK_STATUS, {
    required_error: "El estado es requerido",
  }),
  actionPlan: z.string().default(""),
  finishDate: z.date({
    required_error: "La fecha de finalización es requerida",
  }),
});
export type TaskDto = z.infer<typeof TaskDtoSchema>;

export const createTaskSchema = TaskDtoSchema.omit({
  id: true,
});
export type CreateTask = z.infer<typeof createTaskSchema>;

export const updateTaskSchema = TaskDtoSchema;
export type UpdateTask = z.infer<typeof updateTaskSchema>;

export const deleteTaskSchema = TaskDtoSchema.pick({
  id: true,
});
export type DeleteTask = z.infer<typeof deleteTaskSchema>;

export const importTasksIntoReportSchema = z.object({
  tasks: z.array(TaskDtoSchema.pick({ id: true })),
  reportId: z.string().min(1, { message: "El ID del reporte es requerido" }),
});
export type ImportTasksIntoReport = z.infer<typeof importTasksIntoReportSchema>;
