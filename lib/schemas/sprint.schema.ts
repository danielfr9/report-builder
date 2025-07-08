import { z } from "zod";

export const SprintDtoSchema = z.object({
  id: z.string().min(1, { message: "ID es requerido" }),
  name: z.string().min(1, { message: "El nombre es requerido" }),
  startDate: z.date({
    required_error: "La fecha de inicio es requerida",
  }),
  endDate: z.date({
    required_error: "La fecha de fin es requerida",
  }),
});
export type SprintDto = z.infer<typeof SprintDtoSchema>;

export const createSprintSchema = SprintDtoSchema.omit({
  id: true,
});
export type CreateSprint = z.infer<typeof createSprintSchema>;

export const updateSprintSchema = SprintDtoSchema;
export type UpdateSprint = z.infer<typeof updateSprintSchema>;

export const deleteSprintSchema = SprintDtoSchema.pick({
  id: true,
});
export type DeleteSprint = z.infer<typeof deleteSprintSchema>;

export interface LocalStorageSprint
  extends Omit<SprintDto, "startDate" | "endDate"> {
  startDate: string;
  endDate: string;
}
