import { z } from "zod";

export const ObservationDtoSchema = z.object({
  id: z.string().min(1, { message: "ID es requerido" }),
  reportId: z.string().min(1, { message: "ID del reporte es requerido" }),
  description: z.string().min(1, { message: "La observación es requerida" }),
});
export type ObservationDto = z.infer<typeof ObservationDtoSchema>;

export const createObservationSchema = ObservationDtoSchema.omit({
  id: true,
});
export type CreateObservation = z.infer<typeof createObservationSchema>;
export type UpdateObservation = z.infer<typeof ObservationDtoSchema>;

export const deleteObservationSchema = ObservationDtoSchema.pick({
  id: true,
});
export type DeleteObservation = z.infer<typeof deleteObservationSchema>;
