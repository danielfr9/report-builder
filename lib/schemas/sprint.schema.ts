import { z } from "zod";

export const SprintSchema = z.object({
  id: z.string(),
  startDate: z.date(),
  endDate: z.date(),
  name: z.string(),
});

export type Sprint = z.infer<typeof SprintSchema>;

export const CreateSprintSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  startDate: z.date(),
  endDate: z.date(),
});

export interface LocalStorageSprint
  extends Omit<Sprint, "startDate" | "endDate"> {
  startDate: string;
  endDate: string;
}
