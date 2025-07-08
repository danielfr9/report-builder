import { z } from "zod";

export const observationModelSchema = z.object({
  id: z.string().min(1, { message: "ID es requerido" }),
  description: z.string().min(1, { message: "La observación es requerida" }),
  reportId: z.string().min(1, { message: "ID del reporte es requerido" }),
});
export type ObservationModel = z.infer<typeof observationModelSchema>;
export type InsertObservation = Omit<ObservationModel, "id">;
