import { TASK_STATUS } from "../constants/task-status";
import { z } from "zod";

export const taskSchema = z.object({
  id: z.string(),
  name: z.string(),
  comments: z.string().optional(),
  storyPoints: z.coerce.number(),
  status: z.nativeEnum(TASK_STATUS),
  actionPlan: z.string().optional(),
  finishDate: z.date(),
});
export type Task = z.infer<typeof taskSchema>;

export const createTaskSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  storyPoints: z.coerce
    .number()
    .min(1, "La cantidad de story points debe ser mayor a 0"),
  status: z.nativeEnum(TASK_STATUS, {
    errorMap: () => ({ message: "El estado es requerido" }),
  }),
  comments: z.string().optional(),
  actionPlan: z.string().optional(),
  finishDate: z.date(),
});

export type NewTask = z.infer<typeof createTaskSchema>;

export const updateTaskSchema = createTaskSchema.extend({
  id: z.string().min(1, { message: "ID es requerido" }),
});
