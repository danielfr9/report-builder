import { z } from "zod";

export const sprintModelSchema = z.object({
  id: z.string().min(1, { message: "ID es requerido" }),
  name: z.string().min(1, { message: "El nombre es requerido" }),
  startDate: z
    .string({
      required_error: "La fecha de inicio es requerida",
    })
    .datetime({
      message: "La fecha de inicio no es una fecha válida",
    }),
  endDate: z
    .string({
      required_error: "La fecha de fin es requerida",
    })
    .datetime({
      message: "La fecha de fin no es una fecha válida",
    }),
});
export type SprintModel = z.infer<typeof sprintModelSchema>;
export type InsertSprint = Omit<SprintModel, "id">;
